function Tooltip(options) {
  this.id = options.id;
  this._node = options.node;
  this._position = options.position;
  this._node.setupState.isVisible = true;
  this._node._x = 0;
  this._owner = options.owner;
  this.scratchCartographic = new Cesium.Cartographic();
  this.scratchCartesian3 = new Cesium.Cartesian3();
  this.scaleSense = Cesium.defined(this._node.setupState.updateScale);
  this._clampToGround = Cesium.defaultValue(this._node.setupState.clampToGround, true);
}

Object.defineProperties(Tooltip.prototype, {
  visible: {
    get() {
      return this._node.setupState.isVisible;
    },
    set(value) {
      this._node.setupState.isVisible = value;
    },
  },
  position: {
    get() {
      return this._position;
    },
    set(value) {
      this._position = value;
    },
  }
});

Tooltip.prototype.destroy = function () {
  this._node.setupState.isVisible = false;
};

Tooltip.prototype.updateContent = function (content) {
  if (Cesium.defined(this._node)) {
    this._node.setupState.updateContent(content);
  }
};

Tooltip.prototype.updateScale = function (scaleDistance) {
  if (this.scaleSense) {
    this._node.setupState.updateScale(scaleDistance);
  }
};

Tooltip.prototype.update = function (viewer) {
  if (!this._node.setupState.isVisible) {
    return;
  }

  let position = this._position;
  if (this._owner.clampToTerrain && this._clampToGround) {
    const cartorgrahic = Cesium.Cartographic.fromCartesian(this._position, Cesium.Ellipsoid.WGS84, this.scratchCartographic);
    const height = viewer.scene.globe.getHeight(cartorgrahic);
    if (Cesium.defined(height)) {
      cartorgrahic.height = height;
      position = Cesium.Cartographic.toCartesian(cartorgrahic, Cesium.Ellipsoid.WGS84, this.scratchCartesian3);
    }
  }
  const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, position);
  if (Cesium.defined(this._node.setupState.updatePotision) && Cesium.defined(screenPosition)) {
    const x = screenPosition.x.toFixed(0);
    const y = screenPosition.y.toFixed(0);
    if (this._node.setupState.dirty
      || this._node.setupState._offsetWidth === 0
      || this._node.setupState._offsetHeight === 0
      || x !== this._node._x
      || y !== this._node._y) {
      this._node._x = x;
      this._node._y = y;
      this._node.setupState.updatePotision(screenPosition, viewer);
      this._node.setupState.dirty = false;
    }
  }
};

export default Tooltip;
