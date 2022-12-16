import { RouteRecordRaw } from 'vue-router'

// demo_v2模块
const demoVTwoRouter: Array<RouteRecordRaw> = [
  {
    path: '/demo_v2',
    name: 'demo_v2',
    component: () => import('@/view/demo_v2/index.vue')
  }
]

export default demoVTwoRouter
