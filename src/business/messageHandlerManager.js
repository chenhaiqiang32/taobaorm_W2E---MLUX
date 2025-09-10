/**
 * 消息处理器管理器
 * 负责管理raycaster相关的消息处理器注册
 */

// 导入设备数据业务管理器
import { processDeviceData } from './deviceDataManager.js';
// 导入机械臂控制管理器
import { robotArmManager } from './robotArmManager.js';
import { pathManager } from './pathManager.js';
import { movementController } from './movementController.js';

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
      updateDeviceData: this.updateDeviceData.bind(this),
      robotArmControl: this.robotArmControl.bind(this),
      robotArmStop: this.robotArmStop.bind(this),
      robotArmReset: this.robotArmReset.bind(this)
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
   * 机械臂控制处理器
   * @param {Object} data - 控制数据
   * @returns {Object} 处理结果
   */
  robotArmControl(data) {
    console.log('🤖 接收到机械臂控制消息:', data);
    
    try {
      // 验证数据格式
      const validationResult = this.validateRobotArmControlData(data);
      if (!validationResult.valid) {
        throw new Error(`数据验证失败: ${validationResult.error}`);
      }
      const { model, line, options = {} } = data;
      
      // 检查机械臂是否存在
      if (!robotArmManager.hasRobotArm(model)) {
        console.error(`❌ 机械臂 ${model} 不存在`);
        console.log(`📋 可用的机械臂: [${robotArmManager.getAllRobotArmIds().join(', ')}]`);
        throw new Error(`机械臂 ${model} 不存在`);
      }
      
      // 检查路径是否存在
      if (!pathManager.hasPath(line)) {
        console.error(`❌ 路径 ${line} 不存在`);
        console.log(`📋 可用的路径: [${pathManager.getAllPathNames().join(', ')}]`);
        console.log(`📊 路径管理器状态: 已初始化=${pathManager.isInitialized}, 路径数量=${pathManager.paths.size}`);
        throw new Error(`路径 ${line} 不存在`);
      }
      
      // 调试信息：打印路径和机械臂详细信息
      console.log(`🔍 机械臂 ${model} 详细信息:`, {
        exists: robotArmManager.hasRobotArm(model),
        position: robotArmManager.getRobotArm(model)?.position
      });
      console.log(`🔍 路径 ${line} 详细信息:`, {
        exists: pathManager.hasPath(line),
        length: pathManager.getPathLength(line),
        pathType: pathManager.getPath(line)?.constructor.name
      });
      
      // 开始移动
      const success = movementController.startMovement(model, line, {
        ...options,
        onStart: (robotArmId, pathName) => {
          // 获取起始位置
          const robotArm = robotArmManager.getRobotArm(robotArmId);
          if (robotArm) {
            const startPosition = robotArm.position;
            console.log(`✅ 机械臂 ${robotArmId} 开始沿路径 ${pathName} 移动`);
            console.log(`🚀 起始位置: (${startPosition.x.toFixed(3)}, ${startPosition.y.toFixed(3)}, ${startPosition.z.toFixed(3)})`);
          } else {
            console.log(`✅ 机械臂 ${robotArmId} 开始沿路径 ${pathName} 移动`);
          }
          
          if (options.onStart) options.onStart(robotArmId, pathName);
        },
        onUpdate: (robotArmId, pathName, progress, elapsed) => {
          // 实时打印机械臂位置信息
          const robotArm = robotArmManager.getRobotArm(robotArmId);
          if (robotArm) {
            const position = robotArm.position;
            console.log(`📍 机械臂 ${robotArmId} 位置: (${position.x.toFixed(3)}, ${position.y.toFixed(3)}, ${position.z.toFixed(3)}) - 进度: ${(progress * 100).toFixed(1)}% - 耗时: ${elapsed.toFixed(2)}s`);
          }
          
          if (options.onUpdate) options.onUpdate(robotArmId, pathName, progress, elapsed);
        },
        onComplete: (robotArmId, pathName) => {
          // 获取最终位置
          const robotArm = robotArmManager.getRobotArm(robotArmId);
          if (robotArm) {
            const finalPosition = robotArm.position;
            console.log(`✅ 机械臂 ${robotArmId} 沿路径 ${pathName} 移动完成`);
            console.log(`🏁 最终位置: (${finalPosition.x.toFixed(3)}, ${finalPosition.y.toFixed(3)}, ${finalPosition.z.toFixed(3)})`);
          } else {
            console.log(`✅ 机械臂 ${robotArmId} 沿路径 ${pathName} 移动完成`);
          }
          
          if (options.onComplete) options.onComplete(robotArmId, pathName);
        },
        onError: (error) => {
          console.error(`❌ 机械臂移动出错:`, error);
          if (options.onError) options.onError(error);
        }
      });
      
      if (success) {
        return {
          success: true,
          message: `机械臂 ${model} 开始沿路径 ${line} 移动`,
          data: {
            robotArmId: model,
            pathName: line,
            options: options
          }
        };
      } else {
        throw new Error('启动机械臂移动失败');
      }
      
    } catch (error) {
      console.error('机械臂控制处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: data
      };
    }
  }

  /**
   * 停止机械臂移动处理器
   * @param {Object} data - 停止数据
   * @returns {Object} 处理结果
   */
  robotArmStop(data) {
    console.log('⏹️ 接收到机械臂停止消息:', data);
    
    try {
      // 验证数据格式
      if (!data || typeof data !== 'object') {
        throw new Error('数据必须是对象');
      }
      
      if (!data.model || typeof data.model !== 'string') {
        throw new Error('缺少或无效的model参数');
      }
      
      const { model } = data;
      
      // 检查机械臂是否存在
      if (!robotArmManager.hasRobotArm(model)) {
        throw new Error(`机械臂 ${model} 不存在`);
      }
      
      // 停止移动
      movementController.stopMovement(model);
      
      console.log(`✅ 机械臂 ${model} 移动已停止`);
      
      return {
        success: true,
        message: `机械臂 ${model} 移动已停止`,
        data: {
          robotArmId: model,
          action: 'stop'
        }
      };
      
    } catch (error) {
      console.error('停止机械臂处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: data
      };
    }
  }

  /**
   * 重置机械臂位置处理器
   * @param {Object} data - 重置数据
   * @returns {Object} 处理结果
   */
  robotArmReset(data) {
    console.log('🔄 接收到机械臂重置消息:', data);
    
    try {
      // 验证数据格式
      if (!data || typeof data !== 'object') {
        throw new Error('数据必须是对象');
      }
      
      if (!data.model || typeof data.model !== 'string') {
        throw new Error('缺少或无效的model参数');
      }
      
      const { model } = data;
      
      // 检查机械臂是否存在
      if (!robotArmManager.hasRobotArm(model)) {
        throw new Error(`机械臂 ${model} 不存在`);
      }
      
      // 停止移动并重置位置
      movementController.stopMovement(model);
      robotArmManager.resetRobotArmPosition(model);
      
      console.log(`✅ 机械臂 ${model} 已重置到原始位置`);
      
      return {
        success: true,
        message: `机械臂 ${model} 已重置到原始位置`,
        data: {
          robotArmId: model,
          action: 'reset'
        }
      };
      
    } catch (error) {
      console.error('重置机械臂处理失败:', error);
      return {
        success: false,
        error: error.message,
        data: data
      };
    }
  }

  /**
   * 验证机械臂控制数据
   * @param {Object} data - 控制数据
   * @returns {Object} 验证结果
   */
  validateRobotArmControlData(data) {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: '数据必须是对象' };
    }
    
    if (!data.model || typeof data.model !== 'string') {
      return { valid: false, error: '缺少或无效的model参数' };
    }
    
    if (!data.line || typeof data.line !== 'string') {
      return { valid: false, error: '缺少或无效的line参数' };
    }
    
    // 验证options（如果存在）
    if (data.options && typeof data.options !== 'object') {
      return { valid: false, error: 'options必须是对象' };
    }
    
    return { valid: true };
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
