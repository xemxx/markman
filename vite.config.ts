import { rmSync } from 'fs'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import pkg from './package.json'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve('./src/assets/icons/')],
      // 指定symbolId格式
      symbolId: 'icon-[dir]-[name]',

      /**
       * 自定义插入位置
       * @default: body-last
       */
      inject: 'body-last',

      /**
       * custom dom id
       * @default: __svg__icons__dom__
       */
      customDomId: '__svg__icons__dom__',
    }),
    electron({
      main: {
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/electron/main',
          },
        },
      },
      preload: {
        input: {
          // You can configure multiple preload here
          index: join(__dirname, 'electron/preload/index.ts'),
        },
        vite: {
          build: {
            // For debug
            sourcemap: 'inline',
            outDir: 'dist/electron/preload',
          },
        },
      },
      // Enables use of Node.js API in the Renderer-process
      renderer: {
        resolve() {
          // 显式的告诉 `vite-plugin-electron-renderer` 下面的包是 Node.js(CJS) 模块
          return [
            // C/C++ 原生模块
            'sqlite3',
          ]
        },
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
    devSourcemap: false,
  },
  server: {
    host: pkg.env.VITE_DEV_SERVER_HOST,
    port: pkg.env.VITE_DEV_SERVER_PORT,
  },
  // publicDir: 'src/assets',
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
    },
  },
  // 设置路径别名
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve('./src'),
      },
      {
        find: 'main',
        replacement: resolve('./electron/main'),
      },
    ],
  },
})
