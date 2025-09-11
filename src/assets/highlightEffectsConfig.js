/**
 * 醒目效果配置文件
 * 定义围栏、流光等醒目效果的参数和配置
 */

import * as THREE from "three";

/**
 * 醒目效果配置
 */
export const HIGHLIGHT_EFFECTS_CONFIG = {
  // 发光效果配置
  glow: {
    // 基础配置
    enabled: true,
    type: 'glow',
    
    // 发光样式
    color: 0x00ff88,           // 发光颜色（青绿色）
    intensity: 3.0,            // 增加发光强度，保持可见性
    opacity: 0.9,              // 增加透明度，保持可见性
    size: 1.5,                 // 保持发光尺寸倍数
    
    // 流动样式
    flowPattern: 'wave',       // 流动模式 ('wave', 'energy', 'particle')
    flowDensity: 1.5,          // 降低流动密度，使效果更柔和
    flowContrast: 1.2,         // 降低流动对比度，使过渡更平滑
    
    // 动画配置
    animation: {
      enabled: true,
      speed: 0.3,              // 降低整体动画速度
      pulse: true,             // 是否脉冲
      pulseSpeed: 0.5,         // 降低脉冲速度
      breathe: true,           // 是否呼吸效果
      breatheSpeed: 0.3,       // 降低呼吸速度
      flow: true,              // 是否流动效果
      flowSpeed: 0.4,          // 降低流动速度
      flowDirection: 1,        // 流动方向 (1: 向上, -1: 向下)
    },
    
    // 位置配置
    position: {
      offsetY: 0.02,           // Y轴偏移（贴近地面）
      expandRatio: 1.1,        // 扩展比例（相对于包围盒）
    }
  },

  // 围栏效果配置
  fence: {
    // 基础配置
    enabled: true,
    type: 'fence', // 'fence' | 'stream' | 'both'
    
    // 围栏样式
    color: 0x00ff88,           // 围栏颜色（青绿色）
    opacity: 0.8,              // 透明度
    height: 2.0,               // 围栏高度
    thickness: 0.1,            // 围栏厚度
    segments: 32,              // 围栏分段数
    
    // 动画配置
    animation: {
      enabled: true,
      speed: 1.0,              // 动画速度
      direction: 1,            // 动画方向 (1: 顺时针, -1: 逆时针)
      pulse: true,             // 是否脉冲
      pulseSpeed: 2.0,         // 脉冲速度
    },
    
    // 位置配置
    position: {
      offsetY: 0.1,            // Y轴偏移
      expandRatio: 1.2,        // 扩展比例（相对于包围盒）
    }
  },
  
  // 流光效果配置
  stream: {
    // 基础配置
    enabled: true,
    type: 'stream',
    
    // 流光样式
    color: 0xff6600,           // 流光颜色（橙色）
    opacity: 0.9,              // 透明度
    width: 0.05,               // 流光宽度
    length: 0.3,               // 流光长度
    
    // 动画配置
    animation: {
      enabled: true,
      speed: 3.0,              // 流光移动速度
      count: 8,                // 流光数量
      interval: 0.5,           // 流光间隔
    },
    
    // 位置配置
    position: {
      offsetY: 0.2,            // Y轴偏移
      expandRatio: 1.1,        // 扩展比例
    }
  },
  
  // 设备专用配置
  device: {
    glow: {
      color: 0x0088ff,         // 蓝色发光
      intensity: 4.0,          // 增加设备发光强度
      size: 1.8,               // 保持设备发光尺寸
      flowPattern: 'energy',   // 能量流动模式
      flowDensity: 2.0,        // 降低设备流动密度
      flowContrast: 1.8,       // 降低设备流动对比度
      position: {
        offsetY: 0.01,         // 设备贴近地面偏移
        expandRatio: 1.4,      // 保持设备扩展比例
      },
      animation: {
        enabled: true,         // 确保动画启用
        speed: 0.4,            // 降低设备整体动画速度
        pulseSpeed: 0.6,       // 降低设备脉冲速度
        breatheSpeed: 0.4,     // 降低设备呼吸速度
        flowSpeed: 0.5,        // 降低设备流动速度
        flowDirection: 1,      // 向上流动
      }
    }
  },
  
  // 设备组专用配置
  group: {
    glow: {
      color: 0xff8800,         // 橙色发光
      intensity: 5.0,          // 增加设备组发光强度
      size: 2.0,               // 保持设备组发光尺寸
      flowPattern: 'wave',     // 波浪流动模式
      flowDensity: 1.8,        // 降低设备组流动密度
      flowContrast: 1.6,       // 降低设备组流动对比度
      position: {
        offsetY: 0.015,        // 设备组贴近地面偏移
        expandRatio: 1.5,      // 保持设备组扩展比例
      },
      animation: {
        enabled: true,         // 确保动画启用
        speed: 0.3,            // 降低设备组整体动画速度
        pulseSpeed: 0.5,       // 降低设备组脉冲速度
        breatheSpeed: 0.3,     // 降低设备组呼吸速度
        flowSpeed: 0.4,        // 降低设备组流动速度
        flowDirection: 1,      // 向上流动
      }
    }
  }
};

