import { defineConfig, loadEnv, UserConfigExport, ConfigEnv } from 'vite'
import { join } from 'path'
import vue from '@vitejs/plugin-vue'
import viteCompression from 'vite-plugin-compression'
import viteImagemin from 'vite-plugin-imagemin'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'

function resolve(dir: string) {
  return join(__dirname, dir)
}

export default ({ mode }: ConfigEnv): UserConfigExport => {
  return defineConfig({
    server: {
      host: '0.0.0.0',
      port: 8020,
      open: false,
      proxy: {
        [`${loadEnv(mode, process.cwd()).VITE_APP_BASE_API}`]: {
          target: loadEnv(mode, process.cwd()).VITE_TEST_HOST, // 线上
          // rewrite: (path:any) => path.replace(/^\/api/, ''),
          changeOrigin: true,
          ws: true
        },
        '/OCserverNew': {
          target: loadEnv(mode, process.cwd()).VITE_APP_HOST,
          changeOrigin: true,
          // @ts-ignore
          pathRewrite: {
            '^/OCserverNew': '/OCserverNew'
          }
        },
        '/FireService': {
          target: 'http://10.104.207.158:8084',
          changeOrigin: true
        },
        '/OCserver': {
          target: loadEnv(mode, process.cwd()).VITE_APP_HOST,
          changeOrigin: true,
          pathRewrite: {
            '^/FireService': '/FireService'
          }
        },
        '/Assets': {
          target: loadEnv(mode, process.cwd()).VITE_APP_HOST,
          changeOrigin: true
        },
        '/OCMapCacherGG': {
          target: loadEnv(mode, process.cwd()).VITE_APP_HOST,
          changeOrigin: true
        },
        '/OCMapCacher': {
          target: loadEnv(mode, process.cwd()).VITE_APP_HOST,
          changeOrigin: true
        },
        '/ZJDatacenterV2': {
          target: 'https://www.qxjcfw.cn',
          changeOrigin: true
        },
        '/product': {
          target: 'http://127.0.0.1:9084',
          changeOrigin: true
        }
      }
    },
    plugins: [
      vue(),
      viteCompression({
        ext: '.gz',
        algorithm: 'gzip',
        deleteOriginFile: false
      }),
      viteImagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 20
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox'
            },
            {
              name: 'removeEmptyAttrs',
              active: false
            }
          ]
        }
      }),
      vueSetupExtend()
    ],
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    build: {
      target: 'es2015',
      outDir: 'dist'
      // assetsDir: 'assets'
    }
  })
}
