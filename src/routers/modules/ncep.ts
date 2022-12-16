import { RouteRecordRaw } from 'vue-router'

// ncep模块
const ncepRouter: Array<RouteRecordRaw> = [
  {
    path: '/ncep',
    name: 'ncep',
    component: () => import('@/view/ncep/index.vue')
  }
]

export default ncepRouter
