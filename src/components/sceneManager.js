import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { 
  environmentPresets, 
  getEnvironmentPreset, 
  validateEnvironmentConfig 
} from "../assets/enviromentConfig.js";

/**
 * 场景管理器
 * 负责创建和管理Three.js场景、环境设置和雾效
 */
export class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.pmremGenerator = null;
    // 使用配置文件中的默认配置
    this.environmentConfig = { ...environmentPresets.room };
  }

  /**
   * 初始化场景
   * @param {Object} options - 配置选项
   * @param {number} options.width - 渲染器宽度
   * @param {number} options.height - 渲染器高度
   * @param {boolean} options.enableShadows - 是否启用阴影
   * @param {boolean} options.enableAntialias - 是否启用抗锯齿
   * @param {Object} options.environment - 环境贴图配置
   */
  init(options = {}) {
    const {
      width = window.innerWidth,
      height = window.innerHeight,
      enableShadows = true,
      enableAntialias = true,
      environment = {},
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

    // 更新环境配置
    this.updateEnvironmentConfig(environment);

    // 设置线性雾效
    // this.setupFog();


    return {
      scene: this.scene,
      renderer: this.renderer,
    };
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
   * 更新环境配置
   * @param {Object} config - 环境配置
   */
  updateEnvironmentConfig(config = {}) {
    // 验证配置
    const validation = validateEnvironmentConfig(config);
    if (!validation.valid) {
      console.warn('环境配置验证失败:', validation.errors);
      return false;
    }
    
    // 合并配置
    this.environmentConfig = { ...this.environmentConfig, ...config };
    
    // 如果启用环境，则设置环境贴图
    if (this.environmentConfig.enabled) {
      this.setEnvironment(this.environmentConfig.type, this.environmentConfig);
    } else {
      this.clearEnvironment();
    }
    
    return true;
  }

  /**
   * 设置环境效果
   * @param {string} type - 环境类型: 'room', 'hdr', 'default', 'none'
   * @param {Object} options - 配置选项
   */
  setEnvironment(type = "room", options = {}) {
    // 先清理现有环境
    this.clearEnvironment();

    switch (type) {
      case "room":
        // 使用 RoomEnvironment
        this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        this.scene.environment = this.pmremGenerator.fromScene(
          new RoomEnvironment(),
          options.intensity || 0.8
        ).texture;
        console.log("已设置 RoomEnvironment，强度:", options.intensity || 0.8);
        break;

      case "hdr":
        // 使用 HDR 环境贴图
        this.setHDRSky(options);
        break;

      case "default":
        // 使用默认环境
        this.scene.background = new THREE.Color(0x87ceeb);
        console.log("已设置默认环境");
        break;

      case "none":
        // 不设置环境
        console.log("环境贴图已禁用");
        break;

      default:
        console.warn(`未知的环境类型: ${type}`);
        break;
    }

    // 更新所有材质的环境贴图
    this.updateAllMaterialsEnvironment();
  }

  /**
   * 设置 HDR 天空贴图
   * @param {Object} options - 配置选项
   */
  setHDRSky(options = {}) {
    console.log("开始加载 HDR 天空贴图...");

    const loader = new RGBELoader();
    loader.setDataType(THREE.FloatType);

    loader.load(
      options.hdrPath || this.environmentConfig.hdrPath,
      (texture) => {
        console.log("HDR 加载成功:", texture);
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.exposure = options.exposure || 2;
        this.scene.background = texture;

        // 创建环境贴图副本，设置强度
        const envTexture = texture.clone();
        envTexture.intensity = options.intensity || this.environmentConfig.intensity;
        this.scene.environment = envTexture;

        console.log("HDR 天空贴图设置完成，强度:", envTexture.intensity);
      },
      (progress) => {
        if (progress.lengthComputable) {
          console.log(
            "HDR 加载进度:",
            (progress.loaded / progress.total) * 100 + "%"
          );
        }
      },
      (error) => {
        console.error("HDR 加载失败:", error);
        console.log("尝试使用备用方案...");
        this.setFallbackSky(options);
      }
    );
  }

  /**
   * 备用天空设置方案
   * @param {Object} options - 配置选项
   */
  setFallbackSky(options = {}) {
    try {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        options.fallbackPath || this.environmentConfig.fallbackPath,
        (texture) => {
          console.log("备用方案加载成功");
          texture.mapping = THREE.EquirectangularReflectionMapping;
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.exposure = options.exposure || 0.2;
          this.scene.background = texture;

          // 创建环境贴图副本，设置强度
          const envTexture = texture.clone();
          envTexture.intensity = options.intensity || this.environmentConfig.intensity;
          this.scene.environment = envTexture;
        },
        undefined,
        (error) => {
          console.error("备用方案也失败:", error);
          // 最后使用默认的天空颜色
          this.scene.background = new THREE.Color(0x87ceeb);
          console.log("使用默认天空蓝色");
        }
      );
    } catch (error) {
      console.error("备用方案初始化失败:", error);
      this.scene.background = new THREE.Color(0x87ceeb);
      console.log("使用默认天空蓝色");
    }
  }

  /**
   * 更新所有材质的环境贴图
   */
  updateAllMaterialsEnvironment() {
    this.scene.traverse((object) => {
      if (object.isMesh && object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => {
            this.setupMaterialEnvironment(material);
          });
        } else {
          this.setupMaterialEnvironment(object.material);
        }
      }
    });
  }

  /**
   * 设置单个材质的环境贴图
   * @param {THREE.Material} material
   */
  setupMaterialEnvironment(material) {
    if (
      material &&
      (material.isMeshStandardMaterial || material.isMeshPhysicalMaterial)
    ) {
      if (this.scene.environment) {
        material.envMap = this.scene.environment;
        material.envMapIntensity = this.environmentConfig.intensity;
        material.needsUpdate = true;
      }
    }
  }

  /**
   * 清理环境贴图资源
   */
  clearEnvironment() {
    if (this.scene.environment) {
      this.scene.environment.dispose();
      this.scene.environment = null;
    }
    if (this.scene.background) {
      this.scene.background.dispose();
      this.scene.background = null;
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.clearEnvironment();
    if (this.pmremGenerator) {
      this.pmremGenerator.dispose();
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
