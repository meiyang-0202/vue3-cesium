/* eslint-disable no-use-before-define */
function GeojsonPrimitive(options) {
  this._primitive = undefined;
  this._promises = [];
  this.geometryInstances = [];
}

function defaultCrsFunction(coordinates) {
  return Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1], coordinates[2]);
}

const crsNames = {
  'urn:ogc:def:crs:OGC:1.3:CRS84': defaultCrsFunction,
  'EPSG:4326': defaultCrsFunction,
  'urn:ogc:def:crs:EPSG::4326': defaultCrsFunction,
  'urn:ogc:def:crs:EPSG::4490': defaultCrsFunction,
};

const crsLinkHrefs = {};
const crsLinkTypes = {};

function coordinatesArrayToCartesianArray(coordinates, crsFunction) {
  const positions = new Array(coordinates.length);
  for (let i = 0; i < coordinates.length; i++) {
    positions[i] = crsFunction(coordinates[i]);
  }
  return positions;
}

function createPolygon(dataSource, geoJson, crsFunction, coordinates, options) {
  if (coordinates.length === 0 || coordinates[0].length === 0) {
    return;
  }
  
  const holes = [];
  for (let i = 1, len = coordinates.length; i < len; i++) {
    holes.push(
      new Cesium.PolygonHierarchy(
        coordinatesArrayToCartesianArray(coordinates[i], crsFunction)
      )
    );
  }

  const positions = coordinates[0];
  const polygonHierarchy = new Cesium.PolygonHierarchy(
    coordinatesArrayToCartesianArray(positions, crsFunction),
    holes
  );

  const geometry = new Cesium.PolygonGeometry({
    polygonHierarchy,
  });
  
  const i = dataSource.geometryInstances.length;
  // const geometry = Cesium.PolygonGeometry.createGeometry(polygon);
  dataSource.geometryInstances.push(new Cesium.GeometryInstance({
    geometry,
    id: `${i}`,
    attributes: {
      show: new Cesium.ShowGeometryInstanceAttribute(true)
    }
  }));
}

function processGeometryCollection(
  dataSource,
  geoJson,
  geometryCollection,
  crsFunction,
  options
) {
  const geometries = geometryCollection.geometries;
  for (let i = 0, len = geometries.length; i < len; i++) {
    const geometry = geometries[i];
    const geometryType = geometry.type;
    const geometryHandler = geometryTypes[geometryType];
    if (!Cesium.defined(geometryHandler)) {
      throw new Cesium.RuntimeError(`Unknown geometry type: ${geometryType}`);
    }
    geometryHandler(dataSource, geoJson, geometry, crsFunction, options);
  }
}

function createLineString(
  dataSource,
  geoJson,
  crsFunction,
  coordinates,
  options
) {
  if (Cesium.defined(options) && Cesium.defined(options.createLineString)) {
    options.createLineString(
      dataSource,
      geoJson,
      crsFunction,
      coordinates
    );
    return;
  } 

  const positions = coordinatesArrayToCartesianArray(coordinates, crsFunction);
  const i = dataSource.geometryInstances.length;

  const geometry = new Cesium.PolylineGeometry({
    positions,
  });
  

  dataSource.geometryInstances.push(new Cesium.GeometryInstance({
    geometry,
    id: `${i}`,
    attributes: {
      show: new Cesium.ShowGeometryInstanceAttribute(true)
    }
  }));
}

