/**
 * 业务模块统一导出
 * 提供业务逻辑的统一入口
 */

// 设备数据管理
export {
  processDeviceData,
  getDeviceData,
  getAllDeviceData,
  clearDeviceData
} from './deviceDataManager.js';

// 设备配置管理
export {
  DEVICE_TYPES,
  DEVICE_MODEL_MAPPING,
  DEVICE_ID_RANGES,
  getModelNameByDeviceId,
  addDeviceMapping,
  removeDeviceMapping,
  getAllDeviceMappings,
  getDeviceIdsByModelName
} from './deviceConfig.js';

// 消息处理器管理
export {
  MessageHandlerManager,
  messageHandlerManager
} from './messageHandlerManager.js';
