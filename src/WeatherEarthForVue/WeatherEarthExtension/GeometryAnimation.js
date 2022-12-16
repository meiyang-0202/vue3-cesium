
function GeometryAnimaition(options) {
  this._geometryInstances = options.geometryInstances;
  this._appearance = options.appearance;
  this._index = 0;
  this._dirty = true;
  this._property = options.property;
}

Object.defineProperties(GeometryAnimaition.prototype, {
  index: {
    set(value) {
      if (!Number.isNaN(value) && this._index !== value) {
        this._index = value;
        this._dirty = true;
      }
    }
  },
});

GeometryAnimaition.prototype.rebuild = function () {
  this._primitive = this._primitive && this._primitive.destroy();
  const index = this._index;
  const geometryInstances = [this._geometryInstances[index]];
  this._primitive = new Cesium.GroundPrimitive({
    geometryInstances,
    appearance: this._appearance,
    asynchronous: false,
  });
};

GeometryAnimaition.prototype.isDestroyed = function () {
  return false;
};

GeometryAnimaition.prototype.destroy = function () {
  this._primitive = this._primitive && this._primitive.destroy();
};

GeometryAnimaition.prototype.update = function (frameState) {
  if (!frameState.passes.render) {
    return;
  }
  if (Cesium.defined(this._property)) {
    const value = this._property.getValue(frameState.time);
    if (Cesium.defined(value)) {
      this.index = Math.floor(value);
    }
  }
  if (this._dirty) {
    this.rebuild();
    this._dirty = false;
  }

  this._primitive.update(frameState);
};

export default GeometryAnimaition;
