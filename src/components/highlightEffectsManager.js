/**
 * 醒目效果管理器
 * 负责管理围栏、流光等醒目效果的创建、更新和销毁
 */

import * as THREE from "three";
import { 
  getHighlightEffectConfig, 
  createFenceGeometry, 
  createStreamGeometry,
  createFenceMaterial,
  createStreamMaterial,
  createGlowGeometry,
  createGlowMaterial
} from "../assets/highlightEffectsConfig.js";

export class HighlightEffectsManager {
  constructor() {
    this.scene = null;
    this.effects = new Map(); // 存储所有效果对象
    this.clock = new THREE.Clock();
    this.animationId = null;
  }

  /**
   * 初始化效果管理器
   * @param {THREE.Scene} scene - 场景对象
   */
  init(scene) {
    this.scene = scene;
    this.startAnimation();
    console.log('🎨 醒目效果管理器初始化完成');
  }

  /**
   * 为对象添加醒目效果
   * @param {string} id - 效果唯一ID
   * @param {Object} boundingBox - 包围盒信息
   * @param {string} targetType - 目标类型 ('device', 'group')
   * @param {string} effectType - 效果类型 ('glow', 'fence', 'stream', 'both')
   * @param {Object} customConfig - 自定义配置（可选）
   */
  addHighlightEffect(id, boundingBox, targetType = 'device', effectType = 'glow', customConfig = null) {
    if (!this.scene) {
      console.warn('场景未初始化，无法添加醒目效果');
      return;
    }

    // 验证包围盒数据
    if (!boundingBox || !boundingBox.center || !boundingBox.size) {
      console.warn('无效的包围盒数据，无法添加醒目效果:', boundingBox);
      return;
    }

    // 验证包围盒尺寸
    const { center, size } = boundingBox;
    if (!isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z) || 
        size.x <= 0 || size.y <= 0 || size.z <= 0) {
      console.warn('无效的包围盒尺寸，无法添加醒目效果:', size);
      return;
    }

    // 移除已存在的效果
    this.removeHighlightEffect(id);

    const effects = {
      id: id,
      targetType: targetType,
      effectType: effectType,
      objects: [],
      configs: {}
    };

    // 创建发光效果
    if (effectType === 'glow') {
      try {
        const glowConfig = getHighlightEffectConfig(targetType, 'glow');
        if (customConfig?.glow) {
          // 深度合并配置，确保animation对象正确合并
          if (customConfig.glow.animation) {
            glowConfig.animation = { ...glowConfig.animation, ...customConfig.glow.animation };
          }
          Object.assign(glowConfig, customConfig.glow);
        }
        
        // 确保动画配置存在且启用
        if (!glowConfig.animation) {
          glowConfig.animation = { enabled: true };
        }
        if (glowConfig.animation.enabled === undefined) {
          glowConfig.animation.enabled = true;
        }
        
        // 调试信息
        console.log(`🎨 发光效果配置:`, {
          id: id,
          targetType: targetType,
          animation: glowConfig.animation,
          enabled: glowConfig.animation.enabled
        });
        
        const glowGeometry = createGlowGeometry(boundingBox, glowConfig);
        
        // 验证几何体是否有效
        if (!glowGeometry || glowGeometry.attributes.position.count === 0) {
          console.warn('发光几何体创建失败，跳过发光效果');
        } else {
          const glowMaterial = createGlowMaterial(glowConfig);
          const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
          
          // 设置位置 - 贴近地面
          glowMesh.position.set(
            boundingBox.center.x,
            boundingBox.center.y - boundingBox.size.y / 2 + (glowConfig.position?.offsetY || 0.02),
            boundingBox.center.z
          );
          
          glowMesh.name = `${id}_glow`;
          this.scene.add(glowMesh);
          effects.objects.push(glowMesh);
          effects.configs.glow = glowConfig;
        }
      } catch (error) {
        console.error('创建发光效果时出错:', error);
      }
    }

