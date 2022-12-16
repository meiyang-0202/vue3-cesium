
function FlightPlane(options) {
  this._positions = [];
  this._modelOptions = options.model;
  this._iconOptions = options.icon;
  this._startTime = options.startTime;
  this._stopTime = options.stopTime;
  this._speed = Cesium.defaultValue(options.speed, 0);
  this._distances = [];
  this._distanceSum = 0.0;
  this._scratchC3 = new Cesium.Cartesian3();
  this._currentPosition = new Cesium.Cartesian3();

  this._matrix3Scratch = new Cesium.Matrix3();
  this._scratchMatrix4 = new Cesium.Matrix4();
  this._orientationScratch = new Cesium.Quaternion();
  this._owner = options.owner;
  this._tooltip = options.tooltip;
}


Object.defineProperties(FlightPlane.prototype, {
  position: {
    get() {
      return this._currentPosition;
    }
  }
});

FlightPlane.prototype.push = function (position) {
  this._positions.push(position);
  if (this._positions.length > 1) {
    const p0 = this._positions[this._positions.length - 2];
    const p1 = this._positions[this._positions.length - 1];
    const distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(p0, p1, this._scratchC3));
    this._distances.push(distance);
    this._distanceSum += distance;
  } else {
    this._distances.push(0.0);
  }
};

FlightPlane.prototype.createModel = function (options) {
  const startTime = this._startTime;
  const stopTime = this._stopTime;
  let speed = this._speed;
  if (speed === 0) {
    const ftime = Cesium.JulianDate.secondsDifference(stopTime, startTime);
    speed = this._distanceSum / ftime;
  }

  const positions = this._positions;
  const distances = this._distances;
  const property = new Cesium.SampledPositionProperty();
  let seconds = 0;
  for (let i = 0; i < positions.length; i++) {
    const p = positions[i];
    const d = distances[i];
    seconds += d / speed;
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      seconds,
      new Cesium.JulianDate()
    );
    property.addSample(time, p);
  }

  this._property = property;
  this._orientation = new Cesium.VelocityOrientationProperty(property);

  this._model = Cesium.Model.fromGltf(options);
  this._model.readyPromise.then((model) => {
    model.activeAnimations.addAll({
      loop: Cesium.ModelAnimationLoop.REPEAT // Loop the animation
    });
  }).catch((error) => {
    console.error(error);
  });
};


FlightPlane.prototype.createIcon = function (options) {
  if (!Cesium.defined(options)) {
    return;
  }
  this._billboard = this._owner._billboards.add(options);
};

FlightPlane.prototype.destroy = function () {
  if (Cesium.defined(this._billboard)) {
    this._owner._billboards.remove(this._billboard);
    this._billboard = undefined;
  }
  if (Cesium.defined(this._tooltip)) {
    this._tooltip.visible = false;
    this._tooltip = undefined;
  }
  this._model = this._model && this._model.destroy();
  return Cesium.destroyObject(this);
};

FlightPlane.prototype.isDestroyed = function () {
  return false;
};

FlightPlane.prototype.update = function (frameState) {
  if (!Cesium.defined(this._model)) {
    this.createModel(this._modelOptions);
    this.createIcon(this._iconOptions);
    if (Cesium.defined(this._tooltip)) {
      this._tooltip.visible = true;
    }
  }

  const position = this._property.getValue(frameState.time, this._currentPosition);
  if (position) {
    const orientation = this._orientation.getValue(frameState.time, this._orientationScratch);
    this._model.modelMatrix = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromQuaternion(orientation, this._matrix3Scratch),
      position,
      this._scratchMatrix4
    );

    if (Cesium.defined(this._billboard)) {
      this._billboard.position = position;
    }

    if (Cesium.defined(this._tooltip)) {
      this._tooltip.position = position;
      this._tooltip.updateContent(this);
    }
  }

  this._model.update(frameState);
};

export default FlightPlane;
