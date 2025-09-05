/**
 * 环境配置文件
 * 定义场景中环境贴图和背景的配置参数
 */

/**
 * 环境配置预设
 */
export const environmentPresets = {
  // 禁用环境
  disabled: {
    type: 'none',
    enabled: false,
    name: 'disabled',
    description: '禁用所有环境效果'
  },
  
  // RoomEnvironment 环境
  room: {
    type: 'room',
    enabled: true,
    name: 'room',
    description: '使用 Three.js RoomEnvironment',
    intensity: 0.8,
    background: {
      type: 'texture',
      path: './sunny2.jpg'
    }
  },
  
  // HDR 环境
  hdr: {
    type: 'hdr',
    enabled: true,
    name: 'hdr',
    description: '使用 HDR 环境贴图',
    hdrPath: './bg.hdr',
    fallbackPath: './sunny2.hdr',
    intensity: 2.0,
    exposure: 2.0,
    background: {
      type: 'hdr',
      path: './bg.hdr'
    }
  },
  
  // 默认环境
  default: {
    type: 'default',
    enabled: true,
    name: 'default',
    description: '使用默认天空颜色',
    backgroundColor: 0x87ceeb,
    background: {
      type: 'color',
      color: 0x87ceeb
    }
  }
};

/**
 * 默认环境配置
 */
export const defaultEnvironmentConfig = {
  type: 'room',
  enabled: true,
  intensity: 0.8,
  exposure: 1.0,
  background: {
    type: 'texture',
    path: './sunny2.jpg'
  }
};

/**
 * 项目默认环境配置
 * 当前项目启用的环境配置
 * 
 * 修改此配置来改变项目的默认环境设置：
 * - type: 'disabled' | 'room' | 'hdr' | 'default'
 * - enabled: true | false
 * - intensity: 环境强度 (0-10)
 * - exposure: 曝光值 (0-10)
 * - background: 背景配置
 */
export const projectEnvironmentConfig = {
  type: "hdr", // 环境类型：disabled=禁用, room=RoomEnvironment, hdr=HDR, default=默认
  enabled: true, // 是否启用环境
  name: "project_default",
  description: "项目默认配置 - HDR 环境贴图",
  hdrPath: "./hdr/bg.hdr", // HDR 文件路径（验证必需）
  fallbackPath: "./bg.jpg", // 备用文件路径
  intensity: 1, // 环境强度
  exposure: 1.0, // 曝光值
  background: {
    type: "hdr", // 背景类型：none=无, texture=纹理, hdr=HDR, color=纯色
    path: "./hdr/bg.hdr", // 背景文件路径
  },
};

/**
 * 获取环境配置预设
 * @param {string} presetName - 预设名称
 * @returns {Object} 环境配置对象
 */
export function getEnvironmentPreset(presetName) {
  return environmentPresets[presetName] || environmentPresets.room;
}

/**
 * 获取项目默认环境配置
 * @returns {Object} 项目默认环境配置对象
 */
export function getProjectEnvironmentConfig() {
  return { ...projectEnvironmentConfig };
}

/**
 * 验证环境配置
 * @param {Object} config - 环境配置
 * @returns {Object} 验证结果
 */
export function validateEnvironmentConfig(config) {
  const errors = [];
  
  if (!config) {
    errors.push('配置对象不能为空');
    return { valid: false, errors };
  }
  
  if (!config.type) {
    errors.push('环境类型不能为空');
  }
  
  const validTypes = ['room', 'hdr', 'default', 'none'];
  if (config.type && !validTypes.includes(config.type)) {
    errors.push(`无效的环境类型: ${config.type}，支持的类型: ${validTypes.join(', ')}`);
  }
  
  if (config.type === 'hdr' && !config.hdrPath) {
    errors.push('HDR 环境需要指定 hdrPath');
  }
  
  if (config.intensity !== undefined && (config.intensity < 0 || config.intensity > 10)) {
    errors.push('环境强度应在 0-10 之间');
  }
  
  if (config.exposure !== undefined && (config.exposure < 0 || config.exposure > 10)) {
    errors.push('曝光值应在 0-10 之间');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 合并环境配置
 * @param {Object} baseConfig - 基础配置
 * @param {Object} overrideConfig - 覆盖配置
 * @returns {Object} 合并后的配置
 */
export function mergeEnvironmentConfig(baseConfig, overrideConfig) {
  return {
    ...baseConfig,
    ...overrideConfig,
    background: {
      ...baseConfig.background,
      ...overrideConfig.background
    }
  };
}

/**
 * 获取所有可用的环境预设
 * @returns {Array} 环境预设列表
 */
export function getAvailableEnvironmentPresets() {
  return Object.keys(environmentPresets).map(key => ({
    key,
    ...environmentPresets[key]
  }));
}
