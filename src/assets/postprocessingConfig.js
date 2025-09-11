/**
 * 后处理效果配置文件
 * 定义各种后处理效果的参数和配置
 */

/**
 * 后处理效果配置
 */
export const POSTPROCESSING_CONFIG = {
  // 抗锯齿配置
  antialias: {
    enabled: true,
    type: 'SMAA', // 'SMAA', 'SSAA', 'none'
    quality: 'high' // 'low', 'medium', 'high'
  },

  // 轮廓效果配置
  outline: {
    // 基础配置
    visibleEdgeColor: 0xff0000,        // 可见边缘颜色 (红色 - 更明显)
    hiddenEdgeColor: 0x000000,         // 隐藏边缘颜色 (黑色 - 对比更强)
    edgeGlow: 0.4,                     // 边缘发光强度 (最大发光)
    usePatternTexture: false,          // 是否使用图案纹理
    
    // 边缘样式
    edgeThickness: 1.0,                // 边缘厚度 (最粗)
    edgeStrength: 1.0,                // 边缘强度 (超强)
    
    // 性能配置
    downSampleRatio: 0.4,                // 下采样比例 (不降采样，保持最高质量)
    pulsePeriod: 1,                    // 脉冲周期 (快速脉冲)
    
    // 分辨率配置
    resolution: { 
      x: 0,                            // 0表示使用屏幕分辨率
      y: 0 
    }
  },

  // 预设配置
  presets: {
    // 默认绿色轮廓
    default: {
      visibleEdgeColor: 0x00ff00,
      hiddenEdgeColor: 0x22090a,
      edgeThickness: 1.0,
      edgeStrength: 3.0
    },
    
    // 蓝色轮廓
    blue: {
      visibleEdgeColor: 0x0088ff,
      hiddenEdgeColor: 0x001122,
      edgeThickness: 1.2,
      edgeStrength: 2.5
    },
    
    // 红色轮廓
    red: {
      visibleEdgeColor: 0xff0000,
      hiddenEdgeColor: 0x220000,
      edgeThickness: 1.5,
      edgeStrength: 4.0
    },
    
    // 黄色轮廓
    yellow: {
      visibleEdgeColor: 0xffff00,
      hiddenEdgeColor: 0x222200,
      edgeThickness: 1.0,
      edgeStrength: 3.5
    },
    
    // 紫色轮廓
    purple: {
      visibleEdgeColor: 0xff00ff,
      hiddenEdgeColor: 0x220022,
      edgeThickness: 1.3,
      edgeStrength: 3.2
    },
    
    // 发光效果
    glow: {
      visibleEdgeColor: 0x00ff88,
      hiddenEdgeColor: 0x002211,
      edgeGlow: 0.5,
      edgeThickness: 2.0,
      edgeStrength: 5.0
    },
    
    // 细线效果
    thin: {
      visibleEdgeColor: 0xffffff,
      hiddenEdgeColor: 0x111111,
      edgeThickness: 0.5,
      edgeStrength: 2.0
    },
    
    // 粗线效果
    thick: {
      visibleEdgeColor: 0x00ff00,
      hiddenEdgeColor: 0x22090a,
      edgeThickness: 3.0,
      edgeStrength: 6.0
    },
    
    // 超明显效果（用于测试）
    superVisible: {
      visibleEdgeColor: 0xff0000,      // 红色
      hiddenEdgeColor: 0x000000,       // 黑色
      edgeGlow: 1.0,                   // 最大发光
      edgeThickness: 8.0,              // 超粗的线
      edgeStrength: 20.0,              // 超强的效果
      downSampleRatio: 1,              // 不降采样
      pulsePeriod: 1                   // 快速脉冲
    },
    
    // 超强发光效果
    ultraGlow: {
      visibleEdgeColor: 0x00ffff,      // 青色
      hiddenEdgeColor: 0x000000,       // 黑色
      edgeGlow: 1.0,                   // 最大发光
      edgeThickness: 6.0,              // 很粗的线
      edgeStrength: 18.0,              // 超强效果
      downSampleRatio: 1,              // 不降采样
      pulsePeriod: 1.5                 // 快速脉冲
    },
    
    // 霓虹灯效果
    neon: {
      visibleEdgeColor: 0xff00ff,      // 洋红色
      hiddenEdgeColor: 0x000000,       // 黑色
      edgeGlow: 1.0,                   // 最大发光
      edgeThickness: 4.0,              // 中等粗细
      edgeStrength: 12.0,              // 强效果
      downSampleRatio: 1,              // 不降采样
      pulsePeriod: 0.8                 // 超快脉冲
    }
  },

  // 设备类型对应的轮廓配置
  deviceTypes: {
    equipment: {
      preset: 'ultraGlow',
      custom: {
        visibleEdgeColor: 0x00ffff,      // 青色
        edgeThickness: 6.0,              // 很粗
        edgeStrength: 18.0,              // 超强
        edgeGlow: 1.0,                   // 最大发光
        downSampleRatio: 1,              // 不降采样
        pulsePeriod: 1.5                 // 快速脉冲
      }
    },
    
    structure: {
      preset: 'superVisible',
      custom: {
        visibleEdgeColor: 0xff0000,      // 红色
        edgeThickness: 8.0,              // 超粗
        edgeStrength: 20.0,              // 超强
        edgeGlow: 1.0,                   // 最大发光
        downSampleRatio: 1,              // 不降采样
        pulsePeriod: 1                   // 快速脉冲
      }
    },
    
    line: {
      preset: 'neon',
      custom: {
        visibleEdgeColor: 0xff00ff,      // 洋红色
        edgeThickness: 4.0,              // 中等粗细
        edgeStrength: 12.0,              // 强效果
        edgeGlow: 1.0,                   // 最大发光
        downSampleRatio: 1,              // 不降采样
        pulsePeriod: 0.8                 // 超快脉冲
      }
    },
    
    default: {
      preset: 'superVisible'
    }
  }
};

