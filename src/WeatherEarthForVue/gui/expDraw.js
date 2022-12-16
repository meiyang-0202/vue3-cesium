import apiDraw from '../exp/apiDraw';
import bindGUI from './expBind';

function expDraw() {

}

expDraw.ui = {
  线: { 线() { apiDraw.draw('line'); } },
  矩形: { 矩形() { apiDraw.draw('rectangle'); } },
  折线: { 折线() { apiDraw.draw('polyline'); } },
  多边形: { 多边形() { apiDraw.draw('polygon'); } },
  文字: { 文字() { apiDraw.draw('文字'); } },
  清除: { 清除: apiDraw.clear },
};


expDraw.bind = function (gui) {
  const folder = gui.addFolder('绘制');
  bindGUI(folder, expDraw.ui);
  return folder;
};

export default expDraw;
