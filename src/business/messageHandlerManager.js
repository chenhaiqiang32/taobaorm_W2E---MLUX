/**
 * 消息处理器管理器
 * 负责管理raycaster相关的消息处理器注册
 */

// 导入设备数据业务管理器
import { processDeviceData } from './deviceDataManager.js';

/**
 * 消息处理器管理器类
 */
export class MessageHandlerManager {
  constructor() {
    this.messageManager = null;
    this.css2dManager = null;
  }

  /**
   * 设置Message管理器引用
   * @param {Object} messageManager - Message管理器实例
   */
  setMessageManager(messageManager) {
    this.messageManager = messageManager;
    
    // 注册raycaster相关的消息处理器
    if (this.messageManager) {
      this.registerRaycasterHandlers();
    }
  }

  /**
   * 设置CSS2D管理器引用
   * @param {Object} css2dManager - CSS2D管理器实例
   */
  setCSS2DManager(css2dManager) {
    this.css2dManager = css2dManager;
  }

  /**
   * 注册raycaster相关的消息处理器
   */
  registerRaycasterHandlers() {
    if (!this.messageManager) {
      console.warn('MessageManager未设置，无法注册处理器');
      return;
    }

    // 注册设备数据处理器
    this.messageManager.registerRaycasterHandlers({
      updateDeviceData: this.updateDeviceData.bind(this)
    });

    console.log('📝 Raycaster消息处理器注册完成');
  }

  /**
   * 更新多设备数据
   * @param {Array} deviceDataArray - 多设备数据数组
   * @returns {Object} 处理结果
   */
  updateDeviceData(deviceDataArray) {
    // 使用业务管理器处理设备数据
    const result = processDeviceData(deviceDataArray, this.css2dManager);
    
    if (!result.success) {
      console.error('设备数据处理失败:', result.error);
    }
    
    return result;
  }

  /**
   * 获取Message管理器实例
   * @returns {Object|null} Message管理器实例
   */
  getMessageManager() {
    return this.messageManager;
  }

  /**
   * 获取CSS2D管理器实例
   * @returns {Object|null} CSS2D管理器实例
   */
  getCSS2DManager() {
    return this.css2dManager;
  }

  /**
   * 检查是否已初始化
   * @returns {boolean} 是否已初始化
   */
  isInitialized() {
    return this.messageManager !== null && this.css2dManager !== null;
  }
}

// 创建全局实例
export const messageHandlerManager = new MessageHandlerManager();
