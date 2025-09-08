/**
 * 设备数据业务管理器
 * 负责处理设备数据的业务逻辑和映射关系
 */

// 导入设备配置管理
import { getModelNameByDeviceId } from './deviceConfig.js';

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
    
    // 存储设备数据
    window.deviceDataMap.set(deviceid, data);
    
    // 根据设备ID映射到模型名称
    const modelName = getModelNameByDeviceId(deviceid);
    
    if (modelName) {
      // 存储到对应的模型数据中
      window[`${modelName}Data`] = data;
      
      // 如果当前有对应标签显示，立即更新
      if (css2dManager) {
        updateVisibleLabels(modelName, data, css2dManager);
      }
      
      processedCount++;
      console.log(`📦 设备 ${deviceid} 数据已更新:`, data.title);
    } else {
      console.warn(`未找到设备ID ${deviceid} 对应的模型映射`);
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
  console.log('🧹 设备数据已清空');
}

