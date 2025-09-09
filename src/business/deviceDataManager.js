/**
 * 设备数据业务管理器
 * 负责处理设备数据的业务逻辑和映射关系
 */

// 导入设备配置管理
import { DEVICE_MODEL_DATA_MAP, DEVICE_TYPES_LIST } from './deviceConfig.js';

/**
 * 处理多设备数据的业务逻辑
 * @param {Array} deviceDataArray - 多设备数据数组
 * @param {Object} css2dManager - CSS2D管理器实例
 * @returns {Object} 处理结果
 */
export function processDeviceData(deviceDataArray, css2dManager) {
  if (!Array.isArray(deviceDataArray)) {
    console.error('设备数据必须是数组格式');
    return { success: false, error: '数据格式错误' };
  }

  // 清空之前的设备数据
  window.deviceDataMap = window.deviceDataMap || new Map();
  
  let processedCount = 0;
  let errorCount = 0;
  
  // 处理每个设备数据
  deviceDataArray.forEach(deviceInfo => {
    const { deviceid, data } = deviceInfo;
    
    if (!deviceid || !data) {
      console.warn('设备数据格式错误，跳过:', deviceInfo);
      errorCount++;
      return;
    }
    
    // 存储设备数据到全局Map
    window.deviceDataMap.set(deviceid, data);
    
    // 将数据存储到DEVICE_MODEL_DATA_MAP中
    DEVICE_MODEL_DATA_MAP[deviceid] = data;
    
    // 从DEVICE_TYPES_LIST中找到匹配的设备
    const matchedDevice = DEVICE_TYPES_LIST.find(device => device.name === deviceid);
    // 调试信息（仅在需要时启用）
    // console.log(`🔍 查找设备 ${deviceid}:`, {
    //   found: !!matchedDevice,
    //   deviceName: matchedDevice?.name,
    //   hasBoundingBox: !!matchedDevice?.boundingBox,
    //   totalDevices: DEVICE_TYPES_LIST.length,
    //   deviceList: DEVICE_TYPES_LIST.map(d => d.name)
    // });
    
    if (matchedDevice && matchedDevice.boundingBox) {
      // 在包围盒上方插入label
      if (css2dManager) {
        insertLabelAboveBoundingBox(matchedDevice, data, css2dManager);
      }
      
      processedCount++;
      console.log(`📦 设备 ${deviceid} 数据已更新，标签已插入:`, data.title);
    } else {
      console.warn(`未找到设备ID ${deviceid} 对应的设备信息或包围盒数据`);
      errorCount++;
    }
  });
  
  console.log(`✅ 共处理 ${deviceDataArray.length} 个设备的数据，成功: ${processedCount}，失败: ${errorCount}`);
  
  return {
    success: true,
    total: deviceDataArray.length,
    processed: processedCount,
    errors: errorCount
  };
}

/**
 * 在包围盒上方插入label
 * @param {Object} device - 设备信息对象
 * @param {Object} data - 设备数据
 * @param {Object} css2dManager - CSS2D管理器实例
 */
function insertLabelAboveBoundingBox(device, data, css2dManager) {
  const { name, boundingBox } = device;
  
  if (!boundingBox || !boundingBox.center) {
    console.warn(`设备 ${name} 的包围盒数据无效`);
    return;
  }
  // 计算标签位置（包围盒中心上方）
  const labelPosition = {
    x: boundingBox.center.x,
    y: boundingBox.center.y + boundingBox.size.y / 2 + 0.5, // 在包围盒上方0.5个单位
    z: boundingBox.center.z
  };
  
  // 创建标签数据
  const labelData = {
    title: data.title || name,
    configs: data.configs || []
  };
  
  // 创建或更新标签
  const labelId = `${name}_info`;
  css2dManager.createLabel(labelId, labelData, {
    position: labelPosition,
    type: 'info'
  });
  
  // console.log(`🏷️ 标签已插入到设备 ${name} 上方:`, labelPosition);
}

/**
 * 更新可见的标签
 * @param {string} modelName - 模型名称
 * @param {Object} data - 数据
 * @param {Object} css2dManager - CSS2D管理器实例
 */
