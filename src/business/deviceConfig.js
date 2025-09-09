

/**
 * 设备类型列表
 * 存储所有设备的详细信息
 */
export const DEVICE_TYPES_LIST = [];

/**
 * 设备组类型列表
 * 存储包含'_Group'的设备组信息
 */
export const DEVICE_GROUPS_TYPES_LIST = [];

export const DEVICE_MODEL_DATA_MAP = {};


/**
 * 添加新的设备映射
 * @param {number} deviceid - 设备ID
 * @param {string} modelName - 模型名称
 */
export function addDeviceMapping(deviceid, modelName) {
  DEVICE_MODEL_MAPPING[deviceid] = modelName;
  console.log(`📝 添加设备映射: ${deviceid} -> ${modelName}`);
}

/**
 * 移除设备映射
 * @param {number} deviceid - 设备ID
 */
export function removeDeviceMapping(deviceid) {
  if (DEVICE_MODEL_MAPPING[deviceid]) {
    delete DEVICE_MODEL_MAPPING[deviceid];
    console.log(`🗑️ 移除设备映射: ${deviceid}`);
  }
}

/**
 * 获取所有设备映射
 * @returns {Object} 设备映射对象
 */
export function getAllDeviceMappings() {
  return { ...DEVICE_MODEL_MAPPING };
}

/**
 * 根据模型名称获取所有对应的设备ID
 * @param {string} modelName - 模型名称
 * @returns {Array} 设备ID数组
 */
export function getDeviceIdsByModelName(modelName) {
  const deviceIds = [];
  
  // 检查精确映射
  for (const [deviceid, mappedModelName] of Object.entries(DEVICE_MODEL_MAPPING)) {
    if (mappedModelName === modelName) {
      deviceIds.push(parseInt(deviceid));
    }
  }
  
  // 检查范围映射
  const range = DEVICE_ID_RANGES[modelName];
  if (range) {
    for (let i = range.start; i <= range.end; i++) {
      if (!deviceIds.includes(i)) {
        deviceIds.push(i);
      }
    }
  }
  
  return deviceIds.sort((a, b) => a - b);
}

/**
 * 添加设备到设备类型列表
 * @param {Object} deviceInfo - 设备信息
 */
export function addDeviceToTypesList(deviceInfo) {
  DEVICE_TYPES_LIST.push(deviceInfo);
  console.log(`📦 添加设备到类型列表: ${deviceInfo.name}`);
}

/**
 * 添加设备组到设备组类型列表
 * @param {Object} groupInfo - 设备组信息
 */
export function addDeviceGroupToTypesList(groupInfo) {
  DEVICE_GROUPS_TYPES_LIST.push(groupInfo);
  console.log(`📦 添加设备组到类型列表: ${groupInfo.name}`);
}

/**
 * 清空设备类型列表
 */
export function clearDeviceTypesList() {
  DEVICE_TYPES_LIST.length = 0;
  console.log('🧹 设备类型列表已清空');
}

/**
 * 清空设备组类型列表
 */
export function clearDeviceGroupsTypesList() {
  DEVICE_GROUPS_TYPES_LIST.length = 0;
  console.log('🧹 设备组类型列表已清空');
}

/**
 * 获取设备类型列表
 * @returns {Array} 设备类型列表
 */
export function getDeviceTypesList() {
  return [...DEVICE_TYPES_LIST];
}

/**
 * 获取设备组类型列表
 * @returns {Array} 设备组类型列表
 */
export function getDeviceGroupsTypesList() {
  return [...DEVICE_GROUPS_TYPES_LIST];
}

/**
 * 根据名称查找设备
 * @param {string} name - 设备名称
 * @returns {Object|null} 设备信息
 */
export function findDeviceByName(name) {
  return DEVICE_TYPES_LIST.find(device => device.name === name) || null;
}

/**
 * 根据名称查找设备组
 * @param {string} name - 设备组名称
 * @returns {Object|null} 设备组信息
 */
export function findDeviceGroupByName(name) {
  return DEVICE_GROUPS_TYPES_LIST.find(group => group.name === name) || null;
}
