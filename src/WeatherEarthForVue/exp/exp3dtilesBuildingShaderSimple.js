
function exp3dtilesBuildingShaderSimple() {

}

exp3dtilesBuildingShaderSimple.prototype.getCustomShader = function () {
  const lightPos = Cesium.Cartesian3.fromDegrees(114.2799, 30.5902);
  return new Cesium.CustomShader({
    lightingModel: Cesium.LightingModel.UNLIT,
    uniforms: {
      u_lightPos: {
        type: Cesium.UniformType.VEC3,
        value: lightPos,
      },
    },
    fragmentShaderText: `
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
          {
            vec3 normalEC = fsInput.attributes.normalEC;
            vec4 mixColor = vec4(0.0,1.0,0.0,0.0);
            vec4 color = vec4(material.diffuse, material.alpha);
            color = mix(mixColor,color,0.5);
            vec3 v_stcVertex = fsInput.attributes.positionMC.xyz;
  
            float _baseHeight = 0.0;
            float _heightRange = 60.0;
            float _glowRange = 300.0;
  
            
            // 建筑基础色
            float vtxf_height = v_stcVertex.z - _baseHeight;
            float vtxf_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
            float vtxf_a12 = vtxf_height / _heightRange + sin(vtxf_a11) * 0.1;
            color *= vec4(vtxf_a12, vtxf_a12, vtxf_a12, 1.0);
            // 动态光环
            float vtxf_a13 = fract(czm_frameNumber / 360.0);
            float vtxf_h = clamp(vtxf_height / _glowRange, 0.0, 1.0);
            vtxf_a13 = abs(vtxf_a13 - 0.5) * 2.0;
            float vtxf_diff = step(0.005, abs(vtxf_h - vtxf_a13));
            color.rgb += color.rgb * (1.0 - vtxf_diff);
            material.diffuse = vec3(1.0);
  
            vec3 lightColorHdr = vec3(1.0);
            vec3 lightDirectionEC = czm_lightDirectionEC;
  
            czm_pbrParameters pbrParameters;
            pbrParameters.diffuseColor = material.diffuse;
            pbrParameters.f0 = material.specular;
            pbrParameters.roughness = material.roughness;
  
            vec3 wc = fsInput.attributes.positionWC;
            vec3 light1Dir = wc - u_lightPos;
            float distance = length(light1Dir);
            light1Dir = normalize(light1Dir);
            if(distance < 1000.0){
              lightColorHdr = vec3(1.0,0.0,0.0);
              lightDirectionEC = (czm_modelView * vec4(light1Dir,0.0)).xyz;
            }
  
            vec3 ligth1Color = czm_pbrLighting(
              fsInput.attributes.positionEC,
              normalEC,
              lightDirectionEC,
              lightColorHdr,
              pbrParameters
            );
            material.diffuse = mix(vec3(1.0), ligth1ColorPhong, 1.0);
          }
          `,
  });
};

exp3dtilesBuildingShaderSimple.prototype.decorate = function (tileset) {

};


export default exp3dtilesBuildingShaderSimple;
