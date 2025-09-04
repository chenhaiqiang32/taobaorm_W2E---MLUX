/**
 * 模型列表生成器
 * 自动扫描 public/models/ 目录下的所有 .glb 模型文件
 * 生成包含模型文件名、访问路径和数量的 JavaScript 模块文件
 *
 * 生成的文件位置: src/assets/modelList.js
 * 该文件可以被其他模块导入使用
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 获取当前文件的绝对路径和目录路径
// 由于使用 ES6 模块，需要使用 fileURLToPath 来获取 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 定义目录和文件路径
const modelsDir = path.join(__dirname, "public/models"); // 模型文件存储目录
const outputFile = path.join(__dirname, "src/assets/modelList.js"); // 输出文件路径

// 输出脚本执行信息
console.log("=== 开始生成模型列表 ===");
console.log("当前工作目录:", __dirname);
console.log("模型目录:", modelsDir);
console.log("输出文件:", outputFile);

try {
  // 第一步：验证模型目录是否存在
  // 如果目录不存在，脚本将无法继续执行
  if (!fs.existsSync(modelsDir)) {
    console.error(`错误: 目录 ${modelsDir} 不存在`);
    console.error("请确保 public/models/ 目录存在并包含模型文件");
    process.exit(1); // 退出程序，返回错误代码 1
  }

  // 第二步：读取模型目录中的所有文件
  // 获取目录中所有文件和子目录的名称
  const allFiles = fs.readdirSync(modelsDir);

  console.log("模型目录中的所有文件:", allFiles);

  // 第三步：过滤出 .glb 模型文件
  // 只保留以 .glb 结尾的文件（不区分大小写）
  const modelFiles = allFiles.filter((file) => file.endsWith(".glb"));

  // 检查是否找到了模型文件
  if (modelFiles.length === 0) {
    console.warn("警告: 没有找到 .glb 文件");
    console.warn("请确保 models/ 目录中包含 .glb 格式的模型文件");
  }

  // 第四步：生成模型访问路径数组
  // 路径格式: ./models/filename.glb
  // 这些路径相对于 public 目录，可以直接在 Three.js 中使用
  const modelPaths = modelFiles.map((file) => `./models/${file}`);

  // 第五步：生成 JavaScript 模块文件内容
  // 文件包含：
  // - modelFiles: 模型文件名数组（不含路径）
  // - modelPaths: 模型访问路径数组（包含相对路径）
  // - modelCount: 模型总数
  const content = `// 这个文件是自动生成的，请勿手动修改
// 生成时间: ${new Date().toLocaleString()}
// 模型文件总数: ${modelFiles.length}

// 模型文件名列表（不含路径和后缀）
// 用途：显示模型名称、生成UI标签等
export const modelFiles = ${JSON.stringify(modelFiles, null, 2)};

// 模型访问路径数组（包含相对路径）
// 用途：在 Three.js 中加载模型、生成下载链接等
// 路径格式: ./models/filename.glb
export const modelPaths = ${JSON.stringify(modelPaths, null, 2)};

// 模型总数
// 用途：循环遍历、验证索引范围、显示统计信息等
export const modelCount = ${modelFiles.length};

// 模型名称数组（去除 .glb 后缀）
// 用途：显示友好的模型名称、生成选择器选项等
export const modelNames = ${JSON.stringify(
    modelFiles.map((file) => file.replace(".glb", "")),
    null,
    2
  )};
`;

  // 第六步：确保输出目录存在
  // 如果 src/assets/ 目录不存在，则创建它
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    console.log("创建输出目录:", outputDir);
    fs.mkdirSync(outputDir, { recursive: true }); // recursive: true 允许创建多层目录
  }

  // 第七步：写入生成的 JavaScript 文件
  // 使用同步写入确保文件完全写入后再继续
  fs.writeFileSync(outputFile, content);

  // 第八步：输出成功信息和统计摘要
  console.log("✅ 模型列表已生成到:", outputFile);
  console.log("📋 找到的模型文件:", modelFiles);
  console.log("📋 生成的模型路径:", modelPaths);
  console.log("📋 模型总数:", modelFiles.length);
  console.log(
    "📋 模型名称:",
    modelFiles.map((file) => file.replace(".glb", ""))
  );
  console.log("=== 模型列表生成完成 ===");
} catch (error) {
  // 错误处理：捕获并显示详细的错误信息
  console.error("❌ 生成模型列表时出错:", error);
  console.error("错误详情:", error.stack);
  console.error("请检查：");
  console.error("1. 文件系统权限是否正确");
  console.error("2. 目录路径是否正确");
  console.error("3. 是否有足够的磁盘空间");
  process.exit(1); // 退出程序，返回错误代码 1
}
