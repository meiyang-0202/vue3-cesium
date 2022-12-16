import apiMaterial from './apiMaterial';
import PrimitiveGenerator from '../WeatherEarthExtension/PrimitiveGenerator';

function exp3dtilesFlood(options) {
  if (!Cesium.defined(options)) {
    options = {};
  }
  this._height = 0.0;
  this._minHeight = 0.0;
  this._maxHeight = 100.0;
  this._primitive = undefined;
  this._extent = undefined;
  this._property = undefined;
  this._startTime = Cesium.defaultValue(options.startTime, Cesium.JulianDate.now());
  this._endTime = Cesium.defaultValue(options.endTime, Cesium.JulianDate.addHours(Cesium.JulianDate.now(), 4, new Cesium.JulianDate()));
  this._debug = false;
}

Object.defineProperties(exp3dtilesFlood.prototype, {
  height: {
    get() {
      return this._height;
    },
    set(value) {
      if (value !== this._height && value >= this._minHeight && value <= this._maxHeight) {
        this._height = value;
        this._dirty = true;
      }
    }
  },
});


exp3dtilesFlood.prototype.isDestroyed = function () {
  return false;
};

exp3dtilesFlood.prototype.destroy = function () {
  if (this._debug) {
    const { WE } = window;
    WE.WeExt.pointCollection.removeAll();
  }
  this._primitive = this._primitive && this._primitive && this._primitive.destroy();
};

exp3dtilesFlood.prototype.rebuild = function () {
  const { appearance, height } = this;
  const rectangle = this._extent;
  appearance.renderState.cull.enabled = false;
  const geometry = new Cesium.RectangleGeometry({
    rectangle,
    height,
  });
  this._primitive = this._primitive && this._primitive && this._primitive.destroy();
  this._primitive = PrimitiveGenerator.createPrimitive({ geometry, appearance, asynchronous: false });
};

exp3dtilesFlood.prototype.update = function (frameState) {
  if (Cesium.defined(this._property)) {
    const height = this._property.getValue(frameState.time);
    if (Cesium.defined(height)) {
      this.height = height;
    }
  }
  if (this._dirty) {
    this._dirty = false;
    this.rebuild();
  }
  if (Cesium.defined(this._primitive)) {
    this._primitive.update(frameState);
  }
};

exp3dtilesFlood.prototype.createScene = function (tileset) {
  if (Cesium.defined(tileset.root) && Cesium.defined(tileset.root.boundingVolume)) {
    this.appearance = apiMaterial.getWaterAppearance({
      // baseWaterColor: Cesium.Color.fromCssColorString('#FFF8DCE6'),
      // blendColor: Cesium.Color.fromBytes(255, 0, 0, 255),
      // amplitude: 5,
      // animationSpeed: 0.04,
      // frequency: 30000,
      // specularIntensity: 1.0,
      // fadeFactor: 5,
    });

    const orientedBoundingBox = tileset.root.boundingVolume.boundingVolume;
    const halfAxes = orientedBoundingBox.halfAxes;
    const u = Cesium.Matrix3.getColumn(halfAxes, 0, new Cesium.Cartesian3());
    const v = Cesium.Matrix3.getColumn(halfAxes, 1, new Cesium.Cartesian3());
    const w = Cesium.Matrix3.getColumn(halfAxes, 2, new Cesium.Cartesian3());

    const p1 = Cesium.Cartesian3.add(orientedBoundingBox.center, u, new Cesium.Cartesian3());
    Cesium.Cartesian3.add(p1, v, p1);
    
    const p2 = Cesium.Cartesian3.add(orientedBoundingBox.center, v, new Cesium.Cartesian3());
    Cesium.Cartesian3.subtract(p2, u, p2);

    const p3 = Cesium.Cartesian3.subtract(orientedBoundingBox.center, u, new Cesium.Cartesian3());
    Cesium.Cartesian3.subtract(p3, v, p3);

    const p4 = Cesium.Cartesian3.subtract(orientedBoundingBox.center, v, new Cesium.Cartesian3());
    Cesium.Cartesian3.add(p4, u, p4);

    Cesium.Cartesian3.subtract(p1, w, p1);
    Cesium.Cartesian3.subtract(p2, w, p2);
    Cesium.Cartesian3.add(p3, w, p3);
    Cesium.Cartesian3.add(p4, w, p4);

    if (this._debug) {
      const { WE } = window;
      WE.WeExt.pointCollection.add({
        position: p1
      });
      WE.WeExt.pointCollection.add({
        position: p2
      });
      WE.WeExt.pointCollection.add({
        position: p3
      });
      WE.WeExt.pointCollection.add({
        position: p4
      });
    }

    const cartographic1 = Cesium.Cartographic.fromCartesian(p1);
    const cartographic2 = Cesium.Cartographic.fromCartesian(p2);
    const cartographic3 = Cesium.Cartographic.fromCartesian(p3);
    const cartographic4 = Cesium.Cartographic.fromCartesian(p4);
    const extent = new Cesium.Rectangle(cartographic1.longitude,
      cartographic1.latitude,
      cartographic4.longitude,
      cartographic4.latitude);
    Cesium.Rectangle.expand(extent, cartographic1, extent);
    Cesium.Rectangle.expand(extent, cartographic2, extent);
    Cesium.Rectangle.expand(extent, cartographic3, extent);
    Cesium.Rectangle.expand(extent, cartographic4, extent);

    Cesium.Cartographic.fromCartesian(p4, Cesium.Ellipsoid.WGS84, cartographic4);
    let minHeight = Math.min(cartographic1.height, cartographic2.height);
    minHeight = Math.min(minHeight, cartographic3.height);
    minHeight = Math.min(minHeight, cartographic4.height);

    let maxHeight = Math.max(cartographic1.height, cartographic2.height);
    maxHeight = Math.max(maxHeight, cartographic3.height);
    maxHeight = Math.max(maxHeight, cartographic4.height);

    this._extent = extent;
    this._maxHeight = maxHeight;
    this._minHeight = minHeight;
    this.height = (minHeight + maxHeight) * 0.5;

    const property = new Cesium.SampledProperty(Number);
    property.addSample(this._startTime, minHeight);
    property.addSample(this._endTime, maxHeight);
    this._property = property;
    const that = this;
    tileset.update2 = tileset.update;
    tileset.update = function (frameState) {
      that.update(frameState);
      tileset.update2(frameState);
    };
    
    tileset.destroy2 = tileset.destroy;
    tileset.destroy = function () {
      that.destroy();
      tileset.destroy2();
    };
  }
};

export default exp3dtilesFlood;
