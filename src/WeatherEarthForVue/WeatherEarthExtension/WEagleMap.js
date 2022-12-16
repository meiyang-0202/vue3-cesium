import WEaglePrimitive from './WEaglePrimitive';

function WEagleMap(options) {
  this._we = options.WE;
  this._uniformMap = {};
  this._dirty = false;
  this._show = false;
}

Object.defineProperties(WEagleMap.prototype, {
  WE: {
    get() {
      return this._we;
    }
  },
  viewer: {
    get() {
      return this._we.viewer;
    }
  },
  dirty: {
    get() {
      return this._dirty;
    },
    set(value) {
      this._dirty = value;
    }
  },
  bindObject: {
    get() {
      return this._bindObject;
    }
  },
  show: {
    get() {
      return this._show;
    },
    set(value) {
      this._show = value;
    }
  }
});

WEagleMap.prototype.init = function () {
  const { WE } = this;
  WE.backgroundColor = new Cesium.Color(0.0, 0.0, 0.0, 0.0);
  WE.viewer.scene.primitives.removeAll();
};

WEagleMap.prototype.clear = function () {
  this._bindObject = undefined;
  this.viewer.scene.primitives.removeAll();
};

WEagleMap.prototype.bindVolumeLayer = function (options) {
  const { layer, slice, sampler } = options;


  this._bindObject = slice;
  const { WE } = this;
  const scene = WE.viewer.scene;
  const context = scene.context;

  const { weatherVolume } = layer;
  const uniforms = {
    clipMatrix: weatherVolume.inner._clipMatrix,
    u_attribute: weatherVolume.inner._attributeMatrix,
  };

  uniforms.calcMatrix = slice._volumeWall._calcMatrix;
  uniforms.baseTexture = WeatherEarth.WeatherVolumeLibrary.create3DTexture(context, weatherVolume.inner._source);
  uniforms.tfTexture = WeatherEarth.WeatherVolumeLibrary.createTransferTexture(context, weatherVolume._ValueAndColorRamp, 
    weatherVolume.inner.transferRange, weatherVolume.inner._attributeMatrix[1]);
  
  if (Cesium.defined(sampler)) {
    uniforms.baseTexture.sampler = sampler;
  } else if (Cesium.defined(weatherVolume.inner._texture)) {
    uniforms.baseTexture.sampler = weatherVolume.inner._texture.sampler;
  }

  const source = weatherVolume._TransFunction + WeatherEarth._shadersVolumeWallMaterial;
  const material = new Cesium.Material({
    translucent: false,
    fabric: {
      uniforms,
      source,
    },
  });
  
  const primitive = new WEaglePrimitive({
    material,
  });
  scene.primitives.removeAll();
  scene.primitives.add(primitive);
};

WEagleMap.prototype.isDestroyed = function () {
  return false;
};

WEagleMap.prototype.destroyed = function () {
  this._we = this._we && this._we.destroy();
};

WEagleMap.prototype.requestRender = function () {
  this.viewer.scene.requestRender();
  this._dirty = true;
};

export default WEagleMap;
