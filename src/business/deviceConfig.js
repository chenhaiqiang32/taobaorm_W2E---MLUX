/**
 * 设备配置管理
 * 集中管理设备ID到模型名称的映射关系
 */

/**
 * 设备类型枚举
 */
export const DEVICE_TYPES = {
  EQUIPMENT: 'equipment',
  STRUCTURE: 'structure',
  SENSOR: 'sensor',
  PIPELINE: 'pipeline',
  VALVE: 'valve'
};

/**
 * 设备ID到模型名称的映射配置
 * 可以根据实际业务需求调整映射关系
 */
export const DEVICE_MODEL_MAPPING = {
  // 设备类型
  3423: DEVICE_TYPES.EQUIPMENT,  // 设备ID 3423 对应 equipment 模型
  3425: DEVICE_TYPES.EQUIPMENT,  // 设备ID 3425 对应 equipment 模型
  3427: DEVICE_TYPES.EQUIPMENT,  // 设备ID 3427 对应 equipment 模型
  
  // 结构类型
  3424: DEVICE_TYPES.STRUCTURE,  // 设备ID 3424 对应 structure 模型
  3426: DEVICE_TYPES.STRUCTURE,  // 设备ID 3426 对应 structure 模型
  
  // 传感器类型
  3428: DEVICE_TYPES.SENSOR,     // 设备ID 3428 对应 sensor 模型
  3429: DEVICE_TYPES.SENSOR,     // 设备ID 3429 对应 sensor 模型
  
  // 管道类型
  3430: DEVICE_TYPES.PIPELINE,   // 设备ID 3430 对应 pipeline 模型
  3431: DEVICE_TYPES.PIPELINE,   // 设备ID 3431 对应 pipeline 模型
  
  // 阀门类型
  3432: DEVICE_TYPES.VALVE,      // 设备ID 3432 对应 valve 模型
  3433: DEVICE_TYPES.VALVE,      // 设备ID 3433 对应 valve 模型
};

/**
 * 设备ID范围映射（用于批量映射）
 */
export const DEVICE_ID_RANGES = {
  // 设备ID 3000-3099 对应 equipment 模型
  [DEVICE_TYPES.EQUIPMENT]: { start: 3000, end: 3099 },
  
  // 设备ID 3100-3199 对应 structure 模型
  [DEVICE_TYPES.STRUCTURE]: { start: 3100, end: 3199 },
  
  // 设备ID 3200-3299 对应 sensor 模型
  [DEVICE_TYPES.SENSOR]: { start: 3200, end: 3299 },
  
  // 设备ID 3300-3399 对应 pipeline 模型
  [DEVICE_TYPES.PIPELINE]: { start: 3300, end: 3399 },
  
  // 设备ID 3400-3499 对应 valve 模型
  [DEVICE_TYPES.VALVE]: { start: 3400, end: 3499 },
};

/**
 * 根据设备ID获取模型名称
 * @param {number} deviceid - 设备ID
 * @returns {string|null} 模型名称
 */
export function getModelNameByDeviceId(deviceid) {
  // 首先检查精确映射
  if (DEVICE_MODEL_MAPPING[deviceid]) {
    return DEVICE_MODEL_MAPPING[deviceid];
  }
  
  // 然后检查范围映射
  for (const [modelName, range] of Object.entries(DEVICE_ID_RANGES)) {
    if (deviceid >= range.start && deviceid <= range.end) {
      return modelName;
    }
  }
  
  return null;
}

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
