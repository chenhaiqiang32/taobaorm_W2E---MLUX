// 相机位置配置示例文件
// 复制此文件为 config.js 并根据需要修改配置

const config = {
  // 相机位置配置
  defaultCameraPosition: {
    // 配置类型: "model" 或 "position"
    type: "model", // 根据模型自动设置相机位置

    // 当 type 为 "model" 时，指定控制中心模型的名称
    // 相机将根据该模型的包围盒中心点和半径自动设置位置
    name: "structure", // 使用 "structure" 模型作为控制中心
    
    // 当 type 为 "model" 时，相机位置偏移量（相对于模型包围盒中心）
    // 偏移量 = 模型包围盒半径 * 变量
    offset: {
      x: 6,  // 相机X位置 = 模型中心X + (模型半径 * 6)
      y: 2,  // 相机Y位置 = 模型中心Y + (模型半径 * 2)
      z: 6,  // 相机Z位置 = 模型中心Z + (模型半径 * 6)
    },

    // 当 type 为 "position" 时，使用以下配置（取消注释并修改）
    // type: "position",
    // position: { x: 0, y: 14, z: 24 },    // 相机位置
    // lookAt: { x: 0, y: 0, z: 0 },        // 相机朝向点
  },
};

export default config;
