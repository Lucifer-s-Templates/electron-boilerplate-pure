import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig(({ mode }) => {
  return {
    main: {
      resolve: {
        alias: {
          '@shared': resolve('src/shared')
        }
      },
      build: {
        watch: {}
      }
    },
    preload: {
      resolve: {
        alias: {
          '@shared': resolve('src/shared')
        }
      },
      build: {
        watch: {}
      }
    },
    renderer: {
      resolve: {
        alias: {
          '@renderer': resolve('src/renderer/src'),
          '@shared': resolve('src/shared')
        }
      },
      plugins: [
        vue(),
        AutoImport({
          imports: ['vue', 'vue-router', 'pinia'],
          resolvers: [ElementPlusResolver()],
          dts: resolve(__dirname, 'src/renderer/src/auto-imports.d.ts'),
          eslintrc: {
            enabled: true
          }
        }),
        Components({
          resolvers: [ElementPlusResolver()],
          dts: resolve(__dirname, 'src/renderer/src/components.d.ts')
        }),
        createSvgIconsPlugin({
          iconDirs: [resolve(__dirname, 'src/renderer/src/assets/icons/svg')],
          symbolId: 'icon-[dir]-[name]'
        })
      ]
    }
  }
})
