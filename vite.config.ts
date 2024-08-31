import { rmSync } from 'fs'
import { join, resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron/simple'
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import pkg from './package.json'
import vueDevTools from 'vite-plugin-vue-devtools'

import tailwind from 'tailwindcss'
import autoprefixer from 'autoprefixer'

rmSync('dist', { recursive: true, force: true }) // v14.14.0

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  const isServe = command === 'serve'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  return {
    type: 'module',
    plugins: [
      vue(),
      vueDevTools(),
      Components({
        dts: true,
        resolvers: [AntDesignVueResolver({ importStyle: false })],
      }),
      createSvgIconsPlugin({
        iconDirs: [resolve('./src/assets/icons/')],
        symbolId: 'icon-[dir]-[name]',
        inject: 'body-last',
        customDomId: '__svg__icons__dom__',
      }),
      electron({
        main: {
          vite: {
            build: {
              lib: {
                entry: 'electron/main/index.ts',
                formats: ['es'],
                fileName: () => '[name].mjs',
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
      postcss: {
        plugins: [tailwind(), autoprefixer()],
      },
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
      exclude: ['@vue/devtools'],
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
