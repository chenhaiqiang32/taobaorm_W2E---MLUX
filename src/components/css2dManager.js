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
    
    // 添加到DOM
    document.body.appendChild(this.renderer.domElement);
    
    console.log('🎯 CSS2DManager 初始化完成');
  }

  /**
   * 初始化默认DOM模板
   */
  initDefaultTemplates() {
    // 模板1：简单标题模板
    this.templates.set('title', {
      create: (data) => {
        const div = document.createElement('div');
        div.className = 'css2d-label css2d-title';
        div.innerHTML = `
          <div class="label-title">${data.title || '标题'}</div>
        `;
        return div;
      }
    });

    // 模板2：标题+属性列表模板
    this.templates.set('info', {
      create: (data) => {
        const div = document.createElement('div');
        div.className = 'css2d-label css2d-info';
        
        let configsHtml = '';
        if (data.configs && Array.isArray(data.configs)) {
          configsHtml = data.configs.map(config => 
            `<div class="config-item">
              <span class="config-label">${config.label}:</span>
              <span class="config-value">${config.value}</span>
            </div>`
          ).join('');
        }
        
        div.innerHTML = `
          <div class="label-header">
            <div class="label-title">${data.title || '信息'}</div>
          </div>
          <div class="label-content">
            ${configsHtml}
          </div>
        `;
        return div;
      }
    });

    // 模板3：详细属性模板
    this.templates.set('detail', {
      create: (data) => {
        const div = document.createElement('div');
        div.className = 'css2d-label css2d-detail';
        
        let configsHtml = '';
        if (data.configs && Array.isArray(data.configs)) {
          configsHtml = data.configs.map(config => 
            `<div class="detail-item">
              <div class="detail-label">${config.label}</div>
              <div class="detail-value">${config.value}</div>
            </div>`
          ).join('');
        }
        
        div.innerHTML = `
          <div class="detail-header">
            <h3 class="detail-title">${data.title || '详细信息'}</h3>
          </div>
          <div class="detail-body">
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
      label.position.copy(options.position);
    } else if (options.center) {
      // 基于中心位置计算标签位置
      const offset = options.offset || { x: 0, y: 2, z: 0 };
      label.position.set(
        options.center.x + offset.x,
        options.center.y + offset.y,
        options.center.z + offset.z
      );
    }

    // 设置可见性
    if (options.visible !== undefined) {
      label.visible = options.visible;
    }

    // 存储标签
    this.labels.set(id, label);
    
    // 添加到场景
    this.scene.add(label);
    
    console.log(`📝 创建CSS2D标签: ${id}, 类型: ${templateType}`);
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
   */
  render() {
    if (this.renderer && this.camera && this.scene) {
      this.renderer.render(this.scene, this.camera);
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
   * 销毁管理器
   */
  dispose() {
    this.clear();
    if (this.renderer && this.renderer.domElement) {
      document.body.removeChild(this.renderer.domElement);
    }
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    console.log('🧹 CSS2DManager 已销毁');
  }
}
