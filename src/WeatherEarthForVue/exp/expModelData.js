function expModelData() {

}
const preUrl = import.meta.env.VITE_APP_ASSETS;

function getDayNightShader() {
  const {
    texture0, texture1, texture2
  } = this;

  const gradientTexture0 = new Cesium.TextureUniform({
    url: texture0,
  });
  const gradientTexture1 = new Cesium.TextureUniform({
    url: texture1,
  });
  const gradientTexture2 = new Cesium.TextureUniform({
    url: texture2,
  });

  const shader = new Cesium.CustomShader({
    uniforms: {
      image0: {
        type: Cesium.UniformType.SAMPLER_2D,
        value: gradientTexture0
      },
      image1: {
        type: Cesium.UniformType.SAMPLER_2D,
        value: gradientTexture1
      },
      image2: {
        type: Cesium.UniformType.SAMPLER_2D,
        value: gradientTexture2
      },
      dayTime: {
        type: Cesium.UniformType.FLOAT,
        value: 1.0
      }
    },
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
      {
        float t = mod(dayTime, 86400.0) / 86400.0 * 3.1415926;
        float mixFactor = sin(t);
        vec3 window_color = vec3(1.0);
        vec3 lamp_color = vec3(1.0);
        vec3 other_color = vec3(1.0);
        float window_strength = clamp(1.0 - mixFactor,0.2,0.5);
        float lamp_strength = 0.0;
        float other_strength = 0.0;
        vec2 st = fsInput.attributes.texCoord_0;
        st.y = 1.0 - st.y;
        vec4 color = texture2D(image0, st);
        vec4 night = texture2D(image1, st);
        vec4 light = texture2D(image2, st);
        vec3 frag_color = mix(color.rgb, night.rgb, mixFactor);
        frag_color = mix(frag_color, window_color, light.r * window_strength);
        frag_color = mix(frag_color, lamp_color, light.g * lamp_strength); 
        frag_color = mix(frag_color, other_color, light.b * other_strength); 
        material.diffuse = frag_color.rgb;
        material.alpha = 1.0;
      }
      `
  });

  return shader;
}

expModelData.modelData = {
  方块: {
    url: `${preUrl}/model/cube.gltf`
  },
  eucadian_warhawk: {
    url: `${preUrl}/model/eucadian_warhawk/scene.gltf`
  },
  earthshaker_dota2: {
    url: `${preUrl}/model/earthshaker_dota2/scene.gltf`
  },
  helicopter: {
    url: `${preUrl}/model/helicopter/scene.gltf`
  },
  Aatrox: {
    url: `${preUrl}/model/Aatrox/scene.gltf`
  },
  building06: {
    url: 'http://127.0.0.1:8083/Assets/model/building06/scene.gltf',
    location: [114.3780, 30.5167, 50],
    scale: 10,
  },
  雷达: {
    url: 'http://127.0.0.1:8083/Assets/model/radar.glb',
    location: [114.3780, 30.5167, 50],
    scale: 10,
  },
  园区: {
    url: `${preUrl}/model/city.glb`,
    texture0: `${preUrl}/model/bakedDay.jpg`,
    texture1: `${preUrl}/model/bakedNight.jpg`,
    texture2: `${preUrl}/model/lightMap.jpg`,
    modelShader: getDayNightShader
  }
};

export default expModelData;
