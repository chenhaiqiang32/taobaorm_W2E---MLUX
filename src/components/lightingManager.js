import * as THREE from "three";

/**
 * 灯光管理器
 * 负责创建和管理场景中的所有灯光
 */
export class LightingManager {
  constructor() {
    this.lights = new Map();
    this.scene = null;
  }

  /**
   * 初始化灯光管理器
   * @param {THREE.Scene} scene - 场景对象
   */
  init(scene) {
    this.scene = scene;
  }

  /**
   * 创建环境光
   * @param {Object} options - 环境光配置
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   */
  createAmbientLight(options = {}) {
    const { color = 0xffffff, intensity = 1 } = options;

    const ambientLight = new THREE.AmbientLight(color, intensity);
    this.scene.add(ambientLight);

    this.lights.set("ambient", ambientLight);
    return ambientLight;
  }

  /**
   * 创建主要平行光
   * @param {Object} options - 平行光配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {THREE.Vector3} options.target - 灯光目标点
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   * @param {boolean} options.castShadow - 是否投射阴影
   * @param {Object} options.shadow - 阴影配置
   */
  createMainDirectionalLight(options = {}) {
    const {
      position = new THREE.Vector3(0, 10, 10),
      target = new THREE.Vector3(0, 0, 0),
      color = 0xffffff,
      intensity = 1.0,
      castShadow = true,
      shadow = {},
    } = options;

    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.copy(position);

    // 设置灯光目标
    directionalLight.target.position.copy(target);
    this.scene.add(directionalLight.target);

    // 启用阴影
    if (castShadow) {
      directionalLight.castShadow = true;

      // 阴影配置
      const {
        mapSize = 2048,
        near = 0.5,
        far = 50,
        left = -10,
        right = 10,
        top = 10,
        bottom = -10,
      } = shadow;

      directionalLight.shadow.mapSize.width = mapSize;
      directionalLight.shadow.mapSize.height = mapSize;
      directionalLight.shadow.camera.near = near;
      directionalLight.shadow.camera.far = far;
      directionalLight.shadow.camera.left = left;
      directionalLight.shadow.camera.right = right;
      directionalLight.shadow.camera.top = top;
      directionalLight.shadow.camera.bottom = bottom;
    }

    this.scene.add(directionalLight);
    this.lights.set("main", directionalLight);

    return directionalLight;
  }

  /**
   * 创建填充光
   * @param {Object} options - 填充光配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   */
  createFillLight(options = {}) {
    const {
      position = new THREE.Vector3(-5, 5, 5),
      color = 0xffffff,
      intensity = 0.3,
    } = options;

    const fillLight = new THREE.DirectionalLight(color, intensity);
    fillLight.position.copy(position);

    this.scene.add(fillLight);
    this.lights.set("fill", fillLight);

    return fillLight;
  }

  /**
   * 根据模型包围盒设置灯光位置
   * @param {THREE.Box3} boundingBox - 模型包围盒
   * @param {THREE.Vector3} center - 模型中心点
   * @param {number} radius - 模型半径
   * @param {THREE.Vector3} sceneOffset - 场景偏移量
   */
  setupForModel(
    boundingBox,
    center,
    radius,
    sceneOffset = new THREE.Vector3(0, 0, 0)
  ) {
    if (!this.scene) {
      throw new Error("灯光管理器未初始化，请先调用 init() 方法");
    }

    // 计算灯光距离
    const lightDistance = radius * 3;

    // 创建环境光
    this.createAmbientLight({ color: 0xffffff, intensity: 1 });

    // 创建主要平行光
    const mainLightPosition = new THREE.Vector3(
      center.x + sceneOffset.x + lightDistance,
      center.y + lightDistance,
      center.z + lightDistance
    );

    const mainLightTarget = new THREE.Vector3(
      center.x + sceneOffset.x,
      center.y,
      center.z
    );

    const mainLight = this.createMainDirectionalLight({
      position: mainLightPosition,
      target: mainLightTarget,
      color: 0xffffff,
      intensity: 1.0,
      castShadow: true,
      shadow: {
        mapSize: 2048,
        near: 0.5,
        far: lightDistance * 3,
        left: -radius * 2,
        right: radius * 2,
        top: radius * 2,
        bottom: -radius * 2,
      },
    });

    // 创建填充光
    const fillLightPosition = new THREE.Vector3(
      center.x + sceneOffset.x - lightDistance * 0.5,
      center.y + lightDistance * 0.5,
      center.z + lightDistance * 0.5
    );

    this.createFillLight({
      position: fillLightPosition,
      color: 0xffffff,
      intensity: 0.3,
    });

    return {
      mainLight,
      ambientLight: this.lights.get("ambient"),
      fillLight: this.lights.get("fill"),
      lightDistance,
    };
  }

  /**
   * 获取指定名称的灯光
   * @param {string} name - 灯光名称
   */
  getLight(name) {
    return this.lights.get(name);
  }

  /**
   * 获取所有灯光
   */
  getAllLights() {
    return Array.from(this.lights.values());
  }

  /**
   * 设置灯光强度
   * @param {string} name - 灯光名称
   * @param {number} intensity - 新强度
   */
  setLightIntensity(name, intensity) {
    const light = this.lights.get(name);
    if (light) {
      light.intensity = intensity;
    }
  }

  /**
   * 设置灯光颜色
   * @param {string} name - 灯光名称
   * @param {number} color - 新颜色
   */
  setLightColor(name, color) {
    const light = this.lights.get(name);
    if (light) {
      light.color.setHex(color);
    }
  }

  /**
   * 启用/禁用阴影
   * @param {string} name - 灯光名称
   * @param {boolean} enabled - 是否启用
   */
  setShadowEnabled(name, enabled) {
    const light = this.lights.get(name);
    if (light && light.castShadow !== undefined) {
      light.castShadow = enabled;
    }
  }

  /**
   * 清理所有灯光
   */
  dispose() {
    this.lights.forEach((light) => {
      if (light.target) {
        this.scene.remove(light.target);
      }
      this.scene.remove(light);
    });
    this.lights.clear();
  }
}
