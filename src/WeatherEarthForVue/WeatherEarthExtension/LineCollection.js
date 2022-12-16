function LineCollection() {
  this._lineCollection = new Cesium.PolylineCollection();
}

LineCollection.prototype.removeAll = function () {
  this._lineCollection.removeAll();
};

LineCollection.prototype.add = function (options) {
  this._lineCollection.add(options);
};

LineCollection.prototype.isDestroy = function () {
  return false;
};

LineCollection.prototype.destroy = function () {
  this._lineCollection = this._lineCollection && this._lineCollection.destroy();
};

LineCollection.prototype.update = function (frameState) {
  this._lineCollection.update(frameState);
};

export default LineCollection;
