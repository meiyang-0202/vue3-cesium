// eslint-disable-next-line import/no-cycle
import apiGeometry from './apiGeometry';
import * as expShader from './expShader';
  
function apiMaterial() {

}

apiMaterial.getImageAppearance = function (image) {
  const appearance = new Cesium.MaterialAppearance({
    renderState: {
      depthTest: { enabled: true },
      depthMask: true,
      blending: Cesium.BlendingState.ALPHA_BLEND,
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK,
      },
    },
    translucent: true,
  });

  const source = `
  czm_material czm_getMaterial(czm_materialInput materialInput) {
    czm_material material = czm_getDefaultMaterial(materialInput);
    vec2 uv = materialInput.st;
    vec4 color = texture2D(image,uv);
    material.diffuse = color.rgb;
    material.alpha = color.a;
    return material;
  }`;

  appearance.material = new Cesium.Material({
    fabric: {
      uniforms: {
        image,
      },
      source,
    },
  });
  return appearance;
};

apiMaterial.getWaterAppearance = function (options) {
  const { specularMap } = options;
  const appearance = new Cesium.MaterialAppearance({
    renderState: {
      depthTest: { enabled: true },
      depthMask: true,
      blending: Cesium.BlendingState.ALPHA_BLEND,
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK,
      },
    },
    translucent: true
  });
  const baseWaterColor = Cesium.defaultValue(options.baseWaterColor, Cesium.Color.fromCssColorString('#006ab4aa'));
  const blendColor = Cesium.defaultValue(options.blendColor, Cesium.Color.fromCssColorString('#006ab4aa'));
  const uniforms = {
    normalMap: Cesium.buildModuleUrl(
      'Assets/Textures/waterNormals.jpg'
    ),
    baseWaterColor,
    blendColor,
    specularIntensity: Cesium.defaultValue(options.specularIntensity, 0.2),
    frequency: Cesium.defaultValue(options.frequency, 10000.0),
    animationSpeed: Cesium.defaultValue(options.animationSpeed, 0.02),
    amplitude: Cesium.defaultValue(options.amplitude, 5.0),
    fadeFactor: Cesium.defaultValue(options.fadeFactor, 20.001)
  };
  if (Cesium.defined(specularMap)) {
    uniforms.specularMap = specularMap;
  }
  appearance.material = new Cesium.Material({
    fabric: {
      type: 'Water',
      uniforms,
    },
  });
  return appearance;
};


apiMaterial.getWaterAppearance2 = function (options) {
  const { specularMap } = options;
  const normalMap = Cesium.buildModuleUrl('Assets/Textures/waterNormals.jpg');
  const appearance = new Cesium.MaterialAppearance({
    renderState: {
      depthTest: { enabled: true },
      depthMask: true,
      blending: Cesium.BlendingState.ALPHA_BLEND,
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK,
      },
    },
    translucent: true
  });

  const WaterMaterial = `uniform sampler2D specularMap;
uniform sampler2D normalMap;
uniform vec4 baseWaterColor;
uniform vec4 blendColor;
uniform float frequency;
uniform float animationSpeed;
uniform float amplitude;
uniform float specularIntensity;
uniform float fadeFactor;
czm_material czm_getMaterial(czm_materialInput materialInput)
{
czm_material material = czm_getDefaultMaterial(materialInput);
float time = czm_frameNumber * animationSpeed;
float fade = max(1.0, (length(materialInput.positionToEyeEC) / 10000000000.0) * frequency * fadeFactor);
float specularMapValue = texture2D(specularMap, materialInput.st).r;
specularMapValue *= 2.0;
specularMapValue = pow(specularMapValue,2.0);
specularMapValue = clamp(specularMapValue,0.0,1.0);
vec4 noise = czm_getWaterNoise(normalMap, materialInput.st * frequency, time, 0.0);
vec3 normalTangentSpace = noise.xyz * vec3(1.0, 1.0, (1.0 / amplitude));
normalTangentSpace.xy /= fade;
normalTangentSpace = mix(vec3(0.0, 0.0, 50.0), normalTangentSpace, specularMapValue);
normalTangentSpace = normalize(normalTangentSpace);
float tsPerturbationRatio = clamp(dot(normalTangentSpace, vec3(0.0, 0.0, 1.0)), 0.0, 1.0);
material.alpha = mix(blendColor.a, baseWaterColor.a, specularMapValue) * specularMapValue;
material.diffuse = mix(blendColor.rgb, baseWaterColor.rgb, specularMapValue);
material.diffuse += (0.1 * tsPerturbationRatio);
material.diffuse = material.diffuse;
material.normal = normalize(materialInput.tangentToEyeMatrix * normalTangentSpace);
material.specular = specularIntensity;
material.shininess = 10.0;
return material;
}
`;

  appearance.material = new Cesium.Material({
    fabric: {
      uniforms: {
        baseWaterColor: new Cesium.Color(0.2, 0.3, 0.6, 0.7),
        blendColor: new Cesium.Color(0.0, 1.0, 0.699, 1.0),
        specularMap: Cesium.defaultValue(specularMap, Cesium.Material.DefaultImageId),
        normalMap,
        frequency: 10000.0,
        animationSpeed: 0.02,
        amplitude: 5.0,
        specularIntensity: 0.2,
        fadeFactor: 0.01,
      },
      source: WaterMaterial,
    },
    translucent(material) {
      const uniforms = material.uniforms;
      return (
        uniforms.baseWaterColor.alpha < 1.0 || uniforms.blendColor.alpha < 1.0
      );
    },
  });
  return appearance;
};

apiMaterial.getMaterial = function (data) {
  const { fragmentSource } = data;
  return new Cesium.Material({
    fabric: {
      source: fragmentSource,
    },
  });
};

apiMaterial.getAppearance = function (data) {
  const { fragmentSource } = data;
  const appearance = new Cesium.MaterialAppearance({
    renderState: {
      depthTest: { enabled: true },
      depthMask: true,
      blending: Cesium.BlendingState.ALPHA_BLEND,
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK,
      },
    },
    translucent: true,
    material: new Cesium.Material({
      fabric: {
        source: fragmentSource,
      },
    })
  });
  return appearance;
};

apiMaterial.getFragmentSource = function (value) {
  return expShader[value];
};
  
apiMaterial.changeMaterial = function (value) {
  if (value === '') {
    return;
  }
  const fragmentSource = expShader[value];
  apiGeometry.primitives.forEach((primitive) => {
    const appearance = apiMaterial.getAppearance({ fragmentSource });
    primitive.appearance = appearance;
  });
};

export default apiMaterial;
