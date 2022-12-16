import { RouteRecordRaw } from 'vue-router'

// demo_v模块
const demoVRouter: Array<RouteRecordRaw> = [
  {
    path: '/demo_v',
    name: 'demo_v',
    component: () => import('@/view/demo_v/index.vue')
  }
]

export default demoVRouter
