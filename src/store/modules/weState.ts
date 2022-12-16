import { defineStore } from 'pinia'
import { WeState } from '../interface/index'

export const WeStore = defineStore({
  id: 'WeState',
  state: (): WeState => ({
    _viewPoint: null,
    _lengedColorArray: [],
    _showLengend: false,
    _showVolumeButton: false
  }),
  getters: {},
  actions: {
    VIEW_MOVE(val: any) {
      this._viewPoint = val
    },
    ADD_COLORARR(val: { color?: string, value?: string }[]) {
      this._lengedColorArray = val
    },
    ShowLengend(val: boolean) {
      this._showLengend = val
    },
    ShowVolumeButton(val: boolean) {
      this._showVolumeButton = val
    },
    ChangeLengend(ValueAndColorRamp: { ColorRamp: any[], ValueRamp: any[] }) {
      const colorRamp = ValueAndColorRamp.ColorRamp
      const valueRamp = ValueAndColorRamp.ValueRamp
      const arr = []
      for (let i = 0; i < colorRamp.length; i++) {
        arr.push({
          color: 'rgba(' + colorRamp[i][0] + ', ' + colorRamp[i][1] + ', ' + colorRamp[i][2] + ', ' + colorRamp[i][3] + ')',
          value: valueRamp[i]
        })
      }
      this._lengedColorArray = arr
    }
  }
})
