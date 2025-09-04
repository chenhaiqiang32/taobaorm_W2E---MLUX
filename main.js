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
import { BackgroundManager } from "./src/components/backgroundManager.js";
import { AnimationManager } from "./src/components/animationManager.js";

// 创建管理器实例
const sceneManager = new SceneManager();
const cameraManager = new CameraManager();
const lightingManager = new LightingManager();
const backgroundManager = new BackgroundManager();
const animationManager = new AnimationManager();

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
  });

  // 将渲染器添加到DOM
  document.body.appendChild(renderer.domElement);

  // 初始化背景管理器
  backgroundManager.init(scene);
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

  // 初始化灯光管理器
  lightingManager.init(scene);

  return { scene, renderer };
}

/**
 * 设置模型和场景
 */
function setupModelAndScene(scene) {
  // 定义物体向右偏移量
  const sceneOffset = new THREE.Vector3(4, 0, 0);

  loadAllModels(scene)
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

      // 设置灯光
      lightingManager.setupForModel(boundingBox, center, radius, sceneOffset);

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
  // 点击事件监听器，打印相机位置
  renderer.domElement.addEventListener("click", (event) => {
    const cameraInfo = cameraManager.getCameraInfo();
    if (cameraInfo) {
      console.log("=== 当前相机位置信息 ===");
      console.log("相机位置 (Position):", cameraInfo.position);
      console.log("控制器目标 (Target):", cameraInfo.target);
      console.log("相机旋转 (Rotation):", cameraInfo.rotation);
      console.log("相机距离目标:", cameraInfo.distance);
      console.log("========================");
    }
  });

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
