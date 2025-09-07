/**
 * 射线检测配置文件
 * 定义鼠标事件对应的模型检测配置
 */

/**
 * 鼠标移入射线检测配置
 * 配置格式：
 * {
 *   name: "模型名称",
 *   fun: function(intersects) { ... }, // 移入事件回调
 *   exitFun: function(object) { ... }  // 移出事件回调（可选）
 * }
 */
export const mousemoveConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("鼠标移入 equipment 模型:", intersects);
    },
    exitFun: function (object) {
      console.log("鼠标移出 equipment 模型:", object);
    }
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("鼠标移入 structure 模型:", intersects);
    },
    exitFun: function (object) {
      console.log("鼠标移出 structure 模型:", object);
    }
  },
];

/**
 * 鼠标单击射线检测配置
 */
export const clickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("单击 equipment 模型:", intersects);
    },
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("单击 structure 模型:", intersects);
    },
  }
];

/**
 * 鼠标双击射线检测配置
 */
export const dblclickConfigModels = [
  {
    name: "equipment",
    fun: function (intersects) {
      console.log("双击 equipment 模型:", intersects);
    },
  },
  {
    name: "structure",
    fun: function (intersects) {
      console.log("双击 structure 模型:", intersects);
    },
  }
];