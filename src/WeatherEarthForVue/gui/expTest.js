import bindGUI from './expBind';
import apiGeometry from '../exp/apiGeometry';

function expTest() {

}

expTest.layerName = 'TestUrlTemplateImageryProvider';

expTest.showOfflineMap = function (value) {
  const { WE } = window;
  const { layerName } = expTest;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }
  const positron = new Cesium.UrlTemplateImageryProvider({
    url: `${import.meta.env.VITE_APP_ASSETS}/offlineMapHubei/img_w/{z}/{y}/{x}.jpg`,
  });
  WE.layerManager.addImageryProvider(positron, layerName);
};

expTest.jumpToPosition = function () {
  const value = expTest.ui['位置'].位置;
  const { WE } = window;
  if (value === '') {
    return;
  }
  const xyz = value.split(' ');
  const x = parseFloat(xyz[0]);
  const y = parseFloat(xyz[1]);
  const z = parseFloat(xyz[2]);


  WE.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(x, y, z),
    duration: 2.0
  });
  WE.WeExt.pointCollection.add({
    position: Cesium.Cartesian3.fromDegrees(x, y, 0)
  });
};


expTest.jumpToTileXYZ = function () {
  const value = expTest.ui['瓦片'].瓦片;
  const { WE } = window;
  if (value === '') {
    return;
  }
  const xyz = value.split(' ');
  const w = xyz[0];
  const x = parseInt(xyz[1], 10);
  const y = parseInt(xyz[2], 10);
  const z = parseInt(xyz[3], 10);
  let rect;
  if (w === 'c') {
    const tilingScheme = new Cesium.GeographicTilingScheme();
    const numy = tilingScheme.getNumberOfYTilesAtLevel(z);
    rect = tilingScheme.tileXYToRectangle(x, numy - y, z);
  } else {
    const tilingScheme = new Cesium.WebMercatorTilingScheme();
    rect = tilingScheme.tileXYToRectangle(x, y, z);
  }
  const west = Cesium.Math.toDegrees(rect.west);
  const south = Cesium.Math.toDegrees(rect.south);
  const east = Cesium.Math.toDegrees(rect.east);
  const north = Cesium.Math.toDegrees(rect.north);
  console.info(west + ' ' + south + ' ' + east + ' ' + north);
  const appearance = new Cesium.EllipsoidSurfaceAppearance({
    aboveGround: false,
  });
  WE.WeExt.primitiveManager.addRectangle({
    west, south, east, north, appearance
  });

  WE.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(west, south, 100000),
    duration: 5.0
  });

  WE.WeExt.pointCollection.add({
    position: Cesium.Cartesian3.fromDegrees(west, south, 0)
  });
};

expTest.ui = {
  离线地图: { 离线地图: false, func: expTest.showOfflineMap },
  瓦片: { 瓦片: 'w 52935 26496 16' },
  跳转瓦片: { 跳转瓦片: expTest.jumpToTileXYZ },
  位置: { 位置: '110.9277856 32.4565475 100' },
  跳转位置: { 跳转位置: expTest.jumpToPosition },
};

expTest.bind = function (gui) {
  const folder = gui.addFolder('测试');
  bindGUI(folder, expTest.ui);
  return folder;
};

export default expTest;

