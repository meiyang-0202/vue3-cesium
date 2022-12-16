import apiAnalystDEM from './apiAnalystDEM';

function apiAnalyst() {

}

const contourUniforms = {};

apiAnalyst.type = '';

apiAnalyst.colorElevationWithContour = function (value) {
  apiAnalystDEM.hasContourLine = value;
  apiAnalyst.colorElevation(apiAnalyst.type);
};

apiAnalyst.colorElevation = function (value) {
  apiAnalyst.type = value;
  const { WE } = window;
  const { hasContourLine } = apiAnalystDEM;
  let material;
  const globe = WE.viewer.scene.globe;

  if (hasContourLine || value !== '') {
    material = apiAnalystDEM.getDemMaterial(value);
  }

  globe.material = material;
};

apiAnalyst.entities = [];

function sampleTerrainSuccess(terrainSamplePositions) {
  const { WE } = window;
  const { viewer } = WE;
  
  const ellipsoid = Cesium.Ellipsoid.WGS84;

  viewer.entities.suspendEvents();

  for (let i = 0; i < terrainSamplePositions.length; ++i) {
    const position = terrainSamplePositions[i];

    const entity = viewer.entities.add({
      name: position.height.toFixed(1),
      position: ellipsoid.cartographicToCartesian(position),
      label: {
        text: position.height.toFixed(1),
        font: '10pt monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, -14),
        fillColor: Cesium.Color.BLACK,
        outlineColor: Cesium.Color.BLACK,
        showBackground: true,
        backgroundColor: new Cesium.Color(0.9, 0.9, 0.9, 0.7),
        backgroundPadding: new Cesium.Cartesian2(4, 3),
      },
    });
    apiAnalyst.entities.push(entity);
  }
  viewer.entities.resumeEvents();
}

function createGrid(rectangle) {
  const center = new Cesium.Cartographic();
  Cesium.Rectangle.center(rectangle, center);
  const gridWidth = 41;
  const gridHeight = 41;
  const e = rectangle;
  const terrainSamplePositions = [];
  for (let y = 0; y < gridHeight; ++y) {
    for (let x = 0; x < gridWidth; ++x) {
      const longitude = Cesium.Math.lerp(
        e.west,
        e.east,
        x / (gridWidth - 1)
      );
      const latitude = Cesium.Math.lerp(
        e.south,
        e.north,
        y / (gridHeight - 1)
      );
      const position = new Cesium.Cartographic(longitude, latitude);
      terrainSamplePositions.push(position);
    }
  }
  return terrainSamplePositions;
}

function createClipPlanes(points) {
  const clippingPlanes = [];

  const pointsLength = points.length;

  for (let i = 0; i < pointsLength; ++i) {
    const nextIndex = (i + 1) % pointsLength;
    let midpoint = Cesium.Cartesian3.add(
      points[i],
      points[nextIndex],
      new Cesium.Cartesian3()
    );
    midpoint = Cesium.Cartesian3.multiplyByScalar(
      midpoint,
      0.5,
      midpoint
    );

    const up = Cesium.Cartesian3.normalize(
      midpoint,
      new Cesium.Cartesian3()
    );
    let right = Cesium.Cartesian3.subtract(
      points[nextIndex],
      midpoint,
      new Cesium.Cartesian3()
    );
    right = Cesium.Cartesian3.normalize(right, right);

    let normal = Cesium.Cartesian3.cross(
      right,
      up,
      new Cesium.Cartesian3()
    );
    normal = Cesium.Cartesian3.normalize(normal, normal);

    // Compute distance by pretending the plane is at the origin
    const originCenteredPlane = new Cesium.Plane(normal, 0.0);
    const distance = Cesium.Plane.getPointDistance(
      originCenteredPlane,
      midpoint
    );

    clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
  }

  return clippingPlanes;
}

apiAnalyst.backFaceCulling = true;
apiAnalyst.showSkirts = true;

apiAnalyst.reset = function () {
  const { WE } = window;
  const { backFaceCulling, showSkirts, enableLighting } = apiAnalyst;
  const globe = WE.viewer.scene.globe;
  globe.backFaceCulling = backFaceCulling;
  globe.showSkirts = showSkirts;
  globe.clippingPlanes = undefined;
  globe.material = undefined;
  // WE.geometryManager.removeAll();
  apiAnalyst.entities.forEach((e) => {
    WE.viewer.entities.remove(e);
  });
  apiAnalyst.entities = [];
  apiAnalyst.type = '';
};

apiAnalyst.demClipSurface = function (points) {  
  apiAnalyst.reset();
  const { WE } = window;
  const { viewer } = WE;
  const scene = viewer.scene;
  const globe = scene.globe;
  const promise = WE.handlerManager.startDraw({
    type: 'polygon',
    isConstant: false,
  });

  promise.then((drawObject) => {
    const clippingPlanes = createClipPlanes(drawObject.positions);
    globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeWidth: 1.0,
      edgeColor: Cesium.Color.WHITE,
      enabled: true,
    });
  
    globe.backFaceCulling = true;
    globe.showSkirts = false;
  });
};

apiAnalyst.test = function (value) {  
  const vp = {
    longitude: 1.935349, latitude: 0.565328, height: 3860.713, heading: 0.20, pitch: -0.76, roll: 0.00 
  };
  const { WE } = window;
  WE.layerManager.showTerrainFilter = true;
  WE.viewer.scene.globe.enableLighting = true;
  WE.WeExt.jumpToViewpoint(vp);
  // apiAnalyst.demClipSurface();
};

apiAnalyst.demClipSurface2 = function (value) {  
  const { WE } = window;
  const { viewer } = WE;
  const scene = viewer.scene;
  const globe = scene.globe;
  if (value === '') {
    globe.translucency.enabled = false;
    globe.undergroundColor = Cesium.Color.BLACK;
    globe.translucency.frontFaceAlpha = 1.0;
    globe.translucency.rectangle = undefined;
    return;
  }

  globe.translucency.enabled = true;
  globe.undergroundColor = Cesium.Color.BLACK;
  globe.translucency.frontFaceAlpha = 0.0;
  globe.translucency.backFaceAlpha = 1.0;
  globe.translucency.rectangle = value;
};

apiAnalyst.demSample = function (value) {
  const { WE } = window;
  const { viewer } = WE;
  
  const promise = WE.handlerManager.startDraw({
    type: 'rectangle',
    isConstant: false,
  });

  promise.then((drawObject) => {
    const rectangle = drawObject.geometry;
    const terrainSamplePositions = createGrid(rectangle);
    Promise.resolve(
      Cesium.sampleTerrainMostDetailed(
        viewer.terrainProvider,
        terrainSamplePositions
      )
    ).then(sampleTerrainSuccess);
  });
};

export default apiAnalyst;
