
function exp3dtilesSnowShader(options) {
  if (!Cesium.defined(options)) {
    options = {};
  }
  this._snowFactor = Cesium.defaultValue(options.snowFactor, 0.65);
}

exp3dtilesSnowShader.prototype.getCustomShader = function () {
  return new Cesium.CustomShader({
    uniforms: {
      u_snowFactor: {
        type: Cesium.UniformType.FLOAT,
        value: this._snowFactor,
      },
    },
    lightingModel: Cesium.LightingModel.UNLIT,
    fragmentShaderText: `
            void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
            {
                vec3 normalEC = fsInput.attributes.normalEC;
                vec3 normalMC = czm_inverseNormal * normalEC;
                vec3 color = material.diffuse;
                vec3 white = vec3(1.0,1.0,1.0);
                float m = dot(normalMC, vec3(0.0,0.0,1.0));
                m = pow(m, 2.0);
                material.diffuse = mix(color, white, clamp(m, 0.0, 1.0) * u_snowFactor);
            }
            `,
  });
};

exp3dtilesSnowShader.prototype.decorate = function () {

};

export default exp3dtilesSnowShader;
