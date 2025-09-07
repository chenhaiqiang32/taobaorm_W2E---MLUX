# 射线检测系统 (Raycaster System)

## 📖 概述

射线检测系统是一个基于 Three.js Raycaster 的交互检测系统，支持鼠标移入、单击、双击等事件，能够自动根据配置为模型添加交互功能。

## 🏗️ 系统架构

```
raycasterConfig.js          # 配置文件
    ↓
RaycasterManager           # 核心管理器
    ↓
modelLoader.js             # 模型加载器（自动注册）
    ↓
main.js                    # 主程序集成
```

## 📁 文件结构

```
src/
├── assets/
│   ├── raycasterConfig.js      # 射线检测配置文件
│   └── raycasterExample.js     # 使用示例
├── components/
│   └── raycasterManager.js     # 射线检测管理器
└── ...
```

## 🚀 快速开始

### 1. 基本使用

```javascript
import { RaycasterManager } from './src/components/raycasterManager.js';

// 创建管理器实例
const raycasterManager = new RaycasterManager();

// 初始化
raycasterManager.init(scene, camera, renderer);

// 注册模型
raycasterManager.registerModel('equipment', equipmentModel);

// 设置事件监听器
raycasterManager.setupEventListeners('all');
```

### 2. 配置文件

在 `src/assets/raycasterConfig.js` 中配置交互行为：

```javascript
export const mousemoveConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("鼠标移入 equipment 模型:", intersects);
    },
  }
];

export const clickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("单击 equipment 模型:", intersects);
    },
  }
];

export const dblclickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("双击 equipment 模型:", intersects);
    },
  }
];
```

## 🔧 API 参考

### RaycasterManager 类

#### 构造函数
```javascript
const raycasterManager = new RaycasterManager();
```

#### 主要方法

##### `init(scene, camera, renderer)`
初始化射线检测管理器
- `scene`: Three.js 场景对象
- `camera`: Three.js 相机对象
- `renderer`: Three.js 渲染器对象

##### `registerModel(name, model)`
注册单个模型
- `name`: 模型名称
- `model`: Three.js 模型对象

##### `registerModels(models)`
批量注册模型
- `models`: 模型数组，格式: `[{name: string, model: THREE.Object3D}]`

##### `setupEventListeners(eventType)`
设置事件监听器
- `eventType`: 事件类型 (`'all'`, `'mousemove'`, `'click'`, `'dblclick'`)

##### `unregisterModel(name)`
移除模型注册
- `name`: 模型名称

##### `removeEventListeners(eventType)`
移除事件监听器
- `eventType`: 事件类型

##### `updateCamera(camera)`
更新相机引用
- `camera`: 新的相机对象

##### `getHoveredModel()`
获取当前悬停的模型
- 返回: 当前悬停的模型对象或 `null`

##### `getModelCount()`
获取注册的模型数量
- 返回: 模型数量

##### `getRegisteredModelNames()`
获取所有注册的模型名称
- 返回: 模型名称数组

##### `dispose()`
清理资源

## 📋 配置说明

### 事件类型

| 事件类型 | 触发时机 | 用途 |
|----------|----------|------|
| `mousemove` | 鼠标移入/移出模型 | 高亮效果、信息提示 |
| `click` | 鼠标单击模型 | 选择、显示详情 |
| `dblclick` | 鼠标双击模型 | 聚焦、进入详情页面 |

### 配置格式

```javascript
{
  name: "模型名称",           // 必须：与注册的模型名称一致
  fun: function (intersects) { // 必须：回调函数
    // intersects: 相交信息数组
    // intersects[0]: 第一个相交对象的信息
    //   - object: 相交的模型对象
    //   - point: 相交点坐标
    //   - distance: 距离
    //   - faceIndex: 面索引
  }
}
```

## 💡 使用示例

### 1. 模型高亮效果

```javascript
{
  name: "equipment",
  fun: function (intersects) {
    const object = intersects[0].object;
    // 保存原始材质
    if (!object.userData.originalMaterial) {
      object.userData.originalMaterial = object.material;
    }
    // 设置高亮材质
    object.material = new THREE.MeshBasicMaterial({ 
      color: 0xff0000, 
      transparent: true, 
      opacity: 0.5 
    });
  }
}
```

### 2. 显示模型信息

