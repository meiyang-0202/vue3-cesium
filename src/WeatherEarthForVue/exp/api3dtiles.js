import exp3dtilesData from './exp3dtilesData';

function api3dtiles() {

}
  
api3dtiles.pipe = ['JS', 'PS', 'DX', 'GD', 'LD'];
  
api3dtiles.layerName = '三维瓦片图层';

api3dtiles.clearPipeLayer = function () {
  const { WE } = window;
  api3dtiles.pipe.forEach((name) => {
    WE.layerManager.remove(name);
  });
};

api3dtiles.load3dtiles = function (value) {
  const { WE } = window;
  if (value === '三维管线') {
    api3dtiles.load3dtilesPipe();
    return;
  }
  const { layerName } = api3dtiles;
  WE.layerManager.remove(layerName);

  if (value === '') {
    WE.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
    api3dtiles.clearPipeLayer();
    return;    
  }

  const options = exp3dtilesData.data[value];
  const { view, exp3dtilesShader } = options;
  if (Cesium.defined(exp3dtilesShader)) {
    options.enableModelExperimental = true;
    options.customShader = exp3dtilesShader.getCustomShader();
  }
 
  const tileset = WE.layerManager.addTilesetLayer(options, layerName);   

  if (Cesium.defined(exp3dtilesShader)) {
    exp3dtilesShader.decorate(tileset);
  }

  tileset.readyPromise.then(() => {
    if (Cesium.defined(options.decorator)) {
      options.decorator.createScene(tileset, WE);
    }
    if (Cesium.defined(view)) {
      const vp = new WeatherEarth.ViewPoint(view);
      WE.viewer.camera.flyTo({
        destination: vp.cartesion3,
        orientation: {
          heading: vp.heading,
          pitch: vp.pitch,
          roll: vp.roll
        },
        duration: 0.0
      });
    } else {
      const bs = tileset.boundingSphere;
      const cartographic = Cesium.Cartographic.fromCartesian(bs.center, undefined, new Cesium.Cartographic());
      const destination = Cesium.Cartesian3.fromRadians(cartographic.longitude,
        cartographic.latitude, cartographic.height + bs.radius * 2.0);
      WE.viewer.camera.flyTo({
        destination,
        duration: 1.0
      }); 
    }
  });
};

api3dtiles.load3dtilesPipe = function () {
  api3dtiles.clearPipeLayer();
  const data = api3dtiles.pipe;
  
  const { WE } = window;
  WE.viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
  data.forEach((name) => {
    const url = `${WeatherEarth.Config.AssetUrl}/3dtiles/sx/${name}/tileset.json`;
    const layer = WE.layerManager.addPipeLayer({ url }, name);
    if (name === data[0]) {
      layer.readyPromise.then((tileset) => {
        WE.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.8, tileset.boundingSphere.radius * 2.3));
      });
    }
  });
};

export default api3dtiles;
