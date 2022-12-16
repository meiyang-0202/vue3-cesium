import bindGUI from './expBind';
import expRadar from './expRadar';
import expCloud from './expCloud';
import expWind from './expWind';
import expThunder from './expThunder';
import expImagery from './expImagery';

function expWeather() {

}

expWeather.showParticle = function (value) {
  const { WE } = window;
  WE.weatherSystem.snow = value === '雪';
  WE.weatherSystem.rain = value === '雨';
  WE.weatherSystem.fog = value === '雾';
};

expWeather.ui = {
  天气: { 天气: ['晴', '雪', '雨', '雾'], func: expWeather.showParticle },
};

expWeather.bind = function (gui) {
  const folder = gui.addFolder('气象');
  const folder1 = expRadar.bind(folder);
  const folder2 = expCloud.bind(folder);
  const folder3 = expWind.bind(folder);
  const folder4 = expThunder.bind(folder);
  const folder5 = expImagery.bind(folder);

  // 雷达
  // folder1.open();
  // 云
  // folder2.open();
  // 风
  // folder3.open();
  // 雷
  // folder4.open();
  // 气象图片
  folder5.open();
  const folder_ = folder.addFolder('天气');
  bindGUI(folder_, expWeather.ui);
  return folder;
};

export default expWeather;
