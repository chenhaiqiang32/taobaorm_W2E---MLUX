

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

/**
 * 为所有设备组生成CSS2D标签
 * @param {Object} css2dManager - CSS2D管理器实例
 */
export function createGroupLabels(css2dManager) {
  if (!css2dManager) {
    console.warn('CSS2D管理器未提供，无法创建设备组标签');
    return;
  }

  console.log(`🏷️ 开始为 ${DEVICE_GROUPS_TYPES_LIST.length} 个设备组创建CSS2D标签`);

  DEVICE_GROUPS_TYPES_LIST.forEach(groupInfo => {
    createGroupLabel(groupInfo, css2dManager);
  });

  console.log(`✅ 设备组标签创建完成，共创建 ${DEVICE_GROUPS_TYPES_LIST.length} 个标签`);
}

/**
 * 为单个设备组创建CSS2D标签
 * @param {Object} groupInfo - 设备组信息
 * @param {Object} css2dManager - CSS2D管理器实例
 */
export function createGroupLabel(groupInfo, css2dManager) {
  const { name, boundingBox } = groupInfo;
  
  if (!boundingBox || !boundingBox.center) {
    console.warn(`设备组 ${name} 的包围盒数据无效`);
    return;
  }

  // 计算标签位置（包围盒中心上方）
  const labelPosition = {
    x: boundingBox.center.x,
    y: boundingBox.center.y + boundingBox.size.y / 2 + 1.0, // 在包围盒上方1.0个单位
    z: boundingBox.center.z
  };
  
  // 创建标签数据（只显示组名）
  const labelData = {
    title: name,
    configs: []
  };
  
  // 创建标签
  const labelId = `${name}_group`;
  css2dManager.createLabel(labelId, labelData, {
    position: labelPosition,
    type: 'group', // 使用低调的设备组模板
    visible: true  // 默认显示
  }, {x: 0.5, y: 1});
  
  console.log(`🏷️ 设备组标签已创建: ${name}`, labelPosition);
}
