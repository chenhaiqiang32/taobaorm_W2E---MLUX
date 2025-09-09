import * as THREE from "three";
import {
  loadAllModels,
  autoSetupCameraAndControls,
  getAvailableModels,
} from "./modelLoader.js";
import BoxModel from "./src/components/boxModel.js";

// 导入新的模块化组件
import { SceneManager } from "./src/components/sceneManager.js";
import { CameraManager } from "./src/components/cameraManager.js";
import { LightingManager } from "./src/components/lightingManager.js";
import { getAdjustedLightConfig } from "./src/assets/lightConfig.js";
import { getProjectEnvironmentConfig } from "./src/assets/enviromentConfig.js";
import { BackgroundManager } from "./src/components/backgroundManager.js";
import { AnimationManager } from "./src/components/animationManager.js";
import { RaycasterManager } from "./src/components/raycasterManager.js";
import { CSS2DManager } from "./src/components/css2dManager.js";
import { MessageManager } from "./src/components/messageManager.js";
import { setCSS2DManager, setMessageManager } from "./src/assets/raycasterConfig.js";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

// 创建管理器实例
const sceneManager = new SceneManager();
const cameraManager = new CameraManager();
const lightingManager = new LightingManager();
const backgroundManager = new BackgroundManager();
const animationManager = new AnimationManager();
const raycasterManager = new RaycasterManager();
const css2dManager = new CSS2DManager();
const messageManager = new MessageManager();

// 简单的CSS2D渲染器（用于测试）
let simpleCSS2DRenderer = null;
let testLabels = [];

// 调试开关
const DEBUG_CSS2D = false; // 设置为true启用CSS2D调试

// 设置管理器引用到射线检测配置
setCSS2DManager(css2dManager);

/**
 * 初始化简单的CSS2D渲染器（用于测试同步问题）
 */
function initSimpleCSS2D(scene, camera) {
  console.log('🚀 初始化简单CSS2D渲染器...');
  
  // 创建CSS2D渲染器
  simpleCSS2DRenderer = new CSS2DRenderer();
  simpleCSS2DRenderer.setSize(window.innerWidth, window.innerHeight);
  simpleCSS2DRenderer.domElement.style.position = 'absolute';
  simpleCSS2DRenderer.domElement.style.top = '0px';
  simpleCSS2DRenderer.domElement.style.pointerEvents = 'none';
  simpleCSS2DRenderer.domElement.style.zIndex = '1001'; // 比CSS2DManager高一层
  
  // 添加到DOM
  document.body.appendChild(simpleCSS2DRenderer.domElement);
  
  // 创建测试标签
  createTestLabels(scene);
  
  console.log('✅ 简单CSS2D渲染器初始化完成');
}

/**
 * 创建测试标签
 */
function createTestLabels(scene) {
  // 创建3个测试标签
  for (let i = 0; i < 3; i++) {
    const labelDiv = document.createElement('div');
    labelDiv.style.cssText = `
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      pointer-events: none;
      user-select: none;
      border: 2px solid #ff0000;
      min-width: 100px;
      text-align: center;
    `;
    labelDiv.textContent = `简单标签 ${i + 1}`;
    
    const label = new CSS2DObject(labelDiv);
    
    // 设置位置
    const angle = (i / 3) * Math.PI * 2;
    const radius = 8;
    label.position.set(
      Math.cos(angle) * radius,
      3,
      Math.sin(angle) * radius
    );
    
    label.userData = { 
      id: `simple_label_${i}`,
      index: i,
      startTime: Date.now()
    };
    
    scene.add(label);
    testLabels.push(label);
  }
  
  console.log(`✅ 创建了 ${testLabels.length} 个简单测试标签`);
}

// 全局变量
let groundEffect = null;

/**
 * 初始化场景
 */
