// @ts-ignore
import * as WeatherEarth from 'hxlc-weatherearth'

interface NCObjItem {
  name: string,
  varname: string,
  TransFunction: any,
  ValueAndColorRamp: any,
  ext?: string
}
interface NCObj {
  temperature: NCObjItem,
  humidity: NCObjItem,
  dbz: NCObjItem,
  sa: NCObjItem,
  swan: NCObjItem,
  eastward_wind: NCObjItem,
  geopotential_height: NCObjItem,
  specific_humidity: NCObjItem,
  air_temperature: NCObjItem,
  lagrangian_tendency_of_air_pressure: NCObjItem
}

const ncObj: NCObj = {
  // 温度
  temperature: {
    name: 'ANA-2019070516_201907051550_201907051547',
    varname: 'z_t',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZT
  },
  // 湿度
  humidity: {
    name: 'ANA-2019070516_201907051550_201907051547',
    varname: 'z_q',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ
  },
  // 反射率
  dbz: {
    name: '20200720_151158_bjanc_mergedDbz',
    varname: 'DBZ',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ
  },
  // 单站
  sa: {
    name: 'Z_RADR_I_Z9716_20200627084800_O_DOR_SA_CAP.bin',
    varname: 'SA',
    ext: 'bz2',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ
  },
  // swan
  swan: {
    name: 'Z_OTHE_RADAMOSAIC_20200718234800.bin',
    varname: 'DBZ',
    ext: 'bz2',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ
  },
  // @ts-ignore
  eastward_wind: {
    varname: '4F02610A',
    ext: 'npy',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_WindTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV
  },
  // @ts-ignore
  geopotential_height: {
    varname: '4F02610A',
    ext: 'npy',
    // eslint-disable-next-line no-multi-str
    TransFunction: 'vec4 v_transfer(float v,float z,bool usePhongLight,vec4 color)\n\
    {\n\
    float offset = u_attribute[0][1];\n\
    float range = u_attribute[0][2] - u_attribute[0][1];\n\
    v -= offset;\n\
    vec4 fragColor = vec4(0.0,0.0,0.0,0.0); \n\
    if(v < 0.0) return fragColor;\n\
    fragColor = vec4(v/range,1.0 - v/range,v/range,v/range); \n\
    return fragColor; \n\
    }\n\
    ',
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ
  },
  // @ts-ignore
  specific_humidity: {
    varname: '4F02610A',
    ext: 'npy',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ
  },
  // @ts-ignore
  air_temperature: {
    varname: '4F02610A',
    ext: 'npy',
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZT
  },
  // @ts-ignore
  lagrangian_tendency_of_air_pressure: {
    varname: '4F02610A',
    ext: 'npy',
    // eslint-disable-next-line no-multi-str
    TransFunction: 'vec4 v_transfer(float v,float z,bool usePhongLight,vec4 color)\n\
    {\n\
      float offset = u_attribute[0][1];\n\
      float range = u_attribute[0][2] - u_attribute[0][1];\n\
      v -= offset;\n\
      vec4 fragColor = vec4(0.0,0.0,0.0,0.0); \n\
      if(v < 0.0) return fragColor;\n\
      fragColor = vec4(0.0,1.0 - v/range,v/range,v/range); \n\
      return fragColor; \n\
    }\n\
    ',
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ
  }
}
const remoteUrl = `${import.meta.env.VITE_APP_TJURL}/OCserver/p/OC?method=nc&f=html&param={0}%3B{1}%3B{2}`

export function getWeatherVolumeOptions(type: any) {
  // @ts-ignore
  return Object.assign(ncObj[type], { url: remoteUrl })
}

export { remoteUrl }
