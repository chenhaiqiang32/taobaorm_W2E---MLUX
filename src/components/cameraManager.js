import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { 
  getCameraTweenConfig, 
  calculateCameraTarget, 
  applyEasing 
} from "../assets/cameraTweenConfig.js";

/**
 * 相机管理器
 * 负责创建和管理相机、轨道控制器
 */
export class CameraManager {
  constructor() {
    this.camera = null;
    this.controls = null;
    this.defaultPosition = new THREE.Vector3(0, 14, 24);
    this.defaultTarget = new THREE.Vector3(0, 0, 0);
    
    // 动画相关属性
    this.isAnimating = false;
    this.currentAnimation = null;
    this.animationStartTime = 0;
    this.animationDuration = 0;
    this.startPosition = new THREE.Vector3();
    this.startTarget = new THREE.Vector3();
    this.endPosition = new THREE.Vector3();
    this.endTarget = new THREE.Vector3();
    this.animationConfig = null;
    this.animationCallback = null;
  }

  /**
   * 初始化相机
   * @param {Object} options - 配置选项
   * @param {number} options.fov - 视野角度
   * @param {number} options.aspect - 宽高比
   * @param {number} options.near - 近平面
   * @param {number} options.far - 远平面
   * @param {THREE.Vector3} options.position - 相机初始位置
   * @param {THREE.Vector3} options.target - 相机初始目标点
   */
  init(options = {}) {
    const {
      fov = 75,
      aspect = window.innerWidth / window.innerHeight,
      near = 0.1,
      far = 1000000,
      position = this.defaultPosition,
      target = this.defaultTarget,
    } = options;

    // 创建透视相机
    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.copy(position);

    return this.camera;
  }

  /**
   * 初始化轨道控制器
   * @param {THREE.WebGLRenderer} renderer - 渲染器
   * @param {Object} options - 控制器配置
   */
  initControls(renderer, options = {}) {
    if (!this.camera) {
      throw new Error("相机未初始化，请先调用 init() 方法");
    }

    const {
      enableDamping = true,
      dampingFactor = 0.05,
      target = this.defaultTarget,
    } = options;

    // 创建轨道控制器
    this.controls = new OrbitControls(this.camera, renderer.domElement);
    this.controls.enableDamping = enableDamping;
    this.controls.dampingFactor = dampingFactor;
    this.controls.target.copy(target);
    this.controls.update();

    return this.controls;
  }

  /**
   * 设置相机位置
   * @param {THREE.Vector3} position - 新位置
   */
  setPosition(position) {
    if (this.camera) {
      this.camera.position.copy(position);
    }
  }

  /**
   * 设置相机目标点
   * @param {THREE.Vector3} target - 新目标点
   */
  setTarget(target) {
    if (this.controls) {
      this.controls.target.copy(target);
      this.controls.update();
    }
  }

  /**
   * 根据模型包围盒设置相机位置
   * @param {THREE.Box3} boundingBox - 模型包围盒
   * @param {THREE.Vector3} center - 模型中心点
   * @param {number} radius - 模型半径
   * @param {number} distanceMultiplier - 距离倍数
   */
  setupForModel(boundingBox, center, radius, distanceMultiplier = 6) {
    if (!this.camera) return;

    // 计算合适的相机距离，确保模型完全可见
    const distance = radius * distanceMultiplier;

    // 设置相机位置和朝向
    this.camera.position.copy(this.defaultPosition);
    this.camera.lookAt(center);

    // 设置控制器目标
    if (this.controls) {
      this.controls.target.copy(center);
      this.controls.update();
    }

    // 更新相机参数，确保近远平面合适
    // this.camera.near = distance * 0.01;
    // this.camera.far = distance * 100;
    this.camera.updateProjectionMatrix();

    return {
      distance,
      position: this.camera.position.clone(),
      target: center.clone(),
    };
  }

