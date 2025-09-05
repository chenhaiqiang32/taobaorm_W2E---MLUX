# 灯光配置系统使用说明

## 概述

这是一个完整的 Three.js 灯光配置系统，允许你通过配置文件来管理场景中的所有灯光，包括灯光类型、位置、强度、朝向、阴影等参数。

## 文件结构

- `src/assets/lightConfig.js` - 主配置文件，包含所有灯光的配置参数
- `src/components/lightingManager.js` - 灯光管理器，负责创建和管理灯光
- `src/assets/lightConfigExample.js` - 使用示例和预设配置

## 支持的灯光类型

### 1. 环境光 (Ambient Light)
```javascript
{
  type: 'ambient',
  name: 'ambient',
  color: 0xffffff,
  intensity: 0.4,
  enabled: true
}
```

### 2. 平行光 (Directional Light)
```javascript
{
  type: 'directional',
  name: 'main',
  position: { x: 10, y: 15, z: 10 },
  target: { x: 0, y: 0, z: 0 },
  color: 0xffffff,
  intensity: 1.2,
  enabled: true,
  castShadow: true,
  shadow: {
    mapSize: 2048,
    near: 0.5,
    far: 50,
    left: -15,
    right: 15,
    top: 15,
    bottom: -15,
    bias: -0.001,
    normalBias: 0.02
  }
}
```

### 3. 点光源 (Point Light)
```javascript
{
  type: 'point',
  name: 'point1',
  position: { x: 5, y: 3, z: 5 },
  color: 0xffaa00,
  intensity: 0.8,
  distance: 20,
  decay: 2,
  enabled: true,
  castShadow: true,
  shadow: {
    mapSize: 1024,
    near: 0.1,
    far: 20,
    bias: -0.001,
    normalBias: 0.02
  }
}
```

### 4. 聚光灯 (Spot Light)
```javascript
{
  type: 'spot',
  name: 'spot1',
  position: { x: -5, y: 8, z: 0 },
  target: { x: 0, y: 0, z: 0 },
  color: 0xffffff,
  intensity: 0.6,
  distance: 25,
  angle: Math.PI / 6, // 30度
  penumbra: 0.2,
  decay: 1,
  enabled: true,
  castShadow: true,
  shadow: {
    mapSize: 1024,
    near: 0.1,
    far: 25,
    bias: -0.001,
    normalBias: 0.02
  }
}
```

### 5. 半球光 (Hemisphere Light)
```javascript
{
  type: 'hemisphere',
  name: 'hemisphere',
  position: { x: 0, y: 10, z: 0 },
  skyColor: 0x87ceeb,
  groundColor: 0x8b4513,
  intensity: 0.3,
  enabled: true
}
```

## 阴影配置参数

所有支持阴影的灯光类型都可以配置以下阴影参数：

- `mapSize`: 阴影贴图分辨率 (默认: 2048)
- `near`: 阴影相机近平面 (默认: 0.5)
- `far`: 阴影相机远平面 (默认: 50)
- `left`: 阴影相机左边界 (默认: -10)
- `right`: 阴影相机右边界 (默认: 10)
- `top`: 阴影相机上边界 (默认: 10)
- `bottom`: 阴影相机下边界 (默认: -10)
- `bias`: 阴影偏移 (默认: -0.001)
- `normalBias`: 法线偏移 (默认: 0.02)

## 使用方法

### 基本使用

```javascript
import { LightingManager } from './components/lightingManager.js';
import { lightConfig } from './assets/lightConfig.js';

// 创建灯光管理器
const lightingManager = new LightingManager();

// 初始化
lightingManager.init(scene);

// 从配置文件加载灯光
lightingManager.loadFromConfig();
```

### 自定义配置

```javascript
const customConfig = [
  {
    type: 'ambient',
    name: 'customAmbient',
    color: 0x404040,
    intensity: 0.6,
    enabled: true
  },
  {
    type: 'directional',
    name: 'customMain',
    position: { x: 15, y: 20, z: 15 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 1.5,
    enabled: true,
    castShadow: true,
    shadow: {
      mapSize: 4096,
      near: 0.1,
      far: 100,
      left: -20,
      right: 20,
      top: 20,
      bottom: -20,
      bias: -0.0005,
      normalBias: 0.01
    }
  }
];

lightingManager.loadFromConfig(customConfig);
```

### 动态调整灯光

```javascript
// 调整灯光强度
lightingManager.setLightIntensity('main', 1.5);

// 调整灯光颜色
lightingManager.setLightColor('ambient', 0x404040);

// 启用/禁用阴影
lightingManager.setShadowEnabled('main', true);

// 启用/禁用灯光
lightingManager.setLightEnabled('fill', false);

// 批量更新配置
lightingManager.updateLightConfig('main', {
  intensity: 2.0,
  color: 0xffeedd
});
```

## 预设配置

系统提供了几种预设的灯光配置：

### 室内场景
```javascript
import { createIndoorLightingConfig } from './assets/lightConfigExample.js';

const indoorConfig = createIndoorLightingConfig();
lightingManager.loadFromConfig(indoorConfig);
```

### 户外场景
```javascript
import { createOutdoorLightingConfig } from './assets/lightConfigExample.js';

const outdoorConfig = createOutdoorLightingConfig();
lightingManager.loadFromConfig(outdoorConfig);
```

### 夜景场景
```javascript
import { createNightLightingConfig } from './assets/lightConfigExample.js';

const nightConfig = createNightLightingConfig();
lightingManager.loadFromConfig(nightConfig);
```

## 配置工具函数

```javascript
import { 
  getLightConfig, 
  getEnabledLights, 
  getLightsByType 
} from './assets/lightConfig.js';

// 获取指定名称的灯光配置
const mainLightConfig = getLightConfig('main');

// 获取所有启用的灯光配置
const enabledLights = getEnabledLights();

// 获取指定类型的灯光配置
const directionalLights = getLightsByType('directional');
```

## 性能优化建议

1. **阴影贴图分辨率**: 根据场景需求调整 `mapSize`，分辨率越高质量越好但性能消耗越大
2. **阴影范围**: 合理设置 `near`、`far`、`left`、`right`、`top`、`bottom` 参数，避免不必要的阴影计算
3. **灯光数量**: 控制场景中灯光的数量，过多的灯光会影响性能
4. **阴影启用**: 只为主要的灯光启用阴影，次要灯光可以关闭阴影

## 注意事项

1. 确保在调用 `loadFromConfig()` 之前已经调用了 `init(scene)`
2. 灯光名称必须唯一，重复的名称会覆盖之前的灯光
3. 阴影参数只对支持阴影的灯光类型有效
4. 修改配置后需要重新调用 `loadFromConfig()` 来应用更改
5. 使用 `dispose()` 方法可以清理所有灯光，避免内存泄漏

## 扩展性

系统设计为可扩展的，你可以：

1. 添加新的灯光类型
2. 自定义阴影算法
3. 添加动画支持
4. 集成光照贴图
5. 添加后处理效果

通过修改 `lightingManager.js` 中的 `createLightFromConfig` 方法，可以轻松添加新的灯光类型支持。
