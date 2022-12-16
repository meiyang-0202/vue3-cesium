import { defineStore, createPinia } from 'pinia'
import { DefaultState } from './interface/index'

export const DefaultStore = defineStore({
  id: 'DefaultState',
  state: (): DefaultState => ({
    showCommand: false,
    debugTooltip: false,
    showToolTip: false,
    collapseTooltip: false,
    popupToolTips: {},
    tiltToolTips: {},
    pointToolTips: {}
  }),
  getters: {},
  actions: {}
})

const pinia = createPinia()
export default pinia
