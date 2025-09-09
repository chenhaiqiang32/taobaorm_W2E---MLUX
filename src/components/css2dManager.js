/**
 * CSS2D标签管理器
 * 负责创建和管理3D场景中的2D标签
 */

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export class CSS2DManager {
  constructor() {
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.labels = new Map();
    this.templates = new Map();
    this.debugMode = false; // 调试模式开关
    
    // 初始化默认模板
    this.initDefaultTemplates();
  }

  /**
   * 初始化CSS2D管理器
   * @param {THREE.Scene} scene - 场景对象
   * @param {THREE.Camera} camera - 相机对象
   * @param {Object} options - 配置选项
   */
  init(scene, camera, options = {}) {
    this.scene = scene;
    this.camera = camera;
    
    // 创建CSS2D渲染器
    this.renderer = new CSS2DRenderer();
    this.renderer.setSize(options.width || 800, options.height || 600);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0px';
    this.renderer.domElement.style.pointerEvents = 'none';
    this.renderer.domElement.style.zIndex = '1002'; // 比简单CSS2D高
    
    // 添加到DOM - 尝试添加到canvas容器，如果不存在则添加到body
    const canvasContainer = document.querySelector('canvas')?.parentElement;
    if (canvasContainer) {
      canvasContainer.appendChild(this.renderer.domElement);
      console.log('🎯 CSS2D渲染器添加到canvas容器');
    } else {
      document.body.appendChild(this.renderer.domElement);
      console.log('🎯 CSS2D渲染器添加到body');
    }
    
    // 创建测试标签（调试用）
    if (this.debugMode) {
      this.createTestLabel();
    }
    
    console.log('🎯 CSS2DManager 初始化完成');
  }

  /**
   * 创建测试标签
   */
  createTestLabel() {
    // 创建最简单的测试标签
    const testDiv = document.createElement('div');
    testDiv.style.cssText = `
      background: rgba(0, 255, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      user-select: none;
      border: 2px solid #00ff00;
      min-width: 100px;
      text-align: center;
    `;
    testDiv.textContent = 'CSS2DManager测试';
    
    const testLabel = new CSS2DObject(testDiv);
    testLabel.position.set(0, 5, 0);
    
    // 添加到场景
    this.scene.add(testLabel);
    this.labels.set('simple_test', testLabel);
    
    console.log('🧪 CSS2DManager简单测试标签已创建:', testLabel);
    console.log('🧪 标签位置:', testLabel.position);
    console.log('🧪 场景子对象数量:', this.scene.children.length);
  }

  /**
   * 初始化默认DOM模板
   */
  initDefaultTemplates() {
    // 模板1：简单标题模板（使用简单样式）
    this.templates.set('title', {
      create: (data) => {
        const div = document.createElement('div');
        
        // 使用简单的内联样式
        div.style.cssText = `
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          user-select: none;
          border: 2px solid #00ff88;
          min-width: 100px;
          text-align: center;
          font-family: Arial, sans-serif;
        `;
        
        div.innerHTML = `
          <div style="font-weight: bold; color: #00ff88;">${data.title || '标题'}</div>
        `;
        return div;
      }
    });

    // 模板2：标题+属性列表模板（优化样式）
    this.templates.set('info', {
      create: (data) => {
        const div = document.createElement('div');
        
        // 优化的内联样式 - 更现代的设计
        div.style.cssText = `
          background: linear-gradient(135deg, rgba(0, 136, 255, 0.95) 0%, rgba(0, 100, 200, 0.9) 100%);
          color: white;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          pointer-events: none;
          user-select: none;
          border: 1px solid rgba(255, 255, 255, 0.2);
          min-width: 140px;
          max-width: 200px;
          text-align: left;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-shadow: 0 4px 20px rgba(0, 136, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          position: relative;
          overflow: hidden;
        `;
        
        // 添加顶部装饰条
        const topBar = document.createElement('div');
        topBar.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #00ff88, #0088ff, #ff8800);
          border-radius: 12px 12px 0 0;
        `;
        
        let configsHtml = '';
        if (data.configs && Array.isArray(data.configs)) {
          configsHtml = data.configs.map((config, index) => 
            `<div style="
              margin: 6px 0;
              padding: 4px 8px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              border-left: 3px solid rgba(255, 255, 255, 0.3);
              transition: all 0.2s ease;
            ">
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-size: 11px;
              ">
                <span style="
                  color: rgba(255, 255, 255, 0.8);
                  font-weight: 500;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">${config.label}</span>
                <span style="
                  color: #fff;
                  font-weight: 600;
                  background: rgba(255, 255, 255, 0.15);
                  padding: 2px 6px;
                  border-radius: 4px;
                  font-size: 10px;
                ">${config.value}</span>
              </div>
            </div>`
          ).join('');
        }
        
        div.innerHTML = `
          <div style="
            font-weight: 600;
            margin-bottom: 8px;
            color: #fff;
            font-size: 14px;
            text-align: center;
            padding-bottom: 6px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
          ">${data.title || '设备信息'}</div>
          <div style="margin-top: 4px;">
            ${configsHtml}
          </div>
        `;
        
        // 插入装饰条
        div.insertBefore(topBar, div.firstChild);
        
        return div;
      }
    });

    // 模板3：详细属性模板（使用简单样式）
    this.templates.set('detail', {
      create: (data) => {
        const div = document.createElement('div');
        
        // 使用简单的内联样式
        div.style.cssText = `
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 10px 15px;
          border-radius: 6px;
          font-size: 12px;
          pointer-events: none;
          user-select: none;
          border: 2px solid #ff8800;
          min-width: 150px;
          text-align: center;
          font-family: Arial, sans-serif;
        `;
        
        let configsHtml = '';
        if (data.configs && Array.isArray(data.configs)) {
          configsHtml = data.configs.map(config => 
            `<div style="margin: 3px 0; padding: 2px 0; border-bottom: 1px solid rgba(255,136,0,0.3);">
              <div style="font-size: 10px; color: #ffaa44; text-transform: uppercase;">${config.label}</div>
              <div style="font-size: 12px; color: #fff; font-weight: bold;">${config.value}</div>
            </div>`
          ).join('');
        }
        
        div.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 6px; color: #ff8800; font-size: 14px;">${data.title || '详细信息'}</div>
          <div>
            ${configsHtml}
          </div>
        `;
        return div;
      }
    });
  }

  /**
   * 创建CSS2D标签
   * @param {string} id - 标签唯一ID
   * @param {Object} data - 标签数据 {title, configs}
   * @param {Object} options - 选项 {position, center, type}
   */
  createLabel(id, data, options = {}) {
    // 移除已存在的标签
    this.removeLabel(id);

    // 获取模板
    const templateType = options.type || 'info';
    const template = this.templates.get(templateType);
    
    if (!template) {
      console.warn(`模板类型 "${templateType}" 不存在`);
      return null;
    }

    // 创建DOM元素
    const domElement = template.create(data);
    
    // 创建CSS2D对象
    const label = new CSS2DObject(domElement);
    
    // 设置位置
    if (options.position) {
      if (options.position.x !== undefined) {
        label.position.set(options.position.x, options.position.y || 0, options.position.z || 0);
      } else {
        label.position.copy(options.position);
      }
    } else if (options.center) {
      // 基于中心位置计算标签位置
      const offset = options.offset || { x: 0, y: 2, z: 0 };
      label.position.set(
        options.center.x + offset.x,
        options.center.y + offset.y,
        options.center.z + offset.z
      );
    }
    label.center.set(0.5, 1);
    // 设置可见性
    if (options.visible !== undefined) {
      label.visible = options.visible;
    }

    // 存储标签
    this.labels.set(id, label);
    
    // 添加到场景
    this.scene.add(label);
    
    return label;
  }

  /**
   * 更新标签数据
   * @param {string} id - 标签ID
   * @param {Object} data - 新数据
   */
  updateLabel(id, data) {
    const label = this.labels.get(id);
    if (!label) {
      console.warn(`标签 "${id}" 不存在`);
      return;
    }

    // 获取模板类型（从DOM类名推断）
    const domElement = label.element;
    let templateType = 'info';
    if (domElement.classList.contains('css2d-title')) {
      templateType = 'title';
    } else if (domElement.classList.contains('css2d-detail')) {
      templateType = 'detail';
    }

    // 重新创建DOM内容
    const template = this.templates.get(templateType);
    if (template) {
      const newDomElement = template.create(data);
      label.element.innerHTML = newDomElement.innerHTML;
    }
  }

  /**
   * 移除标签
   * @param {string} id - 标签ID
   */
  removeLabel(id) {
    const label = this.labels.get(id);
    if (label) {
      this.scene.remove(label);
      this.labels.delete(id);
      console.log(`🗑️ 移除CSS2D标签: ${id}`);
    }
  }

  /**
   * 显示/隐藏标签
   * @param {string} id - 标签ID
   * @param {boolean} visible - 是否可见
   */
  setLabelVisible(id, visible) {
    const label = this.labels.get(id);
    if (label) {
      label.visible = visible;
    }
  }

  /**
   * 调整渲染器大小
   * @param {number} width - 宽度
   * @param {number} height - 高度
   */
  resize(width, height) {
    if (this.renderer) {
      this.renderer.setSize(width, height);
    }
  }

  /**
   * 渲染CSS2D标签
   * @param {THREE.Scene} scene - 场景对象（可选，默认使用内部场景）
   * @param {THREE.Camera} camera - 相机对象（可选，默认使用内部相机）
   */
  render(scene = null, camera = null) {
    const targetScene = scene || this.scene;
    const targetCamera = camera || this.camera;
    
    if (this.renderer && targetCamera && targetScene) {
      this.renderer.render(targetScene, targetCamera);
      
      // 调试模式下每100帧输出一次信息
      if (this.debugMode) {
        if (!this._frameCount) this._frameCount = 0;
        this._frameCount++;
        if (this._frameCount % 100 === 0) {
          console.log(`🎯 CSS2D渲染: 标签数量=${this.labels.size}`);
        }
      }
    } else {
      console.warn('CSS2D渲染器未正确初始化:', {
        renderer: !!this.renderer,
        camera: !!targetCamera,
        scene: !!targetScene,
        internalCamera: !!this.camera,
        internalScene: !!this.scene
      });
    }
  }

  /**
   * 获取标签
   * @param {string} id - 标签ID
   * @returns {CSS2DObject|null} 标签对象
   */
  getLabel(id) {
    return this.labels.get(id) || null;
  }

  /**
   * 获取所有标签
   * @returns {Map} 标签映射
   */
  getAllLabels() {
    return this.labels;
  }

  /**
   * 清理所有标签
   */
  clear() {
    this.labels.forEach((label, id) => {
      this.scene.remove(label);
    });
    this.labels.clear();
    console.log('🧹 清理所有CSS2D标签');
  }

  /**
   * 启用调试模式
   */
  enableDebugMode() {
    this.debugMode = true;
    console.log('🔧 CSS2DManager调试模式已启用');
  }

  /**
   * 禁用调试模式
   */
  disableDebugMode() {
    this.debugMode = false;
    console.log('🔧 CSS2DManager调试模式已禁用');
  }

  /**
   * 调试：检查CSS2D状态
   */
  debugStatus() {
    console.log('🔍 CSS2DManager 状态检查:');
    console.log('  - 渲染器:', !!this.renderer);
    console.log('  - 场景:', !!this.scene);
    console.log('  - 相机:', !!this.camera);
    console.log('  - 标签数量:', this.labels.size);
    console.log('  - DOM元素:', !!this.renderer?.domElement);
    console.log('  - DOM元素位置:', this.renderer?.domElement?.style.position);
    console.log('  - DOM元素可见性:', this.renderer?.domElement?.style.display);
    
    if (this.renderer?.domElement) {
      const rect = this.renderer.domElement.getBoundingClientRect();
      console.log('  - DOM元素尺寸:', rect.width, 'x', rect.height);
      console.log('  - DOM元素位置:', rect.left, rect.top);
    }
    
    return {
      renderer: !!this.renderer,
      scene: !!this.scene,
      camera: !!this.camera,
      labelsCount: this.labels.size,
      domElement: !!this.renderer?.domElement
    };
  }

  /**
   * 销毁管理器
   */
  dispose() {
    this.clear();
    if (this.renderer && this.renderer.domElement) {
      const parent = this.renderer.domElement.parentElement;
      if (parent) {
        parent.removeChild(this.renderer.domElement);
      }
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    console.log('🧹 CSS2DManager 已销毁');
  }
}