/**
 * 根据目标类型获取效果配置
 * @param {string} targetType - 目标类型 ('device', 'group')
 * @param {string} effectType - 效果类型 ('glow', 'fence', 'stream')
 * @returns {Object} 效果配置
 */
export function getHighlightEffectConfig(targetType = 'device', effectType = 'glow') {
  const baseConfig = HIGHLIGHT_EFFECTS_CONFIG[effectType];
  const typeConfig = HIGHLIGHT_EFFECTS_CONFIG[targetType]?.[effectType] || {};
  
  return {
    ...baseConfig,
    ...typeConfig
  };
}

/**
 * 创建围栏几何体
 * @param {Object} boundingBox - 包围盒信息
 * @param {Object} config - 围栏配置
 * @returns {THREE.BufferGeometry} 围栏几何体
 */
export function createFenceGeometry(boundingBox, config) {
  // 验证输入参数
  if (!boundingBox || !boundingBox.center || !boundingBox.size) {
    console.warn('无效的包围盒数据');
    return new THREE.BufferGeometry();
  }

  const { center, size } = boundingBox;
  const { height = 2.0, expandRatio = 1.2 } = config;
  
  // 验证尺寸数据
  if (!isFinite(size.x) || !isFinite(size.z) || size.x <= 0 || size.z <= 0) {
    console.warn('无效的包围盒尺寸数据:', size);
    return new THREE.BufferGeometry();
  }
  
  // 计算围栏尺寸
  const fenceWidth = size.x * expandRatio;
  const fenceDepth = size.z * expandRatio;
  const radius = Math.min(fenceWidth, fenceDepth) / 2;
  
  // 使用简单的圆柱几何体作为围栏
  const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
  
  return geometry;
}

/**
 * 创建流光几何体
 * @param {Object} boundingBox - 包围盒信息
 * @param {Object} config - 流光配置
 * @returns {THREE.BufferGeometry} 流光几何体
 */
export function createStreamGeometry(boundingBox, config) {
  // 验证输入参数
  if (!boundingBox || !boundingBox.center || !boundingBox.size) {
    console.warn('无效的包围盒数据');
    return new THREE.BufferGeometry();
  }

  const { center, size } = boundingBox;
  const { width = 0.05, expandRatio = 1.1 } = config;
  
  // 验证尺寸数据
  if (!isFinite(size.x) || !isFinite(size.z) || size.x <= 0 || size.z <= 0) {
    console.warn('无效的包围盒尺寸数据:', size);
    return new THREE.BufferGeometry();
  }
  
  // 计算流光尺寸
  const streamWidth = size.x * expandRatio;
  const streamDepth = size.z * expandRatio;
  
  // 使用简单的环形几何体作为流光
  const geometry = new THREE.RingGeometry(
    Math.min(streamWidth, streamDepth) / 2 - width,
    Math.min(streamWidth, streamDepth) / 2,
    32
  );
  
  // 设置UV坐标
  const uvs = [];
  const vertices = geometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    uvs.push(vertices[i], vertices[i + 2]);
  }
  
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * 创建流光材质
 * @param {Object} config - 流光配置
 * @returns {THREE.ShaderMaterial} 流光材质
 */