  /**
   * 更新相机宽高比
   * @param {number} width - 新宽度
   * @param {number} height - 新高度
   */
  updateAspect(width, height) {
    if (this.camera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * 获取相机对象
   */
  getCamera() {
    return this.camera;
  }

  /**
   * 获取控制器对象
   */
  getControls() {
    return this.controls;
  }

  /**
   * 更新控制器
   */
  update() {
    if (this.controls) {
      this.controls.update();
    }
  }

  /**
   * 获取相机信息
   */
  getCameraInfo() {
    if (!this.camera || !this.controls) return null;

    return {
      position: {
        x: this.camera.position.x.toFixed(3),
        y: this.camera.position.y.toFixed(3),
        z: this.camera.position.z.toFixed(3),
      },
      target: {
        x: this.controls.target.x.toFixed(3),
        y: this.controls.target.y.toFixed(3),
        z: this.controls.target.z.toFixed(3),
      },
      rotation: {
        x: this.camera.rotation.x.toFixed(3),
        y: this.camera.rotation.y.toFixed(3),
        z: this.camera.rotation.z.toFixed(3),
      },
      distance: this.camera.position
        .distanceTo(this.controls.target)
        .toFixed(3),
    };
  }

  /**
   * 镜头动画到目标物体
   * @param {Object} boundingBox - 目标物体的包围盒
   * @param {string} targetType - 目标类型 ('device', 'group', 'default')
   * @param {Function} onComplete - 动画完成回调
   * @param {Object} customConfig - 自定义配置（可选）
   */
  animateToTarget(boundingBox, targetType = 'default', onComplete = null, customConfig = null) {
    if (!this.camera || !this.controls) {
      console.warn('相机或控制器未初始化');
      return;
    }

    if (this.isAnimating) {
      console.log('镜头动画正在进行中，跳过新的动画请求');
      return;
    }

    // 计算目标位置
    const targetData = calculateCameraTarget(boundingBox, targetType, customConfig);
    if (!targetData) {
      console.warn('无法计算镜头目标位置');
      return;
    }

    // 获取动画配置
    this.animationConfig = customConfig || getCameraTweenConfig(targetType);
    this.animationCallback = onComplete;

    // 设置动画参数
    this.startPosition.copy(this.camera.position);
    this.startTarget.copy(this.controls.target);
    this.endPosition.copy(targetData.position);
    this.endTarget.copy(targetData.target);
    this.animationDuration = this.animationConfig.duration;
    this.animationStartTime = performance.now();
    this.isAnimating = true;

    // 如果配置要求，禁用控制器
    if (this.animationConfig.disableControlsDuringAnimation) {
      this.controls.enabled = false;
    }

    console.log(`🎬 开始镜头动画到${targetType}:`, {
      startPosition: this.startPosition,
      endPosition: this.endPosition,
      startTarget: this.startTarget,
      endTarget: this.endTarget,
      duration: this.animationDuration
    });
  }

  /**
   * 更新镜头动画
   * 需要在渲染循环中调用
   */
  updateAnimation() {
    if (!this.isAnimating) return;

    const currentTime = performance.now();
    const elapsed = currentTime - this.animationStartTime;
    const progress = Math.min(elapsed / this.animationDuration, 1);

    // 应用缓动函数
    const easedProgress = applyEasing(progress, this.animationConfig.easing);

    // 插值计算当前位置和目标
    this.camera.position.lerpVectors(this.startPosition, this.endPosition, easedProgress);
    this.controls.target.lerpVectors(this.startTarget, this.endTarget, easedProgress);
    this.controls.update();

    // 检查动画是否完成
    if (progress >= 1) {
      this.completeAnimation();
    }
  }

  /**
   * 完成动画
   */
  completeAnimation() {
    this.isAnimating = false;
    
    // 确保最终位置准确
    this.camera.position.copy(this.endPosition);
    this.controls.target.copy(this.endTarget);
    this.controls.update();

    // 如果配置要求，重新启用控制器
    if (this.animationConfig.enableControlsAfterAnimation) {
      this.controls.enabled = true;
    }

    console.log('🎬 镜头动画完成');

    // 延迟执行回调
    if (this.animationCallback) {
      setTimeout(() => {
        this.animationCallback();
        this.animationCallback = null;
      }, this.animationConfig.onCompleteDelay);
    }

    // 清理动画数据
    this.animationConfig = null;
  }

  /**
   * 停止当前动画
   */
  stopAnimation() {
    if (this.isAnimating) {
      this.isAnimating = false;
      this.controls.enabled = true;
      this.animationConfig = null;
      this.animationCallback = null;
      console.log('🛑 镜头动画已停止');
    }
  }

  /**
   * 检查是否正在动画中
   * @returns {boolean} 是否正在动画
   */
  isAnimationInProgress() {
    return this.isAnimating;
  }

  /**
   * 镜头动画到设备组
   * @param {Object} groupInfo - 设备组信息
   * @param {Function} onComplete - 动画完成回调
   */
  animateToGroup(groupInfo, onComplete = null) {
    if (!groupInfo || !groupInfo.boundingBox) {
      console.warn('设备组信息无效');
      return;
    }
    this.animateToTarget(groupInfo.boundingBox, 'group', onComplete);
  }

  /**
   * 镜头动画到设备
   * @param {Object} deviceInfo - 设备信息
   * @param {Function} onComplete - 动画完成回调
   */
  animateToDevice(deviceInfo, onComplete = null) {
    if (!deviceInfo || !deviceInfo.boundingBox) {
      console.warn('设备信息无效');
      return;
    }
    this.animateToTarget(deviceInfo.boundingBox, 'device', onComplete);
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stopAnimation();
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
