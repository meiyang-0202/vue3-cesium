import expThunderData from './expThunderData';
import Lightning from '../WeatherEarthExtension/Lightning';
import apiMaterial from './apiMaterial';
import PrimitiveGenerator from '../WeatherEarthExtension/PrimitiveGenerator';

function apiThunder() {

}

apiThunder.createThunderCanvas = function () {
  const styles1 = ['#e600ff', '#b84bff', '#9e81ff', '#aaacff'];
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 600;
  const ctx = c.getContext('2d');
  ctx.lineWidth = 40;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const offset = 200 * i;
    ctx.strokeStyle = '#000000';
    ctx.moveTo(100 + offset, 0);
    ctx.lineTo(100 + offset, 200);
    ctx.stroke();
    ctx.moveTo(0 + offset, 100);
    ctx.lineTo(200 + offset, 100);
    ctx.stroke();
  
    ctx.moveTo(0 + offset, 300);
    ctx.lineTo(200 + offset, 300);
    ctx.stroke();
  }
  ctx.lineWidth = 30;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const offset = 200 * i;
    ctx.strokeStyle = styles1[i];
    ctx.moveTo(100 + offset, 5);
    ctx.lineTo(100 + offset, 195);
    ctx.stroke();
    ctx.moveTo(5 + offset, 100);
    ctx.lineTo(195 + offset, 100);
    ctx.stroke();
  
    ctx.moveTo(5 + offset, 300);
    ctx.lineTo(195 + offset, 300);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(100 + offset, 500, 84, 0, 2 * Math.PI);
    ctx.fillStyle = styles1[i];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  }
  return c;
};

apiThunder.createFlashCanvas = function (options) {
  const { image } = options;
  const c1 = document.createElement('canvas');
  c1.width = image.width;
  c1.height = image.height;
  const ctx1 = c1.getContext('2d');
  ctx1.drawImage(image, 0, 0);
  const imgData = (ctx1.getImageData(0, 0, image.width, image.height)).data;
  const imgWidth = image.width - 100;
  const styles1 = [];
  const { row, col } = options;
  const count = col * row;
  for (let i = 0; i < count; i++) {
    const offset1 = i / count;
    const offset = 100 + Math.floor(offset1 * imgWidth);
    const r = imgData[offset * 4 + 0];
    const g = imgData[offset * 4 + 1];
    const b = imgData[offset * 4 + 2];
    const color = new Cesium.Color(r / 255.0, g / 255.0, b / 255.0, 1.0);
    const css = color.toCssColorString();
    styles1.push(css);
  }
  const c = document.createElement('canvas');
  c.width = col * 200;
  c.height = row * 200;
  const ctx = c.getContext('2d');
  ctx.lineWidth = 30;
  for (let j = 0; j < row; j++) {
    for (let i = 0; i < col; i++) {
      ctx.beginPath();
      const offset = 200 * i;
      ctx.strokeStyle = styles1[i];
      ctx.arc(100 + offset, 200 * j + 100, 84, 0, 2 * Math.PI);
      ctx.fillStyle = styles1[i + j * col];
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }
  }
  // const { WE } = window;
  // WE.WeExt.debugCanvas(c);
  return c;
};

apiThunder.layerName = '三维闪电';
apiThunder.primitives = [];

apiThunder.clear = function () {
  const { WE } = window;
  apiThunder.primitives.forEach((primitive) => {
    WE.viewer.scene.primitives.remove(primitive);
    apiThunder.primitives = [];
  });


  const { layerName } = apiThunder;
  WE.layerManager.remove(layerName);
};

apiThunder.loadThunder = function (value) {
  const { layerName } = apiThunder;
  apiThunder.clear();
  if (value === '') {
    return;
  }
  const options = expThunderData.data[value];
  const { WE } = window;
  if (value === '中国区') {
    apiThunder.loadThunderChina(value);
  } else if (value.startsWith('快闪')) {
    apiThunder.loadLightning(value);
  } else {
    const tileset = WE.layerManager.addTilesetLayer(options, layerName);
    tileset.style = new Cesium.Cesium3DTileStyle({
      color: {
        conditions: [
          ['true', "color('#FFFF00', 1.0)"],
        ]
      },
      pointSize: '6.0',
    });

    tileset.readyPromise.then(() => {
      const bs = tileset.boundingSphere;
      const cartographic = Cesium.Cartographic.fromCartesian(bs.center, undefined, new Cesium.Cartographic());
      const destination = Cesium.Cartesian3.fromRadians(cartographic.longitude,
        cartographic.latitude, cartographic.height + bs.radius * 2.0);
      WE.viewer.camera.flyTo({
        destination,
        duration: 1.0
      }); 
    });
  }
};

apiThunder.loadLightning = function (value) {
  const { WE } = window;
  const options = expThunderData.data[value];
  const url = require('@/assets/images/rainbow-legend.png');
  Cesium.Resource.fetchImage(url).then((img) => {
    options.image = img;
    options.row = 8;
    options.col = 8;
    options.mulSpeed = 2;
    options.canvas = apiThunder.createFlashCanvas(options);
    options.thunderUrl = `${WeatherEarth.Config.AssetUrl}/thunder.gif`;
    const lightning = new Lightning(options);
    lightning.readyPromise.then(() => {
      const primitive = WE.scene.primitives.add(lightning);
      apiThunder.primitives.push(primitive);
      const cartographic = Cesium.Cartographic.fromCartesian(lightning.position, undefined, new Cesium.Cartographic());
      const fragmentSource = apiMaterial.getFragmentSource('shaderPulseCircle');
      const appearance = apiMaterial.getAppearance({ fragmentSource });
      const radius = 20000;
      const primitive2 = PrimitiveGenerator.createCircle({
        longitude: Cesium.Math.toDegrees(cartographic.longitude),
        latitude: Cesium.Math.toDegrees(cartographic.latitude),
        radius,
        appearance,
      });
      WE.scene.primitives.add(primitive2);
      apiThunder.primitives.push(primitive2);
    });
  });
};

apiThunder.loadThunderChina = function (value) {
  if (value === '') {
    return;
  }
  const { WE } = window;
  const { layerName } = apiThunder;
  const url = `${WeatherEarth.Config.AssetUrl}/pointcloud/14_line.json`;
  const tileset = WE.layerManager.addTilesetLayer({ url }, layerName);
  tileset.readyPromise.then(() => {
    const url2 = `${WeatherEarth.Config.AssetUrl}/pointcloud/14.pnts?v=1.0.1-OC23dtiles`;
    const canvas = apiThunder.createThunderCanvas();
    const options = {
      url: url2,
      modelMatrix: tileset.root.transform,
      canvas,
    };

    const primitive = WE.viewer.scene.primitives.add(
      new WeatherEarth.PntsPrimitiveCollection(options)
    );
    apiThunder.primitives.push(primitive);
  });
};

export default apiThunder;
