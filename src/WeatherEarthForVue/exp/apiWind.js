function apiWind() {

}

apiWind.layerName = '风场';

apiWind.clear = function () {
  const { WE } = window;
  const { layerName } = apiWind;

  WE.layerManager.remove(layerName);
};

apiWind.loadGrib = function (value) {
  const { WE } = window;
  const { layerName } = apiWind;

  apiWind.clear();
  if (!value) {
    return;
  }

  const flipY = false;
  const showSpeed = true;
  const imageryBaseWind = false;
  const name = 'Z_NAFP_C_BABJ_20201012110809_P_CLDAS_RT_CHN_0P05_HOR-WIN-2020101211';
  const varname = 'CDAEDA2F';
  const ext = 'grb2';

  const options = {
    name,
    varname,
    ext,
    flipY,
    showSpeed,
    imageryBaseWind,
    // makeUrlCallback() {
    //   const url = 'http://www.hxgis.com:8084/Assets/Z_NAFP_C_BABJ_20201012110809_P_CLDAS_RT_CHN_0P05_HOR-WIN-2020101211.CDAEDA2F.w3dm';
    //   return url;
    // }
  };
  const layer = WE.layerManager.addMapBoxWindImageryLayer(options, layerName);
  layer.colorWithSpeed = true;
  WE.layerManager.raiseToTop('注记');
};

apiWind.loadOther = function (value) {
  apiWind.clear();
  if (value === '') {
    return;
  }
  const { WE } = window;
  const { layerName } = apiWind;
  const options = {
    showSpeed: true,
    flipY: true,
    flipX: false,
    imageryBaseWind: false,
    makeUrlCallback() {
      const url = 'http://127.0.0.1:9084/OCserver/OC?name=20220615_18&ext=grib&varName=NcepUV&filter=undefined';
      return url;
    }
  };
  const layer = WE.layerManager.addMapBoxWindImageryLayer(options, layerName);
  layer.colorWithSpeed = false;
  WE.layerManager.raiseToTop('注记');
};

apiWind.loadNcep = function (value) {
  const { WE } = window;
  const { layerName } = apiWind;

  if (value === '') {
    apiWind.clear();
    return;
  }

  value = value.replaceAll('/', '');
  value = value.replaceAll(' ', '_');
  const name = 'NCEP_' + value;
  const ext = 'grib';
  const varname = '60443D5C';
  const flipX = false;
  const imageryBaseWind = false;
  const options = {
    name,
    varname,
    flipX,
    ext,
    imageryBaseWind,
    ffx: 4,
    showSpeed: false,
  };
  let layer = WE.layerManager.getById(layerName);
  if (Cesium.defined(layer)) {
    layer.currentName = name;
    return;
  }
  layer = WE.layerManager.addMapBoxWindImageryLayer(options, layerName);
  layer._changeView = true;
  layer.speedFactor = 0.25;
  layer.drop_rate = 0.003;
  layer.fadeOpacity = 0.976;
  layer.colorWithSpeed = true;

  //
  layer.speedFactor = 0.55;
  layer.drop_rate = 0.03;
  layer.pointSize = 4.0;
  layer.drop_rate = 0.01;
  layer.fadeOpacity = 0.9996;
  layer.colorWithSpeed = false;
};

