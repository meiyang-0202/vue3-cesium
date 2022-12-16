import { RouteRecordRaw } from 'vue-router'

// hubeiRadar模块
const hubeiRadarRouter: Array<RouteRecordRaw> = [
  {
    path: '/hubeiRadar',
    name: 'hubeiRadar',
    component: () => import('@/view/hubeiRadar/index.vue')
  }
]

export default hubeiRadarRouter
