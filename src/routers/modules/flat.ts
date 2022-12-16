import { RouteRecordRaw } from 'vue-router'

// flat模块
const flatRouter: Array<RouteRecordRaw> = [
  {
    path: '/flat',
    name: 'flat',
    component: () => import('@/view/flat/index.vue')
  }
]

export default flatRouter
