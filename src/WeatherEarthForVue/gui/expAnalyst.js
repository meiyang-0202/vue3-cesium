import bindGUI from './expBind';
import apiAnalyst from '../exp/apiAnalyst';

function expAnalyst() {

}

expAnalyst.ui1 = {
  开挖: { 开挖: apiAnalyst.demClipSurface },
  高程采样: { 高程采样: apiAnalyst.demSample },
  重置: { 重置: apiAnalyst.reset },
  赋色: { 赋色: ['', '高程', '坡度', '坡向'], func: apiAnalyst.colorElevation },
  等值线: { 等值线: false, func: apiAnalyst.colorElevationWithContour },
};

expAnalyst.ui2 = {
};

expAnalyst.bind = function (gui) {
  const folder = gui.addFolder('分析');

  const f1 = folder.addFolder('地形');
  bindGUI(f1, expAnalyst.ui1);
  
  // test
  // f1.open();
  // apiAnalyst.test();

  return folder;
};

export default expAnalyst;
