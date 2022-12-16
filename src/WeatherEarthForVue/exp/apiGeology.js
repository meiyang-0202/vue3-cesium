
import api3dtiles from './api3dtiles';

function apiGeology() {

}

apiGeology.data = ['雄安', 'Evs', 'Vtk'];
apiGeology.dataVTK = [
  'tmpGrid_Time_0',
  'tmpGrid_Time_1',
  'tmpGrid_Time_2',
  'tmpGrid_Time_3',
  'tmpGrid_Time_4',
  'tmpGrid_Time_5',
  'tmpGrid_Time_6',
  'tmpGrid_Time_7',
  'tmpGrid_Time_8',
  'tmpGrid_Time_9',
  'tmpGrid_Time_9',
];

apiGeology.layerName = '三维地质图层';

apiGeology.load = function (value) {
  const { WE } = window;
  const { layerName } = apiGeology;
  WE.layerManager.remove(layerName);
  if (value === 'Vtk') {
    apiGeology.vtk();
  } else if (value === 'Evs') {
    apiGeology.evs();
  }
};

apiGeology.legendImage = undefined;

function CreateTransferTextureFunctionForStk(v) {
  const { WE } = window;
  const source = apiGeology.legendImage;
  if (Cesium.defined(source)) {
    return new Cesium.Texture({
      context: WE.viewer.scene.context,
      source,
    });
  }
}

const vtkValueAndColorRamp = {
  ValueRamp: [],
  ColorRamp: [],
};

// eslint-disable-next-line no-multi-str
const vtkTransfunction2 = 'vec4 v_transfer(float v,float z,bool usePhongLight,vec4 color)\n\
  {\n\
    float smin = statisticMatrix[0][0];\n\
    float smax = statisticMatrix[0][1];\n\
    float saver = statisticMatrix[0][2];\n\
    float filtrationmin = clipMatrix[3][2];\n\
    float filtrationmax = clipMatrix[3][3];\n\
    float svariance = statisticMatrix[0][3];\n\
    float offset = u_attribute[0][1];\n\
    float range = u_attribute[0][2] - u_attribute[0][1];\n\
    v -= offset;\n\
    float index = v/range;\n\
    vec4 fragColor = vec4(0.0,0.0,0.0,0.0); \n\
    vec4 floatColor = texture2D(tfTexture, vec2(index, 0.0)); \n\
    vec4 floatColor0 = texture2D(tfTexture, vec2(index, 1.0)); \n\
    float clampA = floatColor0.x * 255.0; \n\
    float clampB = floatColor0.y * 255.0; \n\
    floatColor.a = index * floatColor.a * (z > 0.0 ? (0.6 - z * 0.4) : 1.0); \n\
    if(index > filtrationmax * 0.01 || index < filtrationmin * 0.01)\n\
    {\n\
      floatColor.a = 0.0;\n\
    }\n\
    fragColor = floatColor; \n\
    return fragColor; \n\
  }\n\
';
  
// eslint-disable-next-line no-multi-str
const vtkTransfunction = 'vec4 v_transfer(float v,float z,bool usePhongLight,vec4 color)\n\
  {\n\
    float smin = statisticMatrix[0][0];\n\
    float smax = statisticMatrix[0][1];\n\
    float saver = statisticMatrix[0][2];\n\
    float svariance = statisticMatrix[0][3];\n\
    float svariance0 = saver + 0.0 * svariance;\n\
    float svariance1 = saver + 10.0 * svariance;\n\
    float range = svariance1 - svariance0;\n\
    float at = v / range;\n\
    vec4 floatColor = texture2D(tfTexture, vec2(at, 0.0)); \n\
    floatColor.a = at;\n\
    return floatColor;\n\
    return vec4(v/range,v/range,v/range,clamp(v/range,0.001,1.0));\n\
    if(v > saver  - 1.0 * svariance && v < saver + 0.0 * svariance) return vec4(1.0,1.0,0.0,1.0);\n\
    if(v > saver  + 0.0 * svariance && v < saver + 1.0 * svariance) return vec4(1.0,0.0,0.0,1.0);\n\
    if(v > saver  + 1.0 * svariance && v < saver + 2.0 * svariance) return vec4(0.0,1.0,0.0,1.0);\n\
    if(v > saver  + 2.0 * svariance && v < saver + 3.0 * svariance) return vec4(1.0,0.0,1.0,1.0);\n\
    if(v > saver  + 3.0 * svariance && v < saver + 4.0 * svariance) return vec4(0.5,0.0,0.0,1.0);\n\
    if(v > saver  + 4.0 * svariance && v < saver + 5.0 * svariance) return vec4(0.0,0.5,1.0,1.0);\n\
    return vec4(0.0,0.0,0.0,0.0);\n\
  }\n\
  ';
  
apiGeology.loadVTK = function (value) {
  const { WE } = window;
  const { layerName } = apiGeology;
  WE.layerManager.remove(layerName);

  if (value === '') {
    return;
  }

  if (!Cesium.defined(apiGeology.legendImage)) {
    const url = './data/RB_Lengend.png';
    const promise = Cesium.Resource.fetchImage(url);
    promise.then((data) => {
      apiGeology.legendImage = data;
    });
  }
  WeatherEarth.Config.CreateTransferTextureFunction = CreateTransferTextureFunctionForStk;
  const name = value;
  WE.layerManager.remove(layerName);
  const position = new Cesium.Cartesian3(122, 28, 0);
  const volumeOptions = {
    name,
    varname: 'vtk',
    ext: 'vtk',
    TransFunction: vtkTransfunction,
    ValueAndColorRamp: vtkValueAndColorRamp,
    filterCustom: true,
    // position,
  };
  const layer = WE.layerManager.addVolumeLayer(volumeOptions, layerName);
  layer.show = false;
  layer.showInner = true;
};

apiGeology.evs = function (value) {
  // api3dtiles.load3dtiles();
};



export default apiGeology;