    // 创建围栏效果
    if (effectType === 'fence' || effectType === 'both') {
      try {
        const fenceConfig = getHighlightEffectConfig(targetType, 'fence');
        if (customConfig?.fence) {
          Object.assign(fenceConfig, customConfig.fence);
        }
        
        const fenceGeometry = createFenceGeometry(boundingBox, fenceConfig);
        
        // 验证几何体是否有效
        if (!fenceGeometry || fenceGeometry.attributes.position.count === 0) {
          console.warn('围栏几何体创建失败，跳过围栏效果');
        } else {
          const fenceMaterial = createFenceMaterial(fenceConfig);
          const fenceMesh = new THREE.Mesh(fenceGeometry, fenceMaterial);
          
          // 设置位置
          fenceMesh.position.set(
            boundingBox.center.x,
            boundingBox.center.y + (fenceConfig.position?.offsetY || 0.1),
            boundingBox.center.z
          );
          
          fenceMesh.name = `${id}_fence`;
          this.scene.add(fenceMesh);
          effects.objects.push(fenceMesh);
          effects.configs.fence = fenceConfig;
        }
      } catch (error) {
        console.error('创建围栏效果时出错:', error);
      }
    }

    // 创建流光效果
    if (effectType === 'stream' || effectType === 'both') {
      try {
        const streamConfig = getHighlightEffectConfig(targetType, 'stream');
        if (customConfig?.stream) {
          Object.assign(streamConfig, customConfig.stream);
        }
        
        const streamGeometry = createStreamGeometry(boundingBox, streamConfig);
        
        // 验证几何体是否有效
        if (!streamGeometry || streamGeometry.attributes.position.count === 0) {
          console.warn('流光几何体创建失败，跳过流光效果');
        } else {
          const streamMaterial = createStreamMaterial(streamConfig);
          const streamMesh = new THREE.Mesh(streamGeometry, streamMaterial);
          
          // 设置位置
          streamMesh.position.set(
            boundingBox.center.x,
            boundingBox.center.y + (streamConfig.position?.offsetY || 0.2),
            boundingBox.center.z
          );
          
          streamMesh.name = `${id}_stream`;
          this.scene.add(streamMesh);
          effects.objects.push(streamMesh);
          effects.configs.stream = streamConfig;
        }
      } catch (error) {
        console.error('创建流光效果时出错:', error);
      }
    }

    // 存储效果
    this.effects.set(id, effects);
    
