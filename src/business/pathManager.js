/**
 * 路径管理器
 * 负责解析Line模型，生成样条曲线，提供路径查找和管理功能
 */

import * as THREE from 'three';

export class PathManager {
  constructor() {
    // 路径存储 {路径名称: CatmullRomCurve3对象}
    this.paths = new Map();
    
    // 路径数据存储 {路径名称: 路径数据}
    this.pathData = new Map();
    
    // 是否已初始化
    this.isInitialized = false;
    
    console.log('🛤️ PathManager 已创建');
  }

  /**
   * 初始化路径管理器
   * @param {THREE.Object3D|string} lineModelOrPath - Line模型对象或OBJ文件路径
   */
  async init(lineModelOrPath) {
    if (!lineModelOrPath) {
      console.warn('❌ Line模型或路径不存在，无法初始化路径管理器');
      return false;
    }

    console.log('🛤️ 开始初始化路径管理器...');
    
    // 检查是否为文件路径（字符串）
    if (typeof lineModelOrPath === 'string') {
      // 处理OBJ文件路径
      const foundCount = await this.parseOBJFile(lineModelOrPath);
      if (foundCount > 0) {
        this.isInitialized = true;
        console.log(`✅ 路径管理器初始化完成，找到 ${this.paths.size} 条路径`);
        return true;
      } else {
        console.warn('❌ OBJ文件解析失败');
        return false;
      }
    } else {
      // 处理GLB模型对象
      this.parsePaths(lineModelOrPath);
      this.isInitialized = true;
      console.log(`✅ 路径管理器初始化完成，找到 ${this.paths.size} 条路径`);
      return true;
    }
  }

  /**
   * 解析路径模型
   * @param {THREE.Object3D} lineModel - Line模型对象
   */
  parsePaths(lineModel) {
    console.log('🔍 开始解析路径模型...');
    
      let foundCount = 0;
      // 遍历所有子对象
    lineModel.traverse((child) => {
      if (child.isMesh && child.name && child.name.includes('Path_Lin_')) {
        // 提取路径名称（第一个"_"前的部分）
        const parts = child.name.split('_');
        const pathName = parts[0];
        
        if (pathName) {
          console.log(`✅ 找到路径: ${child.name} -> 路径名称: ${pathName}`);
          
          try {
            // 生成样条曲线
            const curve = this.generateSplineCurve(child);
            
            if (curve) {
              // 存储样条曲线
              this.paths.set(pathName, curve);
              
              // 创建路径数据
              const pathData = {
                name: pathName,
                originalName: child.name,
                curve: curve,
                mesh: child,
                length: curve.getLength(),
                points: this.extractPathPoints(child),
                boundingBox: this.calculatePathBoundingBox(child)
              };
              
              this.pathData.set(pathName, pathData);
              foundCount++;
              
              console.log(`  - 路径长度: ${pathData.length.toFixed(2)}`);
              console.log(`  - 路径点数: ${pathData.points.length}`);
            }
          } catch (error) {
            console.error(`❌ 生成路径 ${pathName} 的样条曲线失败:`, error);
          }
        }
      }
    });
    
    // 如果没有找到Path_Lin_开头的mesh，尝试解析OBJ格式的路径数据
    if (foundCount === 0) {
      console.log('🔍 未找到Path_Lin_开头的mesh，尝试解析OBJ格式路径数据...');
      foundCount = this.parseOBJPaths(lineModel);
    }
    
    console.log(`📊 路径解析完成，共找到 ${foundCount} 条路径`);
    this.logPaths();
  }

