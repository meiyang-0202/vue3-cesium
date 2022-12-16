import { RouteRecordRaw } from 'vue-router'

// weather模块
const weatherRouter: Array<RouteRecordRaw> = [
  {
    path: '/weather',
    name: 'weather',
    component: () => import('@/view/weather/index.vue')
  }
]

export default weatherRouter
