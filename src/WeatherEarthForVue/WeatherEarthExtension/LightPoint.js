function LightPoint(options) {
  this._matrixScratch = new Cesium.Matrix4();
  this._lightPosScratch = new Cesium.Cartesian3();
  this._pointCollection = new Cesium.PointPrimitiveCollection();
  this._color = Cesium.defaultValue(options.color, new Cesium.Color(1.0, 1.0, 0.0, 1.0));
  this._pointCollection.add({ postion: new Cesium.Cartesian3(), color: this._color });
}

Object.defineProperties(LightPoint.prototype, {
  position: {
    get() {
      return this._lightPosScratch;
    }
  },
  color: {
    get() {
      return this._color;
    }
  }
});

LightPoint.prototype.setPosition = function (options) {
  const { longitude, latitude, height } = options;
  Cesium.Cartesian3.fromDegrees(longitude, latitude, height, Cesium.Ellipsoid.WGS84, this._lightPosScratch);
  this._pointCollection.modelMatrix = Cesium.Matrix4.fromTranslation(this._lightPosScratch, this._matrixScratch);
};

LightPoint.prototype.isDestroy = function () {
  return false;
};

LightPoint.prototype.destroy = function () {

};

LightPoint.prototype.update = function (frameState) {
  this._pointCollection.update(frameState);
};

export default LightPoint;