  /**
   * 解析OBJ格式的路径数据
   * @param {THREE.Object3D} lineModel - Line模型对象
   * @returns {number} 找到的路径数量
   */
  parseOBJPaths(lineModel) {
    console.log('🔍 开始解析OBJ格式路径数据...');
    
    let foundCount = 0;
    
    // 遍历所有子对象，查找包含路径信息的mesh
    lineModel.traverse((child) => {
      if (child.isMesh) {
        // 检查mesh的名称是否包含路径信息
        if (child.name) {
          const parts = child.name.split('_');
          const pathName = parts[0];
          
          if (pathName) {
            console.log(`✅ 找到OBJ路径: ${child.name} -> 路径名称: ${pathName}`);
            
            try {
              // 生成样条曲线
              const curve = this.generateSplineCurve(child);
              
              if (curve) {
                // 存储样条曲线
                this.paths.set(pathName, curve);
                
                // 创建路径数据
                const pathData = {
                  name: pathName,
                  originalName: child.name,
                  curve: curve,
                  mesh: child,
                  length: curve.getLength(),
                  points: this.extractPathPoints(child),
                  boundingBox: this.calculatePathBoundingBox(child)
                };
                
                this.pathData.set(pathName, pathData);
                foundCount++;
                
                console.log(`  - 路径长度: ${pathData.length.toFixed(2)}`);
                console.log(`  - 路径点数: ${pathData.points.length}`);
              }
            } catch (error) {
              console.error(`❌ 生成OBJ路径 ${pathName} 的样条曲线失败:`, error);
            }
          }
        }
      }
    });
    
    // 如果仍然没有找到，尝试从几何体数据中解析
    if (foundCount === 0) {
      console.log('🔍 尝试从几何体数据中解析路径...');
      foundCount = this.parseGeometryPaths(lineModel);
    }
    
    return foundCount;
  }

