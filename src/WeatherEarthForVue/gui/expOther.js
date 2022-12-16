import bindGUI from './expBind';
import apiOther from '../exp/apiOther';
import expWidget from './expWidget';
import expTest from './expTest';
import expMapService from './expMapService';

function expOther() {

}

expOther.ui = {
  KML: { KML: ['', '国家站'], func: apiOther.loadKML },
};


expOther.bind = function (gui) {
  const folder = gui.addFolder('其他');
  bindGUI(folder, expOther.ui);
  expWidget.bind(folder);
  expTest.bind(folder);
  const folder4 = folder.addFolder('地图服务');
  expMapService.bind(folder4);
  return folder;
};

export default expOther;
