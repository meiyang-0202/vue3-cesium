import { RouteRecordRaw } from 'vue-router'

// leafLet模块
const leafLetRouter: Array<RouteRecordRaw> = [
  {
    path: '/leafLet',
    name: 'leafLet',
    component: () => import('@/view/leafLet/index.vue')
  }
]

export default leafLetRouter
