import { RouteRecordRaw } from 'vue-router'

// doubleView模块
const doubleViewRouter: Array<RouteRecordRaw> = [
  {
    path: '/doubleView',
    name: 'doubleView',
    component: () => import('@/view/doubleView/index.vue')
  }
]

export default doubleViewRouter
