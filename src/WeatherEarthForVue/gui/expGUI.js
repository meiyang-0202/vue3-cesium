import expWeather from './expWeather';
import expSystem from './expSystem';
import expFly from './expFly';
import expOther from './expOther';
import expModel from './expModel';
import expGeometry from './expGeometry';
import expRenderTest from './expRenderTest';
import expAnalyst from './expAnalyst';
import apiCanvas from '../exp/apiCanvas';
import apiTest from '../exp/apiTest';
import apiImagery from '../exp/apiImagery';

function expGUI() {

}

expGUI.folders = [];

expGUI.折叠 = function () {
  expGUI.folders.forEach((f) => {
    f.close();
  });
};

expGUI.bind = function (gui) {
  // gui.add(expGUI, '折叠');
  const folder1 = expWeather.bind(gui);
  expGUI.folders.push(folder1);
  const folder2 = expFly.bind(gui);
  expGUI.folders.push(folder2);
  const folder3 = expModel.bind(gui);
  expGUI.folders.push(folder3);
  const folder4 = expGeometry.bind(gui);
  expGUI.folders.push(folder4);
  const folder5 = expAnalyst.bind(gui);
  expGUI.folders.push(folder5);
  const folder6 = expOther.bind(gui);
  expGUI.folders.push(folder6);
  const folder7 = expSystem.bind(gui);
  expGUI.folders.push(folder7);

  // 气象
  folder1.open();
  // 航飞
  // folder2.open();
  // 模型
  // folder3.open();
  // 几何
  // folder4.open();
  // 分析
  // folder5.open();
  // 其他
  // folder6.open();
  // 系统
  // folder7.open();

  WeatherEarth.Config.CommonLayerTDTMaximumLevel = 14;
  WeatherEarth.Config.AssetUrl = import.meta.env.VITE_APP_ASSETS;
  if (import.meta.env.VITE_APP_DEBUG_H) {
    // const folderX = expRenderTest.bind(gui);
    // expGUI.folders.push(folderX);
    // folderX.open();
    // apiCanvas.image2blue();
    // apiCanvas.test();
    // apiTest.test();
    // apiImagery.loadJson();
  }
};

export default expGUI;
