
function PrimitiveGenerator() {
    
}

PrimitiveGenerator.createWall = function (options) {
  const { positions, maximumHeight, appearance } = options;
  const minimumHeight = Cesium.defaultValue(options.minimumHeight, 0.0);
  const geometryInstances = [];
  geometryInstances.push(
    new Cesium.GeometryInstance({
      geometry: Cesium.WallGeometry.fromConstantHeights({
        positions,
        minimumHeight,
        maximumHeight,
      }),
    })
  );
  return new Cesium.Primitive({
    geometryInstances,
    asynchronous: true,
    appearance,
  });
};

PrimitiveGenerator.createHalfSphere = function (options) {
  const {
    longitude, latitude, radius, fragmentSource
  } = options;
  const height = Cesium.defaultValue(options.height, 0.0);
  const ellipsoid = new Cesium.EllipsoidGeometry({
    radii: new Cesium.Cartesian3(radius, radius, radius),
    minimumClock: Cesium.Math.toRadians(90.0),
    maximumClock: Cesium.Math.toRadians(270.0),
    minimumCone: Cesium.Math.toRadians(0.0),
    maximumCone: Cesium.Math.toRadians(180.0),
  });
    
  const geometry = Cesium.EllipsoidGeometry.createGeometry(ellipsoid);
    
  const cartesion = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(cartesion);
  const m3 = Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(90.0));
  const m4 = Cesium.Matrix4.fromRotation(m3);
  Cesium.Matrix4.multiply(modelMatrix, m4, modelMatrix);

  const primitive = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry,
    }),
    asynchronous: false,
    appearance: options.appearance,
    modelMatrix,
  });
      
  return primitive;
};

PrimitiveGenerator.createCircle = function (options) {
  const {
    longitude, latitude, radius
  } = options;
      
  const geometry = new Cesium.CircleGeometry({
    center: Cesium.Cartesian3.fromDegrees(longitude, latitude),
    radius,
  });
      
  const geometryInstances = [];
  geometryInstances.push(
    new Cesium.GeometryInstance({
      geometry,
    })
  );
  
  return new Cesium.GroundPrimitive({
    geometryInstances,
    asynchronous: true,
    ...options
  });
};
  
PrimitiveGenerator.createPrimitive = function (options) {
  const {
    geometry
  } = options;

  const geometryInstances = [];
  geometryInstances.push(
    new Cesium.GeometryInstance({
      geometry,
    })
  );

  return new Cesium.Primitive(({
    geometryInstances,
    ...options
  }));
};
  
PrimitiveGenerator.createRectangle = function (options) {
  const {
    west, south, east, north
  } = options;
    
  const geometry = new Cesium.RectangleGeometry({
    rectangle: Cesium.Rectangle.fromDegrees(west, south, east, north),
  });
    
  const geometryInstances = [];
  geometryInstances.push(
    new Cesium.GeometryInstance({
      geometry,
    })
  );

  return new Cesium.GroundPrimitive(({
    geometryInstances,
    asynchronous: true,
    ...options
  }));
};

export default PrimitiveGenerator;
