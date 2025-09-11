/**
 * 设备数据业务管理器
 * 负责处理设备数据的业务逻辑和映射关系
 */

// 导入设备配置管理
import { DEVICE_MODEL_DATA_MAP, DEVICE_TYPES_LIST } from './deviceConfig.js';
// 导入后处理配置
import { getDeviceOutlineConfig, applyDeviceTypeToOutlinePass } from '../assets/postprocessingConfig.js';

// 全局状态管理
let currentSelectedDevice = null;
let currentSelectedGroup = null;
let postprocessingManager = null;
let css2dManager = null;
let cameraManager = null;
let highlightEffectsManager = null;

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
 * 设置管理器实例
 * @param {Object} postprocessingMgr - 后处理管理器实例
 * @param {Object} css2dMgr - CSS2D管理器实例
 * @param {Object} cameraMgr - 相机管理器实例
 * @param {Object} highlightMgr - 醒目效果管理器实例
 */
export function setManagers(postprocessingMgr, css2dMgr, cameraMgr = null, highlightMgr = null) {
  postprocessingManager = postprocessingMgr;
  css2dManager = css2dMgr;
  cameraManager = cameraMgr;
  highlightEffectsManager = highlightMgr;
  console.log('🔧 设备数据管理器已设置后处理、CSS2D、相机和醒目效果管理器');
}

/**
 * 向上递归查找匹配的设备对象
 * @param {THREE.Object3D} object - 开始查找的对象
 * @returns {THREE.Object3D|null} 匹配的设备对象
 */
function findDeviceInHierarchy(object) {
  if (!object) {
    return null;
  }

  // 获取DEVICE_TYPES_LIST中的所有设备名称
  const deviceNames = DEVICE_TYPES_LIST.map(device => device.name);
  console.log(`🔍 查找设备层次结构，可用设备:`, deviceNames);

  let currentObject = object;
  let depth = 0;
  const maxDepth = 10; // 防止无限递归

  while (currentObject && depth < maxDepth) {
    console.log(`🔍 检查对象 (深度 ${depth}):`, currentObject.name, currentObject);
    
    // 检查当前对象的名称是否在DEVICE_TYPES_LIST中
    if (currentObject.name && deviceNames.includes(currentObject.name)) {
      console.log(`✅ 找到匹配的设备: ${currentObject.name}`);
      return currentObject;
    }
    
    // 向上查找父级对象
    currentObject = currentObject.parent;
    depth++;
  }

  console.warn(`❌ 在层次结构中未找到匹配的设备，最大深度: ${maxDepth}`);
  return null;
}

/**
 * 处理设备鼠标悬停事件
 * @param {THREE.Object3D} hoveredObject - 被悬停的对象
 */
export function handleDeviceHover(hoveredObject) {
  console.log(`🎯 处理设备悬停:`, hoveredObject);
  
  if (!postprocessingManager) {
    console.warn('后处理管理器未设置');
    return;
  }

  // 向上递归查找匹配的设备
  const hoverDevice = findDeviceInHierarchy(hoveredObject);
  
  if (!hoverDevice) {
    console.warn('未找到匹配的设备对象:', hoveredObject);
    return;
  }

  const deviceName = hoverDevice.name;
  console.log(`✅ 找到悬停设备: ${deviceName}`);

  // 应用设备高亮效果（不显示标签，只高亮）
  applyDeviceOutline(hoverDevice, deviceName);
  
  // 设置鼠标样式为小手
  document.body.style.cursor = 'pointer';
}

/**
 * 处理设备鼠标移出事件
 * @param {THREE.Object3D} exitedObject - 移出的对象
 */
export function handleDeviceExit(exitedObject) {
  console.log(`🎯 处理设备移出:`, exitedObject);
  
  if (!postprocessingManager) {
    console.warn('后处理管理器未设置');
    return;
  }

  // 清除高亮效果
  postprocessingManager.clearHighlight();
  
  // 恢复默认鼠标样式
  document.body.style.cursor = 'default';
}

/**
 * 处理设备点击事件
 * @param {THREE.Object3D} clickedObject - 被点击的对象
 */
