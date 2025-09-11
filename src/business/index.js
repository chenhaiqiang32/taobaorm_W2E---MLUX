/**
 * 业务模块统一导出
 * 提供业务逻辑的统一入口
 */

// 设备数据管理
export {
  processDeviceData,
  getDeviceData,
  getAllDeviceData,
  clearDeviceData,
  getDeviceModelData,
  getAllDeviceModelData,
  setDeviceModelData,
  removeDeviceModelData,
  testDeviceDataFormat,
  handleDeviceClick,
  handleDeviceHover,
  handleDeviceExit,
  clearDeviceSelection,
  getCurrentSelectedDevice,
  handleGroupClick,
  clearGroupSelection,
  getCurrentSelectedGroup,
  clearAllSelections,
  setManagers
} from './deviceDataManager.js';

// 设备配置管理
export {
  DEVICE_TYPES_LIST,
  DEVICE_GROUPS_TYPES_LIST,
  addDeviceMapping,
  removeDeviceMapping,
  getAllDeviceMappings,
  getDeviceIdsByModelName,
  addDeviceToTypesList,
  addDeviceGroupToTypesList,
  clearDeviceTypesList,
  clearDeviceGroupsTypesList,
  getDeviceTypesList,
  getDeviceGroupsTypesList,
  findDeviceByName,
  findDeviceGroupByName,
  createGroupLabels,
  createGroupLabel
} from './deviceConfig.js';

// 消息处理器管理
export {
  MessageHandlerManager,
  messageHandlerManager
} from './messageHandlerManager.js';

// 场景分析器
export {
  SceneAnalyzer,
  sceneAnalyzer
} from './sceneAnalyzer.js';

// 机械臂管理器
export {
  RobotArmManager,
  robotArmManager
} from './robotArmManager.js';

// 路径管理器
export {
  PathManager,
  pathManager
} from './pathManager.js';

// 移动控制器
export {
  MovementController,
  movementController
} from './movementController.js';
