# 环境配置系统使用说明

## 概述

这是一个完整的 Three.js 环境配置系统，允许你通过配置文件来管理场景中的环境贴图、背景和光照效果，支持多种环境类型和预设配置。

## 文件结构

- `src/assets/enviromentConfig.js` - 主配置文件，包含所有环境配置参数
- `src/components/sceneManager.js` - 场景管理器，负责创建和管理环境
- `src/assets/environmentExample.js` - 使用示例和预设配置

## 支持的环境类型

### 1. RoomEnvironment (room)
```javascript
{
  type: 'room',
  enabled: true,
  name: 'room',
  description: '使用 Three.js RoomEnvironment',
  intensity: 0.8,
  background: {
    type: 'texture',
    path: './sunny2.jpg'
  }
}
```

### 2. HDR 环境 (hdr)
```javascript
{
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
}
```

### 3. 默认环境 (default)
```javascript
{
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
```

### 4. 禁用环境 (none)
```javascript
{
  type: 'none',
  enabled: false,
  name: 'disabled',
  description: '禁用所有环境效果'
}
```

## 使用方法

### 项目默认配置

项目使用统一的默认环境配置，在 `enviromentConfig.js` 中的 `projectEnvironmentConfig` 对象中定义：

```javascript
// 在 main.js 中自动使用项目默认配置
import { getProjectEnvironmentConfig } from './src/assets/enviromentConfig.js';

const { scene, renderer } = sceneManager.init({
  width: window.innerWidth,
  height: window.innerHeight,
  enableShadows: true,
  enableAntialias: true,
  environment: getProjectEnvironmentConfig() // 使用项目默认环境配置
});
```

### 修改项目默认配置

要修改项目的默认环境设置，编辑 `src/assets/enviromentConfig.js` 文件中的 `projectEnvironmentConfig` 对象：

```javascript
export const projectEnvironmentConfig = {
  type: 'room',        // 环境类型：disabled/room/hdr/default
  enabled: true,       // 是否启用环境
  intensity: 0.8,      // 环境强度 (0-10)
  exposure: 1.0,       // 曝光值 (0-10)
  background: {
    type: 'texture',   // 背景类型：none/texture/hdr/color
    path: './sunny2.jpg' // 背景文件路径
  }
};
```

### 基本使用

```javascript
import { SceneManager } from './src/components/sceneManager.js';
import { getEnvironmentPreset } from './src/assets/enviromentConfig.js';

// 创建场景管理器
const sceneManager = new SceneManager();

// 初始化场景
const { scene, renderer } = sceneManager.init({
  width: window.innerWidth,
  height: window.innerHeight,
  enableShadows: true,
  enableAntialias: true,
  environment: getEnvironmentPreset('room') // 使用预设配置
});
```

### 自定义配置

```javascript
const customConfig = {
  type: 'hdr',
  enabled: true,
  hdrPath: './custom.hdr',
  intensity: 1.5,
  exposure: 1.8,
  background: {
    type: 'hdr',
    path: './custom.hdr'
  }
};

sceneManager.updateEnvironmentConfig(customConfig);
```

### 动态切换环境

```javascript
// 切换到 HDR 环境
sceneManager.updateEnvironmentConfig(getEnvironmentPreset('hdr'));

// 切换到默认环境
sceneManager.updateEnvironmentConfig(getEnvironmentPreset('default'));

// 禁用环境
sceneManager.updateEnvironmentConfig(getEnvironmentPreset('disabled'));
```

## 预设配置

系统提供了几种预设的环境配置：

### 室内场景
```javascript
import { createIndoorEnvironmentConfig } from './src/assets/environmentExample.js';

const indoorConfig = createIndoorEnvironmentConfig();
sceneManager.updateEnvironmentConfig(indoorConfig);
```

### 户外场景
```javascript
import { createOutdoorEnvironmentConfig } from './src/assets/environmentExample.js';

const outdoorConfig = createOutdoorEnvironmentConfig();
sceneManager.updateEnvironmentConfig(outdoorConfig);
```

### 夜景场景
```javascript
import { createNightEnvironmentConfig } from './src/assets/environmentExample.js';

const nightConfig = createNightEnvironmentConfig();
sceneManager.updateEnvironmentConfig(nightConfig);
```

## 配置工具函数

```javascript
import { 
  getEnvironmentPreset, 
  validateEnvironmentConfig,
  getAvailableEnvironmentPresets 
} from './src/assets/enviromentConfig.js';

// 获取指定预设的环境配置
const roomConfig = getEnvironmentPreset('room');

// 验证环境配置
const validation = validateEnvironmentConfig(config);
if (validation.valid) {
  console.log('配置有效');
} else {
  console.log('配置错误:', validation.errors);
}

// 获取所有可用的环境预设
const presets = getAvailableEnvironmentPresets();
```

## 配置参数说明

### 通用参数
- `type`: 环境类型 ('room', 'hdr', 'default', 'none')
- `enabled`: 是否启用环境
- `intensity`: 环境强度 (0-10)
- `exposure`: 曝光值 (0-10)

### HDR 环境参数
- `hdrPath`: HDR 文件路径
- `fallbackPath`: 备用文件路径
- `exposure`: HDR 曝光值

### 背景参数
- `background.type`: 背景类型 ('texture', 'hdr', 'color')
- `background.path`: 背景文件路径
- `background.color`: 背景颜色 (十六进制)

## 性能优化建议

1. **环境贴图分辨率**: 根据场景需求选择合适的 HDR 分辨率
2. **环境强度**: 合理设置 `intensity` 值，避免过亮或过暗
3. **材质更新**: 系统会自动更新所有材质的环境贴图
4. **资源清理**: 切换环境时会自动清理之前的资源

## 注意事项

1. 确保 HDR 文件路径正确且文件存在
2. 环境配置会在场景初始化时自动应用
3. 修改配置后需要重新调用 `updateEnvironmentConfig()`
4. 使用 `dispose()` 方法可以清理所有环境资源

## 扩展性

系统设计为可扩展的，你可以：

1. 添加新的环境类型
2. 自定义环境加载器
3. 添加后处理效果
4. 集成天气系统
5. 添加动态环境变化

通过修改 `enviromentConfig.js` 中的 `environmentPresets` 对象，可以轻松添加新的环境预设。

## 故障排除

### 常见问题

1. **HDR 加载失败**: 检查文件路径和格式
2. **环境不显示**: 确认 `enabled` 为 `true`
3. **材质不反射**: 检查材质是否支持环境贴图
4. **性能问题**: 降低环境贴图分辨率或强度

### 调试方法

```javascript
// 启用详细日志
console.log('当前环境配置:', sceneManager.environmentConfig);

// 检查场景环境
console.log('场景环境:', sceneManager.scene.environment);
console.log('场景背景:', sceneManager.scene.background);

// 验证配置
const validation = validateEnvironmentConfig(config);
console.log('配置验证:', validation);
```
