import bindGUI from './expBind';
import apiCloud from '../exp/apiCloud';
import expCloudData from '../exp/expCloudData';

function expCloud() {

}


expCloud.ui = {
  风云卫星中国区: {
    风云卫星中国区: [''],
    func: apiCloud.loadCloud
  }
};

expCloud.bind = function (gui) {
  expCloud.ui.风云卫星中国区.风云卫星中国区 = [''];
  Object.keys(expCloudData.data).forEach((element) => {
    expCloud.ui.风云卫星中国区.风云卫星中国区.push(element);
  });

  const folder = gui.addFolder('云');
  bindGUI(folder, expCloud.ui);
  return folder;
};

export default expCloud;