apiWind.loadTyphoon = function (value) {
  const { WE } = window;

  WE.earthPinCollection.remove('台风信息');
  WE.layerManager.remove('台风路径');
  WE.earthPinCollection.remove('台风名称');
  if (value === '') {
    WE.handlerManager.stop();
    WE.layerManager.showDetectiveLine = false;
    return;
  }
  WE.layerManager.showDetectiveLine = true;

  const parseTime = function (str) {
    return (
      '2021-'
      + str.substr(0, 2)
      + '-'
      + str.substr(2, 2)
      + 'T'
      + str.substr(4, 2)
      + ':'
      + str.substr(6, 2)
    );
  };

  const url = WeatherEarth.Config.AssetUrl + '/gfkd/typhoon/' + value + '.json';
  Cesium.Resource.fetchJson(url).then((json) => {
    const length = json.data.length;
    const data = json.data;
    if (!Cesium.defined(length) || length < 0) {
      return;
    }

    const start = Cesium.JulianDate.fromIso8601(
      parseTime(json.data[length - 1].xianzaishijian)
    );
    const stop = Cesium.JulianDate.fromIso8601(
      parseTime(json.data[0].xianzaishijian)
    );

    const gregorianStart = Cesium.JulianDate.toGregorianDate(start);
    const name = `${data[0].bianhao}${data[0].zhongwenbianhao}</br>
      ${gregorianStart.month}月${gregorianStart.day}日${gregorianStart.hour}时`;

    WE.viewer.clock.startTime = start.clone();
    WE.viewer.clock.stopTime = stop.clone();
    WE.viewer.clock.currentTime = start.clone();
    WE.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop at the end
    WE.viewer.clock.clockStep = Cesium.ClockStep.TICK_DEPENDENT;
    WE.viewer.clock.multiplier = 20;
    WE.viewer.timeline.zoomTo(start, stop);

    const linePositions = [];
    const timePositions = [];
    const levels = [];
    for (let i = length - 1; i > -1; i--) {
      const d = json.data[i];
      const time = Cesium.JulianDate.fromIso8601(
        parseTime(d.xianzaishijian)
      );
      const longitude = parseFloat(d.xianzaijindu);
      const latitude = parseFloat(d.xianzaiweidu);
      const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);
      linePositions.push(position);
      timePositions.push(time);

      const jb = d.taifengjibie;
      const level = jb.substr(0, jb.indexOf('级'));
      levels.push(level);
    }

    WE.earthPinCollection.add(new WeatherEarth.EarthPin({
      id: '台风名称',
      graphy: new WeatherEarth.Tooltip({ align: 'right' }),
      content: name,
      position: linePositions[0]
    }));

    const onIndexChangedFunction = function (layer,
                                             propertyName,
                                             newValue,
                                             currentPos) {
      if (newValue > -1 && newValue < data.length) {
        const d = data[data.length - newValue - 1];

        const c = {};
        if (Cesium.defined(d.fenglifor7Northeast)
          && Cesium.defined(d.fenglifor7Northwest)
          && Cesium.defined(d.fenglifor7Southeast)
          && Cesium.defined(d.fenglifor7Southwest)) {
          c.enws7 = {
            e: d.fenglifor7Northeast,
            n: d.fenglifor7Northwest,
            w: d.fenglifor7Southwest,
            s: d.fenglifor7Southeast,
          };
        }
        if (Cesium.defined(d.fenglifor10Northeast)
          && Cesium.defined(d.fenglifor10Northwest)
          && Cesium.defined(d.fenglifor10Southeast)
          && Cesium.defined(d.fenglifor10Southwest)) {
          c.enws10 = {
            e: d.fenglifor10Northeast,
            n: d.fenglifor10Northwest,
            w: d.fenglifor10Southwest,
            s: d.fenglifor10Southeast,
          };
        }
        layer.windCircleKey = c;
      }
    };

    const layer = WE.layerManager.addTyphoonLayer({
      positions: linePositions,
      times: timePositions,
      levels,
      indexChangedCallback: onIndexChangedFunction,
      typhoonImage: WeatherEarth.Config.AssetUrl + '/typhoon.gif'
    }, '台风路径');

    const forecast = json.forecast;
    if (Cesium.defined(forecast)) {
      const colors = [Cesium.Color.RED,
        Cesium.Color.GREEN,
        Cesium.Color.ORANGE,
        Cesium.Color.YELLOW,
        Cesium.Color.PINK,
        Cesium.Color.ANTIQUEWHITE,
        Cesium.Color.CHARTREUSE,
        Cesium.Color.DARKKHAKI];
      // eslint-disable-next-line camelcase
      let color_i = 0;
      Object.keys(forecast).forEach((element) => {
        // eslint-disable-next-line no-shadow
        const data = forecast[element];
        if (
          !Cesium.defined(data)
          || !Cesium.defined(data.length)
          || data.length < 0
        ) {
          return;
        }
        // eslint-disable-next-line camelcase
        const color = colors[color_i++];
        // eslint-disable-next-line no-shadow
        const linePositions = [];
        for (let i = 0; i < data.length; i++) {
          let longitude = parseFloat(data[i].yubaojindu);
          let latitude = parseFloat(data[i].yubaoweidu);
          if (i === data.length - 1) {
            longitude = parseFloat(data[i].xianzaijindu);
            latitude = parseFloat(data[i].xianzaiweidu);
          }
          const position = Cesium.Cartesian3.fromDegrees(
            longitude,
            latitude,
            0.0
          );
          linePositions.push(position);
        }
        layer.addForecastRoute({ positions: linePositions, color });
      });
    }

    WE.handlerManager.startPick({
      handleType: 'CommonPick',
      color: Cesium.Color.RED,
    });

    WE.handlerManager.currentHander.onMovePickFeature = undefined;
    WE.handlerManager.currentHander.onPickFeature = function (
      entity,
      propertyName,
      screenPosition,
      oldValue
    ) {
      if (Cesium.defined(entity) && Cesium.defined(entity.id)) {
        const index = entity.id;
        const d = data[data.length - 1 - index];
        const info = `编号:${d.bianhao}
          <br/>级别:${d.taifengjibie}
          <br/>位置:${d.xianzaijindu},${d.xianzaiweidu}`;

        WE.earthPinCollection.remove('台风信息');
        const pin = new WeatherEarth.EarthPin({
          id: '台风信息',
          graphy: new WeatherEarth.Tooltip({ align: 'top' }),
          content: info,
          position: linePositions[index],
        });
        WE.earthPinCollection.add(pin);
      }
    };
  });
};

