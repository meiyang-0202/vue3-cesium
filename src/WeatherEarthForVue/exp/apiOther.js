import apiGeojson from './apiGeojson';

function apiOther() {

}

apiOther.layerName = '其他图层';
apiOther.dataSource = undefined;

apiOther.loadKML = function (value) {
  const { layerName } = apiOther;
  const { WE } = window;

  if (value === '') {
    WE.layerManager.remove(layerName);
    return;
  }
  const id = layerName;
  const url = `${WeatherEarth.Config.AssetUrl}/kml/nation.kml`;
  WE.layerManager.addKMLLayer(url, { id, clampToGround: true });
};

apiOther.loadGeojson = function (value) {
  const { layerName } = apiOther;
  const { WE } = window;

  if (value === '') {
    WE.layerManager.remove(layerName);
    if (Cesium.defined(apiOther.dataSource)) {
      WE.viewer.dataSources.remove(apiOther.dataSource);
      apiOther.dataSource = undefined;
    }
    return;
  }

  const options = apiGeojson.data[value];
  const { url } = options;

  if (value === '水库') {
    apiOther.loadGeojson3(value);
    return;
  }
  const id = layerName;
  const promise = Cesium.GeoJsonDataSource.load(url, { id, clampToGround: true });
  promise.then((dataSource) => {
    apiOther.dataSource = dataSource;
    WE.viewer.dataSources.add(dataSource);
  });
};

apiOther.loadGeojson3 = function (value) {
  const { layerName } = apiOther;
  const { WE } = window;

  if (value === '') {
    WE.layerManager.remove(layerName);
    if (Cesium.defined(apiOther.dataSource)) {
      WE.viewer.dataSources.remove(apiOther.dataSource);
      apiOther.dataSource = undefined;
    }
    return;
  }
  const id = layerName;
  const url = `${import.meta.env.VITE_APP_ASSETS}/water.geojson`;
  const promise = Cesium.GeoJsonDataSource.load(url, { id, clampToGround: true });
  promise.then((dataSource) => {
    const entities = dataSource.entities.values;
    let i = 0;

    entities.forEach((entity) => {
      entity.show = i === 0;
      i++;
      entity.polygon.material = new Cesium.GridMaterialProperty({
        color: Cesium.Color.fromCssColorString('#0000FF'),
        cellAlpha: 1.0,
        lineCount: new Cesium.Cartesian2(8, 8),
        lineThickness: new Cesium.Cartesian2(2.0, 2.0),
      });
    });
    apiOther.dataSource = dataSource;
    WE.viewer.dataSources.add(dataSource);
    setInterval(() => {
      if (i > entities.length - 1) { i = 0; }
      let prei = i - 1;
      if (prei === -1) { prei = entities.length - 1; }
      entities[prei].show = false;
      entities[i].show = true;
      i++;
    }, 200);
  });
};

apiOther.loadGeojson2 = function (value) {
  const { layerName } = apiOther;
  const { WE } = window;

  if (value === '') {
    WE.layerManager.remove(layerName);
    return;
  }
  const id = layerName;
  const url = `${import.meta.env.VITE_APP_ASSETS}/water.geojson`;
  WE.layerManager.addGeoJsonDataSource(url, { id, clampToGround: true });
};




export default apiOther;
