import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { modelPaths, modelNames } from "./src/assets/modelList.js";
import config from "./src/assets/config.js";
import { sceneAnalyzer, robotArmManager, pathManager } from "./src/business/index.js";

// 存储 glb_tex 模型的材质，用于材质流动效果
export let glbTexMaterials = [];

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

    const modelPath = modelPaths[modelIndex];
    const modelName = modelNames[modelIndex];
    const isOBJFile = modelPath.toLowerCase().endsWith('.obj');
    
    console.log(
      `正在加载模型: ${modelPath} (索引: ${modelIndex}, 名称: ${modelName}, 格式: ${isOBJFile ? 'OBJ' : 'GLB'})`
    );

    if (isOBJFile) {
      // 使用OBJLoader加载OBJ文件
      const loader = new OBJLoader();
      
      loader.load(
        modelPath, // 使用模型路径数组中的路径
        function (object) {
          const model = object;
        // 计算模型的包围盒
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const radius = Math.max(size.x, size.y, size.z);

        // OBJ文件没有动画，设置mixer为null
        let mixer = null;
        let animations = [];

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
          animations: animations, // 返回动画数据
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
        console.error("加载OBJ模型时出错:", error);
        reject(error);
      }
    );
    } else {
      // 使用GLTFLoader加载GLB文件
      const loader = new GLTFLoader();

      // 创建 DRACOLoader 实例
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath("./draco/");

      // 将 DRACOLoader 实例设置给 GLTFLoader
      loader.setDRACOLoader(dracoLoader);

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
          console.error("加载GLB模型时出错:", error);
          reject(error);
        }
      );
    }
  });
}

