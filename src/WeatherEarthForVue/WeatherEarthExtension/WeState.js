/* eslint-disable no-shadow */
const state = {
  _viewPoint: null,
  _lengedColorArray: [],
  _showLengend: false,
  _showVolumeButton: false,
};
const mutations = {
  VIEW_MOVE(state, val) {
    state._viewPoint = val;
  },
  ADD_COLORARR(state, val) {
    state._lengedColorArray = val;
  },
  ShowLengend(state, val) {
    state._showLengend = val;
  },
  ShowVolumeButton(state, val) {
    state._showVolumeButton = val;
  },
  ChangeLengend(state, ValueAndColorRamp) {
    const colorRamp = ValueAndColorRamp.ColorRamp;
    const valueRamp = ValueAndColorRamp.ValueRamp;
    const arr = [];
    for (let i = 0; i < colorRamp.length; i++) {
      arr.push({
        color: 'rgba(' + colorRamp[i][0] + ', ' + colorRamp[i][1] + ', ' + colorRamp[i][2] + ', ' + colorRamp[i][3] + ')',
        value: valueRamp[i]
      });
    }
    state._lengedColorArray = arr;
  },
};
export default {
  namespaced: true,
  state,
  mutations
};
