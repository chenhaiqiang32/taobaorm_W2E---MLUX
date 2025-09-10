/**
 * 机械臂管理器
 * 负责解析和管理机械臂模型，提供机械臂查找和操作功能
 */

import * as THREE from 'three';

export class RobotArmManager {
  constructor() {
    // 机械臂模型存储 {编号: 模型对象}
    this.robotArms = new Map();
    
    // 机械臂数据存储 {编号: 机械臂数据}
    this.robotArmData = new Map();
    
    // 是否已初始化
    this.isInitialized = false;
    
    console.log('🤖 RobotArmManager 已创建');
  }

  /**
   * 初始化机械臂管理器
   * @param {THREE.Object3D} equipmentModel - equipment模型对象
   */
  init(equipmentModel) {
    if (!equipmentModel) {
      console.warn('❌ equipment模型不存在，无法初始化机械臂管理器');
      return false;
    }

    console.log('🤖 开始初始化机械臂管理器...');
    
    // 解析机械臂模型
    this.parseRobotArms(equipmentModel);
    
    this.isInitialized = true;
    console.log(`✅ 机械臂管理器初始化完成，找到 ${this.robotArms.size} 个机械臂`);
    
    return true;
  }

  /**
   * 解析机械臂模型
   * @param {THREE.Object3D} equipmentModel - equipment模型对象
   */
  parseRobotArms(equipmentModel) {
    console.log('🔍 开始解析机械臂模型...');
    
    // 查找Mesh_Group_3
    const meshGroup3 = equipmentModel.getObjectByName('Mesh_Group_3');
    if (!meshGroup3) {
      console.warn('❌ 未找到Mesh_Group_3，无法解析机械臂');
      return;
    }

    console.log('✅ 找到Mesh_Group_3，开始遍历子对象...');
    
    let foundCount = 0;
    
    // 遍历所有子对象
    meshGroup3.traverse((child) => {
      if (child.name && child.name.includes('Mesh_equipment_jxs')) {
        // 提取编号（最后一个"_"后的部分）
        const parts = child.name.split('_');
        const id = parts[parts.length - 1];
        
        if (id && id.match(/^\d+$/)) { // 确保是数字编号
          console.log(`✅ 找到机械臂: ${child.name} -> 编号: ${id}`);
          
          // 存储机械臂模型
          this.robotArms.set(id, child);
          
          // 创建机械臂数据
          const robotArmData = {
            id: id,
            name: child.name,
            model: child,
            originalPosition: child.position.clone(),
            currentPosition: child.position.clone(),
            isMoving: false,
            currentPath: null,
            animation: null,
            boundingBox: this.calculateBoundingBox(child)
          };
          
          this.robotArmData.set(id, robotArmData);
          foundCount++;
        }
      }
    });
    
    console.log(`📊 机械臂解析完成，共找到 ${foundCount} 个机械臂`);
    this.logRobotArms();
  }

  /**
   * 计算机械臂的包围盒
   * @param {THREE.Object3D} model - 机械臂模型
   * @returns {Object} 包围盒数据
   */
  calculateBoundingBox(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    return {
      min: {
        x: box.min.x,
        y: box.min.y,
        z: box.min.z
      },
      max: {
        x: box.max.x,
        y: box.max.y,
        z: box.max.z
      },
      center: {
        x: center.x,
        y: center.y,
        z: center.z
      },
      size: {
        x: size.x,
        y: size.y,
        z: size.z
      }
    };
  }

  /**
   * 获取机械臂模型
   * @param {string} id - 机械臂编号
   * @returns {THREE.Object3D|null} 机械臂模型对象
   */
  getRobotArm(id) {
    return this.robotArms.get(id) || null;
  }

  /**
   * 获取机械臂数据
   * @param {string} id - 机械臂编号
   * @returns {Object|null} 机械臂数据对象
   */
  getRobotArmData(id) {
    return this.robotArmData.get(id) || null;
  }

  /**
   * 获取所有机械臂编号
   * @returns {Array} 机械臂编号数组
   */
  getAllRobotArmIds() {
    return Array.from(this.robotArms.keys());
  }

  /**
   * 获取所有机械臂数据
   * @returns {Array} 机械臂数据数组
   */
  getAllRobotArmData() {
    return Array.from(this.robotArmData.values());
  }