```javascript
{
  name: "equipment",
  fun: function (intersects) {
    const object = intersects[0].object;
    const point = intersects[0].point;
    
    console.log('模型名称:', object.name);
    console.log('点击位置:', point);
    console.log('距离:', intersects[0].distance);
    
    // 显示信息面板
    showInfoPanel({
      name: object.name,
      position: point,
      distance: intersects[0].distance
    });
  }
}
```

### 3. 相机聚焦到模型

```javascript
{
  name: "equipment",
  fun: function (intersects) {
    const object = intersects[0].object;
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    
    // 聚焦到模型中心
    cameraManager.focusOn(center, 5);
  }
}
```

### 4. 播放模型动画

```javascript
{
  name: "equipment",
  fun: function (intersects) {
    const object = intersects[0].object;
    
    // 查找动画混合器
    let mixer = null;
    object.traverse((child) => {
      if (child.userData.mixer) {
        mixer = child.userData.mixer;
      }
    });
    
    if (mixer) {
      // 播放动画
      animationManager.setMixer(mixer, mixer._actions);
      animationManager.play();
    }
  }
}
```

## ⚡ 性能优化

### 1. 模型注册优化
- 只注册需要交互的模型
- 避免注册过多的小对象
- 可以将多个小对象组合成一个大的可交互对象

### 2. 事件监听器优化
- 只启用需要的事件类型
- 在不需要时移除事件监听器

### 3. 回调函数优化
- 避免在回调中执行耗时操作
- 使用 `setTimeout` 或 `requestAnimationFrame` 处理耗时操作

## 🐛 调试技巧

### 1. 启用调试模式

```javascript
{
  name: "equipment",
  fun: function (intersects) {
    console.log('=== 射线检测调试信息 ===');
    console.log('相交对象数量:', intersects.length);
    console.log('第一个相交对象:', intersects[0]);
    console.log('相交点:', intersects[0].point);
    console.log('距离:', intersects[0].distance);
    console.log('面索引:', intersects[0].faceIndex);
    console.log('========================');
  }
}
```

### 2. 检查模型注册状态

```javascript
console.log('注册的模型数量:', raycasterManager.getModelCount());
console.log('模型名称列表:', raycasterManager.getRegisteredModelNames());
```

### 3. 检查事件监听器状态
在浏览器开发者工具中检查事件监听器：Elements -> Event Listeners

## 🔄 集成流程

### 1. 在 main.js 中集成

```javascript
import { RaycasterManager } from "./src/components/raycasterManager.js";

// 创建管理器实例
const raycasterManager = new RaycasterManager();

// 在 initScene 中初始化
raycasterManager.init(scene, cameraManager.getCamera(), renderer);

// 在 setupModelAndScene 中自动注册模型
loadAllModels(scene, raycasterManager).then((models) => {
  // 设置事件监听器
  raycasterManager.setupEventListeners('all');
});
```

### 2. 在 modelLoader.js 中自动注册

```javascript
export function loadAllModels(scene, raycasterManager = null) {
  return Promise.all(loadPromises).then(models => {
    // 自动注册模型到射线检测系统
    if (raycasterManager) {
      const modelsToRegister = models.map((modelData, index) => ({
        name: modelNames[index],
        model: modelData.model
      }));
      
      raycasterManager.registerModels(modelsToRegister);
    }
    
    return models;
  });
}
```

## 📝 注意事项

1. **模型名称一致性**: 配置中的 `name` 必须与注册的模型名称完全一致
2. **事件监听器管理**: 及时移除不需要的事件监听器，避免内存泄漏
3. **性能考虑**: 避免在回调函数中执行耗时操作
4. **错误处理**: 在回调函数中添加 try-catch 错误处理
5. **资源清理**: 在不需要时调用 `dispose()` 方法清理资源

## 🎯 最佳实践

1. **配置驱动**: 通过配置文件管理交互行为，便于维护
2. **模块化设计**: 将射线检测功能封装成独立的管理器
3. **自动注册**: 在模型加载时自动注册到射线检测系统
4. **事件分离**: 区分不同的事件类型，实现不同的交互效果
5. **性能优化**: 合理使用事件监听器，避免不必要的性能开销

## 🔗 相关文件

- `src/assets/raycasterConfig.js` - 配置文件
- `src/components/raycasterManager.js` - 核心管理器
- `src/assets/raycasterExample.js` - 使用示例
- `modelLoader.js` - 模型加载器（自动注册支持）
- `main.js` - 主程序集成

