import LightPoint from '../WeatherEarthExtension/LightPoint';

function exp3dtilesBuildingShader() {
  this._lightPoint1 = undefined;
  this._lightPoint2 = undefined;
  this._lightPoint3 = undefined;
  this._customShader = undefined;
  
  this._step = 0.1;
  this._lightHeight = 0.1;
  this._lightLongitude = 114.2799;
  this._lightLatitude = 30.5902;
}

exp3dtilesBuildingShader.prototype.updateLightPos = function () {
  const customShader = this._customShader;
  const { WE } = window;
  const { _lightPoint1, _lightPoint2, _lightPoint3 } = this;
  if (!Cesium.defined(_lightPoint1)) {
    return;
  }

  this._lightHeight += this._step;
  const maxHeight = 200.0;
  if (this._lightHeight > maxHeight || this._lightHeight < 0.0) {
    this._step = -this._step;
  }
  let longitude = this._lightLongitude + Math.cos(this._lightHeight / maxHeight * Cesium.Math.TWO_PI) * 0.008;
  let latitude = this._lightLatitude + Math.sin(this._lightHeight / maxHeight * Cesium.Math.TWO_PI) * 0.008;
  const height = 100.0 + this._lightHeight;
  _lightPoint1.setPosition({ longitude, latitude, height });
  customShader.setUniform('u_lightColor1', _lightPoint1.color);
  customShader.setUniform('u_lightPos1', _lightPoint1.position);

  if (Cesium.defined(_lightPoint2)) {
    longitude = this._lightLongitude + Math.sin(this._lightHeight / maxHeight * Cesium.Math.TWO_PI) * 0.008;
    latitude = this._lightLatitude + Math.cos(this._lightHeight / maxHeight * Cesium.Math.TWO_PI) * 0.008;
    _lightPoint2.setPosition({ longitude, latitude, height });
    customShader.setUniform('u_lightColor2', _lightPoint2.color);
    customShader.setUniform('u_lightPos2', _lightPoint2.position);
  }

  if (Cesium.defined(_lightPoint3)) {
    longitude = this._lightLongitude + Math.sin(this._lightHeight / maxHeight * Cesium.Math.TWO_PI + Cesium.Math.PI_OVER_TWO) * 0.008;
    latitude = this._lightLatitude + Math.cos(this._lightHeight / maxHeight * Cesium.Math.TWO_PI) * 0.008;
    _lightPoint3.setPosition({ longitude, latitude, height });
    customShader.setUniform('u_lightColor3', _lightPoint3.color);
    customShader.setUniform('u_lightPos3', _lightPoint3.position);
  }

  customShader.setUniform('u_cameraDirectionWC', WE.viewer.scene.camera.positionWC);
};

