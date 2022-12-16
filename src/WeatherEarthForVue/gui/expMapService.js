import bindGUI from './expBind';
import apiMapService from '../exp/apiMapService';

function expMapService() {

}

expMapService.ui = {
  WMS: { WMS: ['', '风云4'], func: apiMapService.loadWMS },
  WMTS: { WMTS: ['', '天地图地形'], func: apiMapService.loadWMTS },
  TMS: { TMS: ['', 'new', 'old'], func: apiMapService.loadTMS },
};
  
expMapService.bind = function (folder) {
  bindGUI(folder, expMapService.ui);
  // folder.open();
  return folder;
};

export default expMapService;
