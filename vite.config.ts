import { rmSync } from 'fs'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import pkg from './package.json'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const isServe = command === 'serve'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  return {
    type: "module",
    plugins: [
      vue(),
      Components({
        dts: true,
        resolvers: [AntDesignVueResolver({ importStyle: false })],
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
          vite: {
            build: {
              lib: {
               entry: 'electron/main/index.ts',
               formats: ['cjs'],
               fileName: () => '[name].js',
             },
              outDir: 'dist/electron/main',
              sourcemap,
              minify: isBuild,
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {},
                ),
              },
            },
          },
          onstart(options) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ '[startup] Electron App',
              )
            } else {
              options.startup()
            }
          },
        },
        preload: {
          input: {
            // You can configure multiple preload here
            index: join(__dirname, 'electron/preload/index.ts'),
          },
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined, // #332
              minify: isBuild,
              outDir: 'dist/electron/preload',
              rollupOptions: {
                external: Object.keys(
                  'dependencies' in pkg ? pkg.dependencies : {},
                ),
              },
            },
          },
        },
        // Enables use of Node.js API in the Renderer-process
        renderer: {
          resolve: {
            sqlite3: {
              type: 'cjs',
            },
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
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
        return {
          host: url.hostname,
          port: +url.port,
        }
      })(),
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
  }
})
