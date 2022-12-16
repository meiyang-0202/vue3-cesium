
import Tooltip from './Tooltip';

function TooltipManager() {
  this._objects = new Cesium.AssociativeArray();
  const { WE } = window;
  const { scene } = WE.viewer;
  const _this = this;
  this._preUpdateRemoveListener = scene.preUpdate.addEventListener(
    (_scene, time) => {
      _this.update(time);
    }
  );
  this._clearing = false;
  this._clampToTerrain = false;
  this._hasScalePin = false;
  this._scaleDistance = 0;
}

Object.defineProperties(TooltipManager.prototype, {
  clampToTerrain: {
    get() {
      return this._clampToTerrain;
    },
    set(value) {
      this._clampToTerrain = value;
    },
  },
  clampToGround: {
    get() {
      return this._clampToTerrain;
    },
    set(value) {
      this._clampToTerrain = value;
    },
  },
  scaleDistance: {
    get() {
      return this._scaleDistance;
    },
    set(value) {
      this._scaleDistance = value;
    },
  }
});

TooltipManager.prototype.updateScale = function (distance) {
  if (this._hasScalePin) {
    this.scaleDistance = distance;
  }
};
  
TooltipManager.prototype.add = function (pin) {
  if (!Cesium.defined(pin)) {
    throw new Cesium.DeveloperError('entity is required.');
  }
  
  if (!(pin instanceof Tooltip)) {
    pin.owner = this;
    pin = new Tooltip(pin);
  }
  if (!Cesium.defined(pin.id)) {
    pin.id = Cesium.createGuid();
  }
  const id = pin.id;
  const pins = this._objects;
  if (pins.contains(id)) {
    throw new Cesium.RuntimeError(
      'An pin with id ' + id + ' already exists in this collection.'
    );
  }
  pin.pinCollection = this;
  pins.set(id, pin);

  if (!this._hasScalePin && pin.scaleSense) {
    this._hasScalePin = true;
  }

  return pin;
};

TooltipManager.prototype.remove = function (pin) {
  if (!Cesium.defined(pin)) {
    return false;
  }
  
  if (typeof pin === 'string') {
    return this.removeById(pin);
  }
  
  if (!Cesium.defined(pin.id)) {
    return false;
  }
  
  if (!this._objects.remove(pin.id)) {
    return false;
  }
  
  pin.destroy();
  return true;
};

TooltipManager.prototype.getById = function (id) {
  if (!Cesium.defined(id)) {
    throw new Cesium.DeveloperError('id is required.');
  }
  
  return this._objects.get(id);
};

TooltipManager.prototype.removeById = function (id) {
  if (!Cesium.defined(id)) {
    return false;
  }
  
  const pin = this.getById(id);
  if (!Cesium.defined(pin)) {
    return false;
  }
  
  if (!this._objects.remove(id)) {
    return false;
  }
  
  pin.destroy();
  return true;
};

TooltipManager.prototype.destroy = function () {
  this._preUpdateRemoveListener();
  this.removeAll();
};

TooltipManager.prototype.removeAll = function () {
  this._clearing = true;
  const pins = this._objects.values;
  const pinsLength = pins.length;
  for (let i = 0; i < pinsLength; i++) {
    pins[i].destory();
  }
  this._objects.removeAll();
  this._clearing = false;
};

TooltipManager.prototype.update = function (time) {
  if (this._clearing) {
    return;
  }
  const { WE } = window;
  const pins = this._objects.values;
  const pinsLength = pins.length;
  for (let i = 0; i < pinsLength; i++) {
    const pin = pins[i];
    if (this.scaleDistance > 0) {
      pin.updateScale(this.scaleDistance);
    }
    pin.update(WE.viewer);
  }
  this.scaleDistance = 0;
};

export default TooltipManager;
