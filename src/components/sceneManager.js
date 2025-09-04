import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * 场景管理器
 * 负责创建和管理Three.js场景、环境设置和雾效
 */
export class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.pmremGenerator = null;
  }

  /**
   * 初始化场景
   * @param {Object} options - 配置选项
   * @param {number} options.width - 渲染器宽度
   * @param {number} options.height - 渲染器高度
   * @param {boolean} options.enableShadows - 是否启用阴影
   * @param {boolean} options.enableAntialias - 是否启用抗锯齿
   */
  init(options = {}) {
    const {
      width = window.innerWidth,
      height = window.innerHeight,
      enableShadows = true,
      enableAntialias = true,
    } = options;

    // 创建场景
    this.scene = new THREE.Scene();

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: enableAntialias });
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = enableShadows;

    // 设置设备像素比，提高渲染质量
    this.renderer.setPixelRatio(window.devicePixelRatio);

    if (enableShadows) {
      // 启用更高质量的阴影
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }

    // 启用更高质量的纹理过滤
    this.renderer.physicallyCorrectLights = true;

    // 设置ROOM环境
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // 设置线性雾效
    this.setupFog();

    return {
      scene: this.scene,
      renderer: this.renderer,
    };
  }

  /**
   * 设置雾效
   * @param {Object} options - 雾效配置
   */
  setupFog(options = {}) {
    const {
      color = new THREE.Color(207 / 255, 201 / 255, 201 / 255),
      near = 0.1,
      far = 500,
    } = options;

    this.scene.fog = new THREE.Fog(color, near, far);
  }

  /**
   * 获取场景对象
   */
  getScene() {
    return this.scene;
  }

  /**
   * 获取渲染器对象
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   * 更新渲染器尺寸
   * @param {number} width - 新宽度
   * @param {number} height - 新高度
   */
  resize(width, height) {
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
