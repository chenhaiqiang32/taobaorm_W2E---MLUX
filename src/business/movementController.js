/**
 * 移动控制器
 * 负责控制机械臂沿路径移动的动画系统
 */

import * as THREE from 'three';
import { robotArmManager } from './robotArmManager.js';

export class MovementController {
  constructor() {
    // 动画控制 {机械臂ID: 动画对象}
    this.animations = new Map();
    
    // 动画配置
    this.defaultOptions = {
      duration: 5000,           // 移动持续时间（毫秒）
      easing: 'linear',         // 缓动函数：linear, easeIn, easeOut, easeInOut
      loop: false,              // 是否循环移动
      reverse: false,           // 是否反向移动
      onStart: null,            // 开始移动回调
      onUpdate: null,           // 移动更新回调
      onComplete: null,         // 移动完成回调
      onError: null             // 错误回调
    };
    
    // 动画ID计数器
    this.animationIdCounter = 0;
    
    // 是否正在运行动画循环
    this.isRunning = false;
    
    console.log('🎬 MovementController 已创建');
  }

  /**
   * 开始移动
   * @param {string} robotArmId - 机械臂编号
   * @param {string} pathName - 路径名称
   * @param {Object} options - 移动选项
   * @returns {boolean} 是否成功开始移动
   */
  startMovement(robotArmId, pathName, options = {}) {
    console.log(`🎬 开始移动机械臂 ${robotArmId} 沿路径 ${pathName}`);
    
    try {
      // 验证参数
      if (!this.validateMovementRequest(robotArmId, pathName)) {
        return false;
      }
      
      // 合并配置选项
      const config = { ...this.defaultOptions, ...options };
      
      // 停止当前动画（如果存在）
      this.stopMovement(robotArmId);
      
      // 创建新的动画
      const animation = new RobotArmAnimation(
        robotArmId, 
        pathName, 
        config
      );
      
      // 存储动画
      this.animations.set(robotArmId, animation);
      
      // 开始动画
      animation.play();
      
      // 启动动画循环（如果还没有运行）
      if (!this.isRunning) {
        this.startAnimationLoop();
      }
      
      console.log(`✅ 机械臂 ${robotArmId} 移动动画已开始`);
      return true;
      
    } catch (error) {
      console.error(`❌ 开始移动机械臂 ${robotArmId} 失败:`, error);
      if (options.onError) {
        options.onError(error);
      }
      return false;
    }
  }

  /**
   * 停止移动
   * @param {string} robotArmId - 机械臂编号
   */
  stopMovement(robotArmId) {
    const animation = this.animations.get(robotArmId);
    if (animation) {
      animation.stop();
      this.animations.delete(robotArmId);
      console.log(`⏹️ 机械臂 ${robotArmId} 移动已停止`);
    }
    
    // 如果没有动画在运行，停止动画循环
    if (this.animations.size === 0) {
      this.stopAnimationLoop();
    }
  }

  /**
   * 暂停移动
   * @param {string} robotArmId - 机械臂编号
   */
  pauseMovement(robotArmId) {
    const animation = this.animations.get(robotArmId);
    if (animation) {
      animation.pause();
      console.log(`⏸️ 机械臂 ${robotArmId} 移动已暂停`);
    }
  }

  /**
   * 恢复移动
   * @param {string} robotArmId - 机械臂编号
   */
  resumeMovement(robotArmId) {
    const animation = this.animations.get(robotArmId);
    if (animation) {
      animation.resume();
      console.log(`▶️ 机械臂 ${robotArmId} 移动已恢复`);
    }
  }

  /**
   * 停止所有移动
   */
  stopAllMovements() {
    console.log('⏹️ 停止所有机械臂移动');
    this.animations.forEach((animation, robotArmId) => {
      animation.stop();
    });
    this.animations.clear();
    this.stopAnimationLoop();
  }

  /**
   * 暂停所有移动
   */
  pauseAllMovements() {
    console.log('⏸️ 暂停所有机械臂移动');
    this.animations.forEach((animation) => {
      animation.pause();
    });
  }

  /**
   * 恢复所有移动
   */
  resumeAllMovements() {
    console.log('▶️ 恢复所有机械臂移动');
    this.animations.forEach((animation) => {
      animation.resume();
    });
  }

