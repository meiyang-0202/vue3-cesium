import { RouteRecordRaw } from 'vue-router'

// volumeRain模块
const volumeRainRouter: Array<RouteRecordRaw> = [
  {
    path: '/volumeRain',
    name: 'volumeRain',
    component: () => import('@/view/volumeRain/index.vue')
  }
]

export default volumeRainRouter
