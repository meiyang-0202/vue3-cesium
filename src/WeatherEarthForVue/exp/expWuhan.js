
// eslint-disable-next-line import/no-cycle
import apiMaterial from './apiMaterial';

function expWuHan() {

}

function createOD() {
  const { WE } = window;
  const positions = [];
  const longitude = 114.2683;
  const latitude = 30.5891;
  positions.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0));
  positions.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, 5000.0));

  positions.push(Cesium.Cartesian3.fromDegrees(114.28, 30.5970, 0.0));
  positions.push(Cesium.Cartesian3.fromDegrees(114.28, 30.5970, 5000.0));

  WE.WeExt.primitiveManager.addODLine({
    positions,
    image: require('@/assets/images/flow3.png'),
    inverseXY: true,
    segment: 0,
    arcType: Cesium.ArcType.NONE,
    width: 24,
    repeat: 4,
  });
}

function createRectangle() {
  const { WE } = window;
  const fragmentSource1 = apiMaterial.getFragmentSource('shaderMagicCircle');
  const appearance1 = apiMaterial.getAppearance({ fragmentSource: fragmentSource1 });
  const west = 114.2905; 
  const south = 30.5841; 
  const east = 114.2935; 
  const north = 30.5871;
  WE.WeExt.primitiveManager.addRectangle({
    west,
    south,
    east,
    north,
    appearance: appearance1,
    classificationType: Cesium.ClassificationType.TERRAIN
  });
}

function createCirle(longitude, latitude, radius, shader) {
  const fragmentSource = apiMaterial.getFragmentSource(shader);
  const appearance = apiMaterial.getAppearance({ fragmentSource });
  const { WE } = window;
  WE.WeExt.primitiveManager.addCircle({
    longitude,
    latitude,
    radius,
    appearance,
    classificationType: Cesium.ClassificationType.BOTH
  });
}

function createHalfSphere() {
  const { WE } = window;
  const fragmentSource = apiMaterial.getFragmentSource('shaderDigitalBrain');
  const appearance = apiMaterial.getAppearance({ fragmentSource });
  const radius = 120.0;
  const longitude = 114.2683;
  const latitude = 30.5891;
  const height = 0.0;
  WE.WeExt.primitiveManager.addHalfSphere({
    radius,
    longitude,
    latitude,
    height,
    appearance
  });
}

function createWall() {
  const { WE } = window;
  const fragmentSource = apiMaterial.getFragmentSource('shaderMovingGradient');
  const appearance = apiMaterial.getAppearance({ fragmentSource });
  appearance.renderState.cull.enabled = false;
  const west = 114.2639; 
  const south = 30.5778; 
  const east = 114.2659; 
  const north = 30.5798;
  const positions1 = Cesium.Cartesian3.fromDegreesArray([west, south, east, south]);
  const positions2 = Cesium.Cartesian3.fromDegreesArray([east, south, east, north]);
  const positions3 = Cesium.Cartesian3.fromDegreesArray([west, north, east, north]);
  const positions4 = Cesium.Cartesian3.fromDegreesArray([west, north, west, south]);
  let positions = positions1;
  positions = positions.concat(positions2);
  positions = positions.concat(positions3);
  positions = positions.concat(positions4);
  const maximumHeight = 50.0;
  WE.WeExt.primitiveManager.addWall({
    positions, maximumHeight, appearance,
  });
}

function createTetradron() {
  const { WE } = window;
  const position = Cesium.Cartesian3.fromDegrees(114.29, 30.5970, 400.0);
  WE.WeExt.primitiveManager.addTetrahedron({ position });
}

expWuHan.create = function () {
  createOD();
  createWall();
  createRectangle();
  createHalfSphere();
  createTetradron();
  createCirle(114.2683, 30.5891, 200.0, 'shaderTotalNoob');
  createCirle(114.2683, 30.5891, 360.0, 'shaderLoadingCircle');
  createCirle(114.3317, 30.5891, 5600.0, 'shaderPulseCircle');
};

export default expWuHan;