function updateVisibleLabels(modelName, data, css2dManager) {
  // 更新信息标签
  const label = css2dManager.getLabel(`${modelName}_info`);
  if (label && label.visible) {
    css2dManager.updateLabel(`${modelName}_info`, data);
  }
  
  // 更新详细标签
  const detailLabel = css2dManager.getLabel(`${modelName}_detail`);
  if (detailLabel && detailLabel.visible) {
    css2dManager.updateLabel(`${modelName}_detail`, data);
  }
}

/**
 * 获取设备数据
 * @param {number} deviceid - 设备ID
 * @returns {Object|null} 设备数据
 */
export function getDeviceData(deviceid) {
  if (!window.deviceDataMap) {
    return null;
  }
  return window.deviceDataMap.get(deviceid) || null;
}

/**
 * 获取所有设备数据
 * @returns {Map} 所有设备数据
 */
export function getAllDeviceData() {
  return window.deviceDataMap || new Map();
}

/**
 * 清空设备数据
 */
export function clearDeviceData() {
  window.deviceDataMap = new Map();
  // 清空DEVICE_MODEL_DATA_MAP
  Object.keys(DEVICE_MODEL_DATA_MAP).forEach(key => {
    delete DEVICE_MODEL_DATA_MAP[key];
  });
  console.log('🧹 设备数据已清空');
}

/**
 * 获取DEVICE_MODEL_DATA_MAP中的数据
 * @param {string} deviceid - 设备ID
 * @returns {Object|null} 设备数据
 */
export function getDeviceModelData(deviceid) {
  return DEVICE_MODEL_DATA_MAP[deviceid] || null;
}

/**
 * 获取所有DEVICE_MODEL_DATA_MAP中的数据
 * @returns {Object} 所有设备数据
 */
export function getAllDeviceModelData() {
  return { ...DEVICE_MODEL_DATA_MAP };
}

/**
 * 设置设备模型数据
 * @param {string} deviceid - 设备ID
 * @param {Object} data - 设备数据
 */
export function setDeviceModelData(deviceid, data) {
  DEVICE_MODEL_DATA_MAP[deviceid] = data;
  console.log(`📝 设备模型数据已设置: ${deviceid}`);
}

/**
 * 移除设备模型数据
 * @param {string} deviceid - 设备ID
 */
export function removeDeviceModelData(deviceid) {
  if (DEVICE_MODEL_DATA_MAP[deviceid]) {
    delete DEVICE_MODEL_DATA_MAP[deviceid];
    console.log(`🗑️ 设备模型数据已移除: ${deviceid}`);
  }
}

/**
 * 测试设备数据格式处理
 * @param {Array} testData - 测试数据
 * @param {Object} css2dManager - CSS2D管理器实例
 */
export function testDeviceDataFormat(testData, css2dManager) {
  console.log('🧪 测试设备数据格式处理...');
  
  if (!Array.isArray(testData)) {
    console.error('测试数据必须是数组格式');
    return;
  }
  
  testData.forEach((item, index) => {
    console.log(`📋 测试数据 ${index + 1}:`, item);
    
    const { deviceid, data } = item;
    
    if (!deviceid || !data) {
      console.warn(`❌ 数据格式错误: ${JSON.stringify(item)}`);
      return;
    }
    
    if (!data.title) {
      console.warn(`⚠️ 缺少title字段: ${deviceid}`);
    }
    
    if (!data.configs || !Array.isArray(data.configs)) {
      console.warn(`⚠️ 缺少configs字段或格式错误: ${deviceid}`);
    } else {
      console.log(`✅ configs字段有效，包含 ${data.configs.length} 个配置项`);
    }
    
    // 从DEVICE_TYPES_LIST中查找匹配的设备
    const matchedDevice = DEVICE_TYPES_LIST.find(device => device.name === deviceid);
    
    if (matchedDevice) {
      console.log(`✅ 找到匹配设备: ${deviceid}`);
      if (matchedDevice.boundingBox) {
        console.log(`✅ 设备有包围盒数据:`, matchedDevice.boundingBox.center);
      } else {
        console.warn(`⚠️ 设备缺少包围盒数据: ${deviceid}`);
      }
    } else {
      console.warn(`❌ 未找到匹配设备: ${deviceid}`);
      console.log('📋 可用设备列表:', DEVICE_TYPES_LIST.map(d => d.name));
    }
  });
  
  console.log('🧪 测试完成');
}

