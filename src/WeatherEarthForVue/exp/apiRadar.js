/* eslint-disable no-undef */
import expRadarData from './expRadarData';
import RadarRainSimulator from '../WeatherEarthExtension/RadarRainSimulator';
import { WeStore } from '@/store/modules/weState'

const weStore = WeStore()
function apiRadar() {
}

apiRadar.layers = [];
apiRadar.layerName = '雷达图层';

console.log('aaaa');
console.log('bbbb');


apiRadar.showOrHideLengend = function () {
  const { WE } = window;
  const collection = WE.layerManager.getVolumeLayerCollection();
  let ShowLengend = false;
  if (collection.length > 0) {
    const layer = collection[0];
    if (Cesium.defined(layer)) {
      weStore.ChangeLengend(layer.ValueAndColorRamp);
      ShowLengend = layer.show;
    }
  }

  weStore.ShowVolumeButton(ShowLengend);
  weStore.ShowLengend(ShowLengend);
};

apiRadar.clear = function () {
  const { WE } = window;
  const collection = WE.layerManager.getVolumeLayerCollection();
  collection.forEach((layer) => {
    WE.layerManager.remove(layer.id);
  });

  apiRadar.layers.forEach((layername) => {
    WE.layerManager.remove(layername);
  });
  apiRadar.layers = [];
  apiRadar.showOrHideLengend();
};

apiRadar.addRadarLayer = function (options) {
  const { layerName } = options;
  const { WE } = window;
  WE.layerManager.remove(layerName);
  WeatherEarth.Config.HierarchyFloor = [0.0];
  const volumeOptions = {
    position: options.position,
    name: options.name,
    varname: options.varname,
    ext: options.ext,
    TransFunction: options.TransFunction,
    ValueAndColorRamp: options.ValueAndColorRamp,
    ValueAndColorRampChild: options.ValueAndColorRampChild,
    makeUrlCallback: options.makeUrlCallback,
    // enableCaches: false
    // ffx: 6
  };
  WE.globalVolumeState.scaleZ = Cesium.defaultValue(options.scaleZ, 1.0);

  const layer = WE.layerManager.addVolumeLayer(volumeOptions, layerName);

  if (Cesium.defaultValue(options.nearestSample, false)) {
    layer.minificationFilter = Cesium.TextureMinificationFilter.NEAREST;
    layer.magnificationFilter = Cesium.TextureMagnificationFilter.NEAREST;
  }

  layer.showInner = Cesium.defaultValue(options.showInner, false);
  layer.showGrid = Cesium.defaultValue(options.showEco, false);
  layer.alpha = Cesium.defaultValue(options.alpha, 1.0);

  const { offsetZ } = options;
  if (Cesium.defined(offsetZ) && offsetZ > 1.0) {
    if (layer.showInner) {
      WE.globalVolumeState.offsetZ = offsetZ;
    } else {
      WE.globalVolumeState.childState.offsetZ = offsetZ;
    }
  }

  WE.layerManager.raiseToTop('注记');
  WE.layerManager.raiseToTop('地形蒙皮');
  WE.layerManager.raiseToTop('境界');

  apiRadar.showOrHideLengend();
  apiRadar.layers.push(layerName);

  return layer;
};

apiRadar.loadRadar = function (options) {
  apiRadar.clear();
  const layer = apiRadar.addRadarLayer(options);
  return layer;
};

apiRadar.loadRadarOther = function (value) {
  const { layerName } = apiRadar;
  const options = expRadarData.otherData[value];
  apiRadar.clear();

  let layer;
  if (value !== '') {
    const volumeOptions = {
      name: options.name,
      varname: options.varname,
      ext: options.ext,
      layerName,
      TransFunction: options.TransFunction,
      ValueAndColorRamp: options.ValueAndColorRamp,
      ValueAndColorRampChild: options.ValueAndColorRampChild,
      showInner: options.showInner,
      nearestSample: options.nearestSample,
    };

    layer = apiRadar.addRadarLayer(volumeOptions);
  }

  return layer;
};

apiRadar.loadRadarAnime = function (value) {
  const { WE } = window;

  apiRadar.clear();
  if (value === '') {
    WE.WeExt.zoomToNow();
    return;
  }
  // WeatherEarth.Config.EnableCacheW3dm = true;
  const { layerName } = apiRadar;
  const data = expRadarData.animeData[value];
  const { url } = data;
  Cesium.Resource.fetchJson({ url }).then((json) => {
    const urls = json;
    const name = urls[0];

    const options = {
      name,
      varname: data.varname,
      ext: data.ext,
      layerName,
      TransFunction: data.TransFunction,
      ValueAndColorRamp: data.ValueAndColorRamp,
      ValueAndColorRampChild: data.ValueAndColorRampChild,
      showEco: data.showEco,
      showInner: data.showInner,
      buildChildVolume: data.buildChildVolume,
      offsetZ: data.offsetZ,
      nearestSample: data.nearestSample,
    };
    const { analystRain } = data;

    const layer = apiRadar.addRadarLayer(options);
    layer.readyPromise.then(() => {
      if (!layer.showInner) {
        layer.buildChildVolume = Cesium.defaultValue(options.buildChildVolume, true);
      }
      const timeSampleArray = new WeatherEarth.TimeSampleArray(
        urls,
        data.urlParseFunction
      );
      layer.timeSampleArray = timeSampleArray;
      WE.timeSystem.setRange(timeSampleArray.start, timeSampleArray.end);
      if (Cesium.defined(analystRain)) {
        const rainOptions = analystRain();
        RadarRainSimulator.create(layer, rainOptions);
      }
    });

    layer.alpha = 0.8;
  });
};

export default apiRadar;