  /**
   * 检查机械臂是否存在
   * @param {string} id - 机械臂编号
   * @returns {boolean} 是否存在
   */
  hasRobotArm(id) {
    return this.robotArms.has(id);
  }

  /**
   * 设置机械臂位置
   * @param {string} id - 机械臂编号
   * @param {THREE.Vector3} position - 新位置
   */
  setRobotArmPosition(id, position) {
    const robotArm = this.getRobotArm(id);
    const robotArmData = this.getRobotArmData(id);
    
    if (robotArm && robotArmData) {
      robotArm.position.copy(position);
      robotArmData.currentPosition.copy(position);
    }
  }

  /**
   * 重置机械臂到原始位置
   * @param {string} id - 机械臂编号
   */
  resetRobotArmPosition(id) {
    const robotArmData = this.getRobotArmData(id);
    
    if (robotArmData) {
      this.setRobotArmPosition(id, robotArmData.originalPosition);
      robotArmData.isMoving = false;
      robotArmData.currentPath = null;
      robotArmData.animation = null;
    }
  }

  /**
   * 设置机械臂移动状态
   * @param {string} id - 机械臂编号
   * @param {boolean} isMoving - 是否正在移动
   * @param {string|null} pathName - 当前路径名称
   * @param {Object|null} animation - 动画对象
   */
  setRobotArmMovingState(id, isMoving, pathName = null, animation = null) {
    const robotArmData = this.getRobotArmData(id);
    
    if (robotArmData) {
      robotArmData.isMoving = isMoving;
      robotArmData.currentPath = pathName;
      robotArmData.animation = animation;
    }
  }

  /**
   * 获取正在移动的机械臂
   * @returns {Array} 正在移动的机械臂数据数组
   */
  getMovingRobotArms() {
    return this.getAllRobotArmData().filter(data => data.isMoving);
  }

  /**
   * 停止所有机械臂移动
   */
  stopAllRobotArms() {
    this.getAllRobotArmData().forEach(data => {
      if (data.isMoving && data.animation) {
        data.animation.stop();
        this.setRobotArmMovingState(data.id, false);
      }
    });
  }

  /**
   * 重置所有机械臂到原始位置
   */
  resetAllRobotArms() {
    this.getAllRobotArmIds().forEach(id => {
      this.resetRobotArmPosition(id);
    });
  }

  /**
   * 记录机械臂信息
   */
  logRobotArms() {
    console.log('📋 机械臂列表:');
    this.robotArmData.forEach((data, id) => {
      console.log(`  - 编号: ${id}`);
      console.log(`    - 名称: ${data.name}`);
      console.log(`    - 原始位置: (${data.originalPosition.x.toFixed(2)}, ${data.originalPosition.y.toFixed(2)}, ${data.originalPosition.z.toFixed(2)})`);
      console.log(`    - 当前位置: (${data.currentPosition.x.toFixed(2)}, ${data.currentPosition.y.toFixed(2)}, ${data.currentPosition.z.toFixed(2)})`);
      console.log(`    - 是否移动: ${data.isMoving}`);
      console.log(`    - 当前路径: ${data.currentPath || '无'}`);
    });
  }

  /**
   * 调试状态
   */
  debugStatus() {
    console.log('🔍 RobotArmManager 调试信息:');
    console.log(`  - 是否已初始化: ${this.isInitialized}`);
    console.log(`  - 机械臂数量: ${this.robotArms.size}`);
    console.log(`  - 正在移动的机械臂数量: ${this.getMovingRobotArms().length}`);
    console.log(`  - 机械臂编号列表: [${this.getAllRobotArmIds().join(', ')}]`);
    
    if (this.getMovingRobotArms().length > 0) {
      console.log('  - 正在移动的机械臂:');
      this.getMovingRobotArms().forEach(data => {
        console.log(`    - ${data.id}: 路径 ${data.currentPath}`);
      });
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stopAllRobotArms();
    this.robotArms.clear();
    this.robotArmData.clear();
    this.isInitialized = false;
    console.log('🗑️ RobotArmManager 资源已清理');
  }
}

// 创建全局实例
export const robotArmManager = new RobotArmManager();
