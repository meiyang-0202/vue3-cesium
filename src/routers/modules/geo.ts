import { RouteRecordRaw } from 'vue-router'

// geo模块
const geoRouter: Array<RouteRecordRaw> = [
  {
    path: '/geo',
    name: 'geo',
    component: () => import('@/view/geo/index.vue')
  }
]

export default geoRouter
