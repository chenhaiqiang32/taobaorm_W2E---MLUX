/**
 * 场景分析器
 * 负责分析3D场景中的模型结构，并根据业务规则分类存储设备数据
 */

import * as THREE from 'three';
import { 
  addDeviceToTypesList, 
  addDeviceGroupToTypesList,
  clearDeviceTypesList,
  clearDeviceGroupsTypesList
} from './deviceConfig.js';

/**
 * 场景分析器类
 */
export class SceneAnalyzer {
  constructor() {
    this.analyzedModels = new Set();
  }

  /**
   * 分析场景中的模型结构
   * @param {Object} modelData - 模型数据对象 {name: string, model: THREE.Object3D}
   */
  analyzeScene(modelData) {
    const { name: targetModelName, model: targetModel } = modelData;
    
    console.log(`🔍 开始分析场景，目标模型: ${targetModelName}`);
    
    // 清空之前的分析结果
    clearDeviceTypesList();
    clearDeviceGroupsTypesList();
    this.analyzedModels.clear();

    if (!targetModel) {
      console.warn(`⚠️ 模型数据无效: ${targetModelName}`);
      return {
        success: false,
        error: `模型数据无效: ${targetModelName}`,
        devices: [],
        groups: []
      };
    }

    console.log(`✅ 找到目标模型: ${targetModelName}`);
    
    // 分析模型结构
    const analysisResult = this.analyzeModelStructure(targetModel, targetModelName);
    
    console.log(`📊 分析完成:`);
    console.log(`  - 设备数量: ${analysisResult.devices.length}`);
    console.log(`  - 设备组数量: ${analysisResult.groups.length}`);
    
    return analysisResult;
  }


  /**
   * 分析模型结构
   * @param {THREE.Object3D} model - 模型对象
   * @param {string} modelName - 模型名称
   * @returns {Object} 分析结果
   */
  analyzeModelStructure(model, modelName) {
    const devices = [];
    const groups = [];
    // 遍历模型的所有子对象
    model.children.forEach((child) => {
      if (this.analyzedModels.has(child)) {
        return; // 避免重复分析
      }
      
      this.analyzedModels.add(child);
      
      // 检查是否包含'_Group'
      if (child.name.includes('_Group')) {
        // 这是一个设备组
        const groupInfo = this.createGroupInfo(child, modelName);
        groups.push(groupInfo);
        addDeviceGroupToTypesList(groupInfo);
        
        // 分析组内的子设备
        this.analyzeGroupChildren(child, devices, modelName);
      } else if (child.name && child.name !== modelName) {
        // 这是一个普通设备（不包含'_Group'且不是根模型）
        const deviceInfo = this.createDeviceInfo(child, modelName);
        devices.push(deviceInfo);
        addDeviceToTypesList(deviceInfo);
      }
    });
    return {
      success: true,
      modelName: modelName,
      devices: devices,
      groups: groups,
      totalDevices: devices.length,
      totalGroups: groups.length
    };
  }

  /**
   * 分析设备组内的子设备
   * @param {THREE.Object3D} group - 设备组对象
   * @param {Array} devices - 设备数组
   * @param {string} modelName - 模型名称
   */
  analyzeGroupChildren(group, devices, modelName) {
    group.children.forEach((child) => {
      if (this.analyzedModels.has(child)) {
        return; // 避免重复分析
      }
      
      this.analyzedModels.add(child);
      
      // 如果子对象不包含'_Group'，则认为是设备
      if (!child.name.includes('_Group') && child.name) {
        const deviceInfo = this.createDeviceInfo(child, modelName, group.name);
        devices.push(deviceInfo);
        addDeviceToTypesList(deviceInfo);
      }
    });
  }

