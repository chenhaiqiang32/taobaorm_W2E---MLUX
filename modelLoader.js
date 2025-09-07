import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { modelPaths, modelNames } from "./src/assets/modelList.js";
import config from "./src/assets/config.js";

export function loadModel(scene, modelIndex = 0) {
  return new Promise((resolve, reject) => {
    // 检查模型索引是否有效
    if (modelIndex < 0 || modelIndex >= modelPaths.length) {
      reject(
        new Error(
          `模型索引 ${modelIndex} 超出范围，可用模型数量: ${modelPaths.length}`
        )
      );
      return;
    }

    const loader = new GLTFLoader();

    // 创建 DRACOLoader 实例
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("./draco/");

    // 将 DRACOLoader 实例设置给 GLTFLoader
    loader.setDRACOLoader(dracoLoader);

    const modelPath = modelPaths[modelIndex];
    const modelName = modelNames[modelIndex];
    console.log(
      `正在加载模型: ${modelPath} (索引: ${modelIndex}, 名称: ${modelName})`
    );

    loader.load(
      modelPath, // 使用模型路径数组中的路径
      function (gltf) {
        const model = gltf.scene;

        // 计算模型的包围盒
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const radius = Math.max(size.x, size.y, size.z);

        // 创建动画混合器但不自动播放
        let mixer = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          // 不自动播放动画，由外部控制
        }

        // 恢复原始材质，确保模型正常显示
        model.traverse((child) => {
          if (child.isMesh) {
            child.visible = true;
          }
        });

        // 将模型添加到场景
        scene.add(model);

        // 检查是否为控制中心模型
        const isControlCenter = modelName === config.defaultCameraPosition.name;

        // 返回模型信息
        resolve({
          model: model,
          boundingBox: box,
          center: center, // 包围盒中心
          size: size, // 包围盒大小
          radius: radius, // 包围盒半径
          mixer: mixer, // 返回动画混合器
          animations: gltf.animations, // 返回动画数据
          modelPath: modelPath, // 返回模型路径
          modelIndex: modelIndex, // 返回模型索引
          modelName: modelName, // 返回模型名称
          isControlCenter: isControlCenter, // 是否为控制中心模型
        });
      },
      function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      function (error) {
        console.error("加载模型时出错:", error);
        reject(error);
      }
    );
  });
}

// 新增：加载所有模型的函数
export function loadAllModels(scene, raycasterManager = null) {
  const loadPromises = modelPaths.map((path, index) => loadModel(scene, index));

  return Promise.all(loadPromises).then(models => {
    // 如果提供了射线检测管理器，自动注册模型
    if (raycasterManager) {
      const modelsToRegister = models.map((modelData, index) => ({
        name: modelNames[index],
        model: modelData.model
      }));
      
      raycasterManager.registerModels(modelsToRegister);
      console.log(`🎯 已自动注册 ${modelsToRegister.length} 个模型到射线检测系统`);
    }
    
    return models;
  });
}

// 新增：获取可用模型信息的函数
export function getAvailableModels() {
  return {
    count: modelPaths.length,
    paths: modelPaths,
    names: modelNames, // 使用从 modelList.js 导入的 modelNames
    controlCenterConfig: config.defaultCameraPosition,
    controlCenter: config.defaultCameraPosition.name,
  };
}

/**
 * 根据配置自动设置相机和控制器位置
 * @param {Object} cameraManager - 相机管理器实例
 * @param {Array} loadedModels - 已加载的模型数组
 * @returns {Object|null} 相机设置信息，如果设置失败返回 null
 */
export function autoSetupCameraAndControls(cameraManager, loadedModels) {
  if (!cameraManager || !loadedModels || loadedModels.length === 0) {
    console.warn("相机管理器或模型数据不可用");
    return null;
  }

  const cameraConfig = config.defaultCameraPosition;

  try {
    if (cameraConfig.type === "model") {
      // 根据模型名称查找控制中心模型
      const controlCenterModel = loadedModels.find(
        (model) =>
          model.isControlCenter && model.modelName === cameraConfig.name
      );

      if (controlCenterModel) {
        console.log(`🎯 找到控制中心模型: ${controlCenterModel.modelName}`);

        // 根据模型包围盒设置相机位置
        const { boundingBox, center, radius } = controlCenterModel;
        
        // 使用配置的偏移量计算相机位置
        const offset = cameraConfig.offset || { x: 6, y: 2, z: 6 };
        const cameraPosition = new THREE.Vector3(
          center.x + (radius * offset.x),
          center.y + (radius * offset.y),
          center.z + (radius * offset.z)
        );

        console.log(`🎯 相机位置计算:`);
        console.log(`  - 模型中心: (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`);
        console.log(`  - 模型半径: ${radius.toFixed(2)}`);
        console.log(`  - 偏移量配置: x=${offset.x}, y=${offset.y}, z=${offset.z}`);
        console.log(`  - 计算后的相机位置: (${cameraPosition.x.toFixed(2)}, ${cameraPosition.y.toFixed(2)}, ${cameraPosition.z.toFixed(2)})`);

        // 设置相机位置
        cameraManager.setPosition(cameraPosition);
        cameraManager.setTarget(center);
        
        // 更新相机参数，确保近远平面合适
        const distance = Math.max(offset.x, offset.y, offset.z) * radius;
        cameraManager.getCamera().near = distance * 0.01;
        cameraManager.getCamera().far = distance * 100;
        cameraManager.getCamera().updateProjectionMatrix();

        return {
          type: "model",
          modelName: controlCenterModel.modelName,
          center: center,
          radius: radius,
          offset: offset,
          cameraPosition: cameraPosition,
          success: true,
        };
      } else {
        console.warn(`⚠️ 未找到控制中心模型: ${cameraConfig.name}`);
        return null;
      }
    } else if (cameraConfig.type === "position") {
      // 根据固定位置设置相机
      if (cameraConfig.position && cameraConfig.lookAt) {
        const position = new THREE.Vector3(
          cameraConfig.position.x || 0,
          cameraConfig.position.y || 14,
          cameraConfig.position.z || 24
        );

        const lookAt = new THREE.Vector3(
          cameraConfig.lookAt.x || 0,
          cameraConfig.lookAt.y || 0,
          cameraConfig.lookAt.z || 0
        );

        // 设置相机位置
        cameraManager.setPosition(position);
        cameraManager.setTarget(lookAt);

        console.log("🎯 相机位置已根据固定配置设置");

        return {
          type: "position",
          position: position,
          lookAt: lookAt,
          success: true,
        };
      } else {
        console.warn("⚠️ 固定位置配置不完整，缺少 position 或 lookAt");
        return null;
      }
    } else {
      console.warn(`⚠️ 未知的相机配置类型: ${cameraConfig.type}`);
      return null;
    }
  } catch (error) {
    console.error("❌ 自动设置相机和控制器时出错:", error);
    return null;
  }
}