function initScene() {
  // 初始化场景管理器
  const { scene, renderer } = sceneManager.init({
    width: window.innerWidth,
    height: window.innerHeight,
    enableShadows: true,
    enableAntialias: true,
    environment: getProjectEnvironmentConfig() // 使用项目默认环境配置
  });

  // 将渲染器添加到DOM
  document.body.appendChild(renderer.domElement);

  // 初始化背景管理器
  backgroundManager.init(scene);
  // backgroundManager.createBackgroundSphere({
  //   texturePath: "./sunny2.jpg",
  //   radius: 500,
  //   segments: 32,
  //   shader: {
  //     brightness: 1,
  //     saturation: 1,
  //     contrast: 1,
  //   },
  // });

  // 初始化相机管理器
  cameraManager.init({
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 1000,
    position: new THREE.Vector3(0, 14, 24),
    target: new THREE.Vector3(0, 0, 0),
  });

  // 初始化轨道控制器
  cameraManager.initControls(renderer, {
    enableDamping: true,
    dampingFactor: 0.05,
    target: new THREE.Vector3(0, 0, 0),
  });

  // 初始化射线检测管理器
  raycasterManager.init(scene, cameraManager.getCamera(), renderer);

  // 初始化CSS2D标签管理器
  css2dManager.init(scene, cameraManager.getCamera(), {
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  // 调试：检查CSS2D状态（仅在调试模式下）
  if (DEBUG_CSS2D) {
    console.log('🔍 CSS2D初始化后状态检查:');
    css2dManager.debugStatus();
  }

  // 初始化简单的CSS2D渲染器（用于测试）
  if (DEBUG_CSS2D) {
    initSimpleCSS2D(scene, cameraManager.getCamera());
  }

  // 初始化消息管理器
  messageManager.init();
  console.log('✅ MessageManager初始化完成，准备接收消息');
  
  // 在MessageManager初始化后设置引用
  setMessageManager(messageManager);

  // // 初始化灯光管理器
  lightingManager.init(scene);
  
  // // 从配置文件加载灯光
  lightingManager.loadFromConfig();

  return { scene, renderer };
}

/**
 * 设置模型和场景
 */
function setupModelAndScene(scene) {
  // 定义物体向右偏移量
  const sceneOffset = new THREE.Vector3(4, 0, 0);

  loadAllModels(scene, raycasterManager)
    .then((models) => {
      // 获取第一个模型（如果只加载一个模型的话）
      const {
        model,
        boundingBox,
        center,
        size,
        radius,
        mixer: loadedMixer,
        animations,
        isControlCenter,
        modelName,
      } = models[0]; // 从数组中获取第一个模型

      // 移动模型
      model.position.add(sceneOffset);

      // 设置动画管理器
      animationManager.setMixer(loadedMixer, animations);

      // 遍历模型，设置金属材质属性
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          if (
            child.material.isMeshStandardMaterial ||
            child.material.isMeshPhysicalMaterial
          ) {
            child.material.envMapIntensity = 2.0;
            child.material.needsUpdate = true;
          }
        }
      });

      // 自动设置相机和控制器（基于配置）
      const cameraInfo = autoSetupCameraAndControls(cameraManager, models);

      if (cameraInfo) {
        console.log("🎯 相机和控制器已根据配置自动设置");
      } else {
        // 如果自动设置失败，使用默认设置
        cameraManager.setupForModel(boundingBox, center, radius, 6);
        console.log("⚠️ 自动设置失败，使用默认相机设置");
      }

      // 创建地面效果
      const core = { scene: scene };
      groundEffect = new BoxModel(core);

      // 计算地面位置
      const groundCenter = new THREE.Vector3(
        center.x + sceneOffset.x,
        boundingBox.min.y - radius,
        center.z
      );

      // 初始化地面效果
      groundEffect.initModel(groundCenter, radius);

      // 根据模型位置动态调整灯光配置
      const adjustedLightConfig = getAdjustedLightConfig(center, radius, sceneOffset);
      lightingManager.loadFromConfig(adjustedLightConfig);

      // 设置射线检测事件监听器
      raycasterManager.setupEventListeners('all');

      console.log("物体向右平移完成:", {
        物体偏移量: sceneOffset,
        物体新位置: model.position,
        原始中心保持: center,
        相机位置: cameraManager.getCamera().position,
        相机朝向: center,
        控制器目标: cameraManager.getControls().target,
        地面位置: groundCenter,
        控制中心模型: isControlCenter ? "是" : "否",
        模型名称: modelName,
      });

      // 显示控制中心配置信息
      const availableModels = getAvailableModels();
      console.log("🎯 控制中心配置:", availableModels.controlCenterConfig);
      console.log("🎯 控制中心模型:", availableModels.controlCenter);
    })
    .catch((error) => {
      console.error("Failed to setup model and controls:", error);
    });
}

