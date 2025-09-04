const config = {
  defaultCameraPosition: {
    type: "model", // "model" 或 "position"
    name: "equipment", // 当 type 为 "model" 时，指定模型名称

    // 当 type 为 "model" 时，相机位置偏移量（相对于模型包围盒中心）
    // 偏移量 = 模型包围盒半径 * 变量
    offset: {
      x: 0, // 相机X位置 = 模型中心X + (模型半径 * 6)
      y: 0.1, // 相机Y位置 = 模型中心Y + (模型半径 * 2)
      z: 0.64, // 相机Z位置 = 模型中心Z + (模型半径 * 6)
    },

    // 当 type 为 "position" 时，使用以下配置
    // type: "position",
    // position: { x: 0, y: 14, z: 24 },
    // lookAt: { x: 0, y: 0, z: 0 },
  },
};

export default config;
