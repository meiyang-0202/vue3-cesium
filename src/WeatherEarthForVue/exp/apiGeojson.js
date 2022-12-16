import GeojsonPrimitive from '../WeatherEarthExtension/GeojsonPrimitive';
import GeometryAnimaition from '../WeatherEarthExtension/GeometryAnimation';
import apiMaterial from './apiMaterial';

function apiGeojson() {

}

apiGeojson.data = {
  水库: {
    url: `${import.meta.env.VITE_APP_ASSETS}/geojson/water.geojson`,
    view: {
      longitude: 1.856713, latitude: 0.470813, height: 6063.056, heading: 0.17, pitch: -0.33, roll: 0.00
    }
  },
  武汉_路网: {
    url: `${import.meta.env.VITE_APP_ASSETS}/geojson/wh_road.geojson`,
  },
  武汉_水域: {
    url: `${import.meta.env.VITE_APP_ASSETS}/geojson/wh_water.geojson`
  },
  中国: {
    url: `${import.meta.env.VITE_APP_ASSETS}/geojson/china.json`
  },
  隧道: {
    url: `${import.meta.env.VITE_APP_ASSETS}/dizhi/suidao/suidao.geojson`
  },
  断面: {
    url: `${import.meta.env.VITE_APP_ASSETS}/cky/kzdm.geojson`
  }
};

apiGeojson.layerName = '矢量图层';
apiGeojson.dataSource = undefined;
apiGeojson.primitive = undefined;

apiGeojson.loadGeojson = function (value) {
  const { layerName } = apiGeojson;
  const { WE } = window;

  if (value === '') {
    WE.layerManager.remove(layerName);
    if (Cesium.defined(apiGeojson.dataSource)) {
      WE.viewer.dataSources.remove(apiGeojson.dataSource);
      apiGeojson.dataSource = undefined;
    }
    if (Cesium.defined(apiGeojson.primitive)) {
      WE.viewer.scene.primitives.remove(apiGeojson.primitive);
      apiGeojson.primitive = undefined;
    }
    WE.WeExt.zoomToNow();
    return;
  }

  const options = apiGeojson.data[value];
  const { url, view } = options;

  if (value.indexOf('水库') !== -1) {
    const promise = GeojsonPrimitive.load(url, options);
    promise.then((geojsonInstance) => {
      const appearance = apiMaterial.getWaterAppearance({
        baseWaterColor: Cesium.Color.fromBytes(20, 44, 37, 200),
        blendColor: Cesium.Color.fromBytes(20, 44, 37, 200),
      });
      const { geometryInstances } = geojsonInstance;
      const property = WE.WeExt.createTodayProperty(geometryInstances.length);

      apiGeojson.primitive = WE.viewer.scene.primitives.add(new GeometryAnimaition({
        appearance,
        geometryInstances,
        property
      }));

      WE.WeExt.zoomToToday(WE.WeExt.today00, WE.WeExt.today24);
    });
  } else if (value.indexOf('水') !== -1) {
    const promise = GeojsonPrimitive.load(url, options);
    promise.then((geojsonInstance) => {
      const appearance = apiMaterial.getWaterAppearance({
        baseWaterColor: Cesium.Color.fromBytes(20, 44, 37, 200),
        blendColor: Cesium.Color.fromBytes(20, 44, 37, 200),
      });
      const { geometryInstances } = geojsonInstance;
      const primitive = new Cesium.GroundPrimitive({
        geometryInstances,
        appearance,
        asynchronous: true
      });
      apiGeojson.primitive = WE.viewer.scene.primitives.add(primitive);
    });
  } else if (value.indexOf('路') !== -1) {
    const promise = GeojsonPrimitive.load(url, options);
    promise.then((geojsonInstance) => {
      const { geometryInstances } = geojsonInstance;
      WE.WeExt.primitiveManager.addODLine({
        geometryInstances,
        image: require('@/assets/images/flow1.webp'),
        repeat: 5,
      });
    });
  } else if (value === '断面') {
    const minimumHeight = 200;
    const maximumHeight = 350;
    options.createLineString = (dataSource,
      geoJson,
      crsFunction,
      coordinates) => {
      const positions = new Array(coordinates.length);
      for (let i = 0; i < coordinates.length; i++) {
        const p = coordinates[i];
        positions[i] = Cesium.Cartesian3.fromDegrees(p[0], p[1]);
      }

      const instance = new Cesium.GeometryInstance({
        geometry: Cesium.WallGeometry.fromConstantHeights({
          positions,
          minimumHeight,
          maximumHeight,
        }),
      });

      dataSource.geometryInstances.push(instance);
    };
    const promise = GeojsonPrimitive.load(url, options);
    promise.then((geojsonInstance) => {
      const fragmentSource = apiMaterial.getFragmentSource('shaderMovingGradient');
      const appearance = apiMaterial.getAppearance({ fragmentSource });
      appearance.renderState.cull.enabled = false;
      const { geometryInstances } = geojsonInstance;
      const primitive = new Cesium.Primitive({
        geometryInstances,
        appearance,
        asynchronous: true
      });
      apiGeojson.primitive = WE.viewer.scene.primitives.add(primitive);
    });
  } else {
    const id = layerName;
    const promise = Cesium.GeoJsonDataSource.load(url, { id, clampToGround: true });
    promise.then((dataSource) => {
      apiGeojson.dataSource = dataSource;
      WE.viewer.dataSources.add(dataSource);
    });
  }

  if (Cesium.defined(view)) {
    WE.WeExt.jumpToViewpoint(view);
  }
};

export default apiGeojson;
