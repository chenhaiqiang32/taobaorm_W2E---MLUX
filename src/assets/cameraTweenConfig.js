/**
 * 镜头Tween动画配置
 * 用于定义镜头移动到目标物体时的动画参数
 */

import * as THREE from "three";

/**
 * 默认镜头动画配置
 */
export const DEFAULT_CAMERA_TWEEN_CONFIG = {
  // 动画持续时间（毫秒）
  duration: 1500,
  
  // 缓动函数类型
  easing: 'easeInOutCubic', // 可选: 'linear', 'easeIn', 'easeOut', 'easeInOut', 'easeInOutCubic'
  
  // 镜头距离目标的倍数（基于包围盒大小）
  distanceMultiplier: {
    device: 3.0,    // 设备：3倍包围盒大小
    group: 2.5,     // 设备组：2.5倍包围盒大小
    default: 4.0    // 默认：4倍包围盒大小
  },
  
  // 镜头高度偏移（相对于目标中心）
  heightOffset: {
    device: 0.3,    // 设备：稍微向上偏移
    group: 0.2,     // 设备组：轻微向上偏移
    default: 0.5    // 默认：中等向上偏移
  },
  
  // 镜头角度配置
  angle: {
    device: {
      azimuth: 0,     // 方位角（水平旋转）
      elevation: 15   // 仰角（垂直角度）
    },
    group: {
      azimuth: 0,
      elevation: 20
    },
    default: {
      azimuth: 0,
      elevation: 25
    }
  },
  
  // 动画完成后的回调延迟（毫秒）
  onCompleteDelay: 100,
  
  // 是否在动画过程中禁用控制器
  disableControlsDuringAnimation: true,
  
  // 是否在动画完成后重新启用控制器
  enableControlsAfterAnimation: true
};

/**
 * 设备组镜头动画配置
 */
export const GROUP_CAMERA_TWEEN_CONFIG = {
  ...DEFAULT_CAMERA_TWEEN_CONFIG,
  duration: 1200,
  distanceMultiplier: 2.5,
  heightOffset: 0.2,
  angle: {
    azimuth: 0,
    elevation: 20
  }
};

/**
 * 设备镜头动画配置
 */
export const DEVICE_CAMERA_TWEEN_CONFIG = {
  ...DEFAULT_CAMERA_TWEEN_CONFIG,
  duration: 1000,
  distanceMultiplier: 3.0,
  heightOffset: 0.3,
  angle: {
    azimuth: 0,
    elevation: 15
  }
};

/**
 * 根据目标类型获取动画配置
 * @param {string} targetType - 目标类型 ('device', 'group', 'default')
 * @returns {Object} 动画配置
 */
export function getCameraTweenConfig(targetType = 'default') {
  switch (targetType) {
    case 'device':
      return DEVICE_CAMERA_TWEEN_CONFIG;
    case 'group':
      return GROUP_CAMERA_TWEEN_CONFIG;
    default:
      return DEFAULT_CAMERA_TWEEN_CONFIG;
  }
}

/**
 * 计算镜头目标位置
 * @param {Object} boundingBox - 包围盒信息
 * @param {string} targetType - 目标类型
 * @param {Object} customConfig - 自定义配置（可选）
 * @returns {Object} 包含position和target的对象
 */
export function calculateCameraTarget(boundingBox, targetType = 'default', customConfig = null) {
  const config = customConfig || getCameraTweenConfig(targetType);
  
  if (!boundingBox || !boundingBox.center || !boundingBox.size) {
    console.warn('无效的包围盒数据');
    return null;
  }
  
  const { center, size } = boundingBox;
  const maxSize = Math.max(size.x, size.y, size.z);
  const distance = maxSize * config.distanceMultiplier;
  
  // 计算目标点（包围盒中心 + 高度偏移）
  const target = {
    x: center.x,
    y: center.y + (size.y * config.heightOffset),
    z: center.z
  };
  
  // 计算镜头位置
  const azimuth = (config.angle.azimuth * Math.PI) / 180;
  const elevation = (config.angle.elevation * Math.PI) / 180;
  
  const position = {
    x: target.x + distance * Math.cos(elevation) * Math.sin(azimuth),
    y: target.y + distance * Math.sin(elevation),
    z: target.z + distance * Math.cos(elevation) * Math.cos(azimuth)
  };
  
  return {
    position: new THREE.Vector3(position.x, position.y, position.z),
    target: new THREE.Vector3(target.x, target.y, target.z)
  };
}

/**
 * 缓动函数集合
 */
export const EASING_FUNCTIONS = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};

/**
 * 应用缓动函数
 * @param {number} t - 时间进度 (0-1)
 * @param {string} easingType - 缓动类型
 * @returns {number} 缓动后的值
 */
export function applyEasing(t, easingType = 'easeInOutCubic') {
  const easingFunction = EASING_FUNCTIONS[easingType] || EASING_FUNCTIONS.easeInOutCubic;
  return easingFunction(t);
}
