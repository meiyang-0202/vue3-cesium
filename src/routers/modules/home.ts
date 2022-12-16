import { RouteRecordRaw } from 'vue-router'

// home模块
const homeRouter: Array<RouteRecordRaw> = [
  {
    path: '/home',
    name: 'home',
    component: () => import('@/view/home/index.vue')
  }
]

export default homeRouter
