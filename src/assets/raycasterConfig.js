/**
 * 射线检测配置文件
 * 定义鼠标事件对应的模型检测配置
 */

// 导入CSS2D管理器和Message管理器（动态导入避免循环依赖）
let css2dManager = null;
let messageManager = null;

// 导入业务模块
import { messageHandlerManager } from '../business/index.js';

/**
 * 鼠标移入射线检测配置
 * 配置格式：
 * {
 *   name: "模型名称",
 *   fun: function(intersects) { ... }, // 移入事件回调
 *   exitFun: function(object) { ... }  // 移出事件回调（可选）
 * }
 */
export const mousemoveConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("鼠标移入 equipment 模型:", intersects);
      
      // CSS2D演示：显示设备信息
      showEquipmentInfo(intersects);
    },
    exitFun: function (object) {
      console.log("鼠标移出 equipment 模型:", object);
      
      // 隐藏CSS2D标签
      hideModelInfo("equipment");
    }
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("鼠标移入 structure 模型:", intersects);
      
      // CSS2D演示：显示结构信息
      showStructureInfo(intersects);
    },
    exitFun: function (object) {
      console.log("鼠标移出 structure 模型:", object);
      
      // 隐藏CSS2D标签
      hideModelInfo("structure");
    }
  },
];

/**
 * 鼠标单击射线检测配置
 */
export const clickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("单击 equipment 模型:", intersects);
    },
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("单击 structure 模型:", intersects);
    },
  }
];

/**
 * 鼠标双击射线检测配置
 */
export const dblclickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("双击 equipment 模型:", intersects);
      
      // CSS2D演示：显示详细设备信息
      showEquipmentDetail(intersects);
    },
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("双击 structure 模型:", intersects);
      
      // CSS2D演示：显示详细结构信息
      showStructureDetail(intersects);
    },
  }
];

/**
 * 设置CSS2D管理器引用
 * @param {CSS2DManager} manager - CSS2D管理器实例
 */
export function setCSS2DManager(manager) {
  css2dManager = manager;
  
  // 同时设置到业务模块的消息处理器管理器
  messageHandlerManager.setCSS2DManager(manager);
}

/**
 * 设置Message管理器引用
 * @param {MessageManager} manager - Message管理器实例
 */
export function setMessageManager(manager) {
  messageManager = manager;
  
  // 使用业务模块的消息处理器管理器
  messageHandlerManager.setMessageManager(manager);
}


/**
 * 显示设备信息（鼠标移入）
 * @param {Object} intersects - 相交信息
 */
function showEquipmentInfo(intersects) {
  if (!css2dManager) return;
  
  // 检查是否有设备数据
  if (!window.equipmentData) {
    console.log("📝 设备数据未加载，跳过显示设备信息标签");
    return;
  }
  
  const intersect = intersects;
  const position = intersect.point;
  
  css2dManager.createLabel("equipment_info", window.equipmentData, {
    position: position,
    type: "info",
    offset: { x: 0, y: 3, z: 0 }
  });
}

/**
 * 显示结构信息（鼠标移入）
 * @param {Object} intersects - 相交信息
 */
function showStructureInfo(intersects) {
  if (!css2dManager) return;
  
  // 检查是否有结构数据
  if (!window.structureData) {
    console.log("📝 结构数据未加载，跳过显示结构信息标签");
    return;
  }
  
  const intersect = intersects;
  const position = intersect.point;
  
  css2dManager.createLabel("structure_info", window.structureData, {
    position: position,
    type: "info",
    offset: { x: 0, y: 3, z: 0 }
  });
}

/**
 * 显示详细设备信息（双击）
 * @param {Object} intersects - 相交信息
 */
function showEquipmentDetail(intersects) {
  if (!css2dManager) return;
  
  // 检查是否有设备详细数据
  if (!window.equipmentDetailData) {
    console.log("📝 设备详细数据未加载，跳过显示设备详细信息标签");
    return;
  }
  
  const intersect = intersects;
  const position = intersect.point;
  
  css2dManager.createLabel("equipment_detail", window.equipmentDetailData, {
    position: position,
    type: "detail",
    offset: { x: 0, y: 4, z: 0 }
  });
}

/**
 * 显示详细结构信息（双击）
 * @param {Object} intersects - 相交信息
 */
function showStructureDetail(intersects) {
  if (!css2dManager) return;
  
  // 检查是否有结构详细数据
  if (!window.structureDetailData) {
    console.log("📝 结构详细数据未加载，跳过显示结构详细信息标签");
    return;
  }
  
  const intersect = intersects;
  const position = intersect.point;
  
  css2dManager.createLabel("structure_detail", window.structureDetailData, {
    position: position,
    type: "detail",
    offset: { x: 0, y: 4, z: 0 }
  });
}

/**
 * 隐藏模型信息标签
 * @param {string} modelName - 模型名称
 */
function hideModelInfo(modelName) {
  if (!css2dManager) return;
  
  // 隐藏信息标签
  css2dManager.setLabelVisible(`${modelName}_info`, false);
  // 隐藏详细标签
  css2dManager.setLabelVisible(`${modelName}_detail`, false);
}
