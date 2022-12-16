import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { clearRequest } from '@/services/request/cancelRequest'

// * 导入所有router
// @ts-ignore
const metaRouters = import.meta.globEager('./modules/*.ts')

// * 处理路由
export const routerArray: Array<RouteRecordRaw> = []
Object.keys(metaRouters).forEach(item => {
  Object.keys(metaRouters[item]).forEach((key: any) => {
    routerArray.push(...metaRouters[item][key])
  })
})

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  ...routerArray,
  {
    path: '/:pathMatch(.*)*',
    name: '页面丢失啰',
    component: () => import('@/view/NoFound/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  clearRequest()
  if (to.name) {
    typeof to.name === 'string' ? document.title = to.name : ''
  }
  next()
})

export default router