export function handleDeviceClick(clickedObject) {
  console.log(`🎯 处理设备点击:`, clickedObject);
  
  if (!postprocessingManager || !css2dManager) {
    console.warn('后处理管理器或CSS2D管理器未设置', {
      postprocessingManager: !!postprocessingManager,
      css2dManager: !!css2dManager
    });
    return;
  }

  // 向上递归查找匹配的设备
  const clickDevice = findDeviceInHierarchy(clickedObject);
  
  if (!clickDevice) {
    console.warn(`未找到匹配的设备对象:`, clickedObject);
    return;
  }

  console.log(`✅ 找到匹配的设备: ${clickDevice.name}`, clickDevice);

  // 如果点击的是同一个设备，则取消选择
  if (currentSelectedDevice && currentSelectedDevice.name === clickDevice.name) {
    clearDeviceSelection();
    return;
  }

  // 清除之前的选择（包括设备组选择）
  clearDeviceSelection();
  clearGroupSelection();

  // 设置新的选择
  currentSelectedDevice = {
    name: clickDevice.name,
    object: clickDevice,
    data: DEVICE_MODEL_DATA_MAP[clickDevice.name] || null,
  };

  // 应用outline效果
  applyDeviceOutline(clickDevice, clickDevice.name);

  // 显示设备标签
  showDeviceLabel(clickDevice.name);

  // 添加醒目效果
  if (highlightEffectsManager) {
    // 动态更新包围盒以确保位置准确
    const deviceInfo = DEVICE_TYPES_LIST.find(device => device.name === clickDevice.name);
    if (deviceInfo) {
      // 使用场景分析器更新包围盒
      import('./sceneAnalyzer.js').then(module => {
        const sceneAnalyzer = new module.SceneAnalyzer();
        const updatedBoundingBox = sceneAnalyzer.updateBoundingBox(clickDevice);
        
        if (updatedBoundingBox) {
          highlightEffectsManager.addHighlightEffect(
            `device_${clickDevice.name}`,
            updatedBoundingBox,
            'device',
            'glow'
          );
        } else if (deviceInfo.boundingBox) {
          // 如果更新失败，使用原始包围盒
          highlightEffectsManager.addHighlightEffect(
            `device_${clickDevice.name}`,
            deviceInfo.boundingBox,
            'device',
            'glow'
          );
        }
      });
    }
  }

  // 镜头动画到设备
  if (cameraManager) {
    const deviceInfo = DEVICE_TYPES_LIST.find(device => device.name === clickDevice.name);
    if (deviceInfo) {
      // 使用动态更新的包围盒进行镜头动画
      import('./sceneAnalyzer.js').then(module => {
        const sceneAnalyzer = new module.SceneAnalyzer();
        const updatedBoundingBox = sceneAnalyzer.updateBoundingBox(clickDevice);
        
        if (updatedBoundingBox) {
          // 创建临时的设备信息对象用于镜头动画
          const tempDeviceInfo = {
            ...deviceInfo,
            boundingBox: updatedBoundingBox
          };
          cameraManager.animateToDevice(tempDeviceInfo, () => {
            console.log(`🎬 镜头动画到设备 ${clickDevice.name} 完成`);
          });
        } else if (deviceInfo.boundingBox) {
          // 如果更新失败，使用原始包围盒
          cameraManager.animateToDevice(deviceInfo, () => {
            console.log(`🎬 镜头动画到设备 ${clickDevice.name} 完成`);
          });
        }
      });
    }
  }

  console.log(`🎯 设备 ${clickDevice.name} 已被选中，应用outline效果、醒目效果、显示标签和镜头动画`);
}

/**
 * 应用设备outline效果
 * @param {THREE.Object3D} object - 要应用outline的对象
 * @param {string} deviceName - 设备名称
 */
function applyDeviceOutline(object, deviceName) {
  if (!postprocessingManager) {
    console.warn('后处理管理器未设置，无法应用outline效果');
    return;
  }

  // 获取设备类型（从设备名称推断）
  const deviceType = getDeviceTypeFromName(deviceName);
  console.log(`🎨 应用设备outline效果: ${deviceName} (类型: ${deviceType})`);
  
  // 应用设备类型对应的outline配置
  const outlinePass = postprocessingManager.getOutlinePass();
  if (outlinePass) {
    applyDeviceTypeToOutlinePass(outlinePass, deviceType);
    
    // 调试：输出当前outline配置
    console.log('🔍 当前outline配置:', {
      visibleEdgeColor: outlinePass.visibleEdgeColor.getHexString(),
      hiddenEdgeColor: outlinePass.hiddenEdgeColor.getHexString(),
      edgeGlow: outlinePass.edgeGlow,
      edgeThickness: outlinePass.edgeThickness,
      edgeStrength: outlinePass.edgeStrength,
      downSampleRatio: outlinePass.downSampleRatio,
      pulsePeriod: outlinePass.pulsePeriod
    });
    
    console.log('✅ outline配置已应用');
  } else {
    console.warn('❌ 无法获取outline通道');
  }

  // 高亮对象
  postprocessingManager.highlightObjects([object]);
  console.log('✅ 对象已添加到高亮列表');
}

