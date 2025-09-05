import * as THREE from "three";
import { lightConfig, getEnabledLights, getLightConfig } from "../assets/lightConfig.js";

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
   * 从配置文件加载所有灯光
   * @param {Array} config - 灯光配置数组，如果不提供则使用默认配置
   */
  loadFromConfig(config = null) {
    if (!this.scene) {
      throw new Error("灯光管理器未初始化，请先调用 init() 方法");
    }

    // 清理现有灯光
    this.dispose();

    // 使用提供的配置或默认配置
    const lightConfigs = config || getEnabledLights();

    // 遍历配置创建灯光
    lightConfigs.forEach(lightData => {
      if (lightData.enabled) {
        this.createLightFromConfig(lightData);
      }
    });

    return this.getAllLights();
  }

  /**
   * 根据配置创建灯光
   * @param {Object} lightData - 灯光配置数据
   * @returns {THREE.Light} 创建的灯光对象
   */
  createLightFromConfig(lightData) {
    const { type, name, enabled = true } = lightData;

    if (!enabled) {
      return null;
    }

    let light;

    switch (type) {
      case 'ambient':
        light = this.createAmbientLight(lightData);
        break;
      case 'directional':
        light = this.createDirectionalLight(lightData);
        break;
      case 'point':
        light = this.createPointLight(lightData);
        break;
      case 'spot':
        light = this.createSpotLight(lightData);
        break;
      case 'hemisphere':
        light = this.createHemisphereLight(lightData);
        break;
      default:
        console.warn(`未知的灯光类型: ${type}`);
        return null;
    }

    if (light) {
      this.lights.set(name, light);
    }

    return light;
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

    return ambientLight;
  }

  /**
   * 创建平行光
   * @param {Object} options - 平行光配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {THREE.Vector3} options.target - 灯光目标点
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   * @param {boolean} options.castShadow - 是否投射阴影
   * @param {Object} options.shadow - 阴影配置
   */
  createDirectionalLight(options = {}) {
    const {
      position = new THREE.Vector3(0, 10, 10),
      target = new THREE.Vector3(0, 0, 0),
      color = 0xffffff,
      intensity = 1.0,
      castShadow = true,
      shadow = {},
    } = options;

    const directionalLight = new THREE.DirectionalLight(color, intensity);
    
    // 设置位置
    if (position) {
      directionalLight.position.set(position.x, position.y, position.z);
    }

    // 设置灯光目标
    if (target) {
      directionalLight.target.position.set(target.x, target.y, target.z);
      this.scene.add(directionalLight.target);
    }

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
        bias = -0.001,
        normalBias = 0.02
      } = shadow;

      directionalLight.shadow.mapSize.width = mapSize;
      directionalLight.shadow.mapSize.height = mapSize;
      directionalLight.shadow.camera.near = near;
      directionalLight.shadow.camera.far = far;
      directionalLight.shadow.camera.left = left;
      directionalLight.shadow.camera.right = right;
      directionalLight.shadow.camera.top = top;
      directionalLight.shadow.camera.bottom = bottom;
      directionalLight.shadow.bias = bias;
      directionalLight.shadow.normalBias = normalBias;
    }

    this.scene.add(directionalLight);
    return directionalLight;
  }

  /**
   * 创建点光源
   * @param {Object} options - 点光源配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   * @param {number} options.distance - 灯光距离
   * @param {number} options.decay - 衰减
   * @param {boolean} options.castShadow - 是否投射阴影
   * @param {Object} options.shadow - 阴影配置
   */
  createPointLight(options = {}) {
    const {
      position = new THREE.Vector3(0, 5, 0),
      color = 0xffffff,
      intensity = 1.0,
      distance = 0,
      decay = 2,
      castShadow = false,
      shadow = {},
    } = options;

    const pointLight = new THREE.PointLight(color, intensity, distance, decay);
    
    // 设置位置
    if (position) {
      pointLight.position.set(position.x, position.y, position.z);
    }

    // 启用阴影
    if (castShadow) {
      pointLight.castShadow = true;

      // 阴影配置
      const {
        mapSize = 1024,
        near = 0.1,
        far = 20,
        bias = -0.001,
        normalBias = 0.02
      } = shadow;

      pointLight.shadow.mapSize.width = mapSize;
      pointLight.shadow.mapSize.height = mapSize;
      pointLight.shadow.camera.near = near;
      pointLight.shadow.camera.far = far;
      pointLight.shadow.bias = bias;
      pointLight.shadow.normalBias = normalBias;
    }

    this.scene.add(pointLight);
    return pointLight;
  }

  /**
   * 创建聚光灯
   * @param {Object} options - 聚光灯配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {THREE.Vector3} options.target - 灯光目标点
   * @param {number} options.color - 灯光颜色
   * @param {number} options.intensity - 灯光强度
   * @param {number} options.distance - 灯光距离
   * @param {number} options.angle - 光束角度
   * @param {number} options.penumbra - 半影
   * @param {number} options.decay - 衰减
   * @param {boolean} options.castShadow - 是否投射阴影
   * @param {Object} options.shadow - 阴影配置
   */
  createSpotLight(options = {}) {
    const {
      position = new THREE.Vector3(0, 10, 0),
      target = new THREE.Vector3(0, 0, 0),
      color = 0xffffff,
      intensity = 1.0,
      distance = 0,
      angle = Math.PI / 3,
      penumbra = 0,
      decay = 2,
      castShadow = false,
      shadow = {},
    } = options;

    const spotLight = new THREE.SpotLight(color, intensity, distance, angle, penumbra, decay);
    
    // 设置位置
    if (position) {
      spotLight.position.set(position.x, position.y, position.z);
    }

    // 设置灯光目标
    if (target) {
      spotLight.target.position.set(target.x, target.y, target.z);
      this.scene.add(spotLight.target);
    }

    // 启用阴影
    if (castShadow) {
      spotLight.castShadow = true;

      // 阴影配置
      const {
        mapSize = 1024,
        near = 0.1,
        far = 20,
        bias = -0.001,
        normalBias = 0.02
      } = shadow;

      spotLight.shadow.mapSize.width = mapSize;
      spotLight.shadow.mapSize.height = mapSize;
      spotLight.shadow.camera.near = near;
      spotLight.shadow.camera.far = far;
      spotLight.shadow.bias = bias;
      spotLight.shadow.normalBias = normalBias;
    }

    this.scene.add(spotLight);
    return spotLight;
  }

  /**
   * 创建半球光
   * @param {Object} options - 半球光配置
   * @param {THREE.Vector3} options.position - 灯光位置
   * @param {number} options.skyColor - 天空颜色
   * @param {number} options.groundColor - 地面颜色
   * @param {number} options.intensity - 灯光强度
   */
  createHemisphereLight(options = {}) {
    const {
      position = new THREE.Vector3(0, 10, 0),
      skyColor = 0x87ceeb,
      groundColor = 0x8b4513,
      intensity = 1.0,
    } = options;

    const hemisphereLight = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    
    // 设置位置
    if (position) {
      hemisphereLight.position.set(position.x, position.y, position.z);
    }

    this.scene.add(hemisphereLight);
    return hemisphereLight;
  }

  /**
   * 创建主要平行光（保持向后兼容）
   * @param {Object} options - 平行光配置
   */
  createMainDirectionalLight(options = {}) {
    return this.createDirectionalLight(options);
  }

  /**
   * 创建填充光（保持向后兼容）
   * @param {Object} options - 填充光配置
   */
  createFillLight(options = {}) {
    return this.createDirectionalLight(options);
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
   * 启用/禁用灯光
   * @param {string} name - 灯光名称
   * @param {boolean} enabled - 是否启用
   */
  setLightEnabled(name, enabled) {
    const light = this.lights.get(name);
    if (light) {
      light.visible = enabled;
    }
  }

  /**
   * 更新灯光配置
   * @param {string} name - 灯光名称
   * @param {Object} newConfig - 新的配置参数
   */
  updateLightConfig(name, newConfig) {
    const light = this.lights.get(name);
    if (!light) {
      console.warn(`灯光 ${name} 不存在`);
      return;
    }

    // 更新强度
    if (newConfig.intensity !== undefined) {
      light.intensity = newConfig.intensity;
    }

    // 更新颜色
    if (newConfig.color !== undefined) {
      light.color.setHex(newConfig.color);
    }

    // 更新位置
    if (newConfig.position !== undefined) {
      light.position.set(newConfig.position.x, newConfig.position.y, newConfig.position.z);
    }

    // 更新目标位置（仅适用于有目标的灯光）
    if (newConfig.target !== undefined && light.target) {
      light.target.position.set(newConfig.target.x, newConfig.target.y, newConfig.target.z);
    }

    // 更新阴影设置
    if (newConfig.castShadow !== undefined && light.castShadow !== undefined) {
      light.castShadow = newConfig.castShadow;
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
