import FlightPlaneAndPath from './FlightPlaneAndPath';

function FlightManager() {
  this._objects = new Cesium.AssociativeArray();
  this._billboards = new Cesium.BillboardCollection();
  this._clearing = false;
}

FlightManager.prototype.add = function (options) {
  if (!Cesium.defined(options.id)) {
    options.id = Cesium.createGuid();
  }
  const id = options.id;
  if (this._objects.contains(id)) {
    throw new Cesium.RuntimeError(
      'An FlightPlaneAndPath with id ' + id + ' already exists in this collection.'
    );
  }
  options.owner = this;
  const plane = new FlightPlaneAndPath(options);
  this._objects.set(id, plane);
  return plane;
};

FlightManager.prototype.getById = function (id) {
  if (!Cesium.defined(id)) {
    throw new Cesium.DeveloperError('id is required.');
  }
  return this._objects.get(id);
};

FlightManager.prototype.removeAll = function () {
  this._clearing = true;
  let i = 0;
  for (; i < this._objects.length; i++) {
    this._objects._array[i].destroy();
  }
  this._objects.removeAll();
  this._clearing = false;
};

FlightManager.prototype.remove = function (entity) {
  if (!Cesium.defined(entity)) {
    return false;
  }

  const id = entity instanceof FlightPlaneAndPath ? entity.id : entity;

  const plane = this.getById(id);
  if (!Cesium.defined(plane)) {
    return false;
  }

  if (!this._objects.remove(id)) {
    return false;
  }

  plane.destroy();

  return true;
};

FlightManager.prototype.destroy = function () {
  return Cesium.destroyObject(this);
};

FlightManager.prototype.isDestroyed = function () {
  return false;
};

FlightManager.prototype.update = function (frameState) {
  if (this._clearing) {
    return;
  }
  for (let i = 0; i < this._objects.length; i++) {
    const plane = this._objects._array[i];
    plane.update(frameState);
  }

  this._billboards.update(frameState);
};

export default FlightManager;
