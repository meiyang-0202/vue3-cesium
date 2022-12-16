import PntsSet from './PntsSet';
import RadarRainSimulator from './RadarRainSimulator';

function Lightning(options) {
  this.displayRange = Cesium.defaultValue(options.displayRange, 80000);
  this.thunderUrl = options.thunderUrl;
  this.shouldAnime = Cesium.defaultValue(options.shouldAnime, true);
  this.currentIndex = 0;
  this.mulSpeed = Cesium.defaultValue(options.mulSpeed, 1);
  this.lastTime = undefined;
  const url = options.url;
  this.size = Cesium.defaultValue(options.size, 8);
  this.canvas = options.canvas;
  this.row = Cesium.defaultValue(options.row, 1);
  this.col = Cesium.defaultValue(options.col, 1);
  this._resource = new Cesium.Resource(url);
  const that = this;
  this._readyPromise = Cesium.defer();
  this._resource.fetchJson().then((json) => {
    that.parse(json);
  });
  this._position = undefined;
}

Object.defineProperties(Lightning.prototype, {
  readyPromise: {
    get() {
      return this._readyPromise.promise;
    },
  },
  resource: {
    get() {
      return this._resource;
    },
  },
  position: {
    get() {
      return this._position;
    },
  },
});
  
Lightning.prototype.parse = function (tilesetJson) {
  this.scratchDistanceCartographic = new Cesium.Cartographic();
  const root = tilesetJson.root;
  const that = this;
  const { size, row, col } = this;
  const count = row * col;
  const matrix = this.transform = Cesium.defined(root.transform)
    ? Cesium.Matrix4.unpack(root.transform)
    : Cesium.Matrix4.clone(root.IDENTITY);

  const { thunderUrl, canvas } = this;
  const url = this.resource.url.replace('.json', '.pnts');
  const pnts = new PntsSet({ url });
  pnts.readyPromise.then(() => {
    that._billboards = new Cesium.BillboardCollection();
    that._billboards.modelMatrix = matrix;
    const pointsLength = pnts.pointsLength;
    const positions = pnts.positions;
    let maxHeight = 0.0;
    let minHeight = 0.0;
    let longitude; let latitude;
    const scratchPosition = new Cesium.Cartesian3();
    for (let i = 0; i < pointsLength; ++i) {
      const position = Cesium.Cartesian3.unpack(positions, i * 3, scratchPosition);
      const b = that._billboards.add({
        position,
        height: size,
        width: size,
      });
      const offset = Math.floor((i / (pointsLength / count)));
      const offsetX = offset % row;
      const offsetY = row - 1 - Math.floor(offset / col);
      b.setImage('1', canvas);
      b.setImageSubRegion('1', new Cesium.BoundingRectangle(200 * offsetX, 200 * offsetY, 200, 200));
      const cartesian = Cesium.Matrix4.multiplyByPoint(matrix, position, scratchPosition);
      const cartographic = Cesium.Cartographic.fromCartesian(cartesian, Cesium.Ellipsoid.WGS84, this.scratchDistanceCartographic);
      if (Cesium.defined(thunderUrl) && Cesium.defined(cartographic)) {
        if (i === 0) {
          maxHeight = cartographic.height;
          minHeight = cartographic.height;
        } else {
          if (cartographic.height > maxHeight) {
            maxHeight = cartographic.height;
          }
          if (Math.abs(cartographic.height - minHeight) < minHeight) {
            minHeight = cartographic.height;
            longitude = cartographic.longitude;
            latitude = cartographic.latitude;
          }
        }
      }
    }

    if (Cesium.defined(longitude)
    && Cesium.defined(latitude)) {
      that._position = Cesium.Cartesian3.fromRadians(longitude, latitude);
      longitude = Cesium.Math.toDegrees(longitude);
      latitude = Cesium.Math.toDegrees(latitude);
      that._primive = RadarRainSimulator.createThunderPrimitive(
        {
          url: thunderUrl, longitude, latitude, height: maxHeight 
        }
      );
    }
    that._readyPromise.resolve(that);
  });
};

Lightning.prototype.update = function (frameState) {
  if (Cesium.defined(this._primive)) {
    let height = 0.0;
    const cartographic = frameState.mapProjection.ellipsoid.cartesianToCartographic(
      frameState.camera.position,
      this.scratchDistanceCartographic
    );
    if (Cesium.defined(cartographic)) {
      height = cartographic.height;
    }
    if (height > this.displayRange) {
      this._primive.update(frameState);
      this.currentIndex = 0;
      this.lastTime = undefined;
      // only render one
      return;
    }
  }

  if (Cesium.defined(this._billboards)) {
    if (this.shouldAnime) {
      if (!Cesium.defined(this.lastTime)) {
        this.lastTime = frameState.frameNumber;
      }
      const length = this._billboards.length;
      const t = length * this.mulSpeed;
      let tick = (frameState.frameNumber - this.lastTime) % (t) * 60 * this.mulSpeed;
      if (tick > t) {
        this.lastTime = undefined;
        tick = 0;
      }
      for (let i = 0; i < length && tick < t; i++) {
        this._billboards.get(i).show = i < tick;
      }
    }
    this._billboards.update(frameState);
  }
};

Lightning.prototype.destroy = function () {
  this._billboards = this._billboards && this._billboards.destroy();
  this._primive = this._primive && this._primive.destroy();
  return Cesium.destroyObject(this);
};

export default Lightning;
