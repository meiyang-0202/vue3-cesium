import expImageryData from './expImageryData';
import expWindData from './expWindData';

function apiImagery() {

}

apiImagery.layerName = '气象图片图层';

apiImagery.loadImage = function (value) {
  const { WE } = window;
  const { layerName } = apiImagery;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }

  const data = expImageryData.imageData[value];
  const { url } = data;

  // test
  if (!Cesium.defined(url)) {
    const url1 = `${import.meta.env.VITE_APP_ASSETS}/liulin/qpe/Z_OTHE_RADAMQPE_60_20210810000000.png`;
    const url2 = `${import.meta.env.VITE_APP_ASSETS}/21847.png`;
    const layer = WE.layerManager.addAnimationImageryLayer({
      url: '{name}',
      rectangle: Cesium.Rectangle.fromDegrees(107, 27, 117, 35),
      name: url1
    }, layerName);
    layer.readyPromise.then(() => {
      setTimeout(() => {
        layer.name = url2;
      }, 3000);
    });
  } else if (data.ext === 'w3dm') {
    apiImagery.loadw3dm(url, layerName);
  } else {
    apiImagery.loadGridData(url, layerName);
  }
};

apiImagery.loadGridData = function (url, layerName) {
  Cesium.Resource.fetchJson(url).then((json) => {
    const { WE } = window;
    const width = json.lonCount;
    const height = json.latCount;

    const data = json.DS;

    function getDataWithXY(x, y) {
      const d = (height - y) * width + x;

      return data[d];
    }

    const west = json.startLon;
    const east = json.endLon;
    const south = json.startLat;
    const north = json.endLat;
    const tileWidth = 1024;
    const tileHeight = tileWidth;
    const provider = new WeatherEarth.CustomTileImageryProvider({
      tilingScheme: new Cesium.GeographicTilingScheme({
        rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north),
        numberOfLevelZeroTilesX: 1,
        numberOfLevelZeroTilesY: 1,
      }),
      color: Cesium.Color.YELLOW,
      maximumLevel: 0,
      tileWidth,
      tileHeight,
    });

    provider.requestImage = function (
      x,
      y,
      level,
      request
    ) {
      // eslint-disable-next-line no-bitwise
      const numTileAtLevel = 1 << level;
      const childWidth = width / numTileAtLevel;
      const childHeight = height / numTileAtLevel;
      const offsetX = Math.floor(childWidth * x);
      const offsetY = Math.floor(childHeight * y);

      const canvas = document.createElement('canvas');
      const canvasSize = tileWidth;

      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const context = canvas.getContext('2d');

      const cssColor = this._color.toCssColorString();

      context.strokeStyle = cssColor;
      context.lineWidth = 1;
      // context.strokeRect(1, 1, canvas.width - 1, canvas.height - 1);
      // console.info(`level:${level} childWidth:${childWidth} offsetX:${offsetX}  offsetY:${offsetY}`);

      context.font = 'bold 12px Arial';
      context.textAlign = 'center';
      context.fillStyle = cssColor;
      const textWidth = 22;
      const sc = Math.floor(canvasSize / textWidth);
      const mergin = (canvasSize - sc * textWidth) * 0.5;

      for (let i = 0; i < sc; i++) {
        for (let j = 0; j < sc; j++) {
          const px = (mergin + (i + 0.5) * textWidth) / canvasSize;
          const py = (mergin + (j + 0.5) * textWidth) / canvasSize;
          const cx = Math.floor(px * canvasSize);
          const cy = Math.floor(py * canvasSize);
          const ox = offsetX + Math.floor(px * childWidth);
          const oy = offsetY + Math.floor(py * childHeight);
          const t = getDataWithXY(ox, oy);
          const label = t ? t.toFixed(1) : '';
          if (label !== '') {
            context.fillText(`${label}`, cx, cy);
          }
        }
      }

      return Promise.resolve(canvas);
    };

    WE.layerManager.addImageryProvider(provider, this.layerName);
  });
};

apiImagery.loadw3dm = function (url, layerName) {
  const { WE } = window;
  const options = {
    url: 'http://127.0.0.1:9084/OCserver/OC?name=20220615_18&ext=grib&varName=NcepTmp&filter=undefined',
    ext: 'w3dm',
    ValueAndColorRamp: expImageryData.TFWindyRH,
    flipX: false,
  };

  const layer = WE.layerManager.addAnimationImageryLayer(options, layerName);
  layer.alpha = 0.8;
  WE.layerManager.raiseToTop('地形蒙皮');
  WE.layerManager.raiseToTop('境界');
  WE.layerManager.raiseToTop('注记');
};
export default apiImagery;
