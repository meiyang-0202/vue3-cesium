import bindGUI from './expBind';
import apiModel from '../exp/apiModel';
import expModelData from '../exp/expModelData';
import exp3dtiles from './exp3dtiles';
import expGeology from './expGeology';

function expModel() {

}

expModel.ui = {
  GLTF模型: { GLTF模型: [''], func: apiModel.loadModel },
};

expModel.bind = function (gui) {
  Object.keys(expModelData.modelData).forEach((element) => {
    expModel.ui.GLTF模型.GLTF模型.push(element);
  });

  const folder = gui.addFolder('模型');
  expGeology.bind(folder);
  bindGUI(folder, expModel.ui);
  exp3dtiles.bind(folder);
  return folder;
};

export default expModel;