/**
 * 显示设备标签
 * @param {string} deviceName - 设备名称
 */
function showDeviceLabel(deviceName) {
  if (!css2dManager) return;

  // 从DEVICE_TYPES_LIST中找到设备信息
  const device = DEVICE_TYPES_LIST.find(d => d.name === deviceName);
  if (!device || !device.boundingBox) {
    console.warn(`未找到设备 ${deviceName} 的包围盒信息`);
    return;
  }

  // 获取设备数据
  const deviceData = DEVICE_MODEL_DATA_MAP[deviceName];
  if (!deviceData) {
    console.warn(`未找到设备 ${deviceName} 的数据`);
    return;
  }

  // 显示标签（设置为可见）
  const labelId = `${deviceName}_info`;
  const existingLabel = css2dManager.getLabel(labelId);
  
  if (existingLabel) {
    // 如果标签已存在，设置为可见
    css2dManager.setLabelVisible(labelId, true);
    console.log(`🏷️ 显示设备 ${deviceName} 的标签`);
  } else {
    // 如果标签不存在，创建新标签
    insertLabelAboveBoundingBox(device, deviceData, css2dManager);
    // 创建后立即设置为可见
    css2dManager.setLabelVisible(labelId, true);
    console.log(`🏷️ 创建并显示设备 ${deviceName} 的标签`);
  }
}

/**
 * 清除设备选择
 */
export function clearDeviceSelection() {
  if (!currentSelectedDevice) return;

  // 清除outline效果
  if (postprocessingManager) {
    postprocessingManager.clearHighlight();
  }

  // 清除醒目效果
  if (highlightEffectsManager) {
    highlightEffectsManager.removeHighlightEffect(`device_${currentSelectedDevice.name}`);
  }

  // 隐藏标签
  if (css2dManager && currentSelectedDevice.name) {
    const labelId = `${currentSelectedDevice.name}_info`;
    css2dManager.setLabelVisible(labelId, false);
  }

  console.log(`🧹 清除设备 ${currentSelectedDevice.name} 的选择状态`);
  currentSelectedDevice = null;
}

/**
 * 从设备名称推断设备类型
 * @param {string} deviceName - 设备名称
 * @returns {string} 设备类型
 */
function getDeviceTypeFromName(deviceName) {
  if (deviceName.includes('equipment')) return 'equipment';
  if (deviceName.includes('structure')) return 'structure';
  if (deviceName.includes('line')) return 'line';
  return 'default';
}

/**
 * 获取当前选中的设备
 * @returns {Object|null} 当前选中的设备信息
 */
export function getCurrentSelectedDevice() {
  return currentSelectedDevice;
}

/**
 * 处理设备组点击事件
 * @param {Object} groupInfo - 设备组信息
 */
