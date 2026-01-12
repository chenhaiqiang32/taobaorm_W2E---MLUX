/**
 * 后处理效果管理器
 * 负责管理Three.js的后处理效果，包括OutlinePass等
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { SSAARenderPass } from 'three/examples/jsm/postprocessing/SSAARenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { POSTPROCESSING_CONFIG } from '../assets/postprocessingConfig.js';

export class PostprocessingManager {
  constructor() {
    this.composer = null;
    this.renderPass = null;
    this.outlinePass = null;
    this.antialiasPass = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    
    // 当前高亮的对象
    this.currentHighlightedObjects = [];
    
    // 从配置文件读取抗锯齿配置
    this.antialiasConfig = {
      enabled: POSTPROCESSING_CONFIG.antialias?.enabled ?? true,
      type: POSTPROCESSING_CONFIG.antialias?.type ?? 'SMAA', // 'SMAA', 'FXAA', 'SSAA', 'none'
      quality: POSTPROCESSING_CONFIG.antialias?.quality ?? 'high' // 'low', 'medium', 'high'
    };
    
    // 使用配置文件中的默认配置
    this.defaultConfig = {
      outline: POSTPROCESSING_CONFIG.outline,
      antialias: this.antialiasConfig
    };
  }

  /**
   * 初始化后处理管理器
   * @param {THREE.WebGLRenderer} renderer - WebGL渲染器
   * @param {THREE.Scene} scene - 场景对象
   * @param {THREE.Camera} camera - 相机对象
   * @param {Object} config - 配置选项
   */
  init(renderer, scene, camera, config = {}) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    
    // 合并配置
    this.config = { ...this.defaultConfig, ...config };
    
    // 更新抗锯齿配置（使用合并后的配置）
    if (this.config.antialias) {
      this.antialiasConfig = { ...this.antialiasConfig, ...this.config.antialias };
    }
    
    // 创建效果合成器
    this.composer = new EffectComposer(renderer);
    
    // 创建渲染通道
    this.renderPass = new RenderPass(scene, camera);
    this.composer.addPass(this.renderPass);
    
    // 创建轮廓通道
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    
    // 应用配置
    this.applyOutlineConfig(this.config.outline);
    
    // 添加到合成器
    this.composer.addPass(this.outlinePass);
    
    // 创建抗锯齿通道
    this.createAntialiasPass();
    
    this.isInitialized = true;
    console.log('🎨 后处理管理器初始化完成');
  }

  /**
   * 创建抗锯齿通道
   */
  createAntialiasPass() {
    if (!this.composer || !this.antialiasConfig.enabled) {
      return;
    }
    
    const { type, quality } = this.antialiasConfig;
    
    try {
      switch (type) {
        case 'SMAA':
          this.antialiasPass = new SMAAPass(
            window.innerWidth,
            window.innerHeight
          );
          console.log('✅ SMAA抗锯齿通道已创建 (高质量)');
          break;
          
        case 'FXAA':
          // 创建FXAA着色器通道
          const fxaaPass = new ShaderPass(FXAAShader);
          // 设置FXAA分辨率
          const pixelRatio = this.renderer.getPixelRatio();
          fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
          fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
          this.antialiasPass = fxaaPass;
          console.log('✅ FXAA抗锯齿通道已创建');
          break;
          
        case 'SSAA':
          // SSAA需要替换RenderPass，所以这里我们暂时跳过
          // 在实际应用中，SSAA通常通过提高渲染分辨率实现
          console.log('ℹ️ SSAA抗锯齿需要特殊处理，暂时跳过');
          return;
          
        default:
          console.log('ℹ️ 未启用抗锯齿');
          return;
      }
      
      // 添加到合成器的最后（在轮廓效果之后）
      this.composer.addPass(this.antialiasPass);
      console.log(`🎯 抗锯齿类型: ${type}, 质量: ${quality}`);
      
    } catch (error) {
      console.warn('⚠️ 创建抗锯齿通道失败:', error);
      this.antialiasPass = null;
    }
  }

  /**
   * 应用轮廓配置
   * @param {Object} outlineConfig - 轮廓配置
   */
  applyOutlineConfig(outlineConfig) {
    if (!this.outlinePass) return;
    
    this.outlinePass.visibleEdgeColor.setHex(outlineConfig.visibleEdgeColor);
    this.outlinePass.hiddenEdgeColor.setHex(outlineConfig.hiddenEdgeColor);
    this.outlinePass.edgeGlow = outlineConfig.edgeGlow;
    this.outlinePass.usePatternTexture = outlineConfig.usePatternTexture;
    this.outlinePass.edgeThickness = outlineConfig.edgeThickness;
    this.outlinePass.edgeStrength = outlineConfig.edgeStrength;
    this.outlinePass.downSampleRatio = outlineConfig.downSampleRatio;
    this.outlinePass.pulsePeriod = outlineConfig.pulsePeriod;
    
    if (outlineConfig.resolution.x > 0 && outlineConfig.resolution.y > 0) {
      this.outlinePass.setSize(outlineConfig.resolution.x, outlineConfig.resolution.y);
    }
  }

  /**
   * 应用抗锯齿配置
   * @param {Object} antialiasConfig - 抗锯齿配置
   */
  applyAntialiasConfig(antialiasConfig) {
    this.antialiasConfig = { ...this.antialiasConfig, ...antialiasConfig };
    
    // 如果抗锯齿通道已存在，先移除
    if (this.antialiasPass && this.composer) {
      this.composer.removePass(this.antialiasPass);
      this.antialiasPass = null;
    }
    
    // 重新创建抗锯齿通道
    this.createAntialiasPass();
    
    console.log('🎯 抗锯齿配置已应用:', this.antialiasConfig);
  }

  /**
   * 设置抗锯齿类型
   * @param {string} type - 抗锯齿类型 ('SMAA', 'SSAA', 'none')
   */
  setAntialiasType(type) {
    this.applyAntialiasConfig({ type });
  }

  /**
   * 启用/禁用抗锯齿
   * @param {boolean} enabled - 是否启用
   */
  setAntialiasEnabled(enabled) {
    this.applyAntialiasConfig({ enabled });
  }

  /**
   * 重新加载配置文件中的配置
   */
  async reloadConfig() {
    try {
      // 重新导入配置文件
      const { POSTPROCESSING_CONFIG: newConfig } = await import('../assets/postprocessingConfig.js');
      
      // 更新默认配置
      this.defaultConfig.outline = newConfig.outline;
      
      // 重新应用配置
      this.applyOutlineConfig(newConfig.outline);
      
      console.log('✅ 配置文件已重新加载并应用');
      console.log('📊 新配置:', {
        visibleEdgeColor: this.outlinePass.visibleEdgeColor.getHexString(),
        hiddenEdgeColor: this.outlinePass.hiddenEdgeColor.getHexString(),
        edgeGlow: this.outlinePass.edgeGlow,
        edgeThickness: this.outlinePass.edgeThickness,
        edgeStrength: this.outlinePass.edgeStrength,
        downSampleRatio: this.outlinePass.downSampleRatio,
        pulsePeriod: this.outlinePass.pulsePeriod
      });
      
      return true;
    } catch (error) {
      console.error('❌ 重新加载配置失败:', error);
      return false;
    }
  }

  /**
   * 高亮指定对象
   * @param {Array|THREE.Object3D} objects - 要高亮的对象或对象数组
   */
  highlightObjects(objects) {
    if (!this.outlinePass || !this.isInitialized) {
      console.warn('后处理管理器未初始化');
      return;
    }
    
    // 清除之前的高亮
    this.clearHighlight();
    
    // 确保objects是数组
    const objectArray = Array.isArray(objects) ? objects : [objects];
    
    // 过滤有效的对象
    const validObjects = objectArray.filter(obj => obj && obj.isObject3D);
    
    if (validObjects.length === 0) {
      console.warn('没有有效的对象可以高亮');
      return;
    }
    
    // 设置高亮对象
    this.outlinePass.selectedObjects = validObjects;
    this.currentHighlightedObjects = [...validObjects];
    
    console.log(`🎯 高亮 ${validObjects.length} 个对象:`, validObjects.map(obj => obj.name || 'unnamed'));
  }

  /**
   * 清除高亮效果
   */
  clearHighlight() {
    if (!this.outlinePass || !this.isInitialized) {
      return;
    }
    
    this.outlinePass.selectedObjects = [];
    this.currentHighlightedObjects = [];
    console.log('🧹 清除高亮效果');
  }

  /**
   * 获取当前高亮的对象
   * @returns {Array} 当前高亮的对象数组
   */
  getHighlightedObjects() {
    return [...this.currentHighlightedObjects];
  }

  /**
   * 检查对象是否被高亮
   * @param {THREE.Object3D} object - 要检查的对象
   * @returns {boolean} 是否被高亮
   */
  isObjectHighlighted(object) {
    return this.currentHighlightedObjects.includes(object);
  }

  /**
   * 更新配置
   * @param {Object} newConfig - 新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.outline) {
      this.applyOutlineConfig(newConfig.outline);
    }
    
    if (newConfig.antialias) {
      this.applyAntialiasConfig(newConfig.antialias);
    }
    
    console.log('⚙️ 后处理配置已更新');
  }

  /**
   * 调整大小
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height) {
    if (!this.composer || !this.isInitialized) {
      return;
    }
    
    this.composer.setSize(width, height);
    
    if (this.outlinePass) {
      this.outlinePass.setSize(width, height);
    }
    
    // 更新抗锯齿通道尺寸
    if (this.antialiasPass) {
      // 检查是否是FXAA（ShaderPass）
      if (this.antialiasPass.material && this.antialiasPass.material.uniforms && this.antialiasPass.material.uniforms['resolution']) {
        // FXAA需要更新分辨率uniform
        const pixelRatio = this.renderer.getPixelRatio();
        this.antialiasPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
        this.antialiasPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
      } else {
        // SMAA或其他类型需要重新创建
        this.composer.removePass(this.antialiasPass);
        this.antialiasPass = null;
        this.createAntialiasPass();
      }
    }
    
    console.log(`📐 后处理管理器大小已调整: ${width}x${height}`);
  }

  /**
   * 渲染
   */
  render() {
    if (!this.composer || !this.isInitialized) {
      return;
    }
    
    this.composer.render();
  }

  /**
   * 获取效果合成器
   * @returns {EffectComposer} 效果合成器
   */
  getComposer() {
    return this.composer;
  }

  /**
   * 获取轮廓通道
   * @returns {OutlinePass} 轮廓通道
   */
  getOutlinePass() {
    return this.outlinePass;
  }

  /**
   * 获取抗锯齿通道
   * @returns {SMAAPass|SSAARenderPass|null} 抗锯齿通道
   */
  getAntialiasPass() {
    return this.antialiasPass;
  }

  /**
   * 获取抗锯齿配置
   * @returns {Object} 抗锯齿配置
   */
  getAntialiasConfig() {
    return { ...this.antialiasConfig };
  }

  /**
   * 检查抗锯齿是否启用
   * @returns {boolean} 是否启用
   */
  isAntialiasEnabled() {
    return this.antialiasConfig.enabled && this.antialiasPass !== null;
  }

  /**
   * 调试：输出当前状态
   */
  debugStatus() {
    console.log('🔍 后处理管理器状态:');
    console.log('  - 初始化状态:', this.isInitialized);
    console.log('  - 合成器:', !!this.composer);
    console.log('  - 轮廓通道:', !!this.outlinePass);
    console.log('  - 抗锯齿通道:', !!this.antialiasPass);
    console.log('  - 抗锯齿配置:', this.antialiasConfig);
    console.log('  - 当前高亮对象数量:', this.currentHighlightedObjects.length);
    console.log('  - 高亮对象:', this.currentHighlightedObjects.map(obj => obj.name || 'unnamed'));
    
    if (this.outlinePass) {
      console.log('  - 轮廓配置:', {
        visibleEdgeColor: this.outlinePass.visibleEdgeColor.getHexString(),
        hiddenEdgeColor: this.outlinePass.hiddenEdgeColor.getHexString(),
        edgeThickness: this.outlinePass.edgeThickness,
        edgeStrength: this.outlinePass.edgeStrength
      });
    }
  }

  /**
   * 销毁管理器
   */
  dispose() {
    this.clearHighlight();
    
    if (this.composer) {
      this.composer.dispose();
      this.composer = null;
    }
    
    this.renderPass = null;
    this.outlinePass = null;
    this.antialiasPass = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    
    console.log('🧹 后处理管理器已销毁');
  }
}
