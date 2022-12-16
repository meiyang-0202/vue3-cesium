import bindGUI from './expBind';
import apiThunder from '../exp/apiThunder';
import expThunderData from '../exp/expThunderData';

function expThunder() {

}

expThunder.ui = {
  闪电: { 闪电: [''], func: apiThunder.loadThunder },
};

expThunder.bind = function (gui) {
  Object.keys(expThunderData.data).forEach((element) => {
    expThunder.ui.闪电.闪电.push(element);
  });

  const folder = gui.addFolder('闪电');
  bindGUI(folder, expThunder.ui);
  return folder;
};

export default expThunder;