/**
 * 获取设备类型的轮廓配置
 * @param {string} deviceType - 设备类型
 * @returns {Object} 轮廓配置
 */
export function getDeviceOutlineConfig(deviceType) {
  const typeConfig = POSTPROCESSING_CONFIG.deviceTypes[deviceType] || POSTPROCESSING_CONFIG.deviceTypes.default;
  
  if (typeConfig.preset) {
    const presetConfig = POSTPROCESSING_CONFIG.presets[typeConfig.preset];
    return { ...presetConfig, ...typeConfig.custom };
  }
  
  return typeConfig.custom || POSTPROCESSING_CONFIG.outline;
}

/**
 * 获取预设配置
 * @param {string} presetName - 预设名称
 * @returns {Object} 预设配置
 */
export function getPresetConfig(presetName) {
  return POSTPROCESSING_CONFIG.presets[presetName] || POSTPROCESSING_CONFIG.presets.default;
}

/**
 * 应用预设配置到轮廓通道
 * @param {OutlinePass} outlinePass - 轮廓通道
 * @param {string} presetName - 预设名称
 */
export function applyPresetToOutlinePass(outlinePass, presetName) {
  const config = getPresetConfig(presetName);
  
  if (outlinePass) {
    outlinePass.visibleEdgeColor.setHex(config.visibleEdgeColor);
    outlinePass.hiddenEdgeColor.setHex(config.hiddenEdgeColor);
    outlinePass.edgeGlow = config.edgeGlow || 0;
    outlinePass.edgeThickness = config.edgeThickness;
    outlinePass.edgeStrength = config.edgeStrength;
  }
}

/**
 * 应用设备类型配置到轮廓通道
 * @param {OutlinePass} outlinePass - 轮廓通道
 * @param {string} deviceType - 设备类型
 */
export function applyDeviceTypeToOutlinePass(outlinePass, deviceType) {
  const config = getDeviceOutlineConfig(deviceType);
  
  if (outlinePass) {
    outlinePass.visibleEdgeColor.setHex(config.visibleEdgeColor);
    outlinePass.hiddenEdgeColor.setHex(config.hiddenEdgeColor);
    outlinePass.edgeGlow = config.edgeGlow || 0;
    outlinePass.edgeThickness = config.edgeThickness;
    outlinePass.edgeStrength = config.edgeStrength;
  }
}

/**
 * 创建自定义轮廓配置
 * @param {Object} options - 配置选项
 * @returns {Object} 轮廓配置
 */
export function createCustomOutlineConfig(options = {}) {
  return {
    ...POSTPROCESSING_CONFIG.outline,
    ...options
  };
}

/**
 * 验证轮廓配置
 * @param {Object} config - 要验证的配置
 * @returns {Object} 验证结果
 */
export function validateOutlineConfig(config) {
  const errors = [];
  const warnings = [];
  
  // 检查必需字段
  if (typeof config.visibleEdgeColor !== 'number') {
    errors.push('visibleEdgeColor 必须是数字');
  }
  
  if (typeof config.hiddenEdgeColor !== 'number') {
    errors.push('hiddenEdgeColor 必须是数字');
  }
  
  if (typeof config.edgeThickness !== 'number' || config.edgeThickness < 0) {
    errors.push('edgeThickness 必须是非负数');
  }
  
  if (typeof config.edgeStrength !== 'number' || config.edgeStrength < 0) {
    errors.push('edgeStrength 必须是非负数');
  }
  
  // 检查性能相关配置
  if (config.edgeThickness > 5) {
    warnings.push('edgeThickness 过大可能影响性能');
  }
  
  if (config.edgeStrength > 10) {
    warnings.push('edgeStrength 过大可能影响性能');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 获取所有可用的预设名称
 * @returns {Array} 预设名称数组
 */
export function getAvailablePresets() {
  return Object.keys(POSTPROCESSING_CONFIG.presets);
}

/**
 * 获取所有可用的设备类型
 * @returns {Array} 设备类型数组
 */
export function getAvailableDeviceTypes() {
  return Object.keys(POSTPROCESSING_CONFIG.deviceTypes);
}

/**
 * 获取抗锯齿配置
 * @returns {Object} 抗锯齿配置
 */
export function getAntialiasConfig() {
  return { ...POSTPROCESSING_CONFIG.antialias };
}

/**
 * 获取可用的抗锯齿类型
 * @returns {Array} 抗锯齿类型数组
 */
export function getAvailableAntialiasTypes() {
  return ['SMAA', 'SSAA', 'none'];
}

/**
 * 验证抗锯齿配置
 * @param {Object} config - 要验证的配置
 * @returns {Object} 验证结果
 */
export function validateAntialiasConfig(config) {
  const errors = [];
  const warnings = [];
  
  // 检查类型
  const validTypes = getAvailableAntialiasTypes();
  if (!validTypes.includes(config.type)) {
    errors.push(`type 必须是以下之一: ${validTypes.join(', ')}`);
  }
  
  // 检查enabled
  if (typeof config.enabled !== 'boolean') {
    errors.push('enabled 必须是布尔值');
  }
  
  // 检查quality
  const validQualities = ['low', 'medium', 'high'];
  if (config.quality && !validQualities.includes(config.quality)) {
    errors.push(`quality 必须是以下之一: ${validQualities.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}
