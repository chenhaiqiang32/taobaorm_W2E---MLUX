/**
 * 环境配置使用示例
 * 展示如何使用环境配置系统
 */

import { 
  environmentPresets, 
  getEnvironmentPreset, 
  validateEnvironmentConfig,
  getAvailableEnvironmentPresets 
} from './enviromentConfig.js';

/**
 * 使用示例：在场景中设置环境
 */
export function setupSceneEnvironment(sceneManager) {
  // 方法1：使用预设配置
  const roomConfig = getEnvironmentPreset('room');
  sceneManager.updateEnvironmentConfig(roomConfig);
  
  // 方法2：使用自定义配置
  const customConfig = {
    type: 'hdr',
    enabled: true,
    hdrPath: './custom.hdr',
    intensity: 1.5,
    exposure: 1.8
  };
  
  // 验证配置
  const validation = validateEnvironmentConfig(customConfig);
  if (validation.valid) {
    sceneManager.updateEnvironmentConfig(customConfig);
  } else {
    console.warn('配置验证失败:', validation.errors);
  }
}

/**
 * 动态切换环境示例
 */
export function switchEnvironment(sceneManager, environmentType) {
  const config = getEnvironmentPreset(environmentType);
  sceneManager.updateEnvironmentConfig(config);
  console.log(`已切换到 ${environmentType} 环境`);
}

/**
 * 创建特定场景的环境配置
 */
export function createIndoorEnvironmentConfig() {
  return {
    type: 'room',
    enabled: true,
    intensity: 0.6,
    background: {
      type: 'color',
      color: 0x404040
    }
  };
}

/**
 * 创建户外场景的环境配置
 */
export function createOutdoorEnvironmentConfig() {
  return {
    type: 'hdr',
    enabled: true,
    hdrPath: './sunny2.hdr',
    fallbackPath: './sunny2.jpg',
    intensity: 1.2,
    exposure: 1.5,
    background: {
      type: 'hdr',
      path: './sunny2.hdr'
    }
  };
}

/**
 * 创建夜景场景的环境配置
 */
export function createNightEnvironmentConfig() {
  return {
    type: 'default',
    enabled: true,
    backgroundColor: 0x001122,
    background: {
      type: 'color',
      color: 0x001122
    }
  };
}

/**
 * 获取所有可用的环境预设
 */
export function showAvailableEnvironments() {
  const presets = getAvailableEnvironmentPresets();
  console.log('可用的环境预设:');
  presets.forEach(preset => {
    console.log(`- ${preset.key}: ${preset.description}`);
  });
  return presets;
}

/**
 * 环境配置测试函数
 */
export function testEnvironmentConfig() {
  console.log('🧪 测试环境配置系统...\n');

  // 测试1: 检查预设配置
  console.log('📋 测试1: 检查预设配置');
  const presets = getAvailableEnvironmentPresets();
  console.log('可用预设数量:', presets.length);
  
  presets.forEach(preset => {
    console.log(`- ${preset.name}: ${preset.type} (${preset.enabled ? '启用' : '禁用'})`);
  });
  console.log('');

  // 测试2: 测试配置验证
  console.log('🔍 测试2: 测试配置验证');
  const validConfig = {
    type: 'room',
    enabled: true,
    intensity: 0.8
  };
  
  const invalidConfig = {
    type: 'invalid',
    enabled: true
  };
  
  const validResult = validateEnvironmentConfig(validConfig);
  const invalidResult = validateEnvironmentConfig(invalidConfig);
  
  console.log('有效配置验证:', validResult.valid ? '✅ 通过' : '❌ 失败');
  console.log('无效配置验证:', invalidResult.valid ? '❌ 应该失败' : '✅ 正确失败');
  if (!invalidResult.valid) {
    console.log('验证错误:', invalidResult.errors);
  }
  console.log('');

  // 测试3: 测试预设获取
  console.log('🎯 测试3: 测试预设获取');
  const roomPreset = getEnvironmentPreset('room');
  const disabledPreset = getEnvironmentPreset('disabled');
  const unknownPreset = getEnvironmentPreset('unknown');
  
  console.log('Room 预设:', roomPreset.type, roomPreset.enabled ? '启用' : '禁用');
  console.log('Disabled 预设:', disabledPreset.type, disabledPreset.enabled ? '启用' : '禁用');
  console.log('未知预设 (应返回默认):', unknownPreset.type, unknownPreset.enabled ? '启用' : '禁用');
  console.log('');

  console.log('🎉 环境配置系统测试完成！');
}

// 如果直接运行此文件，执行测试
if (typeof window === 'undefined') {
  // Node.js 环境
  testEnvironmentConfig();
} else {
  // 浏览器环境
  window.testEnvironmentConfig = testEnvironmentConfig;
  window.showAvailableEnvironments = showAvailableEnvironments;
  console.log('🧪 环境配置系统测试已加载，运行 window.testEnvironmentConfig() 开始测试');
}