    console.log(`🎨 添加醒目效果: ${id} (${targetType}, ${effectType})`, {
      objects: effects.objects.length,
      boundingBox: boundingBox
    });
  }

  /**
   * 移除醒目效果
   * @param {string} id - 效果ID
   */
  removeHighlightEffect(id) {
    const effect = this.effects.get(id);
    if (!effect) return;

    // 从场景中移除所有效果对象
    effect.objects.forEach(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else {
          obj.material.dispose();
        }
      }
      this.scene.remove(obj);
    });

    // 从效果映射中移除
    this.effects.delete(id);
    
    console.log(`🗑️ 移除醒目效果: ${id}`);
  }

  /**
   * 清除所有醒目效果
   */
  clearAllEffects() {
    const effectIds = Array.from(this.effects.keys());
    effectIds.forEach(id => this.removeHighlightEffect(id));
    console.log('🧹 清除所有醒目效果');
  }

  /**
   * 检查效果是否存在
   * @param {string} id - 效果ID
   * @returns {boolean} 是否存在
   */
  hasEffect(id) {
    return this.effects.has(id);
  }

  /**
   * 获取效果信息
   * @param {string} id - 效果ID
   * @returns {Object|null} 效果信息
   */
  getEffect(id) {
    return this.effects.get(id) || null;
  }

  /**
   * 获取所有效果ID
   * @returns {Array} 效果ID数组
   */
  getAllEffectIds() {
    return Array.from(this.effects.keys());
  }

  /**
   * 开始动画循环
   */
  startAnimation() {
    if (this.animationId) return;
    
    const animate = () => {
      this.updateEffects();
      this.animationId = requestAnimationFrame(animate);
    };
    
    animate();
    console.log('🎬 醒目效果动画循环已启动');
  }

  /**
   * 停止动画循环
   */
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
      console.log('🛑 醒目效果动画循环已停止');
    }
  }

  /**
   * 更新所有效果（公共方法）
   * @param {number} time - 时间参数
   */
  update(time) {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.effects.forEach((effect, id) => {
      this.updateEffect(effect, deltaTime, elapsedTime);
    });
  }

  /**
   * 更新所有效果（内部方法）
   */
  updateEffects() {
    const deltaTime = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.effects.forEach((effect, id) => {
      this.updateEffect(effect, deltaTime, elapsedTime);
    });
  }

  /**
   * 更新单个效果
   * @param {Object} effect - 效果对象
   * @param {number} deltaTime - 时间增量
   * @param {number} elapsedTime - 经过时间
   */
  updateEffect(effect, deltaTime, elapsedTime) {
    effect.objects.forEach(obj => {
      if (obj.name.includes('_glow')) {
        this.updateGlowEffect(obj, effect.configs.glow, elapsedTime);
      } else if (obj.name.includes('_fence')) {
        this.updateFenceEffect(obj, effect.configs.fence, elapsedTime);
      } else if (obj.name.includes('_stream')) {
        this.updateStreamEffect(obj, effect.configs.stream, elapsedTime);
      }
    });
  }

  /**
   * 更新围栏效果
   * @param {THREE.Mesh} fenceMesh - 围栏网格
   * @param {Object} config - 围栏配置
   * @param {number} elapsedTime - 经过时间
   */
  updateFenceEffect(fenceMesh, config, elapsedTime) {
    if (!config.animation.enabled) return;

    // 旋转动画
    if (config.animation.direction !== 0) {
      fenceMesh.rotation.y += config.animation.speed * config.animation.direction * 0.01;
    }

    // 脉冲动画
    if (config.animation.pulse) {
      const pulseScale = 1 + Math.sin(elapsedTime * config.animation.pulseSpeed) * 0.1;
      fenceMesh.scale.setScalar(pulseScale);
    }
  }

  /**
   * 更新流光效果
   * @param {THREE.Mesh} streamMesh - 流光网格
   * @param {Object} config - 流光配置
   * @param {number} elapsedTime - 经过时间
   */
  updateStreamEffect(streamMesh, config, elapsedTime) {
    if (!config.animation.enabled) return;

    // 更新着色器时间
    if (streamMesh.material.uniforms) {
      streamMesh.material.uniforms.uTime.value = elapsedTime;
    }

    // 旋转动画
    streamMesh.rotation.y += config.animation.speed * 0.01;
  }

  /**
   * 更新发光效果
   * @param {THREE.Mesh} glowMesh - 发光网格
   * @param {Object} config - 发光配置
   * @param {number} elapsedTime - 经过时间
   */
  updateGlowEffect(glowMesh, config, elapsedTime) {
    if (!glowMesh.material.uniforms) {
      console.warn('发光效果材质没有uniforms:', glowMesh.name);
      return;
    }
    
    const { animation } = config;
    if (!animation?.enabled) {
      console.warn('发光效果动画未启用:', glowMesh.name);
      return;
    }
    
    // 更新着色器uniforms
    glowMesh.material.uniforms.uTime.value = elapsedTime;
    
    // 调试信息（每5秒输出一次）
    if (Math.floor(elapsedTime) % 5 === 0 && Math.floor(elapsedTime * 10) % 10 === 0) {
      console.log(`🎨 更新发光效果: ${glowMesh.name}, 时间: ${elapsedTime.toFixed(2)}`);
    }
    
    // 可选：添加旋转动画
    if (animation.rotate) {
      glowMesh.rotation.y += animation.rotateSpeed * 0.01;
    }
  }

  /**
   * 销毁管理器
   */
  dispose() {
    this.stopAnimation();
    this.clearAllEffects();
    this.scene = null;
    console.log('🧹 醒目效果管理器已销毁');
  }
}
