/**
 * iframe通讯管理器
 * 负责处理iframe与父级窗口之间的消息通讯
 */

export class MessageManager {
  constructor() {
    this.messageHandlers = new Map();
    this.isInitialized = false;
    this.targetOrigin = '*'; // 默认允许所有源，生产环境应指定具体域名
    
    // 绑定this上下文
    this.handleMessage = this.handleMessage.bind(this);
  }

  /**
   * 初始化消息管理器
   * @param {string} targetOrigin - 目标源，默认为'*'
   */
  init(targetOrigin = '*') {
    if (this.isInitialized) {
      return;
    }

    this.targetOrigin = targetOrigin;
    
    // 监听消息事件
    window.addEventListener('message', this.handleMessage);
    
    this.isInitialized = true;
  }

  /**
   * 处理接收到的消息
   * @param {MessageEvent} event - 消息事件
   */
  handleMessage(event) {
    // 安全检查：验证消息来源
    if (this.targetOrigin !== '*' && event.origin !== this.targetOrigin) {
      return;
    }
    
    const { type, data } = event.data || {};
    
    if (!type) {
      return;
    }
    
    // 查找对应的处理器
    const handler = this.messageHandlers.get(type);
    
    if (handler) {
      try {
        const result = handler(data, event);
        
        // 如果处理器返回了结果，发送响应
        if (result !== undefined) {
          this.postMessage('response', result);
        }
      } catch (error) {
        this.postMessage('error', { 
          message: error.message, 
          type: type 
        });
      }
    } else {
      console.warn(`未找到消息类型 "${type}" 的处理器`);
    }
  }

  /**
   * 注册消息处理器
   * @param {string} type - 消息类型
   * @param {Function} handler - 处理函数
   */
  onMessage(type, handler) {
    if (typeof handler !== 'function') {
      console.warn('处理器不是函数，忽略注册');
      return;
    }

    this.messageHandlers.set(type, handler);
  }

  /**
   * 移除消息处理器
   * @param {string} type - 消息类型
   */
  removeMessageHandler(type) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.delete(type);
    }
  }

  /**
   * 向父级窗口发送消息
   * @param {string} type - 消息类型
   * @param {any} data - 消息数据
   * @param {string} id - 消息ID（可选，用于响应匹配）
   */
  postMessage(type, data, id = null) {
    if (!this.isInitialized) {
      return;
    }

    const message = {
      type,
      data,
      timestamp: Date.now()
    };

    if (id) {
      message.id = id;
    }

    try {
      window.parent.postMessage(message, this.targetOrigin);
    } catch (error) {
      // 静默处理错误
    }
  }

  /**
   * 发送请求并等待响应
   * @param {string} type - 消息类型
   * @param {any} data - 消息数据
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise} 响应Promise
   */
  async request(type, data, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        this.removeMessageHandler(`response_${id}`);
        reject(new Error(`请求超时: ${type}`));
      }, timeout);

      // 注册响应处理器
      this.onMessage(`response_${id}`, (responseData) => {
        clearTimeout(timeoutId);
        this.removeMessageHandler(`response_${id}`);
        resolve(responseData);
      });

      // 发送请求
      this.postMessage(type, data, id);
    });
  }

  /**
   * 发送模型数据到父级
   * @param {string} modelName - 模型名称
   * @param {Object} modelData - 模型数据
   */
  sendModelData(modelName, modelData) {
    this.postMessage('modelData', {
      modelName,
      data: modelData,
      timestamp: Date.now()
    });
  }

  /**
   * 发送射线检测事件到父级
   * @param {string} eventType - 事件类型
   * @param {string} modelName - 模型名称
   * @param {Object} eventData - 事件数据
   */
  sendRaycastEvent(eventType, modelName, eventData) {
    this.postMessage('raycastEvent', {
      eventType,
      modelName,
      data: eventData,
      timestamp: Date.now()
    });
  }

  /**
   * 发送场景状态到父级
   * @param {Object} sceneState - 场景状态
   */
  sendSceneState(sceneState) {
    this.postMessage('sceneState', {
      state: sceneState,
      timestamp: Date.now()
    });
  }

  /**
   * 获取所有注册的消息处理器
   * @returns {Array} 消息类型数组
   */
  getRegisteredHandlers() {
    return Array.from(this.messageHandlers.keys());
  }

  /**
   * 检查是否已初始化
   * @returns {boolean} 是否已初始化
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * 注册raycaster相关的消息处理器
   * @param {Object} handlers - 处理器对象，包含各种数据处理函数
   */
  registerRaycasterHandlers(handlers) {
    
    if (!this.isInitialized) {
      console.log('MessageManager未初始化，无法注册处理器');
      return;
    }
    
    // 注册设备数据处理器
    this.onMessage('deviceData', (data) => {
      if (handlers.updateDeviceData) {
        handlers.updateDeviceData(data);
      } else {
        console.log('handlers.updateDeviceData不存在');
      }
    });
    
    // 注册机械臂控制处理器
    this.onMessage('robotArmControl', (data) => {
      if (handlers.robotArmControl) {
        handlers.robotArmControl(data);
      } else {
        console.log('handlers.robotArmControl不存在');
      }
    });
    
    // 注册机械臂停止处理器
    this.onMessage('robotArmStop', (data) => {
      if (handlers.robotArmStop) {
        handlers.robotArmStop(data);
      } else {
        console.log('handlers.robotArmStop不存在');
      }
    });
    
    // 注册机械臂重置处理器
    this.onMessage('robotArmReset', (data) => {
      if (handlers.robotArmReset) {
        handlers.robotArmReset(data);
      } else {
        console.log('handlers.robotArmReset不存在');
      }
    });
    
    // 注册环境切换处理器
    this.onMessage('switchEnvironment', (data) => {
      if (handlers.switchEnvironment) {
        handlers.switchEnvironment(data);
      } else {
        console.log('handlers.switchEnvironment不存在');
      }
    });
    
    console.log('📝 所有raycaster消息处理器注册完成');
  }

  /**
   * 销毁消息管理器
   */
  dispose() {
    if (this.isInitialized) {
      window.removeEventListener('message', this.handleMessage);
      this.messageHandlers.clear();
      this.isInitialized = false;
    }
  }
}
