生成一个控制机械臂模型沿着线条模型路径移动的功能：
第一步：加载模型名称为"equipment"的模型后，提取名称为“Mesh_Group_3”的children下foreach找到名称包含“Mesh_equipment_jxs”的组，将找到的组按照名称最后“_”后的编号存储到本地 例如：例如name为Mesh_equipment_jxs_03那么存储的为{03:模型}
第二步：加载模型名称为“Line”的模型后，利用three.js CatmullRomCurve3 生成样条曲线后，按照mesh名称最后一个“_”后的名称存储到本地，例如 “Path_Lin_D-M”按照 “D-M”：样条曲线
第三步：当前端界面通过message推送{model:'03',line:“D-M”}这样的数据后，三维接受到message通知后，控制 第一步中存储的03对应的模型沿着步骤二中“D-M” 对应的样条曲线平滑的从起点移动到终点