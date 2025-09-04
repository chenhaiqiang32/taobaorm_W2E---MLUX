import * as THREE from "three";

/**
 * 背景管理器
 * 负责创建和管理背景环境、自定义着色器材质
 */
export class BackgroundManager {
  constructor() {
    this.scene = null;
    this.backgroundSphere = null;
    this.textureLoader = null;
  }

  /**
   * 初始化背景管理器
   * @param {THREE.Scene} scene - 场景对象
   */
  init(scene) {
    this.scene = scene;
    this.textureLoader = new THREE.TextureLoader();
  }

  /**
   * 创建自定义背景球体
   * @param {Object} options - 背景配置
   * @param {string} options.texturePath - 纹理图片路径
   * @param {number} options.radius - 球体半径
   * @param {number} options.segments - 球体分段数
   * @param {Object} options.shader - 着色器参数
   */
  createBackgroundSphere(options = {}) {
    const {
      texturePath = "./sunny2.jpg",
      radius = 500,
      segments = 32,
      shader = {},
    } = options;

    // 加载背景纹理
    const backgroundTexture = this.textureLoader.load(texturePath);

    // 设置纹理属性
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    backgroundTexture.generateMipmaps = false;
    backgroundTexture.magFilter = THREE.LinearFilter;
    backgroundTexture.minFilter = THREE.LinearFilter;

    // 着色器参数
    const { brightness = 1, saturation = 1, contrast = 1 } = shader;

    // 创建自定义着色器材质
    const backgroundMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: backgroundTexture },
        brightness: { value: brightness },
        saturation: { value: saturation },
        contrast: { value: contrast },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float brightness;
        uniform float saturation;
        uniform float contrast;
        varying vec2 vUv;
        
        vec3 adjustSaturation(vec3 color, float saturation) {
          vec3 luminance = vec3(0.299, 0.587, 0.114);
          float grey = dot(color, luminance);
          return mix(vec3(grey), color, saturation);
        }
        
        void main() {
          vec4 texColor = texture2D(tDiffuse, vUv);
          
          // 调整亮度
          vec3 color = texColor.rgb * brightness;
          
          // 调整饱和度
          color = adjustSaturation(color, saturation);
          
          // 调整对比度
          color = (color - 0.5) * contrast + 0.5;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false,
    });

    // 创建球体几何体
    const backgroundGeometry = new THREE.SphereGeometry(
      radius,
      segments,
      segments
    );

    // 创建背景球体
    this.backgroundSphere = new THREE.Mesh(
      backgroundGeometry,
      backgroundMaterial
    );
    this.backgroundSphere.renderOrder = -1; // 确保背景最先渲染

    // 添加到场景
    this.scene.add(this.backgroundSphere);

    return this.backgroundSphere;
  }

  /**
   * 更新着色器参数
   * @param {Object} params - 新的着色器参数
   */
  updateShaderParams(params = {}) {
    if (!this.backgroundSphere || !this.backgroundSphere.material) return;

    const material = this.backgroundSphere.material;

    if (params.brightness !== undefined) {
      material.uniforms.brightness.value = params.brightness;
    }

    if (params.saturation !== undefined) {
      material.uniforms.saturation.value = params.saturation;
    }

    if (params.contrast !== undefined) {
      material.uniforms.contrast.value = params.contrast;
    }
  }

  /**
   * 设置背景纹理
   * @param {string} texturePath - 新纹理路径
   */
  setBackgroundTexture(texturePath) {
    if (!this.backgroundSphere || !this.backgroundSphere.material) return;

    const newTexture = this.textureLoader.load(texturePath);

    // 设置纹理属性
    newTexture.colorSpace = THREE.SRGBColorSpace;
    newTexture.generateMipmaps = false;
    newTexture.magFilter = THREE.LinearFilter;
    newTexture.minFilter = THREE.LinearFilter;

    // 更新着色器中的纹理
    this.backgroundSphere.material.uniforms.tDiffuse.value = newTexture;
  }

  /**
   * 获取背景球体
   */
  getBackgroundSphere() {
    return this.backgroundSphere;
  }

  /**
   * 获取当前着色器参数
   */
  getShaderParams() {
    if (!this.backgroundSphere || !this.backgroundSphere.material) return null;

    const material = this.backgroundSphere.material;
    return {
      brightness: material.uniforms.brightness.value,
      saturation: material.uniforms.saturation.value,
      contrast: material.uniforms.contrast.value,
    };
  }

  /**
   * 设置背景可见性
   * @param {boolean} visible - 是否可见
   */
  setVisible(visible) {
    if (this.backgroundSphere) {
      this.backgroundSphere.visible = visible;
    }
  }

  /**
   * 清理背景资源
   */
  dispose() {
    if (this.backgroundSphere) {
      if (this.backgroundSphere.material) {
        this.backgroundSphere.material.dispose();
      }
      if (this.backgroundSphere.geometry) {
        this.backgroundSphere.geometry.dispose();
      }
      this.scene.remove(this.backgroundSphere);
      this.backgroundSphere = null;
    }
  }
}
