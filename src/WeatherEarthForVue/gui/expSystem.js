import bindGUI from './expBind';
import apiPick from '../exp/apiPick';

function expSystem() {

}

expSystem.showAnnotation = function (value) {
  const { WE } = window;
  WE.layerManager.showAnnotation = value;
};

expSystem.showTerrainFilter = function (value) {
  const { WE } = window;
  WE.layerManager.showTerrainFilter = value;
};

expSystem.showCountryBorder = function (value) {
  const { WE } = window;
  WE.layerManager.showCountryBorder = value;
};

expSystem.WGS84 = undefined;

expSystem.showTileCoord = function (value) {
  const { WE } = window;
  if (value) {
    expSystem.WGS84 = WE.viewer.imageryLayers.addImageryProvider(new Cesium.TileCoordinatesImageryProvider((
      { tilingScheme: new Cesium.GeographicTilingScheme({ ellipsoid: Cesium.Ellipsoid.WGS84 }) }
    )));
  } else if (Cesium.defined(expSystem.WGS84)) {
    WE.viewer.imageryLayers.remove(expSystem.WGS84);
    expSystem.WGS84 = undefined;
  }
};

expSystem.showTileCoord2 = function (value) {
  const { WE } = window;
  WE.layerManager.showTileCoord = value;
};

expSystem.showTerrainLight = function (value) {
  const { WE } = window;
  WE.viewer.shadows = value;
  WE.viewer.scene.globe.enableLighting = value;
};

expSystem.travel = function () {
  const { WE } = window;
  WE.travelWorld({
    height: 15263000.80,
    latitude: 30.0,
    duration: 30.0,
  });
};

expSystem.enanbleDepthTest = function (value) {
  const { WE } = window;
  WE.viewer.scene.globe.depthTestAgainstTerrain = value;
};

expSystem.showFrameRate = function (value) {
  const { WE } = window;
  WE.debugShowFramesPerSecond = value;
};

expSystem.showGlobe = function (value) {
  const { WE } = window;
  WE.viewer.scene.globe.show = value;
  WE.viewer.scene.sun.show = value;
  WE.viewer.scene.moon.show = value;
  WE.showSkyBox = value;
};

expSystem.gdate = undefined;

expSystem.showTimeText = function (value) {
  const { WE } = window;
  const elem = document.getElementById('timeh');
  elem.style.display = value ? 'block' : 'none';
  if (!Cesium.defined(expSystem.gdate)) {
    const gdate = expSystem.gdate = new Cesium.GregorianDate(1, 1, 1, 1, 1, 1, 1, false);
    WE.viewer.clock.onTick.addEventListener(() => {
      const t = WE.viewer.clock.currentTime.clone();
      Cesium.JulianDate.addHours(t, 8, t);
      Cesium.JulianDate.toGregorianDate(t, gdate);
      const h = gdate.hour.toString().padStart(2, '0');
      const m = gdate.minute.toString().padStart(2, '0');
      elem.innerText = `${gdate.year}.${gdate.month}.${gdate.day} ${h}:${m} 风云卫星`;
    });
  }
};

expSystem.msaaSamples = function (value) {
  const { WE } = window;
  WE.viewer.scene.msaaSamples = value ? 8 : 1;
};

expSystem.ui = {
  地名: { 地名: false, func: expSystem.showAnnotation },
  高程蒙皮: { 高程蒙皮: false, func: expSystem.showTerrainFilter },
  境界: { 境界: false, func: expSystem.showCountryBorder },
};

expSystem.ui2 = {
  拾取: { 拾取: false, func: apiPick.pick },
  地表光照: { 地表光照: false, func: expSystem.showTerrainLight },
  深度检测: { 深度检测: false, func: expSystem.enanbleDepthTest },
  帧率: { 帧率: false, func: expSystem.showFrameRate },
  显示地球: { 显示地球: true, func: expSystem.showGlobe },
  WGS84: { WGS84: false, func: expSystem.showTileCoord },
  WebMercator: { WebMercator: false, func: expSystem.showTileCoord2 },
  自转: { 自转: expSystem.travel },
  时间标题: { 时间标题: false, func: expSystem.showTimeText },
  反锯齿: { 反锯齿: false, func: expSystem.msaaSamples },
};
expSystem.bind = function (gui) {
  const folder = gui.addFolder('系统');
  bindGUI(folder, expSystem.ui);
  const folder2 = folder.addFolder('场景参数');
  bindGUI(folder2, expSystem.ui2);
  return folder;
};

export default expSystem;