/**
 * 设置事件监听器
 */
function setupEventListeners(renderer) {
  // 点击事件监听器，打印相机位置（已由射线检测系统处理）
  // renderer.domElement.addEventListener("click", (event) => {
  //   const cameraInfo = cameraManager.getCameraInfo();
  //   if (cameraInfo) {
  //     console.log("=== 当前相机位置信息 ===");
  //     console.log("相机位置 (Position):", cameraInfo.position);
  //     console.log("控制器目标 (Target):", cameraInfo.target);
  //     console.log("相机旋转 (Rotation):", cameraInfo.rotation);
  //     console.log("相机距离目标:", cameraInfo.distance);
  //     console.log("========================");
  //   }
  // });

  // 动画控制按钮事件监听器
  document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.getElementById("playButton");
    const resetButton = document.getElementById("resetButton");

    // 播放动画按钮
    if (playButton) {
      playButton.addEventListener("click", () => {
        if (animationManager.hasAnimations()) {
          if (!animationManager.isAnimationPlaying()) {
            animationManager.play();
          } else {
            animationManager.togglePlayPause();
          }
        } else {
          console.log("没有可播放的动画");
        }
      });
    }

    // 重置动画按钮
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        animationManager.reset();
      });
    }
  });

  // 窗口大小调整事件
  window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    cameraManager.updateAspect(width, height);
    sceneManager.resize(width, height);
    css2dManager.resize(width, height);
    
    // 调整简单CSS2D渲染器大小
    if (DEBUG_CSS2D && simpleCSS2DRenderer) {
      simpleCSS2DRenderer.setSize(width, height);
    }
  });

  // 消息监听
  window.addEventListener("message", (event) => {
    const { cmd, params } = event.data || {};
    if (cmd === "init" && params) {
    }
  });
}

/**
 * 动画循环
 */
function animate(time) {
  requestAnimationFrame(animate);

  // 更新控制器
  cameraManager.update();

  // 更新地面效果动画
  if (groundEffect) {
    groundEffect.update(time * 0.001);
  }

  // 更新动画
  animationManager.updateWithClock();

  // 渲染场景
  const renderer = sceneManager.getRenderer();
  const camera = cameraManager.getCamera();
  if (renderer && camera) {
    renderer.render(sceneManager.getScene(), camera);
  }

  // 渲染CSS2D标签
  css2dManager.render(sceneManager.getScene(), cameraManager.getCamera());
  
  // 渲染简单CSS2D标签（测试）
  if (DEBUG_CSS2D && simpleCSS2DRenderer) {
    simpleCSS2DRenderer.render(sceneManager.getScene(), cameraManager.getCamera());
  }
}

/**
 * 主函数
 */
function main() {
  // 初始化场景
  const { scene, renderer } = initScene();

  // 设置模型和场景
  setupModelAndScene(scene);

  // 设置事件监听器
  setupEventListeners(renderer);

  // 开始动画循环
  animate();
}

// 启动应用
main();

