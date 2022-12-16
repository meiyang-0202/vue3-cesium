import Exp3dtilesSnowShader from './exp3dtilesSnowShader';
import Exp3dtilesBuildingShader from './exp3dtilesBuildingShader';
import Exp3dtilesFlood from './exp3dtilesFlood';
import Exp3dtilesDecorator from './Exp3dtilesDecorator';

function exp3dtilesData() {

}

exp3dtilesData.data = {
  武汉市: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/wuhan/tileset.json`,
    exp3dtilesShader: new Exp3dtilesBuildingShader(),
    showOutline: true,
    shadows: Cesium.ShadowMode.DISABLED,
    maximumScreenSpaceError: 6,
    view: {
      longitude: 1.994559, latitude: 0.533376, height: 1150.567, heading: 0.01, pitch: -0.34, roll: 0.00
    }
  },
  武汉市_白: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/wuhan/tileset.json`,
    maximumScreenSpaceError: 6,
    showOutline: true,
  },
  大雁塔: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/dayanta/tileset.json`,
    exp3dtilesShader: new Exp3dtilesSnowShader({ snowFactor: 0.9 }),
    shadows: Cesium.ShadowMode.ENABLE
  },
  长沙: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/changsha/tileset.json`,
    exp3dtilesShader: new Exp3dtilesSnowShader(),
    shadows: Cesium.ShadowMode.ENABLE,
    debugShowBoundingVolume: false,
    maximumScreenSpaceError: 64,
  },
  长沙_淹没: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/changsha/tileset.json`,
    shadows: Cesium.ShadowMode.ENABLE,
    debugShowBoundingVolume: false,
    maximumScreenSpaceError: 64,
    decorator: new Exp3dtilesFlood(),
    view: {
      longitude: 1.979885, latitude: 0.483498, height: 94.773, heading: 0.79, pitch: -0.55, roll: 0.00
    }
  },
  贵州: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/guizhou/tileset.json`
  },
  深圳市: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/sz/tileset.json`
  },
  贵阳市: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/guiyang/tileset.json`
  },
  绍兴: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/shaoxing/tileset.json`
  },
  三维管线: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/shaoxing/tileset.json`
  },
  BIM房子: {
    url: `${import.meta.env.VITE_APP_ASSETS}/3dtiles/bim/Ghasem Ariyani-Revit 2014.json`
  },
  隧道: {
    url: `${import.meta.env.VITE_APP_ASSETS}/dizhi/suidao/tileset.json`,
    decorator: new Exp3dtilesDecorator()
  }
};

export default exp3dtilesData;
