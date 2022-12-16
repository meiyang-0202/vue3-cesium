import bindGUI from './expBind';
import apiImagery from '../exp/apiImagery';
import expImageryData from '../exp/expImageryData';

function expImagery() {

}

expImagery.ui = {
  气象图片: { 气象图片: [''], func: apiImagery.loadImage },
  气象站: { 气象站: ['', '全国'], func: apiImagery.loadStationJson },
};

expImagery.bind = function (gui) {
  expImagery.ui.气象图片.气象图片 = [''];
  Object.keys(expImageryData.imageData).forEach((element) => {
    expImagery.ui.气象图片.气象图片.push(element);
  });
  const folder = gui.addFolder('气象图');
  bindGUI(folder, expImagery.ui);
  return folder;
};


export default expImagery;
