/**
 * 后处理效果管理器
 * 负责管理Three.js的后处理效果，包括OutlinePass等
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';
import { POSTPROCESSING_CONFIG } from '../assets/postprocessingConfig.js';

export class PostprocessingManager {
  constructor() {
    this.composer = null;
    this.renderPass = null;
    this.outlinePass = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    
    // 当前高亮的对象
    this.currentHighlightedObjects = [];
    
    // 使用配置文件中的默认配置
    this.defaultConfig = {
      outline: POSTPROCESSING_CONFIG.outline
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
    
    this.isInitialized = true;
    console.log('🎨 后处理管理器初始化完成');
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
   * 调试：输出当前状态
   */
  debugStatus() {
    console.log('🔍 后处理管理器状态:');
    console.log('  - 初始化状态:', this.isInitialized);
    console.log('  - 合成器:', !!this.composer);
    console.log('  - 轮廓通道:', !!this.outlinePass);
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
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
    
    console.log('🧹 后处理管理器已销毁');
  }
}
