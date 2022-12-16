import bindGUI from './expBind';
import apiGeometry from '../exp/apiGeometry';
import apiMaterial from '../exp/apiMaterial';
import * as expShader from '../exp/expShader';
import expDraw from './expDraw';
import apiGeojson from '../exp/apiGeojson';

function expGeometry() {}


expGeometry.ui = {
  Geojson: { Geojson: [''], func: apiGeojson.loadGeojson },
  形状: { 形状: [''], func: apiGeometry.addGeometry },
  材质: { 材质: [''], func: apiMaterial.changeMaterial },
};
  
expGeometry.bind = function (gui) {
  expGeometry.ui.Geojson.Geojson = [''];
  Object.keys(apiGeojson.data).forEach((item) => {
    expGeometry.ui.Geojson.Geojson.push(item);
  });

  expGeometry.ui.形状.形状 = [''];
  expGeometry.ui.材质.材质 = [''];
  Object.keys(apiGeometry.data).forEach((element) => {
    expGeometry.ui.形状.形状.push(element);
  });

  Object.keys(expShader).forEach((element) => {
    expGeometry.ui.材质.材质.push(element);
  });

  const folder = gui.addFolder('几何');
  bindGUI(folder, expGeometry.ui);
  expDraw.bind(folder);
  return folder;
};

export default expGeometry;
