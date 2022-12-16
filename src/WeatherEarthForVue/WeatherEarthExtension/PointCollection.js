
function PointCollection() {
  this._pointCollection = new Cesium.PointPrimitiveCollection();
}

PointCollection.prototype.removeAll = function () {
  this._pointCollection.removeAll();
};

PointCollection.prototype.add = function (options) {
  const { position } = options;
  const outlineWidth = Cesium.defaultValue(options.outlineWidth, 0);
  this._pointCollection.add({
    position,
    outlineWidth,
    color: options.color,
    outlineColor: Cesium.Color.BLACK,
  });
};

PointCollection.prototype.isDestroy = function () {
  return false;
};

PointCollection.prototype.destroy = function () {
  this._pointCollection = this._pointCollection && this._pointCollection.destroy();
};

PointCollection.prototype.update = function (frameState) {
  this._pointCollection.update(frameState);
};

export default PointCollection;
