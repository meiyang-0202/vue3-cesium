
function Exp3dtilesDecorator() {
  this._positions = [];
  this._positions2 = [];
  this._currentPosition = new Cesium.Cartesian3();
  this._currentPosition2 = new Cesium.Cartesian3();
  this._modelMatrix = undefined;
  this._lineCollection2 = new Cesium.PolylineCollection();
  this._offetHeight = -30;
  this._offetTipHeight = 30;
}

const layerName = '三维瓦片图层';

Exp3dtilesDecorator.prototype.createScene = function (tileset, WE) {
  this.WE = WE;
  this._modelMatrix = tileset.root.transform;
  
  this.computeRoute();

  const that = this;
  tileset.update2 = tileset.update;
  tileset.update = function (frameState) {
    that.update(frameState);
    tileset.update2(frameState);
  };
  tileset.destroy2 = tileset.destroy;
  tileset.destroy = function () {
    that.destroy();
    tileset.destroy2();
  };

  this.createInfo();
  this.createTrack();
  this.createSecondScene(tileset);
};

Exp3dtilesDecorator.prototype.createSecondScene = function (mainTileset) {
  const WE = this.WE.secondWE;
  if (!Cesium.defined(WE)) {
    return;
  }

  const url = mainTileset._url;
  WE.layerManager.remove(layerName);
  const options = {
    url,
  };

  const tileset = WE.layerManager.addTilesetLayer(options, layerName);   
  tileset.readyPromise.then(() => {
    const view = {
      longitude: 2.024607, latitude: 0.523468, height: 460.497, heading: 6.26, pitch: -0.34, roll: 0.00 
    };
    const vp = new WeatherEarth.ViewPoint(view);
    WE.viewer.camera.flyTo({
      destination: vp.cartesion3,
      orientation: {
        heading: vp.heading,
        pitch: vp.pitch,
        roll: vp.roll
      },
      duration: 0.0
    });
  });

  const that = this;
  tileset.update2 = tileset.update;
  tileset.update = function (frameState) {
    that.update2(frameState);
    tileset.update2(frameState);
  };
  tileset.destroy2 = tileset.destroy;
  tileset.destroy = function () {
    that.destroy2();
    tileset.destroy2();
  };
};

Exp3dtilesDecorator.prototype.computeRoute = function () {
  const { WE } = this;
  const startTime = WE.WeExt.today00;
  const stopTime = WE.WeExt.today24;
  const fullTime = Cesium.JulianDate.secondsDifference(stopTime, startTime);
  
  const coordinates = [
    [-214.03, 479.08],
    [-8.31, 189.84],
    [98.07, 159.07],
    [248.4, -44.02]
  ];
  coordinates.reverse();
  const length = coordinates.length;

  const scratchC3 = new Cesium.Cartesian3();
  let speed = 0.0;
  let distanceSum = 0.0;
  const distances = [0.0];

  const positions = [];
  const positions2 = [];
  const positions3 = [];
  for (let i = 0; i < length; i++) {
    const element = coordinates[i];
    const p = new Cesium.Cartesian3(element[0], element[1], this._offetHeight);
    const p3 = new Cesium.Cartesian3(element[0], element[1], this._offetTipHeight);
    positions2.push(p);

    const position = Cesium.Matrix4.multiplyByPoint(this._modelMatrix, p, new Cesium.Cartesian3());
    positions.push(position);
    const position3 = Cesium.Matrix4.multiplyByPoint(this._modelMatrix, p3, new Cesium.Cartesian3());
    positions3.push(position3);
    if (i > 0) {
      const position0 = positions[i - 1];
      const distance = Cesium.Cartesian3.magnitude(Cesium.Cartesian3.subtract(position, position0, scratchC3));
      distanceSum += distance;
      distances.push(distance);
    }
  }

  speed = distanceSum / fullTime;

  this._positions = positions;
  this._positions2 = positions2;
  this._positions3 = positions3;

  // sample
  let seconds = 0.0;
  const sampledPosition = new Cesium.SampledPositionProperty();
  const sampledPosition2 = new Cesium.SampledPositionProperty();
  sampledPosition.addSample(startTime, positions[0]);
  sampledPosition2.addSample(startTime, positions3[0]);
  for (let i = 1; i < length - 1; i++) {
    seconds += distances[i] / speed;
    const time = Cesium.JulianDate.addSeconds(
      startTime,
      seconds,
      new Cesium.JulianDate()
    );
    sampledPosition.addSample(time, positions[i]);
    sampledPosition2.addSample(time, positions3[i]);
  }
  sampledPosition.addSample(stopTime, positions[length - 1]);
  sampledPosition2.addSample(stopTime, positions3[length - 1]);

  this._sampledPosition = sampledPosition;
  this._sampledPosition2 = sampledPosition2;
  this._sampledOrientation = new Cesium.VelocityOrientationProperty(sampledPosition);
  this._sampledOrientation2 = new Cesium.VelocityOrientationProperty(sampledPosition2);
  
  WE.WeExt.zoomToToday();
  WE.viewer.clock.currentTime = WE.WeExt.today00;
};