exp3dtilesBuildingShader.prototype.getCustomShader = function () {
  if (Cesium.defined(this._customShader)) {
    return this._customShader;
  }
  const color1 = new Cesium.Color(1.0, 0.0, 0.0, 1.0);
  const color2 = new Cesium.Color(0.0, 1.0, 0.0, 1.0);
  const color3 = new Cesium.Color(1.0, 1.0, 0.0, 1.0);
  const lightPoint1 = this._lightPoint1 = new LightPoint({ color: color1 });
  const lightPoint2 = this._lightPoint2 = new LightPoint({ color: color2 });
  const lightPoint3 = this._lightPoint3 = new LightPoint({ color: color3 });
  const { WE } = window;
  this._customShader = new Cesium.CustomShader({
    lightingModel: Cesium.LightingModel.UNLIT,
    uniforms: {
      u_cameraDirectionWC: {
        type: Cesium.UniformType.VEC3,
        value: WE.viewer.scene.camera.positionWC,
      },
      u_lightColor1: {
        type: Cesium.UniformType.VEC4,
        value: lightPoint1.color,
      },
      u_lightPos1: {
        type: Cesium.UniformType.VEC3,
        value: lightPoint1.postion,
      },
      u_lightColor2: {
        type: Cesium.UniformType.VEC4,
        value: lightPoint2.color,
      },
      u_lightPos2: {
        type: Cesium.UniformType.VEC3,
        value: lightPoint2.postion,
      },
      u_lightColor3: {
        type: Cesium.UniformType.VEC4,
        value: lightPoint3.color,
      },
      u_lightPos3: {
        type: Cesium.UniformType.VEC3,
        value: lightPoint3.postion,
      },
    },
    fragmentShaderText: `
          vec4 makeLight(vec4 lightColorHdr,vec3 lightPos,
            vec3 positionWC,vec3 positionEC,vec3 normalEC,czm_pbrParameters pbrParameters)
          {
            vec3 color = vec3(0.0);
            float mx1 = 1.0;
            vec3 light1Dir = positionWC - lightPos;
            float distance1 = length(light1Dir);
            if(distance1 < 1000.0){
              vec4 l1 = czm_view * vec4(lightPos, 1.0);
              vec3 lightDirectionEC = l1.xyz - positionEC;
              mx1 = 1.0 - distance1 / 1000.0;
              color = czm_pbrLighting(
                positionEC,
                normalEC,
                lightDirectionEC,
                lightColorHdr.xyz,
                pbrParameters
              ).xyz;
            }
            mx1 = max(color.r,max(color.g,color.b)) * pow(mx1,1.0) * 10.0;
            return vec4(color,mx1);
          }
          void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material)
          {
            material.diffuse = vec3(1.0);
            vec2 uv = fsInput.attributes.texCoord_0;
            vec3 positionWC = fsInput.attributes.positionWC;
            vec3 positionMC = fsInput.attributes.positionMC.xyz;
            vec3 normalEC = fsInput.attributes.normalEC;
            vec3 normalMC = czm_inverseNormal * normalEC;
            vec3 positionEC = fsInput.attributes.positionEC;
  
            vec3 lightColorHdr = czm_lightColorHdr;
            vec3 lightDirectionEC = czm_lightDirectionEC;
            lightDirectionEC = (czm_view * vec4(u_cameraDirectionWC,1.0)).xyz - positionEC;
  
            czm_pbrParameters pbrParameters;
            pbrParameters.diffuseColor = material.diffuse;
            pbrParameters.roughness = 0.0;
            pbrParameters.diffuseColor = vec3(0.0,0.0,1.0);
  
            vec3 ligth1Color0 = czm_pbrLighting(
              positionEC,
              normalEC,
              lightDirectionEC,
              lightColorHdr,
              pbrParameters
            );
            vec3 finalColor = ligth1Color0.rgb;
  
            //point light
            pbrParameters.diffuseColor = vec3(1.0);
            vec4 ligth1ColorR = makeLight(u_lightColor1,u_lightPos1,positionWC,positionEC,normalEC,pbrParameters);
            vec4 ligth1ColorG = makeLight(u_lightColor2,u_lightPos2,positionWC,positionEC,normalEC,pbrParameters);
            vec4 ligth1ColorB = makeLight(u_lightColor3,u_lightPos3,positionWC,positionEC,normalEC,pbrParameters);
            finalColor = mix(finalColor, ligth1ColorR.rgb, ligth1ColorR.a);
            finalColor = mix(finalColor, ligth1ColorG.rgb, ligth1ColorG.a);
            finalColor = mix(finalColor, ligth1ColorB.rgb, ligth1ColorB.a);
  
            //glow light
            float b = 0.1;
            float maxBuildingHeight = 120.0 / b; //should get from meta
            uv.y = positionMC.z / maxBuildingHeight;
            float iTime = fract(czm_frameNumber / 220.0) * 6.2831;
            float d = uv.y + sin(iTime) * b;
            float h = 1.0;
            float f = 1.0;
            float intensity = 2.8;
            float thickness = 0.002 * b;
            float c = pow(thickness * h / abs(d), intensity);
            finalColor.rgb += vec3(1.0, 1.5, 2.1) * c * pow(1.0 - normalMC.z,2.0);
  
            //
            material.diffuse = finalColor;
          }
          `,
  });
  return this._customShader;
};

exp3dtilesBuildingShader.prototype.update = function (frameState) {
  this.updateLightPos();
  if (Cesium.defined(this._lightPoint1)) {
    this._lightPoint1.update(frameState);
  }
  if (Cesium.defined(this._lightPoint2)) {
    this._lightPoint2.update(frameState);
  }
  if (Cesium.defined(this._lightPoint3)) {
    this._lightPoint3.update(frameState);
  }
};

exp3dtilesBuildingShader.prototype.isDestroyed = function () {
  return false;
};

exp3dtilesBuildingShader.prototype.destroy = function () {
  this._customShader = undefined;
  this._lightPoint1 = this._lightPoint1 && this._lightPoint1.destroy();
  this._lightPoint2 = this._lightPoint2 && this._lightPoint2.destroy();
  this._lightPoint3 = this._lightPoint3 && this._lightPoint3.destroy();
};

exp3dtilesBuildingShader.prototype.decorate = function (tileset) {
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
};


export default exp3dtilesBuildingShader;