function processLineString(
  dataSource,
  geoJson,
  geometry,
  crsFunction,
  options
) {
  createLineString(
    dataSource,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
}
function processMultiLineString(
  dataSource,
  geoJson,
  geometry,
  crsFunction,
  options
) {
  const lineStrings = geometry.coordinates;
  for (let i = 0; i < lineStrings.length; i++) {
    createLineString(dataSource, geoJson, crsFunction, lineStrings[i], options);
  }
}

function createPoint(dataSource, geoJson, crsFunction, coordinates, options) {
  const position = crsFunction(coordinates);
  dataSource.geometryInstances.push(position);
}

function processPoint(dataSource, geoJson, geometry, crsFunction, options) {
  createPoint(dataSource, geoJson, crsFunction, geometry.coordinates, options);
}

function processMultiPoint(
  dataSource,
  geoJson,
  geometry,
  crsFunction,
  options
) {
  const coordinates = geometry.coordinates;
  for (let i = 0; i < coordinates.length; i++) {
    createPoint(dataSource, geoJson, crsFunction, coordinates[i], options);
  }
}

function processMultiPolygon(
  dataSource,
  geoJson,
  geometry,
  crsFunction,
  options
) {
  const polygons = geometry.coordinates;
  for (let i = 0; i < polygons.length; i++) {
    createPolygon(dataSource, geoJson, crsFunction, polygons[i], options);
  }
}

function processPolygon(dataSource, geoJson, geometry, crsFunction, options) {
  createPolygon(
    dataSource,
    geoJson,
    crsFunction,
    geometry.coordinates,
    options
  );
}

// GeoJSON processing functions
function processFeature(dataSource, feature, notUsed, crsFunction, options) {
  if (feature.geometry === null) {
    // Null geometry is allowed, so just create an empty entity instance for it.
    // lgw
    // createObject(feature, dataSource._entityCollection, options.describe);
    return;
  }

  if (!Cesium.defined(feature.geometry)) {
    throw new Cesium.RuntimeError('feature.geometry is required.');
  }

  const geometryType = feature.geometry.type;
  const geometryHandler = geometryTypes[geometryType];
  if (!Cesium.defined(geometryHandler)) {
    throw new Cesium.RuntimeError(`Unknown geometry type: ${geometryType}`);
  }
  geometryHandler(dataSource, feature, feature.geometry, crsFunction, options);
}

function processFeatureCollection(
  dataSource,
  featureCollection,
  notUsed,
  crsFunction,
  options
) {
  const features = featureCollection.features;
  for (let i = 0, len = features.length; i < len; i++) {
    processFeature(dataSource, features[i], undefined, crsFunction, options);
  }
}


const geoJsonObjectTypes = {
  Feature: processFeature,
  FeatureCollection: processFeatureCollection,
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
  Topology: processTopology
};

const geometryTypes = {
  GeometryCollection: processGeometryCollection,
  LineString: processLineString,
  MultiLineString: processMultiLineString,
  MultiPoint: processMultiPoint,
  MultiPolygon: processMultiPolygon,
  Point: processPoint,
  Polygon: processPolygon,
  Topology: processTopology
};

function processTopology(dataSource, geoJson, geometry, crsFunction, options) {
  for (const property in geometry.objects) {
    // eslint-disable-next-line no-prototype-builtins
    if (geometry.objects.hasOwnProperty(property)) {
      const feature = Cesium.topojson.feature(geometry, geometry.objects[property]);
      const typeHandler = geoJsonObjectTypes[feature.type];
      typeHandler(dataSource, feature, feature, crsFunction, options);
    }
  }
}

function load(that, geoJson, options) {
  if (!Cesium.defined(geoJson)) {
    throw new Cesium.DeveloperError('geoJson is required.');
  }

  const typeHandler = geoJsonObjectTypes[geoJson.type];
  if (!Cesium.defined(typeHandler)) {
    throw new Cesium.RuntimeError(`Unsupported GeoJSON object type: ${geoJson.type}`);
  }
  // Check for a Coordinate Reference System.
  const crs = geoJson.crs;
  let crsFunction = crs !== null ? defaultCrsFunction : null;
  if (Cesium.defined(crs)) {
    if (!Cesium.defined(crs.properties)) {
      throw new Cesium.RuntimeError('crs.properties is undefined.');
    }

    const properties = crs.properties;
    if (crs.type === 'name') {
      crsFunction = crsNames[properties.name];
      if (!Cesium.defined(crsFunction)) {
        throw new Cesium.RuntimeError(`Unknown crs name: ${properties.name}`);
      }
    } else if (crs.type === 'link') {
      let handler = crsLinkHrefs[properties.href];
      if (!Cesium.defined(handler)) {
        handler = crsLinkTypes[properties.type];
      }

      if (!Cesium.defined(handler)) {
        throw new Cesium.RuntimeError(`Unable to resolve crs link: ${JSON.stringify(properties)}`);
      }

      crsFunction = handler(properties);
    } else if (crs.type === 'EPSG') {
      crsFunction = crsNames[`EPSG:${properties.code}`];
      if (!Cesium.defined(crsFunction)) {
        throw new Cesium.RuntimeError(`Unknown crs EPSG code: ${properties.code}`);
      }
    } else {
      throw new Cesium.RuntimeError(`Unknown crs type: ${crs.type}`);
    }
  }

  return Promise.resolve(crsFunction).then(() => {
    if (crsFunction !== null) {
      typeHandler(that, geoJson, geoJson, crsFunction, options);
    }

    return Promise.all(that._promises).then(() => {
      that._promises.length = 0;
      return that;
    });
  });
}

GeojsonPrimitive.load = function (url, options) {
  return new GeojsonPrimitive().load(url, options);
};

GeojsonPrimitive.prototype.load = function (url, options) {
  const promise = Cesium.Resource.fetchJson(url);
  const that = this;
  // eslint-disable-next-line prefer-arrow-callback
  return Promise.resolve(promise).then(function (geojson) {
    return load(that, geojson, options);
  }).catch((error) => {
    console.log(error);
    return Promise.reject(error);
  });
};


GeojsonPrimitive.prototype.update = function (frameState) {
  if (frameState.passes.render && Cesium.defined(this._primitive)) {
    this._primitive.update(frameState);
  }
};

export default GeojsonPrimitive;
