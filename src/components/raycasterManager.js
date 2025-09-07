/**
 * 射线检测管理器
 * 负责处理鼠标事件与3D模型的交互检测
 */

import * as THREE from "three";
import { 
  mousemoveConfigModels, 
  clickConfigModels, 
  dblclickConfigModels 
} from "../assets/raycasterConfig.js";

export class RaycasterManager {
  constructor() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // 存储模型名称到模型的映射
    this.modelMap = new Map();
    
    // 存储事件配置
    this.eventConfigs = {
      mousemove: mousemoveConfigModels,
      click: clickConfigModels,
      dblclick: dblclickConfigModels
    };
    
    // 存储事件监听器
    this.eventListeners = new Map();
    
    // 当前悬停的模型
    this.hoveredModel = null;
  }

  /**
   * 初始化射线检测管理器
   * @param {THREE.Scene} scene - 场景对象
   * @param {THREE.Camera} camera - 相机对象
   * @param {THREE.WebGLRenderer} renderer - 渲染器对象
   */
  init(scene, camera, renderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    console.log("🎯 RaycasterManager 初始化完成");
  }

  /**
   * 注册模型到射线检测系统
   * @param {string} modelName - 模型名称
   * @param {THREE.Object3D} model - 模型对象
   */
  registerModel(modelName, model) {
    if (!modelName || !model) {
      console.warn("注册模型失败: 模型名称或模型对象为空");
      return;
    }

    this.modelMap.set(modelName, model);
    console.log(`📦 模型 "${modelName}" 已注册到射线检测系统`);
  }

  /**
   * 批量注册模型
   * @param {Array} models - 模型数组，格式: [{name: string, model: THREE.Object3D}]
   */
  registerModels(models) {
    if (!Array.isArray(models)) {
      console.warn("批量注册模型失败: 参数必须是数组");
      return;
    }

    models.forEach(({ name, model }) => {
      this.registerModel(name, model);
    });
  }

  /**
   * 移除模型注册
   * @param {string} modelName - 模型名称
   */
  unregisterModel(modelName) {
    if (this.modelMap.has(modelName)) {
      this.modelMap.delete(modelName);
      console.log(`🗑️ 模型 "${modelName}" 已从射线检测系统移除`);
    }
  }

  /**
   * 设置事件监听器
   * @param {string} eventType - 事件类型 ('mousemove', 'click', 'dblclick')
   */
  setupEventListeners(eventType = 'all') {
    if (!this.renderer || !this.renderer.domElement) {
      console.warn("设置事件监听器失败: 渲染器或DOM元素不存在");
      return;
    }

    const events = eventType === 'all' 
      ? ['mousemove', 'click', 'dblclick'] 
      : [eventType];

    events.forEach(event => {
      if (this.eventListeners.has(event)) {
        this.removeEventListeners(event);
      }

      const handler = this.createEventHandler(event);
      this.renderer.domElement.addEventListener(event, handler);
      this.eventListeners.set(event, handler);
      
      console.log(`🎯 已设置 ${event} 事件监听器`);
    });
  }

  /**
   * 创建事件处理器
   * @param {string} eventType - 事件类型
   * @returns {Function} 事件处理函数
   */
  createEventHandler(eventType) {
    return (event) => {
      // 更新鼠标位置
      this.updateMousePosition(event);
      
      // 执行射线检测
      const intersects = this.performRaycast();
      
      // 处理事件
      this.handleEvent(eventType, intersects, event);
    };
  }

  /**
   * 更新鼠标位置
   * @param {MouseEvent} event - 鼠标事件
   */
  updateMousePosition(event) {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  /**
   * 执行射线检测
   * @returns {Array} 相交对象数组
   */
  performRaycast() {
    if (!this.camera || !this.scene) {
      return [];
    }

    // 更新射线
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 获取所有可检测的模型
    const modelsToCheck = Array.from(this.modelMap.values());
    
    // 执行射线检测
    const intersects = this.raycaster.intersectObjects(modelsToCheck, true);
    
    return intersects;
  }

  /**
   * 处理事件
   * @param {string} eventType - 事件类型
   * @param {Array} intersects - 相交对象数组
   * @param {MouseEvent} event - 原始事件
   */
  handleEvent(eventType, intersects, event) {
    const configs = this.eventConfigs[eventType];
    if (!configs || !Array.isArray(configs)) {
      return;
    }

    // 处理鼠标移入/移出事件
    if (eventType === 'mousemove') {
      this.handleMouseMove(intersects, configs);
    } else {
      // 处理点击事件
      this.handleClickEvent(intersects, configs, eventType);
    }
  }

  /**
   * 处理鼠标移入/移出事件
   * @param {Array} intersects - 相交对象数组
   * @param {Array} configs - 事件配置数组
   */
  handleMouseMove(intersects, configs) {
    // 如果配置为空，不处理任何鼠标移入/移出事件
    if (!configs || configs.length === 0) {
      return;
    }

    const currentHovered = intersects.length > 0 ? intersects[0].object : null;
    
    // 检查是否有模型变化
    if (currentHovered !== this.hoveredModel) {
      // 处理移出事件
      if (this.hoveredModel) {
        this.handleModelExit(this.hoveredModel, configs);
      }
      
      // 处理移入事件
      if (currentHovered) {
        this.handleModelEnter(currentHovered, intersects[0], configs);
      }
      
      this.hoveredModel = currentHovered;
    }
  }

  /**
   * 处理模型移入事件
   * @param {THREE.Object3D} object - 模型对象
   * @param {Object} intersect - 相交信息
   * @param {Array} configs - 事件配置数组
   */
  handleModelEnter(object, intersect, configs) {
    const modelName = this.getModelNameByObject(object);
    if (!modelName) return;

    const config = configs.find(c => c.name === modelName);
    if (config && config.fun) {
      try {
        config.fun(intersect);
      } catch (error) {
        console.error(`执行模型 "${modelName}" 移入回调时出错:`, error);
      }
    }
  }

  /**
   * 处理模型移出事件
   * @param {THREE.Object3D} object - 模型对象
   * @param {Array} configs - 事件配置数组
   */
  handleModelExit(object, configs) {
    const modelName = this.getModelNameByObject(object);
    if (!modelName) return;

    // 查找对应的配置项
    const config = configs.find(c => c.name === modelName);
    if (config && config.exitFun) {
      try {
        config.exitFun(object);
      } catch (error) {
        console.error(`执行模型 "${modelName}" 移出回调时出错:`, error);
      }
    }
  }

  /**
   * 处理点击事件
   * @param {Array} intersects - 相交对象数组
   * @param {Array} configs - 事件配置数组
   * @param {string} eventType - 事件类型
   */
  handleClickEvent(intersects, configs, eventType) {
    if (intersects.length === 0) return;

    const intersect = intersects[0];
    const modelName = this.getModelNameByObject(intersect.object);
    if (!modelName) return;

    const config = configs.find(c => c.name === modelName);
    if (config && config.fun) {
      try {
        config.fun(intersect);
      } catch (error) {
        console.error(`执行模型 "${modelName}" ${eventType} 回调时出错:`, error);
      }
    }
  }

  /**
   * 根据模型对象获取模型名称
   * @param {THREE.Object3D} object - 模型对象
   * @returns {string|null} 模型名称
   */
  getModelNameByObject(object) {
    // 向上查找父级对象，直到找到注册的模型
    let current = object;
    while (current) {
      for (const [name, model] of this.modelMap.entries()) {
        if (model === current || model.children.includes(current)) {
          return name;
        }
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * 移除事件监听器
   * @param {string} eventType - 事件类型
   */
  removeEventListeners(eventType = 'all') {
    if (!this.renderer || !this.renderer.domElement) {
      return;
    }

    const events = eventType === 'all' 
      ? Array.from(this.eventListeners.keys())
      : [eventType];

    events.forEach(event => {
      const handler = this.eventListeners.get(event);
      if (handler) {
        this.renderer.domElement.removeEventListener(event, handler);
        this.eventListeners.delete(event);
        console.log(`🗑️ 已移除 ${event} 事件监听器`);
      }
    });
  }

  /**
   * 更新相机引用
   * @param {THREE.Camera} camera - 新的相机对象
   */
  updateCamera(camera) {
    this.camera = camera;
    console.log("📷 射线检测相机已更新");
  }

  /**
   * 获取当前悬停的模型
   * @returns {THREE.Object3D|null} 当前悬停的模型
   */
  getHoveredModel() {
    return this.hoveredModel;
  }

  /**
   * 获取注册的模型数量
   * @returns {number} 模型数量
   */
  getModelCount() {
    return this.modelMap.size;
  }

  /**
   * 获取所有注册的模型名称
   * @returns {Array} 模型名称数组
   */
  getRegisteredModelNames() {
    return Array.from(this.modelMap.keys());
  }

  /**
   * 清理资源
   */
  dispose() {
    this.removeEventListeners('all');
    this.modelMap.clear();
    this.eventListeners.clear();
    this.hoveredModel = null;
    
    console.log("🧹 RaycasterManager 资源已清理");
  }
}

