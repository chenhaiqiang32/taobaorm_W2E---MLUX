/**
 * 射线检测系统使用示例
 * 展示如何配置和使用射线检测功能
 */

import { RaycasterManager } from '../components/raycasterManager.js';
import { 
  mousemoveConfigModels, 
  clickConfigModels, 
  dblclickConfigModels 
} from './raycasterConfig.js';

/**
 * 基础使用示例
 */
export function basicUsageExample() {
  console.log('🎯 射线检测系统基础使用示例:');
  console.log('');
  
  console.log('1. 创建射线检测管理器:');
  console.log(`
const raycasterManager = new RaycasterManager();
  `);
  
  console.log('2. 初始化管理器:');
  console.log(`
raycasterManager.init(scene, camera, renderer);
  `);
  
  console.log('3. 注册模型:');
  console.log(`
// 单个模型注册
raycasterManager.registerModel('equipment', equipmentModel);

// 批量模型注册
raycasterManager.registerModels([
  { name: 'equipment', model: equipmentModel },
  { name: 'structure', model: structureModel }
]);
  `);
  
  console.log('4. 设置事件监听器:');
  console.log(`
// 设置所有事件监听器
raycasterManager.setupEventListeners('all');

// 或者设置特定事件
raycasterManager.setupEventListeners('click');
raycasterManager.setupEventListeners('mousemove');
raycasterManager.setupEventListeners('dblclick');
  `);
}

/**
 * 配置示例
 */
export function configExamples() {
  console.log('📋 射线检测配置示例:');
  console.log('');
  
  console.log('1. 鼠标移入配置:');
  console.log(`
export const mousemoveConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("鼠标移入 equipment 模型:", intersects);
      // 可以在这里添加高亮效果、显示信息等
    },
  }
];
  `);
  
  console.log('2. 鼠标单击配置:');
  console.log(`
export const clickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("单击 equipment 模型:", intersects);
      // 可以在这里添加选择效果、显示详情等
    },
  }
];
  `);
  
  console.log('3. 鼠标双击配置:');
  console.log(`
export const dblclickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("双击 equipment 模型:", intersects);
      // 可以在这里添加聚焦效果、进入详情页面等
    },
  }
];
  `);
}

/**
 * 高级功能示例
 */
export function advancedFeaturesExample() {
  console.log('🚀 射线检测系统高级功能示例:');
  console.log('');
  
  console.log('1. 获取当前悬停的模型:');
  console.log(`
const hoveredModel = raycasterManager.getHoveredModel();
if (hoveredModel) {
  console.log('当前悬停的模型:', hoveredModel);
}
  `);
  
  console.log('2. 获取注册的模型信息:');
  console.log(`
const modelCount = raycasterManager.getModelCount();
const modelNames = raycasterManager.getRegisteredModelNames();
console.log('注册的模型数量:', modelCount);
console.log('模型名称列表:', modelNames);
  `);
  
  console.log('3. 更新相机引用:');
  console.log(`
// 当相机发生变化时
raycasterManager.updateCamera(newCamera);
  `);
  
  console.log('4. 移除模型注册:');
  console.log(`
raycasterManager.unregisterModel('equipment');
  `);
  
  console.log('5. 移除事件监听器:');
  console.log(`
// 移除特定事件监听器
raycasterManager.removeEventListeners('click');

// 移除所有事件监听器
raycasterManager.removeEventListeners('all');
  `);
}

/**
 * 实际应用示例
 */
export function practicalExamples() {
  console.log('💡 实际应用示例:');
  console.log('');
  
  console.log('1. 模型高亮效果:');
  console.log(`
// 在配置中添加高亮效果
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
  `);
  
  console.log('2. 显示模型信息:');
  console.log(`
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
  `);
  
  console.log('3. 相机聚焦到模型:');
  console.log(`
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
  `);
  
  console.log('4. 播放模型动画:');
  console.log(`
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
  `);
}

/**
 * 性能优化建议
 */
export function performanceTips() {
  console.log('⚡ 性能优化建议:');
  console.log('');
  
  console.log('1. 模型注册优化:');
  console.log(`
// 只注册需要交互的模型
raycasterManager.registerModel('interactiveModel', model);

// 避免注册过多的小对象
// 可以将多个小对象组合成一个大的可交互对象
  `);
  
  console.log('2. 事件监听器优化:');
  console.log(`
// 只启用需要的事件类型
raycasterManager.setupEventListeners('click'); // 只启用点击

// 在不需要时移除事件监听器
raycasterManager.removeEventListeners('mousemove');
  `);
  
  console.log('3. 回调函数优化:');
  console.log(`
// 避免在回调中执行耗时操作
{
  name: "equipment",
  fun: function (intersects) {
    // 好的做法：简单快速的操作
    console.log('点击了模型');
    
    // 避免：耗时操作
    // heavyCalculation();
    // 应该使用 setTimeout 或 requestAnimationFrame
  }
}
  `);
}

/**
 * 调试技巧
 */
export function debuggingTips() {
  console.log('🐛 调试技巧:');
  console.log('');
  
  console.log('1. 启用调试模式:');
  console.log(`
// 在配置中添加调试信息
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
  `);
  
  console.log('2. 检查模型注册状态:');
  console.log(`
console.log('注册的模型数量:', raycasterManager.getModelCount());
console.log('模型名称列表:', raycasterManager.getRegisteredModelNames());
  `);
  
  console.log('3. 检查事件监听器状态:');
  console.log(`
// 在浏览器开发者工具中检查事件监听器
// Elements -> Event Listeners
  `);
}

/**
 * 显示所有示例
 */
export function showAllExamples() {
  basicUsageExample();
  console.log('');
  configExamples();
  console.log('');
  advancedFeaturesExample();
  console.log('');
  practicalExamples();
  console.log('');
  performanceTips();
  console.log('');
  debuggingTips();
}

// 如果直接运行此文件，显示所有示例
if (typeof window === 'undefined') {
  // Node.js 环境
  showAllExamples();
} else {
  // 浏览器环境
  window.showAllExamples = showAllExamples;
  window.basicUsageExample = basicUsageExample;
  window.configExamples = configExamples;
  window.advancedFeaturesExample = advancedFeaturesExample;
  window.practicalExamples = practicalExamples;
  window.performanceTips = performanceTips;
  window.debuggingTips = debuggingTips;
  console.log('🎯 射线检测系统示例已加载，运行以下函数查看示例:');
  console.log('- window.showAllExamples() - 显示所有示例');
  console.log('- window.basicUsageExample() - 基础使用示例');
  console.log('- window.configExamples() - 配置示例');
  console.log('- window.advancedFeaturesExample() - 高级功能示例');
  console.log('- window.practicalExamples() - 实际应用示例');
  console.log('- window.performanceTips() - 性能优化建议');
  console.log('- window.debuggingTips() - 调试技巧');
}

