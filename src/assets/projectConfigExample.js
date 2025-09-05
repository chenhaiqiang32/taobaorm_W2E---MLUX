/**
 * 项目配置示例
 * 展示如何修改项目的默认环境配置
 */

import { projectEnvironmentConfig } from './enviromentConfig.js';

/**
 * 项目配置示例
 * 复制这些配置到 enviromentConfig.js 中的 projectEnvironmentConfig 来修改项目默认设置
 */

// 示例1: 启用 RoomEnvironment
export const roomEnvironmentExample = {
  type: 'room',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 使用 RoomEnvironment',
  intensity: 0.8,
  exposure: 1.0,
  background: {
    type: 'texture',
    path: './sunny2.jpg'
  }
};

// 示例2: 启用 HDR 环境
export const hdrEnvironmentExample = {
  type: 'hdr',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 使用 HDR 环境',
  hdrPath: './bg.hdr',
  fallbackPath: './sunny2.hdr',
  intensity: 1.2,
  exposure: 1.5,
  background: {
    type: 'hdr',
    path: './bg.hdr'
  }
};

// 示例3: 使用默认天空颜色
export const defaultEnvironmentExample = {
  type: 'default',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 使用默认天空颜色',
  intensity: 1.0,
  exposure: 1.0,
  backgroundColor: 0x87ceeb,
  background: {
    type: 'color',
    color: 0x87ceeb
  }
};

// 示例4: 完全禁用环境（当前配置）
export const disabledEnvironmentExample = {
  type: 'disabled',
  enabled: false,
  name: 'project_default',
  description: '项目默认配置 - 禁用环境贴图',
  intensity: 0,
  exposure: 1.0,
  background: {
    type: 'none',
    path: null
  }
};

/**
 * 如何修改项目配置
 */
export function howToModifyProjectConfig() {
  console.log('🔧 如何修改项目默认环境配置:');
  console.log('');
  console.log('1. 打开 src/assets/enviromentConfig.js 文件');
  console.log('2. 找到 projectEnvironmentConfig 对象');
  console.log('3. 修改配置参数:');
  console.log('   - type: 环境类型 (disabled/room/hdr/default)');
  console.log('   - enabled: 是否启用 (true/false)');
  console.log('   - intensity: 环境强度 (0-10)');
  console.log('   - exposure: 曝光值 (0-10)');
  console.log('   - background: 背景配置');
  console.log('4. 保存文件并刷新页面');
  console.log('');
  console.log('📋 当前项目配置:');
  console.log(projectEnvironmentConfig);
  console.log('');
  console.log('💡 配置示例:');
  console.log('- 启用 RoomEnvironment:', roomEnvironmentExample);
  console.log('- 启用 HDR 环境:', hdrEnvironmentExample);
  console.log('- 使用默认天空:', defaultEnvironmentExample);
  console.log('- 禁用环境:', disabledEnvironmentExample);
}

/**
 * 快速切换项目环境配置
 * 注意：这只是示例，实际修改需要在 enviromentConfig.js 中进行
 */
export function quickSwitchExamples() {
  console.log('⚡ 快速切换示例 (需要在 enviromentConfig.js 中修改):');
  console.log('');
  
  console.log('🌞 切换到白天 HDR 环境:');
  console.log(`
export const projectEnvironmentConfig = {
  type: 'hdr',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 白天 HDR 环境',
  hdrPath: './sunny2.hdr',
  intensity: 1.2,
  exposure: 1.5,
  background: {
    type: 'hdr',
    path: './sunny2.hdr'
  }
};
  `);
  
  console.log('🌙 切换到夜景环境:');
  console.log(`
export const projectEnvironmentConfig = {
  type: 'default',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 夜景环境',
  intensity: 0.3,
  exposure: 0.5,
  backgroundColor: 0x001122,
  background: {
    type: 'color',
    color: 0x001122
  }
};
  `);
  
  console.log('🏠 切换到室内环境:');
  console.log(`
export const projectEnvironmentConfig = {
  type: 'room',
  enabled: true,
  name: 'project_default',
  description: '项目默认配置 - 室内环境',
  intensity: 0.6,
  exposure: 1.0,
  background: {
    type: 'texture',
    path: './indoor.jpg'
  }
};
  `);
}

// 如果直接运行此文件，显示使用说明
if (typeof window === 'undefined') {
  // Node.js 环境
  howToModifyProjectConfig();
  quickSwitchExamples();
} else {
  // 浏览器环境
  window.howToModifyProjectConfig = howToModifyProjectConfig;
  window.quickSwitchExamples = quickSwitchExamples;
  console.log('🔧 项目配置示例已加载，运行以下函数查看说明:');
  console.log('- window.howToModifyProjectConfig() - 查看如何修改配置');
  console.log('- window.quickSwitchExamples() - 查看快速切换示例');
}
