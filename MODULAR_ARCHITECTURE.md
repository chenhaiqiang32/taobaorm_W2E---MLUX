# 模块化架构文档

## 概述

本项目已经重构为模块化架构，将原来的 `main.js` 中的功能解耦到多个专门的模块中，提高了代码的可维护性、可扩展性和可测试性。

## 模块结构

```
src/components/
├── sceneManager.js      # 场景管理器
├── cameraManager.js     # 相机管理器
├── lightingManager.js   # 灯光管理器
├── backgroundManager.js # 背景管理器
├── animationManager.js  # 动画管理器
└── boxModel.js         # 地面效果组件（原有）
```

## 各模块详细说明

### 1. SceneManager (场景管理器)

**职责**: 管理 Three.js 场景、渲染器和环境设置

**主要功能**:

- 创建和配置 Three.js 场景
- 创建和配置 WebGL 渲染器
- 设置环境贴图和雾效
- 管理渲染器尺寸调整

**使用方法**:

```javascript
import { SceneManager } from "./src/components/sceneManager.js";

const sceneManager = new SceneManager();
const { scene, renderer } = sceneManager.init({
  width: window.innerWidth,
  height: window.innerHeight,
  enableShadows: true,
  enableAntialias: true,
});
```

**配置选项**:

- `width`: 渲染器宽度
- `height`: 渲染器高度
- `enableShadows`: 是否启用阴影
- `enableAntialias`: 是否启用抗锯齿

### 2. CameraManager (相机管理器)

**职责**: 管理相机和轨道控制器

**主要功能**:

- 创建和配置透视相机
- 创建和配置轨道控制器
- 根据模型自动调整相机位置
- 提供相机信息查询接口

**使用方法**:

```javascript
import { CameraManager } from "./src/components/cameraManager.js";

const cameraManager = new CameraManager();

// 初始化相机
const camera = cameraManager.init({
  fov: 75,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  position: new THREE.Vector3(0, 14, 24),
  target: new THREE.Vector3(0, 0, 0),
});

// 初始化控制器
const controls = cameraManager.initControls(renderer, {
  enableDamping: true,
  dampingFactor: 0.05,
});

// 根据模型设置相机
cameraManager.setupForModel(boundingBox, center, radius, 6);
```

### 3. LightingManager (灯光管理器)

**职责**: 管理场景中的所有灯光

**主要功能**:

- 创建环境光、平行光、填充光
- 自动配置阴影设置
- 根据模型位置自动调整灯光位置
- 提供灯光参数动态调整接口

**使用方法**:

```javascript
import { LightingManager } from "./src/components/lightingManager.js";

const lightingManager = new LightingManager();
lightingManager.init(scene);

// 根据模型自动设置灯光
lightingManager.setupForModel(boundingBox, center, radius, sceneOffset);

// 动态调整灯光参数
lightingManager.setLightIntensity("main", 1.5);
lightingManager.setLightColor("ambient", 0xffffff);
```

**灯光类型**:

- `ambient`: 环境光
- `main`: 主要平行光（带阴影）
- `fill`: 填充光

### 4. BackgroundManager (背景管理器)

**职责**: 管理背景环境和自定义着色器

**主要功能**:

- 创建背景球体
- 加载和配置背景纹理
- 自定义着色器材质（亮度、饱和度、对比度调整）
- 动态更新背景参数

**使用方法**:

```javascript
import { BackgroundManager } from "./src/components/backgroundManager.js";

const backgroundManager = new BackgroundManager();
backgroundManager.init(scene);

// 创建背景球体
backgroundManager.createBackgroundSphere({
  texturePath: "./sunny2.jpg",
  radius: 500,
  segments: 32,
  shader: {
    brightness: 1,
    saturation: 1,
    contrast: 1,
  },
});

// 动态调整着色器参数
backgroundManager.updateShaderParams({
  brightness: 0.8,
  saturation: 0.9,
});
```

### 5. AnimationManager (动画管理器)

**职责**: 管理模型动画的播放控制

**主要功能**:

- 管理动画混合器
- 提供播放、暂停、停止、重置等控制接口
- 支持动画速度调整
- 提供动画状态查询接口

**使用方法**:

```javascript
import { AnimationManager } from "./src/components/animationManager.js";

const animationManager = new AnimationManager();

// 设置动画混合器
animationManager.setMixer(mixer, animations);

// 控制动画播放
animationManager.play(); // 播放
animationManager.pause(); // 暂停
animationManager.resume(); // 恢复
animationManager.stop(); // 停止
animationManager.reset(); // 重置

// 获取动画信息
const info = animationManager.getAnimationInfo();
```

## 重构后的 main.js

重构后的 `main.js` 现在非常简洁，主要包含：

1. **模块导入和实例化**
2. **初始化函数** (`initScene`)
3. **模型设置函数** (`setupModelAndScene`)
4. **事件监听器设置** (`setupEventListeners`)
5. **动画循环** (`animate`)
6. **主函数** (`main`)

## 优势

### 1. 可维护性

- 每个模块职责单一，易于理解和修改
- 代码结构清晰，便于团队协作
- 减少代码重复

### 2. 可扩展性

- 新功能可以独立开发新模块
- 现有模块可以独立升级
- 支持插件式架构

### 3. 可测试性

- 每个模块可以独立测试
- 便于单元测试和集成测试
- 支持模拟和依赖注入

### 4. 可重用性

- 模块可以在其他项目中重用
- 支持不同的配置组合
- 便于创建预设配置

## 使用建议

### 1. 开发新功能

- 优先考虑是否可以在现有模块中添加
- 如果功能复杂，考虑创建新模块
- 保持模块间的低耦合

### 2. 配置管理

- 将配置参数集中在模块的 `init` 方法中
- 支持运行时动态配置
- 提供合理的默认值

### 3. 错误处理

- 每个模块都应该有适当的错误处理
- 提供有意义的错误信息
- 支持优雅降级

### 4. 性能优化

- 避免在动画循环中创建新对象
- 合理使用资源清理
- 支持按需加载

## 迁移指南

如果你有现有的代码需要迁移到新架构：

1. **识别功能**: 将现有代码按功能分类
2. **选择模块**: 确定每个功能应该放在哪个模块
3. **重构代码**: 将代码移动到相应模块
4. **更新接口**: 使用新的模块化接口
5. **测试验证**: 确保功能正常工作

## 示例项目

完整的示例项目展示了如何使用所有模块：

```javascript
// main.js
import { SceneManager } from "./src/components/sceneManager.js";
import { CameraManager } from "./src/components/cameraManager.js";
// ... 其他导入

const sceneManager = new SceneManager();
const cameraManager = new CameraManager();
// ... 其他管理器

function main() {
  const { scene, renderer } = initScene();
  setupModelAndScene(scene);
  setupEventListeners(renderer);
  animate();
}

main();
```

这种架构让代码更加专业、可维护，并且为未来的功能扩展奠定了良好的基础。
