const shaderMovingTexture = `czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    float iTime = czm_frameNumber / (60.0 * 5.0);
    vec2 st = materialInput.st;
    st = (st - 0.5);
    st.y *= 2.0;
    st.x = fract(st.x - iTime);

   float lineCount = repeat;
   float scaledWidth = fract(lineCount * st.x);
   scaledWidth = abs(scaledWidth - floor(scaledWidth));
   st.x = scaledWidth;

    vec2 uv = inverseXY ? vec2(st.y,st.x) : st;
    vec4 color = texture2D(image, uv);
    material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;
}`;

function ODline(options) {
  const { WE } = window;
  this._primitive = undefined;
  const image = options.image;
  this._inverseXY = Cesium.defaultValue(options.inverseXY, false);
  this._width = Cesium.defaultValue(options.width, 2);
  this._segment = Cesium.defaultValue(options.segment, 10);
  this._arcType = options.arcType;
  this._repeat = Cesium.defaultValue(options.repeat, 1);
  Cesium.Resource.fetchImage(image).then((source) => {
    const texture = new Cesium.Texture({
      context: WE.viewer.scene.context,
      source
    });
    const fragmentShaderSource = shaderMovingTexture;
    this.init(options, texture, fragmentShaderSource);
  });
}

function createInstances(stCartesian, edCartesian, width, segment, arcType) {
  const addPointCartesian = Cesium.Cartesian3.add(stCartesian, edCartesian, new Cesium.Cartesian3());
  const positions = [];

  if (segment === 0) {
    positions.push(stCartesian);
    positions.push(edCartesian);
  } else {
    const midPointCartesian = Cesium.Cartesian3.divideByScalar(addPointCartesian, 2, new Cesium.Cartesian3());
    const midPointCartographic = Cesium.Cartographic.fromCartesian(midPointCartesian);
    midPointCartographic.height = Cesium.Cartesian3.distance(stCartesian, edCartesian) / 5;
    const midPoint = Cesium.Ellipsoid.WGS84.cartographicToCartesian(midPointCartographic, new Cesium.Cartesian3());

    const spline = new Cesium.CatmullRomSpline({
      times: [0.0, 0.5, 1.0],
      points: [stCartesian, midPoint, edCartesian]
    });

    for (let i = 0, len = segment; i < len; i++) {
      positions.push(spline.evaluate(i / len));
    }
  }

  const geometry = new Cesium.PolylineGeometry({
    positions,
    width,
    arcType,
  });

  return new Cesium.GeometryInstance({
    geometry
  });
}

ODline.prototype.init = function (options, texture, fragmentShaderSource) {
  let { geometryInstances } = options;
  if (!Cesium.defined(geometryInstances)) {
    geometryInstances = [];
    const {
      origin, destination, positions
    } = options;
    if (Cesium.defined(origin) && Cesium.defined(destination)) {
      const instance = createInstances(origin, destination, this._width, 0, this._arcType);
      geometryInstances.push(instance);
    } else if (Cesium.defined(positions)) {
      for (let i = 0; i < positions.length / 2; i++) {
        const idx = i * 2;
        const startPoint = positions[idx];
        const endPoint = positions[idx + 1];
        const instance = createInstances(startPoint, endPoint, this._width, this._segment, this._arcType);
        geometryInstances.push(instance);
      }
    }
  } 

  const material = new Cesium.Material({
    fabric: {
      uniforms: {
        image: texture,
        inverseXY: this._inverseXY,
        repeat: this._repeat,
      },
      source: fragmentShaderSource
    }
  });

  const appearance = new Cesium.PolylineMaterialAppearance({
    material
  });

  this._primitive = new Cesium.Primitive({
    geometryInstances,
    asynchronous: false,
    appearance
  });
};

ODline.prototype.isDestroy = function () {
  return false;
};

ODline.prototype.destroy = function () {
  this._primitive = this._primitive && this._primitive.destroy();
};

ODline.prototype.update = function (frameState) {
  if (Cesium.defined(this._primitive)) {
    this._primitive.update(frameState);
  }
};

export default ODline;
