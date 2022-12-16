function RadarRainSimulator() {}

RadarRainSimulator.rainUrl = '';
RadarRainSimulator.thunderUrl = '';

RadarRainSimulator.create = function (layer, options) {
  RadarRainSimulator.rainUrl = options.rainUrl;
  RadarRainSimulator.thunderUrl = options.thunderUrl;

  RadarRainSimulator.createRain(layer, options);
  const { WE } = window;
  const { thunderMap } = options;
  if (Cesium.defined(thunderMap)) {
    layer.thunderMap = thunderMap;
    // eslint-disable-next-line no-array-constructor
    layer.thunders = new Array();
    layer._onLoadNew = function (newValue, oldValue) {
      // console.log(newValue + ' is the current Volume.\n');
      RadarRainSimulator.handleThunder(newValue, layer);
    };
  }
  layer.destroyCopy = layer.destroy;
  layer.destroy = function () {
    layer.destroyCopy();
    if (Cesium.defined(layer.rainPrimitive)) {
      WE.viewer.scene.primitives.remove(layer.rainPrimitive);
      layer.rainPrimitive = undefined;
    }
    if (Cesium.defined(layer.thunders)) {
      layer.thunders.forEach((thunderPrimitive) => {
        WE.viewer.scene.primitives.remove(thunderPrimitive);
      });
      layer.thunders = undefined;
    }
  };
};

RadarRainSimulator.createRain = function (layer, rOptions) {
  const { WE } = window;
  const maximumHeight = 30000;
  const minimumHeight = 0;
  const rectangle = layer.rectangle;
  const geometryInstances = [];
  const n = 50;
  const heightS = rectangle.height / n;
  for (let i = 0; i < n; i++) {
    const h = rectangle.south + i * heightS;
    const positions = Cesium.Cartesian3.fromRadiansArray([
      rectangle.west,
      h,
      rectangle.east,
      h,
    ]);
    geometryInstances.push(
      new Cesium.GeometryInstance({
        geometry: Cesium.WallGeometry.fromConstantHeights({
          positions,
          minimumHeight,
          maximumHeight,
        }),
      })
    );
  }

  const uniforms = {
    threshold: Cesium.defaultValue(rOptions.threshold, 15),
    baseTexture: layer.weatherVolume.inner.texture,
    tfTexture: layer.weatherVolume.inner._textureTF,
    u_attribute: layer.weatherVolume.inner._attributeMatrix,
    clipMatrix: layer.weatherVolume.inner._clipMatrix,
  };
  const url = RadarRainSimulator.rainUrl;
  const vertexShaderSource = `
    attribute vec3 position3DHigh;
    attribute vec3 position3DLow;  
    attribute vec3 normal;    
    attribute vec2 st;       
    attribute float batchId;   
    varying vec3 v_positionEC;  
    varying vec3 v_normalEC;      
    varying vec2 v_st;      
    varying float v_batchId;   
    void main()       
    {       
        vec4 p = czm_translateRelativeToEye(position3DHigh,position3DLow);  
        v_positionEC = (czm_modelViewRelativeToEye * p).xyz;      
        v_normalEC = czm_normal * normal; 
        v_st = st;     
        v_batchId = batchId;       
        gl_Position = czm_modelViewProjectionRelativeToEye * p;  
    }      
  `;
  const fragmentShaderSource = `
    ${layer.TransFunction}
    precision highp sampler3D;
    varying float v_batchId;
    czm_material czm_getMaterial(czm_materialInput materialInput) {
        czm_material material = czm_getDefaultMaterial(materialInput);
        float scaler = u_attribute[0][0];
        float offset = u_attribute[0][1];
        float filtrationmin = clipMatrix[3][2];
        float filtrationmax = clipMatrix[3][3]; 
        vec2 st = materialInput.st;
        vec2 st2 = materialInput.st;
        st2.x = fract(8.0 * st.x);
        vec4 color1 = texture2D(image, st2);
        vec4 color = texture3D(baseTexture, vec3(st.x,v_batchId/50.,st.y));
        float value = czm_unpackVolume(color,scaler,offset);
        for(float i=0.1;i<=1.0;i+=0.1)
        {
            color = texture3D(baseTexture, vec3(st.x,v_batchId/50.,i));
            value = max(value,czm_unpackVolume(color,scaler,offset));
        }
        color = v_transfer(value,0.0,false,color);
        if(value > filtrationmax || value < threshold)
        {
            color.a = 0.0;
        }
        material.diffuse = color1.rgb;
        material.alpha = color.a > 0.0 ? min(color1.r,min(color1.b,color1.g)) : 0.0;
        return material;
        } 
    `;
  const options = {
    geometryInstances,
    appearance: new Cesium.MaterialAppearance({
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
      vertexShaderSource,
    }),
    asynchronous: true,
    fragmentShaderSource,
    url,
    uniforms,
  };

  layer.rainPrimitive = WE.viewer.scene.primitives.add(
    new WeatherEarth.GifPrimitive(options)
  );
};

RadarRainSimulator.handleThunder = function (name, layer) {
  const { thunderMap, thunders } = layer;
  const thd = thunderMap.get(name);
  for (let i = 0; i < thunders.length; i++) {
    if (Cesium.defined(thunders[i])) {
      thunders[i].show = Cesium.defined(thd);
    }
  }
  if (Cesium.defined(thd)) {
    let primitive = thunders[thd.id];
    if (!Cesium.defined(primitive)) {
      primitive = thunders[thd.id] = RadarRainSimulator.newThunder(
        thd.longitude,
        thd.latitude
      );
    } else {
      const positions1 = Cesium.Cartesian3.fromDegreesArrayHeights([
        thd.longitude,
        thd.latitude,
        0,
        thd.longitude,
        thd.latitude,
        30000,
      ]);
      primitive.updateGeometry({
        positions: positions1,
      });
    }
  }
};

RadarRainSimulator.newThunder = function (longitude, latitude) {
  const url = RadarRainSimulator.thunderUrl;
  const height = 30000;
  const { WE } = window;
  return WE.viewer.scene.primitives.add(
    RadarRainSimulator.createThunderPrimitive({
      url, longitude, latitude, height 
    })
  );
};

RadarRainSimulator.createThunderPrimitive = function (options) {
  const {
    url, longitude, latitude, height 
  } = options;
  const { WE } = window;
  const positions = Cesium.Cartesian3.fromDegreesArrayHeights([
    longitude,
    latitude,
    0,
    longitude,
    latitude,
    height,
  ]);

  const fs = `
  czm_material czm_getMaterial(czm_materialInput materialInput) {
      czm_material material = czm_getDefaultMaterial(materialInput);
      vec2 st = materialInput.st;
      vec4 color = texture2D(image, vec2(st.y,st.x));
      color = czm_gammaCorrect(color);
      material.diffuse = color.rgb;
      material.alpha = min(color.r,min(color.b,color.g));
      return material;
  } 
  `;

  return new WeatherEarth.GifPolyline({
    url,
    positions,
    width: 100.0,
    appearance: new Cesium.PolylineMaterialAppearance({}),
    fragmentShaderSource: fs
  });
};

export default RadarRainSimulator;
