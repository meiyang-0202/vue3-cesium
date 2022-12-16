import PrimitiveGenerator from './PrimitiveGenerator';
import ODLine from './ODLine';
import Tetrahedron from './Tetrahedron';

function PrimitiveManager() {
  this._objects = new Cesium.AssociativeArray();
}

PrimitiveManager.prototype.addTetrahedron = function (options) {
  return this.add(new Tetrahedron(options));
};

PrimitiveManager.prototype.addODLine = function (options) {
  return this.add(new ODLine(options));
};

PrimitiveManager.prototype.addWall = function (options) {
  return this.add(PrimitiveGenerator.createWall(options));
};

PrimitiveManager.prototype.addHalfSphere = function (options) {
  return this.add(PrimitiveGenerator.createHalfSphere(options));
};

PrimitiveManager.prototype.addCircle = function (options) {
  return this.add(PrimitiveGenerator.createCircle(options));
};

PrimitiveManager.prototype.addPrimitive = function (options) {
  return this.add(PrimitiveGenerator.createPrimitive(options));
};

PrimitiveManager.prototype.addRectangle = function (options) {
  return this.add(PrimitiveGenerator.createRectangle(options));
};

PrimitiveManager.prototype.add = function (primitive) {
  if (!Cesium.defined(primitive.id)) {
    primitive.id = Cesium.createGuid();
  }
  const id = primitive.id;
  if (this._objects.contains(id)) {
    throw new Cesium.RuntimeError(
      'An object with id ' + id + ' already exists in this collection.'
    );
  }
  this._objects.set(id, primitive);
  return primitive;
};

PrimitiveManager.prototype.removeAll = function () {
  this._clearing = true;
  let i = 0;
  for (; i < this._objects.length; i++) {
    this._objects._array[i].destroy();
  }
  this._objects.removeAll();
  this._clearing = false;
};
  
PrimitiveManager.prototype.remove = function (entity) {
  if (!Cesium.defined(entity)) {
    return false;
  }
  
  const id = entity instanceof Cesium.Primitive ? entity.id : entity;

  const obj = this.getById(id);
  
  if (!Cesium.defined(obj)) {
    return false;
  }
  
  if (!this._objects.remove(id)) {
    return false;
  }
  
  obj.destroy();
  
  return true;
};
  
PrimitiveManager.prototype.destroy = function () {
  this.removeAll();
  return Cesium.destroyObject(this);
};
  
PrimitiveManager.prototype.isDestroyed = function () {
  return false;
};
  
PrimitiveManager.prototype.update = function (frameState) {
  if (this._clearing) {
    return;
  }
  for (let i = 0; i < this._objects.length; i++) {
    const p = this._objects._array[i];
    p.update(frameState);
  }
};
  
export default PrimitiveManager;
