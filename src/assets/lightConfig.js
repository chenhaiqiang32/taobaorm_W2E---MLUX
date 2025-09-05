/**
 * 灯光配置文件
 * 定义场景中所有灯光的配置参数
 */

import * as THREE from "three";

export const lightConfig = [
  // 环境光配置
  {
    type: "ambient",
    name: "ambient",
    color: 0xffffff,
    intensity: 0.8,
    enabled: true,
  },

  // 主要平行光配置
  {
    type: "directional",
    name: "main",
    position: { x: -67.443, y: 24.754, z: 0.549 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 1,
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
      normalBias: 0.02,
    },
  },

  // 填充光配置
  {
    type: "directional",
    name: "fill",
    position: { x: 75.928, y: 20.648, z: -2.128 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 1,
    enabled: true,
    castShadow: false,
  },

  // 背光配置
  {
    type: "directional",
    name: "back",
    position: { x: 0, y: 5, z: -10 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 0.2,
    enabled: false,
    castShadow: false,
  },

  // 点光源配置
  {
    type: "point",
    name: "point1",
    position: { x: 5, y: 3, z: 5 },
    color: 0xffaa00,
    intensity: 0.8,
    distance: 20,
    decay: 2,
    enabled: false,
    castShadow: true,
    shadow: {
      mapSize: 1024,
      near: 0.1,
      far: 20,
      bias: -0.001,
      normalBias: 0.02,
    },
  },

  // 聚光灯配置
  {
    type: "spot",
    name: "spot1",
    position: { x: -5, y: 8, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 0.6,
    distance: 25,
    angle: Math.PI / 6, // 30度
    penumbra: 0.2,
    decay: 1,
    enabled: false,
    castShadow: true,
    shadow: {
      mapSize: 1024,
      near: 0.1,
      far: 25,
      bias: -0.001,
      normalBias: 0.02,
    },
  },

  // 半球光配置
  {
    type: "hemisphere",
    name: "hemisphere",
    position: { x: 0, y: 10, z: 0 },
    skyColor: 0x87ceeb,
    groundColor: 0x8b4513,
    intensity: 0.3,
    enabled: false,
  },
];

/**
 * 默认灯光配置
 * 当没有指定配置时使用
 */
export const defaultLightConfig = {
  ambient: {
    type: 'ambient',
    name: 'ambient',
    color: 0xffffff,
    intensity: 0.4,
    enabled: true
  },
  main: {
    type: 'directional',
    name: 'main',
    position: { x: 10, y: 15, z: 10 },
    target: { x: 0, y: 0, z: 0 },
    color: 0xffffff,
    intensity: 1.0,
    enabled: true,
    castShadow: true,
    shadow: {
      mapSize: 2048,
      near: 0.5,
      far: 50,
      left: -10,
      right: 10,
      top: 10,
      bottom: -10,
      bias: -0.001,
      normalBias: 0.02
    }
  }
};

/**
 * 获取灯光配置
 * @param {string} name - 灯光名称
 * @returns {Object|null} 灯光配置对象
 */
export function getLightConfig(name) {
  return lightConfig.find(light => light.name === name) || null;
}

/**
 * 获取启用的灯光配置
 * @returns {Array} 启用的灯光配置数组
 */
export function getEnabledLights() {
  return lightConfig.filter(light => light.enabled);
}

/**
 * 根据类型获取灯光配置
 * @param {string} type - 灯光类型
 * @returns {Array} 指定类型的灯光配置数组
 */
export function getLightsByType(type) {
  return lightConfig.filter(light => light.type === type && light.enabled);
}

/**
 * 根据模型位置动态调整灯光配置
 * @param {THREE.Vector3} modelCenter - 模型中心点
 * @param {number} modelRadius - 模型半径
 * @param {THREE.Vector3} sceneOffset - 场景偏移量
 * @returns {Array} 调整后的灯光配置
 */
export function getAdjustedLightConfig(modelCenter, modelRadius, sceneOffset = new THREE.Vector3(0, 0, 0)) {
  // 计算灯光距离
  const lightDistance = modelRadius * 3;
  
  // 调整后的中心点
  const adjustedCenter = new THREE.Vector3(
    modelCenter.x + sceneOffset.x,
    modelCenter.y,
    modelCenter.z
  );

  // 获取静态配置中的启用状态
  const staticConfig = lightConfig.reduce((acc, light) => {
    acc[light.name] = light.enabled;
    return acc;
  }, {});

  return [
    // 环境光配置
    {
      type: 'ambient',
      name: 'ambient',
      color: 0xffffff,
      intensity: 0.4,
      enabled: staticConfig.ambient || false
    },
    
    // 主要平行光配置 - 根据模型位置调整
    {
      type: 'directional',
      name: 'main',
      position: {
        x: adjustedCenter.x + lightDistance,
        y: adjustedCenter.y + lightDistance,
        z: adjustedCenter.z + lightDistance
      },
      target: {
        x: adjustedCenter.x,
        y: adjustedCenter.y,
        z: adjustedCenter.z
      },
      color: 0xffffff,
      intensity: 1.2,
      enabled: staticConfig.main || false,
      castShadow: true,
      shadow: {
        mapSize: 2048,
        near: 0.5,
        far: lightDistance * 3,
        left: -modelRadius * 2,
        right: modelRadius * 2,
        top: modelRadius * 2,
        bottom: -modelRadius * 2,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    
    // 填充光配置 - 根据模型位置调整
    {
      type: 'directional',
      name: 'fill',
      position: {
        x: adjustedCenter.x - lightDistance * 0.5,
        y: adjustedCenter.y + lightDistance * 0.5,
        z: adjustedCenter.z + lightDistance * 0.5
      },
      target: {
        x: adjustedCenter.x,
        y: adjustedCenter.y,
        z: adjustedCenter.z
      },
      color: 0xffffff,
      intensity: 0.3,
      enabled: staticConfig.fill || false,
      castShadow: false
    },
    
    // 背光配置 - 根据模型位置调整
    {
      type: 'directional',
      name: 'back',
      position: {
        x: adjustedCenter.x,
        y: adjustedCenter.y + lightDistance * 0.3,
        z: adjustedCenter.z - lightDistance * 0.8
      },
      target: {
        x: adjustedCenter.x,
        y: adjustedCenter.y,
        z: adjustedCenter.z
      },
      color: 0xffffff,
      intensity: 0.2,
      enabled: staticConfig.back || false,
      castShadow: false
    },
    
    // 点光源配置 - 根据模型位置调整
    {
      type: 'point',
      name: 'point1',
      position: {
        x: adjustedCenter.x + modelRadius * 0.8,
        y: adjustedCenter.y + modelRadius * 0.5,
        z: adjustedCenter.z + modelRadius * 0.8
      },
      color: 0xffaa00,
      intensity: 0.8,
      distance: lightDistance * 0.7,
      decay: 2,
      enabled: staticConfig.point1 || false,
      castShadow: true,
      shadow: {
        mapSize: 1024,
        near: 0.1,
        far: lightDistance * 0.7,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    
    // 聚光灯配置 - 根据模型位置调整
    {
      type: 'spot',
      name: 'spot1',
      position: {
        x: adjustedCenter.x - modelRadius * 0.8,
        y: adjustedCenter.y + lightDistance * 0.6,
        z: adjustedCenter.z
      },
      target: {
        x: adjustedCenter.x,
        y: adjustedCenter.y,
        z: adjustedCenter.z
      },
      color: 0xffffff,
      intensity: 0.6,
      distance: lightDistance * 0.8,
      angle: Math.PI / 6, // 30度
      penumbra: 0.2,
      decay: 1,
      enabled: staticConfig.spot1 || false,
      castShadow: true,
      shadow: {
        mapSize: 1024,
        near: 0.1,
        far: lightDistance * 0.8,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    
    // 半球光配置 - 根据模型位置调整
    {
      type: 'hemisphere',
      name: 'hemisphere',
      position: {
        x: adjustedCenter.x,
        y: adjustedCenter.y + lightDistance * 0.7,
        z: adjustedCenter.z
      },
      skyColor: 0x87ceeb,
      groundColor: 0x8b4513,
      intensity: 0.3,
      enabled: staticConfig.hemisphere || false
    }
  ];
}
