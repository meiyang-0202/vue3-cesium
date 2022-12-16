import bindGUI from './expBind';
import apiWind from '../exp/apiWind';
import expWindData from '../exp/expWindData';

function expWind() {

}

expWind.ui = {
  // Ncep: { Ncep: expWindData.data.Ncep, func: apiWind.loadNcep },
  Ncep实况: { Ncep实况: apiWind.openNcepPage },
  台风: { 台风: expWindData.data.台风, func: apiWind.loadTyphoon },
  // 其他: { 其他: expWindData.data.其他, func: apiWind.loadOther },
  中国区: { 中国区: false, func: apiWind.loadGrib },
  西南涡: { 西南涡: false, func: apiWind.load3DWind },
  风暴路径: { 风暴路径: false, func: apiWind.loadStorm },
};

expWind.bind = function (gui) {
  expWindData.getLatestNecp();
  const folder = gui.addFolder('风');
  bindGUI(folder, expWind.ui);
  return folder;
};

export default expWind;
