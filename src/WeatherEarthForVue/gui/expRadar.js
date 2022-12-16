
import bindGUI from './expBind';
import apiRadar from '../exp/apiRadar';
import expRadarData from '../exp/expRadarData';
import expVolumeColor from './expVolumeColor';

function expRadar() {

}

expRadar.ui = {
  体数据: { 体数据: [''], func: apiRadar.loadRadarOther },
  动画: { 动画: [''], func: apiRadar.loadRadarAnime },
};

expRadar.bind = function (gui) {
  expRadar.ui.体数据.体数据 = [''];
  expRadar.ui.动画.动画 = [''];

  Object.keys(expRadarData.otherData).forEach((element) => {
    expRadar.ui.体数据.体数据.push(element);
  });

  Object.keys(expRadarData.animeData).forEach((element) => {
    expRadar.ui.动画.动画.push(element);
  });

  const folder = gui.addFolder('雷达');
  bindGUI(folder, expRadar.ui);

  expVolumeColor.bind(folder);

  // test
  // const { WE } = window;
  // WE.globalVolumeState.showGrid = true;
  // WE.globalVolumeState.displayMode = 'Slice';
  // apiRadar.loadRadarOther('SWAN');
  return folder;
};

export default expRadar;
