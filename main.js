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
import { PostprocessingManager } from "./src/components/postprocessingManager.js";
import { setCSS2DManager, setMessageManager, setPostprocessingManager, setSceneManager } from "./src/assets/raycasterConfig.js";
import { handleDeviceClick, getCurrentSelectedDevice, setManagers, clearAllSelections } from "./src/business/deviceDataManager.js";
import { createGroupLabels } from "./src/business/index.js";
import { HighlightEffectsManager } from "./src/components/highlightEffectsManager.js";
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
const postprocessingManager = new PostprocessingManager();
const highlightEffectsManager = new HighlightEffectsManager();

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

  // 初始化后处理管理器
  postprocessingManager.init(renderer, scene, cameraManager.getCamera());
  console.log('✅ PostprocessingManager初始化完成');

  // 初始化消息管理器
  messageManager.init();
  console.log('✅ MessageManager初始化完成，准备接收消息');

  // 初始化醒目效果管理器
  highlightEffectsManager.init(scene);
  console.log('✅ HighlightEffectsManager初始化完成');

  // 在MessageManager初始化后设置引用
  setMessageManager(messageManager);
  
  // 设置后处理管理器引用
  setPostprocessingManager(postprocessingManager);
  
  // 设置场景管理器引用
  setSceneManager(sceneManager);

  // 设置设备数据管理器引用
  setManagers(postprocessingManager, css2dManager, cameraManager, highlightEffectsManager);

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
        center.x,
        boundingBox.min.y - radius,
        center.z
      );

      // 初始化地面效果
      groundEffect.initModel(groundCenter, radius);

      // 根据模型位置动态调整灯光配置
      const adjustedLightConfig = getAdjustedLightConfig(center, radius);
      lightingManager.loadFromConfig(adjustedLightConfig);

      // 设置射线检测事件监听器
      raycasterManager.setupEventListeners('all');

      console.log("模型加载完成:", {
        模型位置: model.position,
        模型中心: center,
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

      // 创建设备组CSS2D标签
      console.log("🏷️ 开始创建设备组标签...");
      createGroupLabels(css2dManager, cameraManager);
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
    postprocessingManager.resize(width, height);
    
    // 调整简单CSS2D渲染器大小
    if (DEBUG_CSS2D && simpleCSS2DRenderer) {
      simpleCSS2DRenderer.setSize(width, height);
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

  // 更新相机动画
  cameraManager.updateAnimation();

  // 更新醒目效果动画
  highlightEffectsManager.update(time);

  // 更新地面效果动画
  if (groundEffect) {
    groundEffect.update(time * 0.001);
  }

  // 更新动画
  animationManager.updateWithClock();

  // 渲染场景（使用后处理管理器）
  const renderer = sceneManager.getRenderer();
  const camera = cameraManager.getCamera();
  const scene = sceneManager.getScene();
  
  if (renderer && camera && scene) {
    // 使用后处理管理器渲染（包含outline效果）
    postprocessingManager.render();
  } else {
    // 如果后处理管理器未正确初始化，使用普通渲染
    if (renderer && camera && scene) {
      renderer.render(scene, camera);
    }
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