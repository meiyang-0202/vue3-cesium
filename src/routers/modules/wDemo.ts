import { RouteRecordRaw } from 'vue-router'

// demo_w模块
const demoWRouter: Array<RouteRecordRaw> = [
  {
    path: '/demo_w',
    name: 'demo_w',
    component: () => import('@/view/demo_w/index.vue')
  }
]

export default demoWRouter
