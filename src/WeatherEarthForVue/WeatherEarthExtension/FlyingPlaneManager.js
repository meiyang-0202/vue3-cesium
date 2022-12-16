import FlyingPane from './FlyingPane';

function FlyingPaneManager() {
  this._planes = new Cesium.AssociativeArray();
  this._billboards = new Cesium.BillboardCollection();
}

FlyingPaneManager.prototype.add = function (options) {
  if (!Cesium.defined(options.id)) {
    options.id = Cesium.createGuid();
  }
  const id = options.id;
  if (this._planes.contains(id)) {
    throw new Cesium.RuntimeError(
      'An flying plane with id ' + id + ' already exists in this collection.'
    );
  }
  options.owner = this;
  const plane = new FlyingPane(options);
  this._planes.set(id, plane);
  return plane;
};

FlyingPaneManager.prototype.getById = function (id) {
  if (!Cesium.defined(id)) {
    throw new Cesium.DeveloperError('id is required.');
  }
  return this._planes.get(id);
};

FlyingPaneManager.prototype.remove = function (entity) {
  if (!Cesium.defined(entity)) {
    return false;
  }
  const id = entity instanceof FlyingPane ? entity.id : entity;

  const plane = this.getById(id);
  if (!Cesium.defined(plane)) {
    return false;
  }

  if (!this._planes.remove(id)) {
    return false;
  }

  plane.destroy();

  return true;
};

FlyingPaneManager.prototype.indexChangedCallback = function (plane,
  eventName,
  index,
  position) {
  // console.info(`${plane.id}-${index}-${position}`);
};


FlyingPaneManager.prototype.destroy = function () {
  return Cesium.destroyObject(this);
};

FlyingPaneManager.prototype.isDestroyed = function () {
  return false;
};

FlyingPaneManager.prototype.update = function (frameState) {
  for (let i = 0; i < this._planes.length; i++) {
    const plane = this._planes._array[i];
    plane.update(frameState);
  }

  this._billboards.update(frameState);
};

export default FlyingPaneManager;
