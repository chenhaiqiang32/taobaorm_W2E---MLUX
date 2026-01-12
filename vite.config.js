export default {
  base: "./",
  resolve: {
    alias: {
      three: "three",
    },
  },
  build: {
    outDir: "docs",
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 将 Three.js 核心库分离到单独的 chunk
          if (id.includes('node_modules/three/build/three.module.js') || 
              id.includes('node_modules/three/src/')) {
            return 'three-core';
          }
          
          // 将 Three.js 示例代码分离到单独的 chunk
          if (id.includes('node_modules/three/examples/jsm/')) {
            return 'three-examples';
          }
          
          // 将其他 node_modules 中的库分离
          if (id.includes('node_modules/')) {
            // 将 @tweenjs/tween.js 分离
            if (id.includes('@tweenjs')) {
              return 'vendor-tween';
            }
            return 'vendor';
          }
        },
      },
    },
    // 可选：提高块大小警告阈值（如果仍然需要）
    // chunkSizeWarningLimit: 1000,
  },
};