apiWind.showDetectiveLine = function (value) {
  const { WE } = window;
  WE.layerManager.showDetectiveLine = value;
};

apiWind.stormUrl = `${import.meta.env.VITE_APP_ASSETS}/getLatestStorms.json`;
apiWind.stormLineEntitys = [];
apiWind.loadStorm = function (value) {
  const { WE } = window;

  if (!value) {
    apiWind.stormLineEntitys.forEach((e) => {
      WE.viewer.entities.remove(e);
    });
    apiWind.stormLineEntitys = [];
    return;
  }
  const height = 1000;
  const url = apiWind.stormUrl;
  Cesium.Resource.fetchJson(url).then((json) => {
    if (json.returnCode === 0) {
      const data = JSON.parse(json.DS);
      data.forEach((storm) => {
        const positions = [];
        const { currentPosition, forecastPoints, postPoints } = storm;
        postPoints.reverse();
        postPoints.forEach((fp) => {
          positions.push(Cesium.Cartesian3.fromDegrees(fp.lng, fp.lat, height));
        });
        const breakIdx = positions.length + 1;
        currentPosition.forEach((fp) => {
          positions.push(Cesium.Cartesian3.fromDegrees(fp.lng, fp.lat, height));
        });
        forecastPoints.forEach((fp) => {
          positions.push(Cesium.Cartesian3.fromDegrees(fp.lng, fp.lat, height));
        });

        for (let i = 0; i < positions.length; i++) {
          if (i === positions.length - 1) {
            break;
          }
          const entity = WE.viewer.entities.add({
            polyline: {
              positions: [positions[i], positions[i + 1]],
              width: 10,
              arcType: Cesium.ArcType.GEODESIC,
              material: new Cesium.PolylineArrowMaterialProperty(
                i < breakIdx ? Cesium.Color.BLUE : Cesium.Color.RED
              ),
              clampToGround: true,
            },
          });
          apiWind.stormLineEntitys.push(entity);
        }
      });
    }
  });
};


apiWind.load3DWind = function (value) {
  const { WE } = window;
  WE.layerManager.remove('粒子风场');
  if (!value) {
    WE.viewer.scene.globe.terrainExaggeration = 1;
    return;
  }
  const nc = {
    name: 'eastward_wind_00',
    varname: '2639B195',
    ext: 'npy',
  };
  const windLayer = WE.layerManager.addWindLayer(nc, '粒子风场');
  windLayer.showAnimation = true;
  windLayer.disableGlobelDepth = true;
  windLayer.alpha = 0.5;
  windLayer.sliceZ = 0.7;
  const panel = {};
  windLayer.panel.maxParticles = panel.maxParticles = 256 * 256;
  windLayer.panel.dropRateBump = panel.dropRateBump = 0.0;
  windLayer.scaleHeight = panel.scaleHeight = 300.0;
  windLayer.filtrationMin = panel.filtrationMin = 8.0;

  const url = `${import.meta.env.VITE_APP_ASSETS}/ggter/`;
  const terrainLayer = new Cesium.CesiumTerrainProvider({
    url,
    requestVertexNormals: false,
    requestWaterMask: false,
  });
  WE.viewer.terrainProvider = terrainLayer;
  WE.viewer.scene.globe.terrainExaggeration = 30;
};

apiWind.openNcepPage = function () {
  const url = window.location.href + 'ncep';
  window.open(url);
};

export default apiWind;
