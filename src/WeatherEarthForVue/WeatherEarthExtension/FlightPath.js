
function FlightPath(options) {
  this._we = options.WE;
  const scene = this._we.viewer.scene;
  this._labels = new Cesium.BillboardCollection();
  this._billboards = new Cesium.BillboardCollection({ scene });
  this._show = true;
  this._linePositions = [];
  this._linePrimitive = undefined;
  this._billboradOptions = Cesium.defaultValue(options.billborad, {});
}

FlightPath.prototype.pushBillboard = function (station) {
  const {
    id, position, label, icon 
  } = station;
  const options = this._billboradOptions;
  const image = Cesium.defaultValue(icon, options.url);
  const size = Cesium.defaultValue(options.size, 24);
  this._billboards.add({
    id,
    position,
    height: size,
    width: size,
    image,
    heightReference: Cesium.defaultValue(options.heightReference, Cesium.HeightReference.NONE),
    pixelOffset: Cesium.defaultValue(options.pixelOffset, new Cesium.Cartesian2(0, 0)),
  });
};

FlightPath.prototype.push = function (station) {
  this.pushBillboard(station);
  const {
    id, position, label, icon 
  } = station;
  // if (Cesium.defined(label)) {

  // }

  this._linePositions.push(position);
};

Object.defineProperties(FlightPath.prototype, {
  show: {
    get() {
      return this._show;
    },
    set(value) {
      this._show = value;
    }
  }
});

FlightPath.prototype.createPrimitive = function () {
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.GroundPolylineGeometry({
      positions: this._linePositions,
      width: 10.0
    })
  });

  const appearance = new Cesium.PolylineMaterialAppearance({
    material: Cesium.Material.fromType(Cesium.Material.PolylineOutlineType)
  });

  appearance.material.uniforms.color = new Cesium.Color(1.0, 1.0, 1.0, 0.5);
  appearance.material.uniforms.outlineWidth = 2.0;
  appearance.material.uniforms.outlineColor = Cesium.Color.WHITE;

  this._linePrimitive = new Cesium.GroundPolylinePrimitive({
    geometryInstances: instance,
    appearance,
    granularity: 2890.0,
    arcType: Cesium.ArcType.RHUMB,
  });
};

FlightPath.prototype.isDestroyed = function () {
  return false;
};

FlightPath.prototype.update = function (frameState) {
  if (!this._show) {
    return;
  }

  if (!Cesium.defined(this._linePrimitive)) {
    this.createPrimitive();
  }

  this._labels.update(frameState);
  this._billboards.update(frameState);
  this._linePrimitive.update(frameState);
};

FlightPath.prototype.destroy = function () {
  this._labels = this._labels && this._labels.destroy();
  this._billboards = this._billboards && this._billboards.destroy();
  this._linePrimitive = this._linePrimitive && this._linePrimitive.destroy();
  return Cesium.destroyObject(this);
};

export default FlightPath;
