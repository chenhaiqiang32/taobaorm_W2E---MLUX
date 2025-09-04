import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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
      far = 1000,
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
    this.camera.near = distance * 0.01;
    this.camera.far = distance * 100;
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
   * 清理资源
   */
  dispose() {
    if (this.controls) {
      this.controls.dispose();
    }
  }
}
