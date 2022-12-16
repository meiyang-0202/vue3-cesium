import bindGUI from './expBind';
import apiWidget from '../exp/apiWidget';

function expWidget() {

}

expWidget.ui = {
  点: { 点: false, func: apiWidget.showPointToolTip },
  气泡: { 气泡: false, func: apiWidget.showPopuToolTip },
  斜气泡: { 斜气泡: false, func: apiWidget.showTiltToolTip },
  气泡贴地: { 气泡贴地: false, func: apiWidget.clampToGround },
};

expWidget.bind = function (gui) {
  const folder = gui.addFolder('DIV气泡');
  bindGUI(folder, expWidget.ui);
  return folder;
};
  
export default expWidget;