export function createStreamMaterial(config) {
  const { color, opacity, animation } = config;
  
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uSpeed: { value: animation.speed },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uSpeed;
      varying vec2 vUv;
      
      void main() {
        float time = uTime * uSpeed;
        float wave = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
        float alpha = wave * uOpacity;
        gl_FragColor = vec4(uColor, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

/**
 * 创建围栏材质
 * @param {Object} config - 围栏配置
 * @returns {THREE.MeshBasicMaterial} 围栏材质
 */
export function createFenceMaterial(config) {
  const { color, opacity } = config;
  
  return new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
  });
}

/**
 * 创建发光几何体（底部一周）
 * @param {Object} boundingBox - 包围盒信息
 * @param {Object} config - 发光配置
 * @returns {THREE.BufferGeometry} 发光几何体
 */
export function createGlowGeometry(boundingBox, config) {
  // 验证输入参数
  if (!boundingBox || !boundingBox.center || !boundingBox.size) {
    console.warn('无效的包围盒数据');
    return new THREE.BufferGeometry();
  }

  const { center, size } = boundingBox;
  const { size: sizeMultiplier = 1.2, expandRatio = 1.1 } = config;
  
  // 验证尺寸数据
  if (!isFinite(size.x) || !isFinite(size.y) || !isFinite(size.z) || 
      size.x <= 0 || size.y <= 0 || size.z <= 0) {
    console.warn('无效的包围盒尺寸数据:', size);
    return new THREE.BufferGeometry();
  }
  
  // 计算底部发光尺寸
  const glowWidth = size.x * expandRatio * sizeMultiplier;
  const glowDepth = size.z * expandRatio * sizeMultiplier;
  const glowHeight = 0.05; // 减少发光高度，让它更贴近地面
  
  // 创建底部圆柱几何体，更明显的效果
  const radius = Math.min(glowWidth, glowDepth) / 2;
  const glowGeometry = new THREE.CylinderGeometry(radius, radius, glowHeight, 32, 1, false);
  
  // 计算UV坐标
  const uvs = [];
  const vertices = glowGeometry.attributes.position.array;
  for (let i = 0; i < vertices.length; i += 3) {
    const x = vertices[i];
    const y = vertices[i + 1];
    const z = vertices[i + 2];
    
    // 计算UV坐标
    const u = (x / radius + 1.0) * 0.5;
    const v = (y / glowHeight + 0.5);
    uvs.push(u, v);
  }
  
  glowGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  glowGeometry.computeVertexNormals();
  
  return glowGeometry;
}

/**
 * 创建发光材质
 * @param {Object} config - 发光配置
 * @returns {THREE.ShaderMaterial} 发光材质
 */
export function createGlowMaterial(config) {
  const { color, intensity = 2.0, opacity = 0.8, animation, flowPattern = 'wave', flowDensity = 3.0, flowContrast = 1.5 } = config;
  
  // 将颜色转换为RGB
  const r = ((color >> 16) & 255) / 255;
  const g = ((color >> 8) & 255) / 255;
  const b = (color & 255) / 255;
  
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Vector3(r, g, b) },
      uIntensity: { value: intensity },
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uSpeed: { value: animation?.speed || 1.0 },
      uPulseSpeed: { value: animation?.pulseSpeed || 2.0 },
      uBreatheSpeed: { value: animation?.breatheSpeed || 1.0 },
      uFlowSpeed: { value: animation?.flowSpeed || 1.0 },
      uFlowDirection: { value: animation?.flowDirection || 1 },
      uFlowDensity: { value: flowDensity },
      uFlowContrast: { value: flowContrast },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uOpacity;
      uniform float uTime;
      uniform float uSpeed;
      uniform float uPulseSpeed;
      uniform float uBreatheSpeed;
      uniform float uFlowSpeed;
      uniform float uFlowDirection;
      uniform float uFlowDensity;
      uniform float uFlowContrast;
      varying vec3 vNormal;
      varying vec3 vPosition;
      varying vec2 vUv;
      
      void main() {
        float time = uTime * uSpeed;
        
        // 脉冲效果 - 提高最小亮度
        float pulse = sin(time * uPulseSpeed) * 0.2 + 0.8; // 范围从 0.6 到 1.0
        
        // 呼吸效果 - 提高最小亮度
        float breathe = sin(time * uBreatheSpeed) * 0.15 + 0.85; // 范围从 0.7 到 1.0
        
        // 流动效果 - 从下往上缓慢流动
        float flowTime = time * uFlowSpeed * 0.5; // 进一步降低流动速度
        float flowY = vUv.y + flowTime * uFlowDirection;
        flowY = mod(flowY, 1.0); // 循环流动
        
        // 创建更柔和的流动效果，使用可配置的密度
        float flowWave1 = sin(flowY * 6.28318 * uFlowDensity) * 0.3 + 0.7; // 减少波动幅度
        float flowWave2 = sin(flowY * 6.28318 * uFlowDensity * 1.5 + 1.0) * 0.2 + 0.8; // 减少第二层波动
        float flowWave3 = sin(flowY * 6.28318 * uFlowDensity * 2.0 + 2.0) * 0.1 + 0.9; // 减少第三层波动
        
        // 组合多层流动效果，使过渡更平滑
        float flowIntensity = (flowWave1 * 0.6 + flowWave2 * 0.3 + flowWave3 * 0.1);
        flowIntensity = pow(flowIntensity, uFlowContrast * 0.8); // 进一步降低对比度
        
        // 添加更柔和的流动亮度变化 - 提高最小亮度
        float flowBrightness = sin(flowY * 6.28318 * uFlowDensity * 0.3 + time * 1.0) * 0.15 + 0.85; // 范围从 0.7 到 1.0
        
        // 添加更柔和的噪点效果
        float noise = sin(flowY * 6.28318 * uFlowDensity * 4.0 + time * 1.5) * 0.05 + 0.95; // 减少噪点强度
        flowIntensity *= noise;
        
        // 径向渐变效果 - 从中间向边缘渐渐扩散
        vec2 center = vec2(0.5, 0.5);
        float distance = length(vUv - center);
        float radialGradient = 1.0 - smoothstep(0.0, 0.7, distance); // 扩大渐变范围
        radialGradient = pow(radialGradient, 0.8); // 增强中心亮度
        
        // 底部边缘发光效果
        float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
        fresnel = pow(fresnel, 1.5); // 减少fresnel强度
        
        // 底部边缘检测 - 增强底部边缘可见性
        float bottomEdge = 1.0 - smoothstep(0.0, 0.3, vUv.y); // 底部30%区域
        float topEdge = smoothstep(0.7, 1.0, vUv.y); // 顶部30%区域
        float edgeGlow = fresnel * (bottomEdge + topEdge) * 1.5; // 减少边缘发光强度
        
        // 组合径向渐变和边缘发光
        float combinedGlow = radialGradient * 0.8 + edgeGlow * 0.2; // 增加径向渐变权重
        
        // 组合效果 - 使用径向渐变和流动效果，提高最小亮度
        float finalIntensity = uIntensity * pulse * breathe * combinedGlow * flowBrightness * (0.85 + 0.15 * flowIntensity); // 提高基础亮度
        float alpha = uOpacity * combinedGlow * pulse * flowBrightness * (0.75 + 0.15 * flowIntensity); // 提高基础透明度
        
        gl_FragColor = vec4(uColor * finalIntensity, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide, // 双面渲染，确保底部边缘可见
    blending: THREE.AdditiveBlending, // 加法混合，增强发光效果
  });
}