  /**
   * 验证移动请求
   * @param {string} robotArmId - 机械臂编号
   * @param {string} pathName - 路径名称
   * @returns {boolean} 是否有效
   */
  validateMovementRequest(robotArmId, pathName) {
    // 动态导入管理器进行验证
    return import('./robotArmManager.js').then(({ robotArmManager }) => {
      return import('./pathManager.js').then(({ pathManager }) => {
        if (!robotArmManager.hasRobotArm(robotArmId)) {
          console.error(`❌ 未找到机械臂模型：${robotArmId}`);
          return false;
        }
        
        if (!pathManager.hasPath(pathName)) {
          console.error(`❌ 未找到路径：${pathName}`);
          return false;
        }
        
        return true;
      });
    }).catch(() => false);
  }

  /**
   * 启动动画循环
   */
  startAnimationLoop() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.animationLoop();
    console.log('🔄 动画循环已启动');
  }

  /**
   * 停止动画循环
   */
  stopAnimationLoop() {
    this.isRunning = false;
    console.log('⏹️ 动画循环已停止');
  }

  /**
   * 动画循环
   */
  animationLoop() {
    if (!this.isRunning) return;
    
    const currentTime = performance.now();
    
    // 更新所有动画
    this.animations.forEach((animation, robotArmId) => {
      animation.update(currentTime);
      
      // 如果动画完成，移除它
      if (animation.isCompleted) {
        this.animations.delete(robotArmId);
        console.log(`✅ 机械臂 ${robotArmId} 移动动画已完成`);
      }
    });
    
    // 如果没有动画在运行，停止循环
    if (this.animations.size === 0) {
      this.stopAnimationLoop();
    } else {
      // 继续下一帧
      requestAnimationFrame(() => this.animationLoop());
    }
  }

  /**
   * 获取正在移动的机械臂
   * @returns {Array} 正在移动的机械臂ID数组
   */
  getMovingRobotArms() {
    return Array.from(this.animations.keys());
  }

  /**
   * 获取动画状态
   * @param {string} robotArmId - 机械臂编号
   * @returns {Object|null} 动画状态
   */
  getAnimationStatus(robotArmId) {
    const animation = this.animations.get(robotArmId);
    return animation ? animation.getStatus() : null;
  }

  /**
   * 调试状态
   */
  debugStatus() {
    console.log('🔍 MovementController 调试信息:');
    console.log(`  - 动画循环运行中: ${this.isRunning}`);
    console.log(`  - 活跃动画数量: ${this.animations.size}`);
    console.log(`  - 正在移动的机械臂: [${this.getMovingRobotArms().join(', ')}]`);
    
    if (this.animations.size > 0) {
      console.log('  - 动画详情:');
      this.animations.forEach((animation, robotArmId) => {
        const status = animation.getStatus();
        console.log(`    - ${robotArmId}: 进度 ${(status.progress * 100).toFixed(1)}%, 状态 ${status.state}`);
      });
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.stopAllMovements();
    console.log('🗑️ MovementController 资源已清理');
  }
}

/**
 * 机械臂动画类
 */
