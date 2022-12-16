import FlightInfoDrawer from './FlightInfoDrawer';

function FlyingPane(options) {
  const position = options.position;
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  this._model = Cesium.Model.fromGltf({
    url: options.url,
    show: true,
    modelMatrix,
    asynchronous: false,
    minimumPixelSize: Cesium.defaultValue(options.minimumPixelSize, 96),
    color: Cesium.defaultValue(options.color, new Cesium.Color(1.0, 1.0, 1.0, 1.0)),
    silhouetteSize: Cesium.defaultValue(options.silhouetteSize, 0),
    silhouetteColor: Cesium.defaultValue(options.silhouetteColor, Cesium.Color.RED),
  });
  this._startTime = options.startTime;
  this._samplePositionProperty = new Cesium.SampledPositionProperty();
  this._samplePositionProperty.addSample(this._startTime, position);
  this._sampleAngleProperty = new Cesium.SampledProperty(Number);
  this._sampleAngleProperty.addSample(this._startTime, 0);
  this._sampleIndexProperty = new Cesium.SampledProperty(Number);
  this._scratchMatrix3 = new Cesium.Matrix3();
  this._scratchMatrix4 = new Cesium.Matrix4();
  this._scratchPosition = new Cesium.Cartesian3();
  this._currentPosition = new Cesium.Cartesian3();
  this._previousPosition = new Cesium.Cartesian3();
  this._lastUpdateSeccond = Cesium.defaultValue(options.lastUpdateSeccond, 0);
  this._id = options.id;
  this._dirty = false;
  this._owner = options.owner;
  const departure = options.departure;
  const destination = options.destination;
  const image = FlightInfoDrawer.draw({ name: options.id, departure, destination });
  this._billboard = this._owner._billboards.add({
    position,
    height: image.height / 16,
    width: image.width / 16,
    pixelOffset: new Cesium.Cartesian2(60, 0),
    scaleByDistance: new Cesium.NearFarScalar(10, 2.0, 150000, 2.0),
    pixelOffsetScaleByDistance: new Cesium.NearFarScalar(1000, 2, 150000, 1),
    disableDepthTestDistance: 1000,
    image,
  });
  this._currentIndex = 0;
  this._positions = [];
  this._positions.push(position);

  this._indexChangedEvent = new Cesium.Event();
  this._removeEventSubscription = this._indexChangedEvent.addEventListener(
    this._owner.indexChangedCallback,
    this
  );
}

Object.defineProperties(FlyingPane.prototype, {
  id: {
    get() {
      return this._id;
    },
    set(value) {
      this._id = value;
    },
  },
  positionProperty: {
    get() {
      return this._samplePositionProperty;
    }
  }
});


FlyingPane.prototype.computePose = function (center, angle) {
  const heading = angle / 360.0 * Cesium.Math.TWO_PI - Cesium.Math.PI_OVER_TWO;
  const pitch = 0.0;
  const roll = 0.0;
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const quaternion = Cesium.Transforms.headingPitchRollQuaternion(center, hpr);
  const rotateMatrix = Cesium.Matrix3.fromQuaternion(quaternion, this._scratchMatrix3);
  return Cesium.Matrix4.fromRotationTranslation(rotateMatrix, center, this._scratchMatrix4);
};

