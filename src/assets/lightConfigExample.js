/**
 * 灯光配置使用示例
 * 展示如何使用灯光配置系统
 */

import { LightingManager } from '../components/lightingManager.js';
import { lightConfig, getEnabledLights, getLightConfig } from './lightConfig.js';

/**
 * 使用示例：在场景中设置灯光
 */
export function setupSceneLighting(scene) {
  // 创建灯光管理器
  const lightingManager = new LightingManager();
  
  // 初始化灯光管理器
  lightingManager.init(scene);
  
  // 方法1：使用默认配置加载所有启用的灯光
  lightingManager.loadFromConfig();
  
  // 方法2：使用自定义配置加载灯光
  // const customConfig = [
  //   {
  //     type: 'ambient',
  //     name: 'customAmbient',
  //     color: 0x404040,
  //     intensity: 0.6,
  //     enabled: true
  //   },
  //   {
  //     type: 'directional',
  //     name: 'customMain',
  //     position: { x: 15, y: 20, z: 15 },
  //     target: { x: 0, y: 0, z: 0 },
  //     color: 0xffffff,
  //     intensity: 1.5,
  //     enabled: true,
  //     castShadow: true,
  //     shadow: {
  //       mapSize: 4096,
  //       near: 0.1,
  //       far: 100,
  //       left: -20,
  //       right: 20,
  //       top: 20,
  //       bottom: -20,
  //       bias: -0.0005,
  //       normalBias: 0.01
  //     }
  //   }
  // ];
  // lightingManager.loadFromConfig(customConfig);
  
  return lightingManager;
}

/**
 * 动态调整灯光参数示例
 */
export function adjustLightingDynamically(lightingManager) {
  // 调整主灯光强度
  lightingManager.setLightIntensity('main', 1.5);
  
  // 调整环境光颜色
  lightingManager.setLightColor('ambient', 0x404040);
  
  // 启用/禁用阴影
  lightingManager.setShadowEnabled('main', true);
  
  // 启用/禁用灯光
  lightingManager.setLightEnabled('fill', false);
  
  // 更新灯光配置
  lightingManager.updateLightConfig('main', {
    intensity: 2.0,
    color: 0xffeedd
  });
}

/**
 * 创建特定场景的灯光配置
 */
export function createIndoorLightingConfig() {
  return [
    {
      type: 'ambient',
      name: 'indoorAmbient',
      color: 0x404040,
      intensity: 0.3,
      enabled: true
    },
    {
      type: 'directional',
      name: 'windowLight',
      position: { x: 10, y: 5, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      color: 0xffeedd,
      intensity: 0.8,
      enabled: true,
      castShadow: true,
      shadow: {
        mapSize: 2048,
        near: 0.1,
        far: 30,
        left: -10,
        right: 10,
        top: 10,
        bottom: -10,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    {
      type: 'point',
      name: 'ceilingLight',
      position: { x: 0, y: 8, z: 0 },
      color: 0xffffff,
      intensity: 0.6,
      distance: 15,
      decay: 1,
      enabled: true,
      castShadow: true,
      shadow: {
        mapSize: 1024,
        near: 0.1,
        far: 15,
        bias: -0.001,
        normalBias: 0.02
      }
    }
  ];
}

/**
 * 创建户外场景的灯光配置
 */
export function createOutdoorLightingConfig() {
  return [
    {
      type: 'hemisphere',
      name: 'skyLight',
      position: { x: 0, y: 50, z: 0 },
      skyColor: 0x87ceeb,
      groundColor: 0x8b4513,
      intensity: 0.6,
      enabled: true
    },
    {
      type: 'directional',
      name: 'sunLight',
      position: { x: 20, y: 30, z: 20 },
      target: { x: 0, y: 0, z: 0 },
      color: 0xffeedd,
      intensity: 1.2,
      enabled: true,
      castShadow: true,
      shadow: {
        mapSize: 4096,
        near: 0.1,
        far: 100,
        left: -30,
        right: 30,
        top: 30,
        bottom: -30,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    {
      type: 'spot',
      name: 'streetLight',
      position: { x: 0, y: 10, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      color: 0xffeedd,
      intensity: 0.4,
      distance: 20,
      angle: Math.PI / 8,
      penumbra: 0.3,
      decay: 1,
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
  ];
}

/**
 * 创建夜景场景的灯光配置
 */
export function createNightLightingConfig() {
  return [
    {
      type: 'ambient',
      name: 'nightAmbient',
      color: 0x001122,
      intensity: 0.1,
      enabled: true
    },
    {
      type: 'hemisphere',
      name: 'nightSky',
      position: { x: 0, y: 50, z: 0 },
      skyColor: 0x001122,
      groundColor: 0x000011,
      intensity: 0.2,
      enabled: true
    },
    {
      type: 'point',
      name: 'moonLight',
      position: { x: 0, y: 100, z: 0 },
      color: 0x8899aa,
      intensity: 0.3,
      distance: 200,
      decay: 1,
      enabled: true,
      castShadow: true,
      shadow: {
        mapSize: 2048,
        near: 0.1,
        far: 200,
        bias: -0.001,
        normalBias: 0.02
      }
    },
    {
      type: 'spot',
      name: 'buildingLight',
      position: { x: 0, y: 20, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      color: 0xffaa00,
      intensity: 0.8,
      distance: 30,
      angle: Math.PI / 6,
      penumbra: 0.2,
      decay: 1,
      enabled: true,
      castShadow: true,
      shadow: {
        mapSize: 1024,
        near: 0.1,
        far: 30,
        bias: -0.001,
        normalBias: 0.02
      }
    }
  ];
}
