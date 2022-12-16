import { RouteRecordRaw } from 'vue-router'

// simpleRadar模块
const simpleRadarRouter: Array<RouteRecordRaw> = [
  {
    path: '/simpleRadar',
    name: 'simpleRadar',
    component: () => import('@/view/simpleRadar/index.vue')
  }
]

export default simpleRadarRouter
