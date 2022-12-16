import FlightPath from './FlightPath';
import FlightPlane from './FlightPlane';

function FlightPlaneAndPath(options) {
  this._show = false;
  options.plane.owner = options.owner;
  options.path.owner = options.owner;
  options.plane.tooltip = options.tooltip;
  this._plane = new FlightPlane(options.plane);
  this._path = new FlightPath(options.path);
}

Object.defineProperties(FlightPlaneAndPath.prototype, {
  show: {
    get() {
      return this._show;
    },
    set(value) {
      this._show = value;
    }
  },
  plane: {
    get() {
      return this._plane;
    }
  },
  path: {
    get() {
      return this._path;
    }
  }
});

FlightPlaneAndPath.prototype.push = function (station) {
  const { id, longitude, latitude } = station;
  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0.0);
  this._path.push({ id, position });
  this.pushPlanePosition(station);
};

FlightPlaneAndPath.prototype.pushPlanePosition = function (station) {
  const { longitude, latitude } = station;
  let { height } = station;
  if (!Cesium.defined(height)) {
    height = Cesium.Math.nextRandomNumber() * 500 + 6750;
  }
  this._plane.push(Cesium.Cartesian3.fromDegrees(longitude, latitude, height));
};

FlightPlaneAndPath.prototype.destroy = function () {
  this._plane = this._plane && this._plane.destroy();
  this._path = this._path && this._path.destroy();
  return Cesium.destroyObject(this);
};

FlightPlaneAndPath.prototype.isDestroyed = function () {
  return false;
};

FlightPlaneAndPath.prototype.update = function (frameState) {
  if (!this._show) {
    return;
  }
  this._path.update(frameState);
  this._plane.update(frameState);
};

export default FlightPlaneAndPath;
