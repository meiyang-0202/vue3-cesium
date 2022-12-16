import { createApp } from 'vue'
import App from './App.vue'
import router from '@/routers/router'
import pinia from '@/store/index'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'

createApp(App)
  .use(ElementPlus, {
    locale: zhCn
  })
  .use(router)
  .use(pinia)
  .mount('#app')
