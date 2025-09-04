import * as THREE from "three";

/**
 * 动画管理器
 * 负责管理模型的动画播放、暂停、重置等操作
 */
export class AnimationManager {
  constructor() {
    this.mixer = null;
    this.animationActions = [];
    this.isPlaying = false;
    this.clock = new THREE.Clock();
  }

  /**
   * 设置动画混合器
   * @param {THREE.AnimationMixer} mixer - 动画混合器
   * @param {Array} animations - 动画片段数组
   */
  setMixer(mixer, animations = []) {
    this.mixer = mixer;
    this.animationActions = [];

    // 为每个动画片段创建动作
    if (this.mixer && animations && animations.length > 0) {
      animations.forEach((clip) => {
        const action = this.mixer.clipAction(clip);
        this.animationActions.push(action);
      });

      this.isPlaying = false;
      console.log(
        `动画初始化完成，找到 ${animations.length} 个动画片段，默认停止播放`
      );
    }
  }

  /**
   * 播放所有动画
   */
  play() {
    if (this.mixer && this.animationActions.length > 0) {
      this.animationActions.forEach((action) => {
        action.play();
      });
      this.isPlaying = true;
      console.log("动画开始播放");
      return true;
    } else {
      console.log("没有可播放的动画");
      return false;
    }
  }

  /**
   * 暂停所有动画
   */
  pause() {
    if (this.mixer && this.animationActions.length > 0) {
      this.animationActions.forEach((action) => {
        action.paused = true;
      });
      this.isPlaying = false;
      console.log("动画已暂停");
      return true;
    }
    return false;
  }

  /**
   * 恢复所有动画
   */
  resume() {
    if (this.mixer && this.animationActions.length > 0) {
      this.animationActions.forEach((action) => {
        action.paused = false;
      });
      this.isPlaying = true;
      console.log("动画已恢复");
      return true;
    }
    return false;
  }

  /**
   * 停止所有动画
   */
  stop() {
    if (this.mixer && this.animationActions.length > 0) {
      this.animationActions.forEach((action) => {
        action.stop();
      });
      this.isPlaying = false;
      console.log("动画已停止");
      return true;
    }
    return false;
  }

  /**
   * 重置所有动画到初始状态
   */
  reset() {
    if (this.mixer && this.animationActions.length > 0) {
      this.animationActions.forEach((action) => {
        action.stop();
        action.reset();
      });
      this.isPlaying = false;
      console.log("动画已重置");
      return true;
    }
    return false;
  }

  /**
   * 切换播放/暂停状态
   */
  togglePlayPause() {
    if (this.isPlaying) {
      return this.pause();
    } else {
      return this.resume();
    }
  }

  /**
   * 设置动画播放速度
   * @param {number} speed - 播放速度倍数
   */
  setSpeed(speed) {
    if (this.mixer) {
      this.mixer.timeScale = speed;
      console.log(`动画播放速度设置为: ${speed}x`);
    }
  }

  /**
   * 获取动画播放速度
   */
  getSpeed() {
    return this.mixer ? this.mixer.timeScale : 1;
  }

  /**
   * 设置特定动画的权重
   * @param {number} index - 动画索引
   * @param {number} weight - 权重值 (0-1)
   */
  setActionWeight(index, weight) {
    if (this.animationActions[index]) {
      this.animationActions[index].setEffectiveWeight(weight);
      console.log(`动画 ${index} 权重设置为: ${weight}`);
    }
  }

  /**
   * 获取动画状态信息
   */
  getAnimationInfo() {
    if (!this.mixer || this.animationActions.length === 0) {
      return {
        hasAnimations: false,
        actionCount: 0,
        isPlaying: false,
        speed: 1,
      };
    }

    return {
      hasAnimations: true,
      actionCount: this.animationActions.length,
      isPlaying: this.isPlaying,
      speed: this.mixer.timeScale,
      actions: this.animationActions.map((action, index) => ({
        index,
        name: action.getClip().name,
        isRunning: action.isRunning(),
        isPaused: action.paused,
        weight: action.getEffectiveWeight(),
        time: action.time,
      })),
    };
  }

  /**
   * 更新动画
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    if (this.mixer && this.isPlaying) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * 使用内置时钟更新动画
   */
  updateWithClock() {
    if (this.mixer && this.isPlaying) {
      const deltaTime = this.clock.getDelta();
      this.mixer.update(deltaTime);
    }
  }

  /**
   * 获取动画混合器
   */
  getMixer() {
    return this.mixer;
  }

  /**
   * 获取动画动作数组
   */
  getActions() {
    return this.animationActions;
  }

  /**
   * 检查是否有动画
   */
  hasAnimations() {
    return this.mixer !== null && this.animationActions.length > 0;
  }

  /**
   * 检查是否正在播放
   */
  isAnimationPlaying() {
    return this.isPlaying;
  }

  /**
   * 清理资源
   */
  dispose() {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.mixer.getRoot());
    }
    this.animationActions = [];
    this.mixer = null;
    this.isPlaying = false;
  }
}