// 添加全局测试函数
window.testSimpleCSS2D = () => {
  console.log('🧪 测试简单CSS2D功能...');
  if (simpleCSS2DRenderer) {
    console.log('✅ 简单CSS2D渲染器存在');
    console.log('📊 测试标签数量:', testLabels.length);
    
    // 移动测试标签
    testLabels.forEach((label, index) => {
      const time = Date.now() * 0.001;
      const angle = time + index * Math.PI / 3;
      const radius = 8;
      
      label.position.x = Math.cos(angle) * radius;
      label.position.z = Math.sin(angle) * radius;
      label.position.y = 3 + Math.sin(time * 2 + index) * 0.5;
    });
    
    console.log('✅ 测试标签已移动');
  } else {
    console.log('❌ 简单CSS2D渲染器不存在');
  }
};

window.checkSimpleCSS2DStatus = () => {
  console.log('🔍 简单CSS2D状态检查:');
  console.log('  - 渲染器:', !!simpleCSS2DRenderer);
  console.log('  - DOM元素:', !!simpleCSS2DRenderer?.domElement);
  console.log('  - 测试标签数量:', testLabels.length);
  
  if (simpleCSS2DRenderer?.domElement) {
    const rect = simpleCSS2DRenderer.domElement.getBoundingClientRect();
    console.log('  - DOM元素尺寸:', rect.width, 'x', rect.height);
    console.log('  - DOM元素位置:', rect.left, rect.top);
  }
};

window.testCSS2DManager = () => {
  console.log('🧪 测试CSS2DManager功能...');
  console.log('📊 CSS2DManager标签数量:', css2dManager.labels.size);
  console.log('📊 CSS2DManager场景子对象数量:', css2dManager.scene.children.length);
  
  // 检查测试标签
  const testLabel = css2dManager.getLabel('simple_test');
  if (testLabel) {
    console.log('✅ 测试标签存在:', testLabel);
    console.log('📍 测试标签位置:', testLabel.position);
  } else {
    console.log('❌ 测试标签不存在');
  }
  
  // 移动测试标签
  if (testLabel) {
    const time = Date.now() * 0.001;
    testLabel.position.x = Math.sin(time) * 5;
    testLabel.position.z = Math.cos(time) * 5;
    testLabel.position.y = 5 + Math.sin(time * 2) * 0.5;
    console.log('✅ 测试标签已移动');
  }
};

window.enableCSS2DDebug = () => {
  DEBUG_CSS2D = true;
  css2dManager.enableDebugMode();
  console.log('🔧 CSS2D调试模式已启用');
};

window.disableCSS2DDebug = () => {
  DEBUG_CSS2D = false;
  css2dManager.disableDebugMode();
  console.log('🔧 CSS2D调试模式已禁用');
};

window.checkCSS2DSceneConsistency = () => {
  console.log('🔍 检查CSS2D场景一致性:');
  console.log('  - CSS2DManager内部场景:', !!css2dManager.scene);
  console.log('  - CSS2DManager内部相机:', !!css2dManager.camera);
  console.log('  - SceneManager场景:', !!sceneManager.getScene());
  console.log('  - CameraManager相机:', !!cameraManager.getCamera());
  
  console.log('  - 场景是否相同:', css2dManager.scene === sceneManager.getScene());
  console.log('  - 相机是否相同:', css2dManager.camera === cameraManager.getCamera());
  
  if (css2dManager.scene && sceneManager.getScene()) {
    console.log('  - CSS2DManager场景子对象数量:', css2dManager.scene.children.length);
    console.log('  - SceneManager场景子对象数量:', sceneManager.getScene().children.length);
  }
};

