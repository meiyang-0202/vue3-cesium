import TooltipManager from './TooltipManager';
import PointCollection from './PointCollection';
import LineCollection from './LineCollection';
import PrimitiveManager from './PrimitiveManager';
import WEagleMap from './WEagleMap';
import WeWebSocket from './WeWebSocket';

function WeExt(WE) {
  this.WE = Cesium.defaultValue(WE, window.WE);
  this._today00 = undefined;
  this._today06 = undefined;
  this._today12 = undefined;
  this._today18 = undefined;
  this._today24 = undefined;
  this._tooltipManager = undefined;
  this._primitiveManager = undefined;
  this._pointCollection = undefined;
  this._lineCollection = undefined;
  this._eagleMap = undefined;
  this._webSocket = undefined;
}

console.log('aaaa');
console.log('vvvv');
console.log('aaaa');
console.log('vvvv');
console.log('aaaa');
console.log('vvvv');

WeExt.prototype.hourFromNow = function (options) {
  if (!options) {
    options = {};
  }
  const difHour = Cesium.defaultValue(options.difHour, 0);
  const todayHour = new Date(new Date().getTime() + (8 + difHour) * 3600 * 1000);
  const julianDT = Cesium.JulianDate.fromDate(todayHour, new Cesium.JulianDate());
  const gregorianDTNow = Cesium.JulianDate.toGregorianDate(julianDT);
  const month = gregorianDTNow.month < 10 ? `0${gregorianDTNow.month}` : `${gregorianDTNow.month}`;
  const day = gregorianDTNow.day < 10 ? `0${gregorianDTNow.day}` : `${gregorianDTNow.day}`;
  const hour = gregorianDTNow.hour < 10 ? `0${gregorianDTNow.hour}` : `${gregorianDTNow.hour}`;
  const time = `${gregorianDTNow.year}${month}${day}${hour}0000`;
  return time;
};

WeExt.prototype.currentViewpoint = function () {
  const { WE } = this;
  const data = WE.viewPoint.toJSON();
  console.info(data);
};

WeExt.prototype.jumpToViewpoint = function (options) {
  const { WE } = this;
  const vp = new WeatherEarth.ViewPoint(options);
  WE.viewer.camera.flyTo({
    destination: vp.cartesion3,
    orientation: {
      heading: vp.heading,
      pitch: vp.pitch,
      roll: vp.roll
    },
    duration: Cesium.defaultValue(options.duration, 0.0)
  });
};

WeExt.toggleTerrain = function (value) {
  const { WE } = this;
  if (value) {
    const url = `${import.meta.env.VITE_APP_PROXY_MAP_URL}cesium?terrain/`;
    const terrainLayer = new Cesium.CesiumTerrainProvider({
      url,
      requestVertexNormals: true,
      requestWaterMask: true,
    });
    WE.viewer.terrainProvider = terrainLayer;
  } else {
    WE.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider(WE.viewer.scene.globe.ellipsoid);
  }
};

WeExt.CesiumDemUrl = `${import.meta.env.VITE_APP_PROXY_MAP_URL}cesium?terrain/`;
WeExt.Cesium_DemVM = function () {
  return new Cesium.ProviderViewModel({
    name: 'Cesium高程',
    tooltip: 'Cesium高程',
    iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
    creationFunction() {
      const url = WeExt.CesiumDemUrl;
      const terrainLayer = new Cesium.CesiumTerrainProvider({
        url,
        requestVertexNormals: true,
        requestWaterMask: true,
        requestMetadata: true,
      });
      return terrainLayer;
    }
  });
};

WeExt.prototype.destroy = function () {
  this._tooltipManager = this._tooltipManager && this._tooltipManager.destroy();
  this._pointCollection = this._pointCollection && this._pointCollection.destroy();
};

