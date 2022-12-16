import FlyingPlaneManager from '../WeatherEarthExtension/FlyingPlaneManager';
import FlightManager from '../WeatherEarthExtension/FlightManager';
import apiRadar from './apiRadar';
import apiWidget from './apiWidget';
import expFlyData from './expFlyData';

function apiFly() {

}

apiFly._showEco = false;

apiFly.showEco = function (value) {
  apiFly._showEco = value;
  expFlyData.radarData.forEach((element) => {
    const { WE } = window;
    const { layerName } = element;
    const layer = WE.layerManager.getById(layerName);
    if (Cesium.defined(layer)) {
      layer.showGrid = value;
    }
  });
};

apiFly.loadRadar = function (value) {
  if (value) {
    let layerName;
    expFlyData.radarData.forEach((element) => {
      element.showEco = apiFly._showEco;
      apiRadar.addRadarLayer(element);
      layerName = element.layerName;
    });
    apiRadar.showOrHideLengend(layerName);
  } else {
    apiRadar.clear();
    apiRadar.showOrHideLengend();
  }
};

// 航飞路径
apiFly.loadFlightPath = function (value, jsonUrl) {
  const { WE } = window;

  if (!Cesium.defined(WE.flightManager)) {
    WE.flightManager = WE.viewer.scene.primitives.add(new FlightManager());
  }

  const iconUrl = WeatherEarth.Config.AssetUrl + '/21847.png';
  const modelUrl = WeatherEarth.Config.AssetUrl + '/model/helicopter/scene.gltf';
  // const modelUrl = WeatherEarth.Config.AssetUrl + '/model/feiji.glb';

  if (value === '') {
    WE.WeExt.zoomToNow();
    WE.flightManager.removeAll();
    return;
  }
  if (value === '全部') {
    const promise1 = apiWidget.showTiltToolTip(true, './data/TiltToolTipFly.json');
    const url = Cesium.defaultValue(jsonUrl, './data/FlightPath.json');
    const promise2 = Cesium.Resource.fetchJson(url);

    Promise.all([promise1, promise2]).then((results) => {
      const flightPathData = results[1];
      const startTime = WE.WeExt.today06;
      const stopTime = WE.WeExt.today18;
      const flightPathOptions = {
        WE,
        billborad: {
          size: 16,
          url: iconUrl,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          pixelOffset: new Cesium.Cartesian2(0, -10)
        }
      };
      const flightPlaneOptions = {
        model: {
          url: modelUrl,
          minimumPixelSize: 96,
          silhouetteColor: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
          silhouetteSize: 1.0,
          shadows: Cesium.ShadowMode.DISABLED,
          allowPicking: false,
        },
        icon: {
          height: 12,
          width: 12,
          pixelOffset: new Cesium.Cartesian2(20, -20),
          scaleByDistance: new Cesium.NearFarScalar(10, 2.0, 150000, 2.0),
          pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1000, 2, 150000, 1),
          disableDepthTestDistance: 1000,
          image: iconUrl,
        },
        startTime,
        stopTime
      };

      Object.keys(flightPathData).forEach((flight) => {
        const tooltip = WE.WeExt.tooltipManager.getById(flight);
        const path = flightPathData[flight];
        const options = {
          plane: flightPlaneOptions,
          path: flightPathOptions,
          tooltip,
        };
        const flightPlanePath = WE.flightManager.add(options);
        const stations = [];
        let idx = 0;
        Object.keys(path).forEach((element) => {
          const id = `航线点_${element}_${idx++}`;
          const station = path[element];
          const longitude = station[0];
          const latitude = station[1];
          flightPlanePath.push({ id, longitude, latitude });
          stations.push({ longitude, latitude });
        });
        for (let i = 2; i < stations.length; i++) {
          const station = stations[stations.length - i - 1];
          flightPlanePath.pushPlanePosition(station);
        }
        flightPlanePath.show = true;
      });

      WE.WeExt.zoomToToday(startTime, stopTime);
      WE.viewer.clock.currentTime = startTime;
      WE.viewer.clock.multiplier = 100;
      WE.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      WE.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
    });
  }
};

apiFly.trackId = 'trackPlane';
// 飞行航迹
apiFly.loadFlightPlane = function (value) {
  const planeUrl = WeatherEarth.Config.AssetUrl + '/model/Cesium_Air.glb';

  const { WE } = window;

  if (!Cesium.defined(WE.flyingPlaneManager)) {
    WE.flyingPlaneManager = WE.viewer.scene.primitives.add(new FlyingPlaneManager());
    WE.trackFlyObject = [];
  }

  const { flyingPlaneManager } = WE;

  if (WE.trackFlyObject.length > 0) {
    WE.trackFlyObject.forEach((element) => {
      flyingPlaneManager.remove(element);
    });
    WE.trackFlyObject = [];
  }

  WE.viewer.entities.removeById(apiFly.trackId);

  if (value === '') {
    return;
  }

  WE.WeExt.zoomToToday();
  const startTime = WE.WeExt.today00;
  WE.viewer.clock.currentTime = startTime;
  WE.viewer.clock.multiplier = 10;

  // 测试数据的开始时间
  WE.viewer.clock.currentTime = Cesium.JulianDate.addSeconds(startTime, 28800 + 4498, new Cesium.JulianDate());

  Cesium.Resource.fetchJson(WeatherEarth.Config.AssetUrl + '/fly/fly1.json').then((json) => {
    Object.keys(json).forEach((element) => {
      const data = json[element];
      if (data.length > 0) {
        const departure = data[0].departure;
        const destination = data[0].destination;
        const position = Cesium.Cartesian3.fromDegrees(data[0].lon, data[0].lat, data[0].height);
        const plane = WE.flyingPlaneManager.add({
          id: element,
          departure,
          destination,
          position,
          lastUpdateSeccond: 0,
          startTime,
          minimumPixelSize: 32.0,
          color: new Cesium.Color(0.5, 0.5, 1.0, 1.0),
          silhouetteSize: 1.0,
          url: planeUrl
        });

        WE.trackFlyObject.push(plane);

        // 设置个定时器不断的取航迹数据推送进来
        setTimeout(() => {
          const p = WE.flyingPlaneManager.getById(element);
          for (let i = 1; i < data.length; i++) {
            const d = data[i];
            p.pushData(d);
          }
        }, 1000);
      }
    });

    // 模拟跟随飞机视角
    // 停止跟随使用
    // 
    // WE.viewer.entities.removeById('trackEntity');

    setTimeout(() => {
      const p = WE.flyingPlaneManager.getById('ARR002');
      if (Cesium.defined(p)) {
        const id = apiFly.trackId;
        const positionPro = p.positionProperty;
        WE.viewer.entities.removeById(id);
        const trackEntity = WE.viewer.entities.add(new Cesium.Entity({
          id,
          position: positionPro,
          point: {
            pixelSize: 1
          }
        }));
        WE.viewer.trackedEntity = trackEntity;
      }
    }, 2000);
  });
};

export default apiFly;
