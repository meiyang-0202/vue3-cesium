
import bindGUI from './expBind';
import apiFly from '../exp/apiFly';

function expFly() {

}

expFly.ui = {
  雷达: { 雷达: false, func: apiFly.loadRadar },
  距离环: { 距离环: false, func: apiFly.showEco },
  航线: { 航线: ['', '全部'], func: apiFly.loadFlightPath },
  航迹: { 航迹: ['', '全部'], func: apiFly.loadFlightPlane },
};

expFly.bind = function (gui) {
  const folder = gui.addFolder('航飞');
  bindGUI(folder, expFly.ui);
  return folder;
};

export default expFly;