class RobotArmAnimation {
  constructor(robotArmId, pathName, options) {
    this.robotArmId = robotArmId;
    this.pathName = pathName;
    this.options = options;
    
    this.startTime = null;
    this.pauseTime = null;
    this.totalPauseTime = 0;
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = false;
    
    this.animationId = `animation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 播放动画
   */
  play() {
    if (this.isCompleted) return;
    
    this.startTime = performance.now() - this.totalPauseTime;
    this.isPlaying = true;
    this.isPaused = false;
    this.pauseTime = null;
    
    // 设置机械臂移动状态
    this.setRobotArmMovingState(true);
    
    // 调用开始回调
    if (this.options.onStart) {
      this.options.onStart(this.robotArmId, this.pathName);
    }
    
    console.log(`▶️ 动画 ${this.animationId} 开始播放`);
  }

  /**
   * 暂停动画
   */
  pause() {
    if (!this.isPlaying || this.isPaused) return;
    
    this.pauseTime = performance.now();
    this.isPaused = true;
    
    console.log(`⏸️ 动画 ${this.animationId} 已暂停`);
  }

  /**
   * 恢复动画
   */
  resume() {
    if (!this.isPaused) return;
    
    this.totalPauseTime += performance.now() - this.pauseTime;
    this.isPaused = false;
    this.pauseTime = null;
    
    console.log(`▶️ 动画 ${this.animationId} 已恢复`);
  }

  /**
   * 停止动画
   */
  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isCompleted = true;
    
    // 重置机械臂移动状态
    this.setRobotArmMovingState(false);
    
    console.log(`⏹️ 动画 ${this.animationId} 已停止`);
  }

  /**
   * 更新动画
   * @param {number} currentTime - 当前时间
   */
  update(currentTime) {
    if (!this.isPlaying || this.isPaused || this.isCompleted) return;
    
    const elapsed = currentTime - this.startTime - this.totalPauseTime;
    const progress = Math.min(elapsed / this.options.duration, 1);
    
    // 应用缓动函数
    const easedProgress = this.applyEasing(progress);
    
    // 处理反向移动
    const finalProgress = this.options.reverse ? (1 - easedProgress) : easedProgress;
    
    try {
      // 更新机械臂位置
      this.updateRobotArmPosition(finalProgress);
      
      // 调用更新回调
      if (this.options.onUpdate) {
        this.options.onUpdate(this.robotArmId, this.pathName, finalProgress, elapsed);
      }
      
      // 检查是否完成
      if (progress >= 1) {
        this.complete();
      }
      
    } catch (error) {
      console.error(`❌ 更新动画 ${this.animationId} 时出错:`, error);
      if (this.options.onError) {
        this.options.onError(error);
      }
      this.stop();
    }
  }

  /**
   * 应用缓动函数
   * @param {number} t - 进度 (0-1)
   * @returns {number} 缓动后的进度
   */
  applyEasing(t) {
    switch (this.options.easing) {
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - Math.pow(1 - t, 2);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'linear':
      default:
        return t;
    }
  }

  /**
   * 更新机械臂位置
   * @param {number} progress - 进度 (0-1)
   */
  async updateRobotArmPosition(progress) {
    try {
      // 动态导入管理器
      const { pathManager } = await import('./pathManager.js');
      const { robotArmManager } = await import('./robotArmManager.js');
      
      // 获取路径和机械臂
      const path = pathManager.getPath(this.pathName);
      const robotArm = robotArmManager.getRobotArm(this.robotArmId);
      
      // 调试信息：验证路径和机械臂数据
      if (!path) {
        console.error(`❌ 路径 ${this.pathName} 不存在`);
        return;
      }
      if (!robotArm) {
        console.error(`❌ 机械臂 ${this.robotArmId} 不存在`);
        return;
      }
      
        // 调试信息：打印路径和机械臂信息
        if (progress === 0) {
          console.log(`🔍 路径信息:`, {
            pathName: this.pathName,
            pathLength: path.getLength ? path.getLength().toFixed(3) : 'N/A',
            pathType: path.constructor.name
          });
          
          const worldPos = new THREE.Vector3();
          robotArm.getWorldPosition(worldPos);
          
          console.log(`🔍 机械臂信息:`, {
            robotArmId: this.robotArmId,
            localPosition: `(${robotArm.position.x.toFixed(3)}, ${robotArm.position.y.toFixed(3)}, ${robotArm.position.z.toFixed(3)})`,
            worldPosition: `(${worldPos.x.toFixed(3)}, ${worldPos.y.toFixed(3)}, ${worldPos.z.toFixed(3)})`,
            visible: robotArm.visible,
            hasParent: robotArm.parent ? 'Yes' : 'No',
            parentName: robotArm.parent ? robotArm.parent.name : 'None'
          });
          
          // 创建可视化调试点
          this.createDebugMarker(position, 'path-start');
          
          // 创建机械臂顶部点调试标记
          if (robotArmData && robotArmData.boundingBox) {
            const boundingBox = robotArmData.boundingBox;
            const topCenter = new THREE.Vector3(
              (boundingBox.min.x + boundingBox.max.x) / 2,
              boundingBox.max.y,
              (boundingBox.min.z + boundingBox.max.z) / 2
            );
            this.createDebugMarker(topCenter, `robot-arm-${this.robotArmId}-top`);
          }
        }
      
      if (path && robotArm) {
        // 使用均匀分布的点获取位置，确保匀速运动
        let position;
        let tangent;
        
        if (path.getUniformPoint) {
          // 使用自定义的均匀分布方法
          position = path.getUniformPoint(progress);
          tangent = path.getUniformTangent(progress);
        } else {
          // 回退到标准方法
          position = path.getPoint(progress);
          tangent = path.getTangent(progress);
        }
        
        // 只修改X和Z轴位置，保持原模型的Y轴高度，并补偿位置偏移
        const robotArmData = robotArmManager.getRobotArmData(this.robotArmId);
        let adjustedPosition = position.clone();
        
        if (robotArmData && robotArmData.originalPosition) {
          // 使用机械臂的原始Y轴位置，只使用路径的X和Z坐标
          adjustedPosition.y = robotArmData.originalPosition.y;
          
          // 补偿机械臂的位置偏移（机械臂后移4个单位的问题）
          // 假设机械臂朝向X轴正方向，需要向前偏移4个单位
          adjustedPosition.x = adjustedPosition.x + 4; // 向前偏移4个单位
          
          console.log(`🎯 机械臂 ${this.robotArmId} 位置调整: 保持原始Y轴高度 ${robotArmData.originalPosition.y.toFixed(3)}，X轴前移4个单位，使用路径XZ坐标 (${position.x.toFixed(3)}, ${position.z.toFixed(3)})`);
        }
        
        // 更新机械臂位置
        robotArm.position.copy(adjustedPosition);
        
        // 强制更新矩阵，确保位置变化被渲染
        robotArm.updateMatrixWorld(true);
        
        // 如果机械臂有父级对象，也需要更新父级的矩阵
        let parent = robotArm.parent;
        while (parent) {
          parent.updateMatrixWorld(true);
          parent = parent.parent;
        }
        
        // 备用方法：如果机械臂有父级，尝试使用世界坐标设置
        if (robotArm.parent) {
          // 计算相对于父级的本地坐标
          const parentWorldMatrix = robotArm.parent.matrixWorld.clone();
          const parentInverseMatrix = parentWorldMatrix.invert();
          const localPosition = position.clone().applyMatrix4(parentInverseMatrix);
          
          // 保持机械臂的原始Y轴位置，只使用路径的X和Z坐标，并补偿位置偏移
          if (robotArmData && robotArmData.originalPosition) {
            // 使用机械臂的原始Y轴位置
            localPosition.y = robotArmData.originalPosition.y;
            
            // 补偿机械臂的位置偏移（机械臂后移4个单位的问题）
            // 假设机械臂朝向X轴正方向，需要向前偏移4个单位
            localPosition.x = localPosition.x + 88; // 向前偏移4个单位
            
            console.log(`📏 机械臂 ${this.robotArmId} 保持原始Y轴高度: ${robotArmData.originalPosition.y.toFixed(3)}，X轴前移4个单位，使用路径XZ坐标`);
          }
          
          // 设置本地位置
          robotArm.position.copy(localPosition);
          robotArm.updateMatrixWorld(true);
          
          console.log(`🔄 使用父级坐标转换: 世界坐标 -> 本地坐标，保持原始Y轴高度`);
        }
        
        // 更新机械臂朝向（沿路径切线方向）
        if (progress < 1 && tangent && tangent.length() > 0) {
          // 确保切线向量已标准化
          const normalizedTangent = tangent.clone().normalize();
          
          // 检查标准化后的向量是否有效
          if (normalizedTangent.length() > 0) {
            // 改进的朝向计算：使用更精确的方法
            this.updateRobotArmRotation(robotArm, normalizedTangent, progress);
            
            // 创建方向箭头调试标记（仅在开始时创建一次）
            if (progress === 0) {
              this.createDebugMarker(
                robotArm.position.clone(), 
                `robot-arm-${this.robotArmId}-direction`, 
                'arrow', 
                normalizedTangent.clone().multiplyScalar(2)
              );
            }
            
            // 调试日志（仅在需要时输出，避免日志过多）
            if (Math.floor(progress * 100) % 10 === 0) { // 每10%进度输出一次
              console.log(`🧭 机械臂 ${this.robotArmId} 朝向更新: 切线方向 (${normalizedTangent.x.toFixed(3)}, ${normalizedTangent.y.toFixed(3)}, ${normalizedTangent.z.toFixed(3)}) - 进度: ${(progress * 100).toFixed(1)}%`);
            }
          } else {
            console.warn(`⚠️ 机械臂 ${this.robotArmId} 切线向量无效，跳过朝向更新`);
          }
        }
        
        // 调试信息：打印实际位置和路径位置
        const worldPosition = new THREE.Vector3();
        robotArm.getWorldPosition(worldPosition);
        
        console.log(`🔧 机械臂 ${this.robotArmId} 位置更新:`, {
          progress: (progress * 100).toFixed(1) + '%',
          pathPosition: `(${position.x.toFixed(3)}, ${position.y.toFixed(3)}, ${position.z.toFixed(3)})`,
          localPosition: `(${robotArm.position.x.toFixed(3)}, ${robotArm.position.y.toFixed(3)}, ${robotArm.position.z.toFixed(3)})`,
          worldPosition: `(${worldPosition.x.toFixed(3)}, ${worldPosition.y.toFixed(3)}, ${worldPosition.z.toFixed(3)})`,
          hasParent: robotArm.parent ? 'Yes' : 'No',
          parentName: robotArm.parent ? robotArm.parent.name : 'None'
        });
      }
    } catch (error) {
      console.error('更新机械臂位置时出错:', error);
      throw error;
    }
  }

  /**
   * 更新机械臂旋转（改进的朝向计算）
   * @param {THREE.Object3D} robotArm - 机械臂对象
   * @param {THREE.Vector3} direction - 目标方向向量
   * @param {number} progress - 移动进度
   */
  updateRobotArmRotation(robotArm, direction, progress) {
    try {
      // 方法1：使用四元数进行平滑旋转
      const targetQuaternion = new THREE.Quaternion();
      
      // 计算目标旋转四元数
      // 机械臂的默认朝向是X轴正方向，需要旋转90度到Z轴正方向
      const defaultDirection = new THREE.Vector3(1, 0, 0); // 机械臂默认朝向X轴正方向
      const rotationQuaternion = new THREE.Quaternion();
      
      // 计算从默认方向到目标方向的旋转
      rotationQuaternion.setFromUnitVectors(defaultDirection, direction);
      
      // 如果机械臂有父级，需要考虑父级的旋转
      if (robotArm.parent) {
        // 获取父级的世界旋转
        const parentWorldQuaternion = new THREE.Quaternion();
        robotArm.parent.getWorldQuaternion(parentWorldQuaternion);
        
        // 计算相对于父级的本地旋转
        const parentInverseQuaternion = parentWorldQuaternion.clone().invert();
        targetQuaternion.multiplyQuaternions(parentInverseQuaternion, rotationQuaternion);
      } else {
        targetQuaternion.copy(rotationQuaternion);
      }
      
      // 应用旋转（使用平滑插值避免突变）
      const currentQuaternion = robotArm.quaternion.clone();
      const lerpFactor = 0.1; // 插值因子，可以调整平滑度
      robotArm.quaternion.slerp(targetQuaternion, lerpFactor);
      
      // 强制更新矩阵
      robotArm.updateMatrixWorld(true);
      
      // 方法2：备用方法 - 使用lookAt（如果四元数方法有问题）
      if (progress === 0) {
        // 在开始时也尝试lookAt方法作为备用
        const targetPosition = robotArm.position.clone().add(direction);
        robotArm.lookAt(targetPosition);
        
        // 如果机械臂默认朝向是X轴，需要额外旋转90度
        robotArm.rotateY(Math.PI / 2); // 绕Y轴旋转90度
        
        robotArm.updateMatrixWorld(true);
      }
      
    } catch (error) {
      console.error('更新机械臂旋转时出错:', error);
      
      // 回退到简单的lookAt方法
      try {
        const targetPosition = robotArm.position.clone().add(direction);
        robotArm.lookAt(targetPosition);
        
        // 如果机械臂默认朝向是X轴，需要额外旋转90度
        robotArm.rotateY(Math.PI / 2); // 绕Y轴旋转90度
        
        robotArm.updateMatrixWorld(true);
      } catch (fallbackError) {
        console.error('回退方法也失败:', fallbackError);
      }
    }
  }

  /**
   * 创建可视化调试标记
   * @param {THREE.Vector3} position - 位置
   * @param {string} label - 标签
   * @param {string} type - 标记类型：'point', 'arrow', 'box'
   * @param {THREE.Vector3} direction - 方向向量（用于箭头标记）
   */
  createDebugMarker(position, label, type = 'point', direction = null) {
    try {
      // 动态导入THREE
      import('three').then(THREE => {
        let marker;
        let color = 0xff0000; // 默认红色
        
        // 根据标签设置不同颜色
        if (label.includes('path')) {
          color = 0x00ff00; // 绿色 - 路径点
        } else if (label.includes('robot-arm')) {
          color = 0x0000ff; // 蓝色 - 机械臂点
        } else if (label.includes('direction')) {
          color = 0xffff00; // 黄色 - 方向标记
        }
        
        switch (type) {
          case 'arrow':
            if (direction) {
              // 创建箭头标记
              const arrowHelper = new THREE.ArrowHelper(
                direction.normalize(),
                position,
                direction.length() * 2,
                color,
                0.2,
                0.1
              );
              marker = arrowHelper;
              marker.name = `debug-arrow-${label}`;
            } else {
              // 回退到点标记
              const geometry = new THREE.SphereGeometry(0.1, 8, 6);
              const material = new THREE.MeshBasicMaterial({ 
                color: color, 
                transparent: true, 
                opacity: 0.8 
              });
              marker = new THREE.Mesh(geometry, material);
              marker.name = `debug-marker-${label}`;
            }
            break;
            
          case 'box':
            // 创建盒子标记
            const boxGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
            const boxMaterial = new THREE.MeshBasicMaterial({ 
              color: color, 
              transparent: true, 
              opacity: 0.6,
              wireframe: true
            });
            marker = new THREE.Mesh(boxGeometry, boxMaterial);
            marker.name = `debug-box-${label}`;
            break;
            
          case 'point':
          default:
            // 创建点标记
            const geometry = new THREE.SphereGeometry(0.1, 8, 6);
            const material = new THREE.MeshBasicMaterial({ 
              color: color, 
              transparent: true, 
              opacity: 0.8 
            });
            marker = new THREE.Mesh(geometry, material);
            marker.name = `debug-marker-${label}`;
            break;
        }
        
        marker.position.copy(position);
        
        // 添加到场景中
        if (window.scene) {
          window.scene.add(marker);
          console.log(`🎯 创建调试标记 ${label} (${type}) 在位置: (${position.x.toFixed(3)}, ${position.y.toFixed(3)}, ${position.z.toFixed(3)})`);
        }
      });
    } catch (error) {
      console.warn('创建调试标记失败:', error);
    }
  }

  /**
   * 设置机械臂移动状态
   * @param {boolean} isMoving - 是否正在移动
   */
  async setRobotArmMovingState(isMoving) {
    try {
      const { robotArmManager } = await import('./robotArmManager.js');
      robotArmManager.setRobotArmMovingState(
        this.robotArmId, 
        isMoving, 
        isMoving ? this.pathName : null, 
        isMoving ? this : null
      );
    } catch (error) {
      console.error('设置机械臂移动状态时出错:', error);
    }
  }

  /**
   * 完成动画
   */
  complete() {
    this.isPlaying = false;
    this.isCompleted = true;
    
    // 重置机械臂移动状态
    this.setRobotArmMovingState(false);
    
    // 调用完成回调
    if (this.options.onComplete) {
      this.options.onComplete(this.robotArmId, this.pathName);
    }
    
    console.log(`✅ 动画 ${this.animationId} 已完成`);
  }

  /**
   * 获取动画状态
   * @returns {Object} 动画状态
   */
  getStatus() {
    const currentTime = performance.now();
    const elapsed = this.startTime ? (currentTime - this.startTime - this.totalPauseTime) : 0;
    const progress = this.startTime ? Math.min(elapsed / this.options.duration, 1) : 0;
    
    return {
      animationId: this.animationId,
      robotArmId: this.robotArmId,
      pathName: this.pathName,
      progress: progress,
      elapsed: elapsed,
      duration: this.options.duration,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isCompleted: this.isCompleted,
      state: this.isCompleted ? 'completed' : 
             this.isPaused ? 'paused' : 
             this.isPlaying ? 'playing' : 'stopped'
    };
  }
}

// 创建全局实例
export const movementController = new MovementController();