  /**
   * 从几何体数据中解析路径
   * @param {THREE.Object3D} lineModel - Line模型对象
   * @returns {number} 找到的路径数量
   */
  parseGeometryPaths(lineModel) {
    console.log('🔍 从几何体数据中解析路径...');
    
    let foundCount = 0;
    
    // 遍历所有mesh，尝试从几何体中提取路径信息
    lineModel.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geometry = child.geometry;
        
        // 检查是否有顶点数据
        if (geometry.attributes && geometry.attributes.position) {
          const vertices = geometry.attributes.position.array;
          const vertexCount = vertices.length / 3;
          
          console.log(`🔍 检查mesh: ${child.name}, 顶点数: ${vertexCount}`);
          
          // 如果顶点数大于1，尝试作为路径处理
          if (vertexCount > 1) {
            // 生成路径名称
            const pathName = child.name || `path_${foundCount + 1}`;
            
            console.log(`✅ 从几何体创建路径: ${pathName}`);
            
            try {
              // 生成样条曲线
              const curve = this.generateSplineCurve(child);
              
              if (curve) {
                // 存储样条曲线
                this.paths.set(pathName, curve);
                
                // 创建路径数据
                const pathData = {
                  name: pathName,
                  originalName: child.name,
                  curve: curve,
                  mesh: child,
                  length: curve.getLength(),
                  points: this.extractPathPoints(child),
                  boundingBox: this.calculatePathBoundingBox(child)
                };
                
                this.pathData.set(pathName, pathData);
                foundCount++;
                
                console.log(`  - 路径长度: ${pathData.length.toFixed(2)}`);
                console.log(`  - 路径点数: ${pathData.points.length}`);
              }
            } catch (error) {
              console.error(`❌ 从几何体生成路径 ${pathName} 失败:`, error);
            }
          }
        }
      }
    });
    
    return foundCount;
  }

  /**
   * 直接从OBJ文件解析路径数据
   * @param {string} objUrl - OBJ文件URL
   * @returns {Promise<number>} 找到的路径数量
   */
  async parseOBJFile(objUrl) {
    console.log('🔍 直接从OBJ文件解析路径数据...');
    
    try {
      // 使用fetch加载OBJ文件
      const response = await fetch(objUrl);
      const text = await response.text();
      
      // 解析OBJ文件内容
      const pathData = this.parseOBJText(text);
      debugger;
      let foundCount = 0;
      
      // 为每个路径创建样条曲线
      for (const path of pathData) {
        if (path.vertices.length >= 2) {
          // 提取路径名称第一个"_"前的字符串作为存储名
          const parts = path.name.split('_');
          const storageName = parts[0];
          
          console.log(`✅ 解析路径: ${path.name} -> 存储名: ${storageName}, 顶点数: ${path.vertices.length}`);
          try {
            // 创建样条曲线
            const curve = new THREE.CatmullRomCurve3(path.vertices);
            curve.closed = false;
            
            // 计算路径长度，确定均匀分布的点数
            const pathLength = curve.getLength();
            const uniformPointCount = Math.max(50, Math.floor(pathLength * 2));
            
            // 生成均匀分布的点
            const uniformPoints = curve.getPoints(uniformPointCount);
            
            // 创建新的样条曲线，使用均匀分布的点
            const uniformCurve = new THREE.CatmullRomCurve3(uniformPoints);
            uniformCurve.closed = false;
            
            // 添加自定义方法，确保匀速运动
            uniformCurve.getUniformPoint = function(t) {
              return this.getPoint(t);
            };
            
            uniformCurve.getUniformTangent = function(t) {
              return this.getTangent(t);
            };
            
            // 存储样条曲线，使用提取的存储名
            this.paths.set(storageName, uniformCurve);
            
            // 创建路径数据
            const pathInfo = {
              name: storageName, // 使用提取的存储名
              originalName: path.name, // 保留原始名称
              curve: uniformCurve,
              mesh: null, // OBJ文件没有mesh对象
              length: uniformCurve.getLength(),
              points: path.vertices.map(v => ({ x: v.x, y: v.y, z: v.z })),
              boundingBox: this.calculatePathBoundingBoxFromVertices(path.vertices)
            };
            
            // 存储路径数据，使用提取的存储名
            this.pathData.set(storageName, pathInfo);
            foundCount++;
            
            console.log(`  - 存储名: ${storageName}`);
            console.log(`  - 路径长度: ${pathInfo.length.toFixed(2)}`);
            console.log(`  - 路径点数: ${pathInfo.points.length}`);
            console.log(`  - 均匀点数: ${uniformPointCount}`);
            
          } catch (error) {
            console.error(`❌ 生成路径 ${path.name} 的样条曲线失败:`, error);
          }
        }
      }
      
      console.log(`📊 OBJ文件解析完成，共找到 ${foundCount} 条路径`);
      return foundCount;
      
    } catch (error) {
      console.error('❌ 解析OBJ文件时出错:', error);
      return 0;
    }
  }

  /**
   * 解析OBJ文件文本内容
   * @param {string} text - OBJ文件内容
   * @returns {Array} 路径数据数组
   */
  parseOBJText(text) {
    // 处理换行符
    if (text.indexOf("\n") !== -1) {
      text = text.replace(/\r\n\s+/g, "\n");
    }

    if (text.indexOf("\\\n") !== -1) {
      text = text.replace(/\\\n/g, "");
    }

    const lines = text.split("\n");
    const result = [];
    let currentPath = null;
    let allVertices = []; // 全局顶点数组，用于索引查找
    let currentPathVertices = []; // 当前路径的顶点数组

    for (let i = 0, l = lines.length; i < l; i++) {
      let line = lines[i].trim();
      
      if (line.length === 0) continue;

      const lineFirstChar = line.charAt(0);

      if (lineFirstChar === "o") {
        // 新的对象开始，先保存之前的路径
        if (currentPath && currentPathVertices.length > 0) {
          currentPath.vertices = [...currentPathVertices];
          result.push(currentPath);
        }
        
        const name = line.split(/\s+/)[1];
        currentPath = { name, vertices: [] };
        currentPathVertices = []; // 重置当前路径的顶点数组
        
      } else if (lineFirstChar === "v") {
        // 顶点数据
        const data = line.split(/\s+/);
        const vertex = new THREE.Vector3(
          parseFloat(data[1]), 
          parseFloat(data[2]), 
          parseFloat(data[3])
        );
        allVertices.push(vertex); // 添加到全局顶点数组
        
      } else if (lineFirstChar === "l") {
        // 线条数据，根据索引获取顶点
        if (currentPath) {
          const data = line.split(/\s+/);
          
          for (let j = 1; j < data.length; j++) {
            const index = parseInt(data[j]) - 1; // 转换为0基索引
            if (index >= 0 && index < allVertices.length) {
              // 将顶点添加到当前路径的顶点数组
              currentPathVertices.push(allVertices[index]);
            }
          }
        }
      }
    }

    // 添加最后一个路径
    if (currentPath && currentPathVertices.length > 0) {
      currentPath.vertices = [...currentPathVertices];
      result.push(currentPath);
    }

    console.log('🔍 OBJ解析结果:', result.map(p => ({ name: p.name, vertexCount: p.vertices.length })));
    return result;
  }

  /**
   * 从顶点数组计算包围盒
   * @param {Array<THREE.Vector3>} vertices - 顶点数组
   * @returns {Object} 包围盒数据
   */
  calculatePathBoundingBoxFromVertices(vertices) {
    if (vertices.length === 0) {
      return {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 0, y: 0, z: 0 },
        center: { x: 0, y: 0, z: 0 },
        size: { x: 0, y: 0, z: 0 }
      };
    }

    let minX = vertices[0].x, maxX = vertices[0].x;
    let minY = vertices[0].y, maxY = vertices[0].y;
    let minZ = vertices[0].z, maxZ = vertices[0].z;

    for (const vertex of vertices) {
      minX = Math.min(minX, vertex.x);
      maxX = Math.max(maxX, vertex.x);
      minY = Math.min(minY, vertex.y);
      maxY = Math.max(maxY, vertex.y);
      minZ = Math.min(minZ, vertex.z);
      maxZ = Math.max(maxZ, vertex.z);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    return {
      min: { x: minX, y: minY, z: minZ },
      max: { x: maxX, y: maxY, z: maxZ },
      center: { x: centerX, y: centerY, z: centerZ },
      size: { x: maxX - minX, y: maxY - minY, z: maxZ - minZ }
    };
  }

  /**
   * 生成样条曲线
   * @param {THREE.Mesh} mesh - 路径mesh对象
   * @returns {THREE.CatmullRomCurve3|null} 样条曲线对象
   */
  generateSplineCurve(mesh) {
    try {
      // 提取顶点数据
      const vertices = mesh.geometry.attributes.position.array;
      const originalPoints = [];
      
      // 将顶点数据转换为Vector3点数组
      for (let i = 0; i < vertices.length; i += 3) {
        const point = new THREE.Vector3(
          vertices[i],
          vertices[i + 1],
          vertices[i + 2]
        );
        originalPoints.push(point);
      }
      
      if (originalPoints.length < 2) {
        console.warn('❌ 路径点数不足，无法生成样条曲线');
        return null;
      }
      
      // 创建初始CatmullRomCurve3样条曲线
      const initialCurve = new THREE.CatmullRomCurve3(originalPoints);
      initialCurve.closed = false;
      
      // 计算路径长度，确定均匀分布的点数
      const pathLength = initialCurve.getLength();
      const uniformPointCount = Math.max(50, Math.floor(pathLength * 2)); // 每单位长度2个点，最少50个点
      
      console.log(`📏 路径长度: ${pathLength.toFixed(2)}, 生成 ${uniformPointCount} 个均匀分布点`);
      
      // 生成均匀分布的点
      const uniformPoints = initialCurve.getPoints(uniformPointCount);
      
      // 创建新的样条曲线，使用均匀分布的点
      const uniformCurve = new THREE.CatmullRomCurve3(uniformPoints);
      uniformCurve.closed = false;
      
      // 添加自定义方法，确保匀速运动
      uniformCurve.getUniformPoint = function(t) {
        // t 是 0-1 的参数，直接使用 getPoint 即可，因为点已经均匀分布
        return this.getPoint(t);
      };
      
      uniformCurve.getUniformTangent = function(t) {
        // 获取均匀分布的切线
        return this.getTangent(t);
      };
      
      console.log(`✅ 成功生成均匀分布样条曲线，原始点: ${originalPoints.length}, 均匀点: ${uniformPoints.length}`);
      return uniformCurve;
      
    } catch (error) {
      console.error('❌ 生成样条曲线时出错:', error);
      return null;
    }
  }

  /**
   * 提取路径点
   * @param {THREE.Mesh} mesh - 路径mesh对象
   * @returns {Array} 路径点数组
   */
  extractPathPoints(mesh) {
    const vertices = mesh.geometry.attributes.position.array;
    const points = [];
    
    for (let i = 0; i < vertices.length; i += 3) {
      points.push({
        x: vertices[i],
        y: vertices[i + 1],
        z: vertices[i + 2]
      });
    }
    
    return points;
  }

  /**
   * 计算路径的包围盒
   * @param {THREE.Mesh} mesh - 路径mesh对象
   * @returns {Object} 包围盒数据
   */
  calculatePathBoundingBox(mesh) {
    const box = new THREE.Box3().setFromObject(mesh);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    return {
      min: {
        x: box.min.x,
        y: box.min.y,
        z: box.min.z
      },
      max: {
        x: box.max.x,
        y: box.max.y,
        z: box.max.z
      },
      center: {
        x: center.x,
        y: center.y,
        z: center.z
      },
      size: {
        x: size.x,
        y: size.y,
        z: size.z
      }
    };
  }

  /**
   * 获取路径样条曲线
   * @param {string} name - 路径名称
   * @returns {THREE.CatmullRomCurve3|null} 样条曲线对象
   */
  getPath(name) {
    return this.paths.get(name) || null;
  }

  /**
   * 获取路径数据
   * @param {string} name - 路径名称
   * @returns {Object|null} 路径数据对象
   */
  getPathData(name) {
    return this.pathData.get(name) || null;
  }

  /**
   * 获取所有路径名称
   * @returns {Array} 路径名称数组
   */
  getAllPathNames() {
    return Array.from(this.paths.keys());
  }

  /**
   * 获取所有路径数据
   * @returns {Array} 路径数据数组
   */
  getAllPathData() {
    return Array.from(this.pathData.values());
  }

  /**
   * 检查路径是否存在
   * @param {string} name - 路径名称
   * @returns {boolean} 是否存在
   */
  hasPath(name) {
    return this.paths.has(name);
  }

  /**
   * 获取路径上的点
   * @param {string} name - 路径名称
   * @param {number} t - 参数t (0-1)
   * @returns {THREE.Vector3|null} 路径上的点
   */
  getPointOnPath(name, t) {
    const curve = this.getPath(name);
    if (curve) {
      if (curve.getUniformPoint) {
        return curve.getUniformPoint(t);
      }
      return curve.getPoint(t);
    }
    return null;
  }

  /**
   * 获取路径上的切线
   * @param {string} name - 路径名称
   * @param {number} t - 参数t (0-1)
   * @returns {THREE.Vector3|null} 路径上的切线
   */
  getTangentOnPath(name, t) {
    const curve = this.getPath(name);
    if (curve) {
      if (curve.getUniformTangent) {
        return curve.getUniformTangent(t);
      }
      return curve.getTangent(t);
    }
    return null;
  }

  /**
   * 获取路径长度
   * @param {string} name - 路径名称
   * @returns {number} 路径长度
   */
  getPathLength(name) {
    const pathData = this.getPathData(name);
    return pathData ? pathData.length : 0;
  }

  /**
   * 根据距离获取路径上的点
   * @param {string} name - 路径名称
   * @param {number} distance - 距离起点的距离
   * @returns {THREE.Vector3|null} 路径上的点
   */
  getPointAtDistance(name, distance) {
    const curve = this.getPath(name);
    if (curve) {
      const totalLength = curve.getLength();
      const t = Math.min(distance / totalLength, 1);
      
      if (curve.getUniformPoint) {
        return curve.getUniformPoint(t);
      }
      return curve.getPoint(t);
    }
    return null;
  }

  /**
   * 获取路径的采样点
   * @param {string} name - 路径名称
   * @param {number} divisions - 分段数
   * @returns {Array} 采样点数组
   */
  getPathPoints(name, divisions = 50) {
    const curve = this.getPath(name);
    if (curve) {
      return curve.getPoints(divisions);
    }
    return [];
  }

  /**
   * 记录路径信息
   */
  logPaths() {
    console.log('📋 路径列表:');
    this.pathData.forEach((data, name) => {
      console.log(`  - 名称: ${name}`);
      console.log(`    - 原始名称: ${data.originalName}`);
      console.log(`    - 路径长度: ${data.length.toFixed(2)}`);
      console.log(`    - 路径点数: ${data.points.length}`);
      console.log(`    - 包围盒中心: (${data.boundingBox.center.x.toFixed(2)}, ${data.boundingBox.center.y.toFixed(2)}, ${data.boundingBox.center.z.toFixed(2)})`);
    });
  }

  /**
   * 调试状态
   */
  debugStatus() {
    console.log('🔍 PathManager 调试信息:');
    console.log(`  - 是否已初始化: ${this.isInitialized}`);
    console.log(`  - 路径数量: ${this.paths.size}`);
    console.log(`  - 路径名称列表: [${this.getAllPathNames().join(', ')}]`);
    
    if (this.paths.size > 0) {
      console.log('  - 路径详情:');
      this.pathData.forEach((data, name) => {
        console.log(`    - ${name}: 长度 ${data.length.toFixed(2)}, 点数 ${data.points.length}`);
      });
    }
  }

  /**
   * 清理资源
   */
  dispose() {
    this.paths.clear();
    this.pathData.clear();
    this.isInitialized = false;
    console.log('🗑️ PathManager 资源已清理');
  }
}

// 创建全局实例
export const pathManager = new PathManager();