window.checkDeviceTypesList = async () => {
  console.log('🔍 检查DEVICE_TYPES_LIST状态:');
  
  // 动态导入deviceConfig
  const { DEVICE_TYPES_LIST } = await import('./src/business/deviceConfig.js');
  
  console.log('  - 设备数量:', DEVICE_TYPES_LIST.length);
  console.log('  - 设备列表:', DEVICE_TYPES_LIST.map(d => ({
    name: d.name,
    hasBoundingBox: !!d.boundingBox,
    boundingBoxCenter: d.boundingBox?.center
  })));
  
  // 检查CSS2DManager中的标签
  console.log('  - CSS2DManager标签数量:', css2dManager.labels.size);
  console.log('  - CSS2DManager标签列表:', Array.from(css2dManager.labels.keys()));
  
  return {
    deviceCount: DEVICE_TYPES_LIST.length,
    labelCount: css2dManager.labels.size,
    devices: DEVICE_TYPES_LIST,
    labels: Array.from(css2dManager.labels.keys())
  };
};

window.testBusinessLogic = async () => {
  console.log('🧪 测试业务逻辑...');
  
  // 动态导入相关模块
  const { processDeviceData } = await import('./src/business/deviceDataManager.js');
  const { DEVICE_TYPES_LIST } = await import('./src/business/deviceConfig.js');
  
  // 创建测试数据
  const testDeviceData = [
    {
      deviceid: "Mesh_equipment_mtl",
      data: {
        title: "测试设备",
        configs: [
          { label: "状态", value: "正常" },
          { label: "温度", value: "25°C" }
        ]
      }
    }
  ];
  
  console.log('📊 测试前状态:');
  console.log('  - DEVICE_TYPES_LIST数量:', DEVICE_TYPES_LIST.length);
  console.log('  - CSS2DManager标签数量:', css2dManager.labels.size);
  
  // 处理测试数据
  processDeviceData(testDeviceData, css2dManager);
  
  console.log('📊 测试后状态:');
  console.log('  - DEVICE_TYPES_LIST数量:', DEVICE_TYPES_LIST.length);
  console.log('  - CSS2DManager标签数量:', css2dManager.labels.size);
  console.log('  - CSS2DManager标签列表:', Array.from(css2dManager.labels.keys()));
  
  return {
    before: { deviceCount: DEVICE_TYPES_LIST.length, labelCount: css2dManager.labels.size },
    after: { deviceCount: DEVICE_TYPES_LIST.length, labelCount: css2dManager.labels.size }
  };
};

