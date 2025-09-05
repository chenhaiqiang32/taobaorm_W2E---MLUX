/**
 * 环境强度和曝光值配置示例
 * 展示不同强度和曝光值组合的视觉效果
 */

/**
 * 环境强度和曝光值配置示例
 */
export const environmentIntensityExamples = {
  // 无效果配置
  disabled: {
    type: "room",
    enabled: true,
    intensity: 0,        // 无环境效果
    exposure: 0,         // 很暗
    description: "完全禁用环境效果，场景会很暗"
  },

  // 低强度配置
  subtle: {
    type: "room",
    enabled: true,
    intensity: 0.3,      // 轻微环境效果
    exposure: 0.5,       // 较暗
    description: "轻微环境效果，适合暗调场景"
  },

  // 正常强度配置
  normal: {
    type: "room",
    enabled: true,
    intensity: 1.0,      // 标准环境效果
    exposure: 1.0,       // 正常亮度
    description: "标准环境效果，适合大多数场景"
  },

  // 高强度配置
  enhanced: {
    type: "room",
    enabled: true,
    intensity: 1.5,      // 增强环境效果
    exposure: 1.0,       // 正常亮度
    description: "增强环境效果，反射更明显"
  },

  // 超高强度配置
  dramatic: {
    type: "room",
    enabled: true,
    intensity: 2.0,      // 强烈环境效果
    exposure: 1.5,       // 较亮
    description: "强烈环境效果，适合戏剧性场景"
  },

  // 过曝配置（不推荐）
  overexposed: {
    type: "room",
    enabled: true,
    intensity: 3.0,      // 过度环境效果
    exposure: 2.0,       // 很亮
    description: "过度曝光，可能过亮（不推荐）"
  }
};

/**
 * HDR 环境强度和曝光值配置示例
 */
export const hdrIntensityExamples = {
  // HDR 低强度
  hdrSubtle: {
    type: "hdr",
    enabled: true,
    hdrPath: "./hdr/bg.hdr",
    intensity: 0.5,      // 轻微 HDR 效果
    exposure: 0.8,       // 较暗
    description: "轻微 HDR 效果，保持细节"
  },

  // HDR 正常强度
  hdrNormal: {
    type: "hdr",
    enabled: true,
    hdrPath: "./hdr/bg.hdr",
    intensity: 1.0,      // 标准 HDR 效果
    exposure: 1.0,       // 正常亮度
    description: "标准 HDR 效果，平衡细节和亮度"
  },

  // HDR 高强度
  hdrEnhanced: {
    type: "hdr",
    enabled: true,
    hdrPath: "./hdr/bg.hdr",
    intensity: 1.5,      // 增强 HDR 效果
    exposure: 1.2,       // 稍亮
    description: "增强 HDR 效果，反射更丰富"
  },

  // HDR 超高强度
  hdrDramatic: {
    type: "hdr",
    enabled: true,
    hdrPath: "./hdr/bg.hdr",
    intensity: 2.0,      // 强烈 HDR 效果
    exposure: 1.5,       // 较亮
    description: "强烈 HDR 效果，适合展示场景"
  }
};

/**
 * 获取环境强度配置示例
 * @param {string} exampleName - 示例名称
 * @returns {Object} 环境配置对象
 */
export function getEnvironmentIntensityExample(exampleName) {
  return environmentIntensityExamples[exampleName] || environmentIntensityExamples.normal;
}

/**
 * 获取 HDR 强度配置示例
 * @param {string} exampleName - 示例名称
 * @returns {Object} HDR 环境配置对象
 */
export function getHDRIntensityExample(exampleName) {
  return hdrIntensityExamples[exampleName] || hdrIntensityExamples.hdrNormal;
}

/**
 * 获取所有环境强度示例
 * @returns {Array} 所有示例配置
 */
export function getAllEnvironmentIntensityExamples() {
  return Object.keys(environmentIntensityExamples).map(key => ({
    key,
    ...environmentIntensityExamples[key]
  }));
}

/**
 * 获取所有 HDR 强度示例
 * @returns {Array} 所有 HDR 示例配置
 */
export function getAllHDRIntensityExamples() {
  return Object.keys(hdrIntensityExamples).map(key => ({
    key,
    ...hdrIntensityExamples[key]
  }));
}

/**
 * 根据场景类型推荐配置
 * @param {string} sceneType - 场景类型
 * @returns {Object} 推荐的环境配置
 */
export function getRecommendedConfig(sceneType) {
  const recommendations = {
    // 室内场景
    indoor: {
      type: "room",
      enabled: true,
      intensity: 0.8,
      exposure: 0.9,
      description: "室内场景推荐配置，温和的环境光照"
    },

    // 室外场景
    outdoor: {
      type: "hdr",
      enabled: true,
      hdrPath: "./hdr/bg.hdr",
      intensity: 1.2,
      exposure: 1.1,
      description: "室外场景推荐配置，自然的环境光照"
    },

    // 夜景场景
    night: {
      type: "room",
      enabled: true,
      intensity: 0.3,
      exposure: 0.4,
      description: "夜景场景推荐配置，低环境光照"
    },

    // 展示场景
    showcase: {
      type: "hdr",
      enabled: true,
      hdrPath: "./hdr/bg.hdr",
      intensity: 1.8,
      exposure: 1.3,
      description: "展示场景推荐配置，突出模型细节"
    },

    // 产品展示
    product: {
      type: "room",
      enabled: true,
      intensity: 1.5,
      exposure: 1.0,
      description: "产品展示推荐配置，清晰的反射效果"
    }
  };

  return recommendations[sceneType] || recommendations.indoor;
}

/**
 * 使用说明
 */
export function showUsageInstructions() {
  console.log('🔧 环境强度和曝光值配置使用说明:');
  console.log('');
  console.log('1. 修改项目配置:');
  console.log('   编辑 src/assets/enviromentConfig.js 中的 projectEnvironmentConfig');
  console.log('');
  console.log('2. 强度和曝光值说明:');
  console.log('   - intensity: 环境强度，影响反射和环境光照');
  console.log('   - exposure: 曝光值，影响整体亮度');
  console.log('');
  console.log('3. 推荐配置:');
  console.log('   - 室内场景: intensity: 0.8, exposure: 0.9');
  console.log('   - 室外场景: intensity: 1.2, exposure: 1.1');
  console.log('   - 夜景场景: intensity: 0.3, exposure: 0.4');
  console.log('   - 展示场景: intensity: 1.8, exposure: 1.3');
  console.log('');
  console.log('4. 注意事项:');
  console.log('   - 强度过高可能导致过曝');
  console.log('   - 曝光过低可能导致场景过暗');
  console.log('   - 建议在 0.3-2.0 范围内调整');
  console.log('');
  console.log('5. 实时调整:');
  console.log('   修改配置后刷新页面即可看到效果');
}

// 如果直接运行此文件，显示使用说明
if (typeof window === 'undefined') {
  // Node.js 环境
  showUsageInstructions();
} else {
  // 浏览器环境
  window.showUsageInstructions = showUsageInstructions;
  window.getEnvironmentIntensityExample = getEnvironmentIntensityExample;
  window.getHDRIntensityExample = getHDRIntensityExample;
  window.getRecommendedConfig = getRecommendedConfig;
  console.log('🔧 环境强度配置示例已加载，运行以下函数查看说明:');
  console.log('- window.showUsageInstructions() - 查看使用说明');
  console.log('- window.getEnvironmentIntensityExample("enhanced") - 获取增强配置');
  console.log('- window.getRecommendedConfig("indoor") - 获取推荐配置');
}