FlyingPane.prototype.updateTrail = function () {
  if (!Cesium.defined(this._trailLineAppearance)) {
    this._trailLineAppearance = new Cesium.PolylineMaterialAppearance({
      material: Cesium.Material.fromType(Cesium.Material.PolylineGlowType)
    });
  }

  this._trailLine = this._trailLine && this._trailLine.destroy();
  const currentIndex = this._currentIndex;
  const positions = this._positions.slice(0, currentIndex);
  if (positions.length < 1) {
    return;
  }

  positions.push(this._currentPosition);
  const instance = new Cesium.GeometryInstance({
    geometry: new Cesium.PolylineGeometry({
      positions,
      width: 4
    })
  });

  this._trailLine = new Cesium.Primitive({ geometryInstances: instance, asynchronous: false });
  this._trailLine.appearance = this._trailLineAppearance;

  const wallGeometry = Cesium.WallGeometry.createGeometry(
    new Cesium.WallGeometry({
      positions,
    })
  );

  this._trailWall = this._trailWall && this._trailWall.destroy();
  if (!Cesium.defined(wallGeometry)) {
    return;
  }

  this._trailWall = new Cesium.Primitive({
    geometryInstances: new Cesium.GeometryInstance({ geometry: wallGeometry }),
    asynchronous: false,
  });
  if (!Cesium.defined(this._wallAppearance)) {
    this._wallAppearance = new Cesium.MaterialAppearance({
      renderState: {
        depthTest: { enabled: true },
        depthMask: true,
        blending: Cesium.BlendingState.ALPHA_BLEND,
        cull: {
          enabled: false,
          face: Cesium.CullFace.FRONT,
        },
      },
      translucent: true,
    });
    const fs = `
    czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        vec2 st = materialInput.st;
        vec4 color = vec4(0.5, 0.5, st.y, 1.0);
        material.diffuse = color.rgb;
        material.alpha = pow(st.y,2.0);
        return material;
    } 
    `;
    this._wallAppearance.material = new Cesium.Material({
      fabric: {
        source: fs,
      },
    });
  }
  this._trailWall.appearance = this._wallAppearance;
};

FlyingPane.prototype.pushData = function (data) {
  if (!Cesium.defined(this._startTime)) {
    return;
  }
  const {
    U, V, lon, lat, height, angle, secconds 
  } = data;

  const planeHeight = 4.0;
  const sec = secconds + 28800.0;

  if (sec < this._lastUpdateSeccond) {
    return;
  }
  this._lastUpdateSeccond = sec;
  const position = Cesium.Cartesian3.fromDegrees(
    lon,
    lat,
    height + planeHeight
  );
  this._scratchDate = new Cesium.JulianDate();
  const t = Cesium.JulianDate.addSeconds(this._startTime, sec, this._scratchDate);
  this._samplePositionProperty.addSample(t, position);
  this._sampleAngleProperty.addSample(t, angle);
  this._sampleIndexProperty.addSample(t, this._positions.length);
  this._positions.push(position);
};


FlyingPane.prototype.destroy = function () {
  this._model = this._model && this._model.destroy();
  this._owner._billboards.remove(this._billboard);
  if (Cesium.defined(this._removeEventSubscription)) {
    this._removeEventSubscription();
    this._removeEventSubscription = undefined;
  }
  return Cesium.destroyObject(this);
};

FlyingPane.prototype.isDestroyed = function () {
  return false;
};

FlyingPane.prototype.update = function (frameState) {
  const position = this._samplePositionProperty.getValue(frameState.time, this._currentPosition);
  if (Cesium.defined(position)) {
    this._billboard.position = position;
    const angle = this._sampleAngleProperty.getValue(frameState.time);
    const modelMatrix = this.computePose(position, angle);
    this._model.modelMatrix = modelMatrix;
  }

  const ip = this._sampleIndexProperty.getValue(frameState.time);
  const index = Cesium.defined(ip) ? Math.floor(ip) : 0;
  if (index !== this._currentIndex) {
    this._currentIndex = index;
    this.updateTrail();
    if (Cesium.defined(this._indexChangedEvent) && Cesium.defined(position)) {
      this._indexChangedEvent.raiseEvent(
        this,
        'indexChanged',
        index,
        position
      );
    }
  }

  if (Cesium.defined(this._trailLine)) {
    this._trailLine.update(frameState);
    if (Cesium.defined(this._trailWall)) {
      this._trailWall.update(frameState);
    }
  }

  this._model.update(frameState);
};

export default FlyingPane;