Exp3dtilesDecorator.prototype.createInfo = function () {
  let { WE } = this;
  const positions = this._positions2;
  // positions.forEach((position) => {
  //   WE.WeExt.pointCollection.add({
  //     position
  //   });
  // });

  const options = {
    positions,
    width: 4,
  };
  // WE.WeExt.lineCollection.add(options);
  // WE.WeExt.pointCollection._pointCollection.modelMatrix = this._modelMatrix;
  // WE.WeExt.lineCollection._lineCollection.modelMatrix = this._modelMatrix;

  if (WE.secondWE) {
    WE = WE.secondWE;
    WE.WeExt.lineCollection.add(options);

    const modelMatrix = this._modelMatrix;
    WE.WeExt.pointCollection._pointCollection.modelMatrix = modelMatrix;
    WE.WeExt.lineCollection._lineCollection.modelMatrix = modelMatrix;

    const height = -this._offetHeight + this._offetTipHeight;
    this._lineCollection2.add({
      positions: [new Cesium.Cartesian3(0, 0, -height), new Cesium.Cartesian3(0, 0, 0)],
      width: 1,
    });
  }
};
  
Exp3dtilesDecorator.prototype.createTrack = function () {
  const { WE } = this;
  const url = WeatherEarth.Config.AssetUrl + '/model/dji_spark/scene.gltf';
  // const url = WeatherEarth.Config.AssetUrl + '/model/helicopter/scene.gltf';
  const options2 = { 
    url,
    minimumPixelSize: 64,
    silhouetteColor: new Cesium.Color(0.0, 1.0, 0.0, 1.0),
    silhouetteSize: 2.0,
    shadows: Cesium.ShadowMode.DISABLED,
    allowPicking: false,
  };
  
  this._model = Cesium.Model.fromGltf(options2);
  this._model.readyPromise.then((model) => {
    model.activeAnimations.addAll({
      loop: Cesium.ModelAnimationLoop.REPEAT // Loop the animation
    });
  }).catch((error) => {
    console.error(error);
  });
};

Exp3dtilesDecorator.prototype.isDestroyed = function () {
  return false;
};

Exp3dtilesDecorator.prototype.destroy = function () {
  this._model = this._model && this._model.destroy();

  const { WE } = this;
  WE.WeExt.pointCollection.removeAll();
  WE.WeExt.lineCollection.removeAll();
  if (this.WE.secondWE) {
    this.WE.secondWE.layerManager.remove(layerName);
  }
  WE.WeExt.pointCollection._pointCollection.modelMatrix = Cesium.Matrix4.IDENTITY;
  WE.WeExt.lineCollection._lineCollection.modelMatrix = Cesium.Matrix4.IDENTITY;
};

Exp3dtilesDecorator.prototype.destroy2 = function () {
  const WE = this.WE.secondWE;
  WE.WeExt.pointCollection.removeAll();
  WE.WeExt.lineCollection.removeAll();
  WE.WeExt.pointCollection._pointCollection.modelMatrix = Cesium.Matrix4.IDENTITY;
  WE.WeExt.lineCollection._lineCollection.modelMatrix = Cesium.Matrix4.IDENTITY;
};

const orientationScratch = new Cesium.Quaternion();
const scratchMatrix3 = new Cesium.Matrix3();
const scratchMatrix4 = new Cesium.Matrix4();
const scratchMatrix42 = new Cesium.Matrix4();
const scratchHPRoll = new Cesium.HeadingPitchRoll(0, 0, 0);
const scratchHPRange = new Cesium.HeadingPitchRange(0, 0, 5);
let time2;
Exp3dtilesDecorator.prototype.update2 = function (frameState) {
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(this._currentPosition, frameState.mapProjection.ellipsoid, scratchMatrix42);
  this._lineCollection2.modelMatrix = modelMatrix;
  this._lineCollection2.update(frameState);

  const position = this._sampledPosition2.getValue(time2, this._currentPosition2);
  const orientation = this._sampledOrientation2.getValue(time2, orientationScratch);
  if (Cesium.defined(position) && Cesium.defined(orientation)) {
    const transform = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromQuaternion(orientation, scratchMatrix3),
      position,
      scratchMatrix42
    );
    if (Cesium.defined(this._model)) {
      this._model.modelMatrix = transform;
      this._model.update(frameState);
    }
  }
};

Exp3dtilesDecorator.prototype.update = function (frameState) {
  time2 = frameState.time;
  if (Cesium.defined(this._sampledPosition)) {
    const position = this._sampledPosition.getValue(frameState.time, this._currentPosition);
    const orientation = this._sampledOrientation.getValue(frameState.time, orientationScratch);
    if (Cesium.defined(position) && Cesium.defined(orientation)) {
      const transform = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation, scratchMatrix3),
        position,
        scratchMatrix4
      );

      const hpRoll = Cesium.Transforms.fixedFrameToHeadingPitchRoll(transform, undefined, undefined, scratchHPRoll);
      const heading = hpRoll.heading;
      scratchHPRange.heading = Cesium.Math.zeroToTwoPi(Cesium.Math.PI_OVER_TWO + heading);
      scratchHPRange.pitch = hpRoll.pitch;
      frameState.camera.setView({ 
        destination: position,
        orientation: {
          heading: scratchHPRange.heading,
          pitch: scratchHPRange.pitch,
        }
      });
    }
  }
};

export default Exp3dtilesDecorator;