export function handleGroupClick(groupInfo) {
  console.log(`🎯 处理设备组点击:`, groupInfo);
  
  if (!highlightEffectsManager) {
    console.warn('醒目效果管理器未设置');
    return;
  }

  // 如果点击的是同一个设备组，则取消选择
  if (currentSelectedGroup && currentSelectedGroup.name === groupInfo.name) {
    clearGroupSelection();
    return;
  }

  // 清除之前的选择（包括设备选择）
  clearDeviceSelection();
  clearGroupSelection();

  // 设置新的设备组选择
  currentSelectedGroup = {
    name: groupInfo.name,
    info: groupInfo
  };

  // 添加设备组醒目效果
  if (groupInfo.model) {
    // 动态更新包围盒以确保位置准确
    import('./sceneAnalyzer.js').then(module => {
      const sceneAnalyzer = new module.SceneAnalyzer();
      const updatedBoundingBox = sceneAnalyzer.updateBoundingBox(groupInfo.model);
      
      if (updatedBoundingBox) {
        highlightEffectsManager.addHighlightEffect(
          `group_${groupInfo.name}`,
          updatedBoundingBox,
          'group',
          'glow'
        );
      } else if (groupInfo.boundingBox) {
        // 如果更新失败，使用原始包围盒
        highlightEffectsManager.addHighlightEffect(
          `group_${groupInfo.name}`,
          groupInfo.boundingBox,
          'group',
          'glow'
        );
      }
    });
  }

  // 镜头动画到设备组
  if (cameraManager) {
    // 使用动态更新的包围盒进行镜头动画
    import('./sceneAnalyzer.js').then(module => {
      const sceneAnalyzer = new module.SceneAnalyzer();
      const updatedBoundingBox = sceneAnalyzer.updateBoundingBox(groupInfo.model);
      
      if (updatedBoundingBox) {
        // 创建临时的设备组信息对象用于镜头动画
        const tempGroupInfo = {
          ...groupInfo,
          boundingBox: updatedBoundingBox
        };
        cameraManager.animateToGroup(tempGroupInfo, () => {
          console.log(`🎬 镜头动画到设备组 ${groupInfo.name} 完成`);
        });
      } else if (groupInfo.boundingBox) {
        // 如果更新失败，使用原始包围盒
        cameraManager.animateToGroup(groupInfo, () => {
          console.log(`🎬 镜头动画到设备组 ${groupInfo.name} 完成`);
        });
      }
    });
  }

  console.log(`🎯 设备组 ${groupInfo.name} 已被选中，应用醒目效果和镜头动画`);
}

/**
 * 清除设备组选择
 */
export function clearGroupSelection() {
  if (!currentSelectedGroup) return;

  // 清除醒目效果
  if (highlightEffectsManager) {
    highlightEffectsManager.removeHighlightEffect(`group_${currentSelectedGroup.name}`);
  }

  console.log(`🧹 清除设备组 ${currentSelectedGroup.name} 的选择状态`);
  currentSelectedGroup = null;
}

/**
 * 获取当前选中的设备组
 * @returns {Object|null} 当前选中的设备组信息
 */
export function getCurrentSelectedGroup() {
  return currentSelectedGroup;
}

/**
 * 清除所有选择（设备和设备组）
 */
export function clearAllSelections() {
  clearDeviceSelection();
  clearGroupSelection();
  console.log('🧹 清除所有选择状态');
}

/**
 * 在包围盒上方插入label
 * @param {Object} device - 设备信息对象
 * @param {Object} data - 设备数据
 * @param {Object} css2dManager - CSS2D管理器实例
 */
function insertLabelAboveBoundingBox(device, data, css2dManager) {
  const { name, model } = device;
  
  if (!model) {
    console.warn(`设备 ${name} 的模型对象无效`);
    return;
  }
  
  // 动态更新包围盒以确保使用最新的世界坐标
  import('./sceneAnalyzer.js').then(module => {
    const sceneAnalyzer = new module.SceneAnalyzer();
    const updatedBoundingBox = sceneAnalyzer.updateBoundingBox(model);
    
    if (!updatedBoundingBox || !updatedBoundingBox.center) {
      console.warn(`设备 ${name} 的包围盒数据无效`);
      return;
    }
    
    // 计算标签位置（包围盒中心上方）
    const labelPosition = {
      x: updatedBoundingBox.center.x,
      y: updatedBoundingBox.center.y + updatedBoundingBox.size.y / 2 + 0.5, // 在包围盒上方0.5个单位
      z: updatedBoundingBox.center.z
    };
    
    // 创建标签数据
    const labelData = {
      title: data.title || name,
      configs: data.configs || []
    };
    
    // 创建或更新标签（默认不显示）
    const labelId = `${name}_info`;
    css2dManager.createLabel(labelId, labelData, {
      position: labelPosition,
      type: 'info',
      visible: false  // 默认不显示
    });
    
    console.log(`🏷️ 标签已插入到设备 ${name} 上方:`, {
      labelPosition,
      boundingBox: updatedBoundingBox
    });
  }).catch(error => {
    console.error(`❌ 创建设备 ${name} 标签时出错:`, error);
  });
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