Object.defineProperties(WeExt.prototype, {
  pointCollection: {
    get() {
      if (!Cesium.defined(this._pointCollection)) {
        const { WE } = this;
        this._pointCollection = WE.viewer.scene.primitives.add(new PointCollection());
      }
      return this._pointCollection;
    }
  },
  lineCollection: {
    get() {
      if (!Cesium.defined(this._lineCollection)) {
        const { WE } = this;
        this._lineCollection = WE.viewer.scene.primitives.add(new LineCollection());
      }
      return this._lineCollection;
    }
  },
  primitiveManager: {
    get() {
      if (!Cesium.defined(this._primitiveManager)) {
        const { WE } = this;
        this._primitiveManager = WE.viewer.scene.primitives.add(new PrimitiveManager());
      }
      return this._primitiveManager;
    }
  },
  tooltipManager: {
    get() {
      if (!Cesium.defined(this._tooltipManager)) {
        this._tooltipManager = new TooltipManager();
      }
      return this._tooltipManager;
    }
  },
  toolTipManager: {
    get() {
      if (!Cesium.defined(this._tooltipManager)) {
        this._tooltipManager = new TooltipManager();
      }
      return this._tooltipManager;
    }
  },
  today00: {
    get() {
      if (!Cesium.defined(this._today00)) {
        const currentTime = Cesium.JulianDate.now();
        this._today00 = currentTime.clone();
        this._today00.secondsOfDay = 14400;
      }
      return this._today00;
    }
  },
  today06: {
    get() {
      if (!Cesium.defined(this._today06)) {
        this._today06 = Cesium.JulianDate.addSeconds(
          this.today00,
          21600,
          new Cesium.JulianDate()
        );
      }
      return this._today06;
    }
  },
  today12: {
    get() {
      if (!Cesium.defined(this._today12)) {
        this._today12 = Cesium.JulianDate.addSeconds(
          this.today00,
          43200,
          new Cesium.JulianDate()
        );
      }
      return this._today12;
    }
  },
  today18: {
    get() {
      if (!Cesium.defined(this._today18)) {
        this._today18 = Cesium.JulianDate.addSeconds(
          this.today00,
          64800,
          new Cesium.JulianDate()
        );
      }
      return this._today18;
    }
  },
  today24: {
    get() {
      if (!Cesium.defined(this._today24)) {
        this._today24 = Cesium.JulianDate.addSeconds(
          this.today00,
          86400,
          new Cesium.JulianDate()
        );
      }
      return this._today24;
    }
  },
  eagleMap: {
    set(value) {
      this._eagleMap = this._eagleMap && this._eagleMap.destroy();
      this._eagleMap = new WEagleMap({ WE: value });
    },
    get() {
      return this._eagleMap;
    }
  },
  webSocket: {
    get() {
      return this._webSocket;
    }
  }
});

WeExt.prototype.initWebSocket = function (url) {
  this._webSocket = new WeWebSocket({ url });
};

WeExt.prototype.createEagle = function (container) {
  this.eagleMap = WeatherEarth.We.createSimpleDrawView(container);
  this.eagleMap.init();
};

WeExt.prototype.zoomToToday = function (startTime, stopTime) {
  const { WE } = this;
  if (!Cesium.defined(startTime)) {
    startTime = this.today00;
  }
  if (!Cesium.defined(stopTime)) {
    stopTime = this.today24;
  }
  const currentTime = Cesium.JulianDate.now();
  WE.viewer.clock.startTime = startTime;
  WE.viewer.clock.stopTime = stopTime;
  WE.viewer.clock.currentTime = currentTime;
  WE.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  WE.viewer.clock.multiplier = 10;
  if (WE.viewer.timeline) {
    WE.viewer.timeline.zoomTo(startTime, stopTime);
  }
};

WeExt.prototype.zoomToNow = function () {
  const { WE } = this;
  const currentTime = Cesium.JulianDate.now();
  WE.viewer.clock.startTime = this.today00;
  WE.viewer.clock.stopTime = this.today24;
  WE.viewer.clock.currentTime = currentTime;
  WE.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  WE.viewer.clock.multiplier = 1;
  if (WE.viewer.timeline) {
    WE.viewer.timeline.zoomTo(this.today00, this.today24);
  }
};

// 体过滤
WeExt.prototype.activeVolumeFilter = function (transparencyValueArr) {
  const { WE } = this;
  const collection = WE.layerManager.getVolumeLayerCollection();
  let hasChildView = false;
  collection.forEach((layer) => {
    hasChildView = hasChildView || Cesium.defined(layer.childWeatherVolume);
  });
  if (hasChildView) {
    WE.globalVolumeState.childState.filtrationMin = transparencyValueArr[0];
    WE.globalVolumeState.childState.filtrationMax = transparencyValueArr[1];
  } else {
    WE.globalVolumeState.filtrationMin = transparencyValueArr[0];
    WE.globalVolumeState.filtrationMax = transparencyValueArr[1];
  }
};

WeExt.prototype.createTodayProperty = function (num) {
  const property = new Cesium.SampledProperty(Number);
  property.addSample(this.today00, 0);
  property.addSample(this.today24, num - 1);
  return property;
};

WeExt.prototype.debugCanvas = function (c) {
  c.toBlob(
    (blob) => {
      const eleLink = document.createElement('a');
      eleLink.download = `${new Date().getTime()}_cavans.png`;
      eleLink.style.display = 'none';
      // 字符内容转变成blob地址
      eleLink.href = URL.createObjectURL(blob);
      // 触发点击
      document.body.appendChild(eleLink);
      eleLink.click();
      // 然后移除
      document.body.removeChild(eleLink);
    },
    'image/png',
    1
  );
};

export default WeExt;
