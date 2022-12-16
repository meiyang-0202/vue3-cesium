import bindGUI from './expBind';
import apiRenderTest from '../exp/apiRenderTest';
import apiRenderTest2 from '../exp/apiRenderTest2';

function expRenderTest() {

}

expRenderTest.ui = {
  Test1: { Test1: apiRenderTest.Test },
  Test2: { Test2: apiRenderTest2.Test }
};

expRenderTest.bind = function (gui) {
  const folder = gui.addFolder('渲染');
  bindGUI(folder, expRenderTest.ui);
  return folder;
};

export default expRenderTest;
