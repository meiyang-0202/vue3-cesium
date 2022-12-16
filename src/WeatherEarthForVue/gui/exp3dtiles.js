import bindGUI from './expBind';
import api3dtiles from '../exp/api3dtiles';
import exp3dtilesData from '../exp/exp3dtilesData';

function exp3dtiles() {
}

exp3dtiles.ui = {
  三维瓦片: { 三维瓦片: [''], func: api3dtiles.load3dtiles },
};

exp3dtiles.bind = function (gui) {
  exp3dtiles.ui.三维瓦片.三维瓦片 = [''];
  Object.keys(exp3dtilesData.data).forEach((element) => {
    exp3dtiles.ui.三维瓦片.三维瓦片.push(element);
  });
  bindGUI(gui, exp3dtiles.ui);
};

export default exp3dtiles;
