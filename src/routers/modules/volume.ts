import { RouteRecordRaw } from 'vue-router'

// volume模块
const volumeRouter: Array<RouteRecordRaw> = [
  {
    path: '/volume',
    name: 'volume',
    component: () => import('@/view/volume/index.vue')
  }
]

export default volumeRouter