  /**
   * 创建设备信息对象
   * @param {THREE.Object3D} child - 子对象
   * @param {string} modelName - 模型名称
   * @param {string} groupName - 所属组名称（可选）
   * @returns {Object} 设备信息
   */
  createDeviceInfo(child, modelName, groupName = null) {
    // 计算包围盒（使用世界坐标）
    const boundingBox = new THREE.Box3().setFromObject(child);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // 确保使用世界坐标
    child.updateMatrixWorld(true);
    const worldBoundingBox = new THREE.Box3().setFromObject(child);
    const worldCenter = worldBoundingBox.getCenter(new THREE.Vector3());
    const worldSize = worldBoundingBox.getSize(new THREE.Vector3());
    
    const deviceInfo = {
      name: child.name,
      model: child,
      modelName: modelName,
      boundingBox: {
        min: worldBoundingBox.min.clone(),
        max: worldBoundingBox.max.clone(),
        center: worldCenter,
        size: worldSize
      },
      position: child.position.clone(),
      rotation: child.rotation.clone(),
      scale: child.scale.clone(),
      visible: child.visible,
      userData: child.userData || {},
      groupName: groupName,
      isGrouped: !!groupName,
      type: 'device',
      analyzedAt: new Date().toISOString()
    };
    
    return deviceInfo;
  }

  /**
   * 创建设备组信息对象
   * @param {THREE.Object3D} group - 设备组对象
   * @param {string} modelName - 模型名称
   * @returns {Object} 设备组信息
   */
  createGroupInfo(group, modelName) {
    // 计算包围盒（使用世界坐标）
    const boundingBox = new THREE.Box3().setFromObject(group);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    // 确保使用世界坐标
    group.updateMatrixWorld(true);
    const worldBoundingBox = new THREE.Box3().setFromObject(group);
    const worldCenter = worldBoundingBox.getCenter(new THREE.Vector3());
    const worldSize = worldBoundingBox.getSize(new THREE.Vector3());
    
    // 统计组内设备数量
    const deviceCount = group.children.filter(child => 
      !child.name.includes('_Group') && child.name
    ).length;
    
    const groupInfo = {
      name: group.name,
      model: group,
      modelName: modelName,
      boundingBox: {
        min: worldBoundingBox.min.clone(),
        max: worldBoundingBox.max.clone(),
        center: worldCenter,
        size: worldSize
      },
      position: group.position.clone(),
      rotation: group.rotation.clone(),
      scale: group.scale.clone(),
      visible: group.visible,
      userData: group.userData || {},
      deviceCount: deviceCount,
      children: group.children.map(child => ({
        name: child.name,
        type: child.name.includes('_Group') ? 'group' : 'device'
      })),
      type: 'group',
      analyzedAt: new Date().toISOString()
    };
    
    return groupInfo;
  }

  /**
   * 更新对象的包围盒（使用世界坐标）
   * @param {THREE.Object3D} object - 要更新包围盒的对象
   * @returns {Object} 更新后的包围盒信息
   */
  updateBoundingBox(object) {
    if (!object) {
      console.warn('无效的对象，无法更新包围盒');
      return null;
    }

    // 确保使用世界坐标
    object.updateMatrixWorld(true);
    const worldBoundingBox = new THREE.Box3().setFromObject(object);
    const worldCenter = worldBoundingBox.getCenter(new THREE.Vector3());
    const worldSize = worldBoundingBox.getSize(new THREE.Vector3());

    // 调试信息
    console.log(`🔍 更新包围盒 - 对象: ${object.name}`, {
      position: object.position,
      worldCenter: worldCenter,
      worldSize: worldSize,
      boundingBox: {
        min: worldBoundingBox.min,
        max: worldBoundingBox.max
      }
    });

    return {
      min: worldBoundingBox.min.clone(),
      max: worldBoundingBox.max.clone(),
      center: worldCenter,
      size: worldSize
    };
  }

  /**
   * 获取分析结果摘要
   * @returns {Object} 分析摘要
   */
  getAnalysisSummary() {
    return {
      totalDevices: this.analyzedModels.size,
      analyzedModels: Array.from(this.analyzedModels).map(model => ({
        name: model.name,
        type: model.name.includes('_Group') ? 'group' : 'device'
      }))
    };
  }


  /**
   * 重置分析器状态
   */
  reset() {
    this.analyzedModels.clear();
    clearDeviceTypesList();
    clearDeviceGroupsTypesList();
    console.log('🔄 场景分析器已重置');
  }
}

// 创建全局实例
export const sceneAnalyzer = new SceneAnalyzer();