window.checkAllLabels = () => {
  console.log('🔍 检查所有标签状态:');
  
  const camera = cameraManager.getCamera();
  console.log('📷 相机位置:', `(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
  
  console.log('📊 CSS2DManager标签:');
  css2dManager.labels.forEach((label, id) => {
    const distance = camera.position.distanceTo(label.position);
    console.log(`  - 标签ID: ${id}`);
    console.log(`    - 位置: (${label.position.x.toFixed(2)}, ${label.position.y.toFixed(2)}, ${label.position.z.toFixed(2)})`);
    console.log(`    - 距离相机: ${distance.toFixed(2)}`);
    console.log(`    - 可见性: ${label.visible}`);
    console.log(`    - 元素:`, label.element);
    console.log(`    - 元素文本:`, label.element?.textContent || label.element?.innerText);
  });
  
  console.log('📊 场景中的CSS2D对象:');
  const css2dObjects = css2dManager.scene.children.filter(child => child.isCSS2DObject);
  console.log(`  - CSS2D对象数量: ${css2dObjects.length}`);
  css2dObjects.forEach((obj, index) => {
    const distance = camera.position.distanceTo(obj.position);
    console.log(`  - CSS2D对象 ${index + 1}:`);
    console.log(`    - 位置: (${obj.position.x.toFixed(2)}, ${obj.position.y.toFixed(2)}, ${obj.position.z.toFixed(2)})`);
    console.log(`    - 距离相机: ${distance.toFixed(2)}`);
    console.log(`    - 可见性: ${obj.visible}`);
    console.log(`    - 元素:`, obj.element);
  });
  
  return {
    managerLabels: css2dManager.labels.size,
    sceneObjects: css2dObjects.length,
    labels: Array.from(css2dManager.labels.entries()),
    objects: css2dObjects
  };
};

window.moveCameraToLabel = (labelId) => {
  const label = css2dManager.getLabel(labelId);
  if (!label) {
    console.log(`❌ 标签 ${labelId} 不存在`);
    return;
  }
  
  const camera = cameraManager.getCamera();
  const labelPos = label.position;
  
  // 移动相机到标签附近
  camera.position.set(
    labelPos.x + 5,
    labelPos.y + 5,
    labelPos.z + 5
  );
  camera.lookAt(labelPos);
  
  console.log(`📷 相机已移动到标签 ${labelId} 附近`);
  console.log(`📷 相机位置: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
  console.log(`📷 相机朝向: (${labelPos.x.toFixed(2)}, ${labelPos.y.toFixed(2)}, ${labelPos.z.toFixed(2)})`);
};

window.moveCameraToFirstLabel = () => {
  const firstLabel = css2dManager.labels.values().next().value;
  if (firstLabel) {
    const labelId = Array.from(css2dManager.labels.keys()).find(id => css2dManager.labels.get(id) === firstLabel);
    moveCameraToLabel(labelId);
  } else {
    console.log('❌ 没有找到任何标签');
  }
};

window.createTestLabelNearCamera = () => {
  const camera = cameraManager.getCamera();
  
  // 在相机前方创建一个测试标签
  const testData = {
    title: '相机附近测试',
    configs: [
      { label: '位置', value: '相机前方' },
      { label: '距离', value: '5米' }
    ]
  };
  
  const testLabel = css2dManager.createLabel('camera_test', testData, {
    position: {
      x: camera.position.x + 5,
      y: camera.position.y,
      z: camera.position.z
    },
    type: 'info'
  });
  
  console.log('🧪 在相机附近创建测试标签:', testLabel);
  console.log('📷 相机位置:', `(${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)})`);
  console.log('🏷️ 标签位置:', `(${testLabel.position.x.toFixed(2)}, ${testLabel.position.y.toFixed(2)}, ${testLabel.position.z.toFixed(2)})`);
  
  return testLabel;
};

window.testAllTemplates = () => {
  const camera = cameraManager.getCamera();
  
  console.log('🧪 测试所有模板...');
  
  // 测试title模板
  const titleData = { title: '标题测试' };
  const titleLabel = css2dManager.createLabel('test_title', titleData, {
    position: { x: camera.position.x + 3, y: camera.position.y, z: camera.position.z },
    type: 'title'
  });
  
  // 测试info模板
  const infoData = {
    title: '信息测试',
    configs: [
      { label: '状态', value: '正常' },
      { label: '温度', value: '25°C' }
    ]
  };
  const infoLabel = css2dManager.createLabel('test_info', infoData, {
    position: { x: camera.position.x + 6, y: camera.position.y, z: camera.position.z },
    type: 'info'
  });
  
  // 测试detail模板
  const detailData = {
    title: '详细测试',
    configs: [
      { label: '设备类型', value: '工业设备' },
      { label: '运行状态', value: '运行中' },
      { label: '维护状态', value: '良好' }
    ]
  };
  const detailLabel = css2dManager.createLabel('test_detail', detailData, {
    position: { x: camera.position.x + 9, y: camera.position.y, z: camera.position.z },
    type: 'detail'
  });
  
  console.log('✅ 所有模板测试标签已创建');
  console.log('📊 当前标签数量:', css2dManager.labels.size);
  
  return { titleLabel, infoLabel, detailLabel };
};

console.log('📋 测试函数已添加: testSimpleCSS2D(), checkSimpleCSS2DStatus(), testCSS2DManager()');
console.log('📋 调试函数已添加: enableCSS2DDebug(), disableCSS2DDebug(), checkCSS2DSceneConsistency(), checkDeviceTypesList(), testBusinessLogic(), checkAllLabels(), moveCameraToLabel(), moveCameraToFirstLabel(), createTestLabelNearCamera(), testAllTemplates()');
