import bindGUI from './expBind';
import apiGeology from '../exp/apiGeology';

function expGeology() {

}

expGeology.ui = {
  模型: { 模型: [''], func: apiGeology.load },
  VTK: { VTK: [''], func: apiGeology.loadVTK }
};

expGeology.bind = function (gui) {
  apiGeology.data.forEach((name) => {
    expGeology.ui.模型.模型.push(name);
  });
  apiGeology.dataVTK.forEach((name) => {
    expGeology.ui.VTK.VTK.push(name);
  });
  const folder = gui.addFolder('地质模型');
  bindGUI(folder, expGeology.ui);
  return folder;
};

export default expGeology;
