
// eslint-disable-next-line import/no-cycle
import apiMaterial from './apiMaterial';
// eslint-disable-next-line import/no-cycle
import expWuHan from './expWuhan';

function apiGeometry() {}

apiGeometry.data = {
  武汉: {
    primitive: () => {
      expWuHan.create();
    }
  },
  Polyline: {
    primitive: () => {
      const { WE } = window;
      const options = {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          114.3125, 30.5670, 0.0,
          114.3125, 30.5670, 1000.0]),
        width: 4,
      };
      WE.WeExt.lineCollection.add(options);
    }
  },
  ODLine: {
    primitive: () => {
      const { WE } = window;
      const image = require('@/assets/images/flow3.png');
      const positions = [];
      const center = [113.0, 30];
      const rii = 100;
      for (let i = 0; i < rii; i++) {
        const lon = center[0] + Math.sin(Cesium.Math.TWO_PI / rii * i) * 10;
        const lat = center[1] + Math.cos(Cesium.Math.TWO_PI / rii * i) * 10;
        if (i % 2 === 0) {
          positions.push(Cesium.Cartesian3.fromDegrees(center[0], center[1]));
          positions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
        } else {
          positions.push(Cesium.Cartesian3.fromDegrees(lon, lat));
          positions.push(Cesium.Cartesian3.fromDegrees(center[0], center[1]));
        }
      }
      WE.WeExt.primitiveManager.addODLine({
        positions,
        image,
        inverseXY: true,
        width: 12
      });

      WE.WeExt.primitiveManager.addODLine({
        positions: Cesium.Cartesian3.fromDegreesArray([103.0, 35.0, 123.0, 30.0]),
        image: require('@/assets/images/flow1.webp'),
        segment: 50,
      });
    }
  },
  矩形: {
    primitive: () => {
      const { WE } = window;
      const fragmentSource = apiMaterial.getFragmentSource('shaderNoiseAnimationElectric');
      const appearance = apiMaterial.getAppearance({ fragmentSource });
      const west = 110.0;
      const south = 39.0;
      const east = 114.0;
      const north = 43.0;
      WE.WeExt.primitiveManager.addRectangle({
        west, south, east, north, appearance,
      });

      const longitude = 116.0;
      const latitude = 40.0;
      const radius = 100000.0;
      WE.WeExt.primitiveManager.addCircle({
        longitude, latitude, radius, appearance,
      });
    }
  },
  半球: {
    primitive: () => {
      const { WE } = window;
      const fragmentSource = apiMaterial.getFragmentSource('shaderThePulse');
      const appearance = apiMaterial.getAppearance({ fragmentSource });
      const radius = 100000.0;
      const longitude = 116.0;
      const latitude = 30.0;
      const height = 0.0;
      WE.WeExt.primitiveManager.addHalfSphere({
        radius,
        longitude,
        latitude,
        height,
        appearance
      });
    }
  },
  墙体: {
    primitive: () => {
      const { WE } = window;
      const fragmentSource = apiMaterial.getFragmentSource('shaderMovingGradient');
      const appearance = apiMaterial.getAppearance({ fragmentSource });
      appearance.renderState.cull.enabled = false;
      const west = 110.0;
      const south = 39.0;
      const east = 114.0;
      const north = 43.0;
      const positions1 = Cesium.Cartesian3.fromDegreesArray([west, south, east, south]);
      const positions2 = Cesium.Cartesian3.fromDegreesArray([east, south, east, north]);
      const positions3 = Cesium.Cartesian3.fromDegreesArray([west, north, east, north]);
      const positions4 = Cesium.Cartesian3.fromDegreesArray([west, north, west, south]);
      let positions = positions1;
      positions = positions.concat(positions2);
      positions = positions.concat(positions3);
      positions = positions.concat(positions4);
      const maximumHeight = 30000.0;
      WE.WeExt.primitiveManager.addWall({
        positions, maximumHeight, appearance,
      });
    }
  },
  水深: {
    primitive: () => {
      const { WE } = window;
      const specularMap = `${import.meta.env.VITE_APP_ASSETS}/cky/SS.jpg`;
      const appearance = apiMaterial.getWaterAppearance2({
        baseWaterColor: Cesium.Color.fromBytes(20, 44, 37, 255),
        blendColor: Cesium.Color.fromBytes(20, 44, 37, 255),
        specularMap,
      });
      const west = 110.883554014;
      const south = 32.3435934302;
      const east = 110.897108014;
      const north = 32.3839314302;
      WE.WeExt.primitiveManager.addRectangle({
        west, south, east, north, appearance,
      });
      const vp = {
        longitude: 1.935384, latitude: 0.564238, height: 1981.989, heading: 6.28, pitch: -0.49, roll: 0.00
      };

      WE.WeExt.jumpToViewpoint(vp);
    }
  },
  Pin: {
    primitive: () => {
      const { WE } = window;
      WE.viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(113.2278, 31.5336),
        billboard: {
          image: require('@/assets/images/pin.png'),
          height: 64,
          width: 64,
          pixelOffset: new Cesium.Cartesian2(32, -32)
        },
      });
    }
  }
};

apiGeometry.primitives = [];

apiGeometry.clear = function () {
  const { WE } = window;
  apiGeometry.primitives.forEach((primitive) => {
    WE.viewer.scene.primitives.remove(primitive);
  });
  apiGeometry.primitives = [];
  if (Cesium.defined(apiGeometry.intervalId)) {
    clearInterval(apiGeometry.intervalId);
    apiGeometry.intervalId = undefined;
  }
  WE.WeExt.lineCollection.removeAll();
};

apiGeometry.newPolyline = function (data) {
  const material = new Cesium.Material({
    fabric: {
      type: 'Color',
      uniforms: {
        color: new Cesium.Color(1.0, 1.0, 0.0, 1.0)
      }
    }
  });
  const polylines = new Cesium.PolylineCollection();
  polylines.add({
    positions: Cesium.Cartesian3.fromDegreesArrayHeights([
      114.3125, 30.5670, 0.0,
      114.3125, 30.5670, 1000.0]),
    width: 4,
    material
  });
  return [polylines];
};

apiGeometry.addGeometry = function (value) {
  const { WE } = window;
  WE.WeExt.lineCollection.removeAll();
  WE.WeExt.primitiveManager.removeAll();
  if (value === '') {
    return;
  }
  const options = apiGeometry.data[value];
  options.primitive();
};

export default apiGeometry;