// 新增：加载所有模型的函数
export async function loadAllModels(scene, raycasterManager = null, enableSceneAnalysis = true) {
  const loadPromises = modelPaths.map((path, index) => loadModel(scene, index));

  return Promise.all(loadPromises).then(async models => {
    // 如果提供了射线检测管理器，自动注册模型
    if (raycasterManager) {
      const modelsToRegister = models.map((modelData, index) => ({
        name: modelNames[index],
        model: modelData.model
      }));
      
      raycasterManager.registerModels(modelsToRegister);
      console.log(`🎯 已自动注册 ${modelsToRegister.length} 个模型到射线检测系统`);
    }
    
    // 如果启用了场景分析，分析equipment和line模型
    if (enableSceneAnalysis) {
      analyzeEquipmentModel(models);
      await analyzeLineModel(models);
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

/**
 * 分析equipment模型结构
 * @param {Array} models - 已加载的模型数组
 * @returns {Object} 分析结果
 */
export function analyzeEquipmentModel(models) {
  console.log('🔍 开始分析equipment模型结构...');
  
  // 从模型数组中查找equipment模型
  const equipmentModelIndex = modelNames.indexOf('equipment');
  
  if (equipmentModelIndex === -1) {
    console.warn('⚠️ 未找到equipment模型名称');
    return {
      success: false,
      error: '未找到equipment模型名称',
      devices: [],
      groups: []
    };
  }
  
  const equipmentModelData = models[equipmentModelIndex];
  
  if (!equipmentModelData || !equipmentModelData.model) {
    console.warn('⚠️ equipment模型数据无效');
    return {
      success: false,
      error: 'equipment模型数据无效',
      devices: [],
      groups: []
    };
  }
  
  // 准备模型数据
  const modelData = {
    name: 'equipment',
    model: equipmentModelData.model
  };
  
  console.log(`✅ 找到equipment模型数据，模型名称: ${modelData.name}`);
  
  try {
    const analysisResult = sceneAnalyzer.analyzeScene(modelData);
    
    if (analysisResult.success) {
      console.log('✅ Equipment模型分析完成');
      console.log(`📊 分析结果:`);
      console.log(`  - 设备数量: ${analysisResult.totalDevices}`);
      console.log(`  - 设备组数量: ${analysisResult.totalGroups}`);
      
      // 输出设备列表
      if (analysisResult.devices.length > 0) {
        console.log('📦 发现的设备:');
        analysisResult.devices.forEach((device, index) => {
          console.log(`  ${index + 1}. ${device.name} ${device.isGrouped ? `(组: ${device.groupName})` : '(独立设备)'}`);
        });
      }
      
      // 输出设备组列表
      if (analysisResult.groups.length > 0) {
        console.log('📦 发现的设备组:');
        analysisResult.groups.forEach((group, index) => {
          console.log(`  ${index + 1}. ${group.name} (包含 ${group.deviceCount} 个设备)`);
        });
      }
      
      // 初始化机械臂管理器
      console.log('🤖 初始化机械臂管理器...');
      const robotArmInitResult = robotArmManager.init(equipmentModelData.model);
      if (robotArmInitResult) {
        console.log('✅ 机械臂管理器初始化成功');
      } else {
        console.warn('⚠️ 机械臂管理器初始化失败');
      }
      
      return analysisResult;
    } else {
      console.warn('⚠️ Equipment模型分析失败:', analysisResult.error);
      return analysisResult;
    }
  } catch (error) {
    console.error('❌ 分析equipment模型时出错:', error);
    return {
      success: false,
      error: error.message,
      devices: [],
      groups: []
    };
  }
}

/**
 * 获取场景分析结果
 * @returns {Object} 分析结果摘要
 */
export function getSceneAnalysisResults() {
  return {
    summary: sceneAnalyzer.getAnalysisSummary(),
    devices: sceneAnalyzer.getDeviceTypesList ? sceneAnalyzer.getDeviceTypesList() : [],
    groups: sceneAnalyzer.getDeviceGroupsTypesList ? sceneAnalyzer.getDeviceGroupsTypesList() : []
  };
}

/**
 * 重置场景分析
 */
export function resetSceneAnalysis() {
  sceneAnalyzer.reset();
  console.log('🔄 场景分析已重置');
}

/**
 * 测试模型查找功能
 * @param {Array} models - 已加载的模型数组
 * @param {string} modelName - 要查找的模型名称
 */
export function testModelFinding(models, modelName = 'equipment') {
  console.log(`🧪 测试模型查找功能 - 查找模型: "${modelName}"`);
  
  // 列出所有可用模型名称
  console.log('📋 所有可用模型名称:');
  modelNames.forEach((name, index) => {
    console.log(`  ${index + 1}. "${name}"`);
  });
  
  // 从模型数组中查找指定模型
  const modelIndex = modelNames.indexOf(modelName);
  
  if (modelIndex === -1) {
    console.log(`❌ 未找到模型名称: "${modelName}"`);
    console.log('💡 建议检查模型名称是否正确，或使用上面列出的可用模型名称');
    return null;
  }
  
  const modelData = models[modelIndex];
  
  if (!modelData || !modelData.model) {
    console.log(`❌ 模型数据无效: "${modelName}"`);
    return null;
  }
  
  console.log(`✅ 成功找到模型: "${modelName}"`);
  console.log(`   - 模型名称: "${modelName}"`);
  console.log(`   - 模型类型: ${modelData.model.type}`);
  console.log(`   - 子对象数量: ${modelData.model.children.length}`);
  console.log(`   - 模型路径: ${modelData.modelPath}`);
  
  return {
    name: modelName,
    model: modelData.model,
    modelData: modelData
  };
}

/**
 * 分析Line模型结构并初始化路径管理器
 * @param {Array} models - 模型数据数组
 * @returns {Promise<Object>} 分析结果
 */
export async function analyzeLineModel(models) {
  console.log('🛤️ 开始分析Line模型结构...');
  // 从模型数组中查找line模型
  const lineModelIndex = modelNames.indexOf('line');
  
  if (lineModelIndex === -1) {
    console.warn('⚠️ 未找到line模型名称');
    return {
      success: false,
      error: '未找到line模型名称',
      paths: []
    };
  }
  
  const lineModelData = models[lineModelIndex];
  
  if (!lineModelData || !lineModelData.model) {
    console.warn('⚠️ line模型数据无效');
    return {
      success: false,
      error: 'line模型数据无效',
      paths: []
    };
  }
  
  console.log(`✅ 找到line模型数据，模型名称: line`);
  
  // 查找 glb_tex 模型并收集其材质
  const glbTexModelIndex = modelNames.indexOf('glb_tex');
  if (glbTexModelIndex !== -1) {
    const glbTexModelData = models[glbTexModelIndex];
    if (glbTexModelData && glbTexModelData.model) {
      console.log('🎨 开始收集 glb_tex 模型的材质...');
      glbTexMaterials = [];
      
      glbTexModelData.model.traverse((child) => {
        if (child.isMesh && child.material) {
          // 处理单个材质
          if (child.material.map) {
            // 确保纹理可以重复
            child.material.map.wrapS = THREE.RepeatWrapping;
            child.material.map.wrapT = THREE.RepeatWrapping;
            glbTexMaterials.push({
              material: child.material,
              map: child.material.map
            });
            console.log(`  ✅ 找到材质，纹理: ${child.material.map.image ? child.material.map.image.src : 'N/A'}`);
          }
          
          // 处理材质数组
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat && mat.map) {
                mat.map.wrapS = THREE.RepeatWrapping;
                mat.map.wrapT = THREE.RepeatWrapping;
                glbTexMaterials.push({
                  material: mat,
                  map: mat.map
                });
                console.log(`  ✅ 找到材质（数组），纹理: ${mat.map.image ? mat.map.image.src : 'N/A'}`);
              }
            });
          }
        }
      });
      
      console.log(`🎨 共收集到 ${glbTexMaterials.length} 个材质用于流动效果`);
    }
  }
  
  try {
    // 检查是否为OBJ文件
    const isOBJFile = lineModelData.modelPath.toLowerCase().endsWith('.obj');
    
    if (isOBJFile) {
      // 对于OBJ文件，使用init方法初始化
      console.log('🛤️ 检测到OBJ文件，初始化路径管理器...');
      const pathInitResult = await pathManager.init(lineModelData.modelPath);
      
      if (pathInitResult) {
        console.log('✅ OBJ路径解析成功');
        
        // 获取路径信息
        const pathNames = pathManager.getAllPathNames();
        const pathData = pathManager.getAllPathData();
        
        console.log(`📊 路径分析结果:`);
        console.log(`  - 路径数量: ${pathNames.length}`);
        console.log(`  - 路径名称: [${pathNames.join(', ')}]`);
        
        if (pathData.length > 0) {
          console.log('🛤️ 发现的路径:');
          pathData.forEach((path, index) => {
            console.log(`  ${index + 1}. ${path.name} (长度: ${path.length.toFixed(2)}, 点数: ${path.points.length})`);
          });
        }
        
        return {
          success: true,
          paths: pathData,
          pathNames: pathNames,
          totalPaths: pathNames.length
        };
      } else {
        console.warn('⚠️ OBJ路径解析失败，未找到路径数据');
        return {
          success: false,
          error: 'OBJ路径解析失败，未找到路径数据',
          paths: []
        };
      }
    } else {
      // 对于GLB文件，使用init方法初始化
      console.log('🛤️ 初始化路径管理器...');
      const pathInitResult = await pathManager.init(lineModelData.model);
      if (pathInitResult) {
        console.log('✅ 路径管理器初始化成功');
        
        // 获取路径信息
        const pathNames = pathManager.getAllPathNames();
        const pathData = pathManager.getAllPathData();
        
        console.log(`📊 路径分析结果:`);
        console.log(`  - 路径数量: ${pathNames.length}`);
        console.log(`  - 路径名称: [${pathNames.join(', ')}]`);
        
        if (pathData.length > 0) {
          console.log('🛤️ 发现的路径:');
          pathData.forEach((path, index) => {
            console.log(`  ${index + 1}. ${path.name} (长度: ${path.length.toFixed(2)}, 点数: ${path.points.length})`);
          });
        }
        
        return {
          success: true,
          paths: pathData,
          pathNames: pathNames,
          totalPaths: pathNames.length
        };
      } else {
        console.warn('⚠️ 路径管理器初始化失败');
        return {
          success: false,
          error: '路径管理器初始化失败',
          paths: []
        };
      }
    }
  } catch (error) {
    console.error('❌ 分析line模型时出错:', error);
    return {
      success: false,
      error: error.message,
      paths: []
    };
  }
}
