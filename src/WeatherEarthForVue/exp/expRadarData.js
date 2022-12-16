
import { parseNameFunc3, parseNameFunc4, parseNameFunc4Multiply8 } from './expTimeParse';

function expRadarData() {

}

const taiFengValueAndColorRampDBZ = {
  ValueRamp: [0.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 55.0, 60.0, 65.0, 70.0],
  ColorRamp: [
    [0.0, 0.0, 0.0, 0.0],
    [1.0, 144.0, 0.0, 0.0],
    [255.0, 255.0, 0.0, 64.0],
    [231.0, 192.0, 0.0, 0.0],
    [255.0, 144.0, 0.0, 128.0],
    [255.0, 0.0, 0.0, 255.0],
    [214.0, 0.0, 0.0, 255.0],
    [192.0, 0.0, 0.0, 255.0],
    [255.0, 0.0, 240.0, 255.0],
    [150.0, 0.0, 180.0, 255.0],
    [173.0, 144.0, 240.0, 255.0],
  ],
};

const guizhouValueAndColorRampDBZ = {
  ValueRamp: [
    0.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 55.0, 60.0, 65.0, 70.0],
  ColorRamp: [
    [0.0, 0.0, 0.0, 0.0],
    [1.0, 160.0, 240.0, 0.0],
    [0.0, 236.0, 236.0, 128.0],
    [0.0, 216.0, 0.0, 64.0],
    [1.0, 144.0, 0.0, 128.0],
    [255.0, 255.0, 0.0, 128.0],
    [231.0, 192.0, 0.0, 255.0],
    [255.0, 144.0, 0.0, 255.0],
    [255.0, 0.0, 0.0, 255.0],
    [214.0, 0.0, 0.0, 255.0],
    [192.0, 0.0, 0.0, 255.0],
    [255.0, 0.0, 240.0, 255.0],
    [150.0, 0.0, 180.0, 255.0],
    [173.0, 144.0, 240.0, 255.0],
  ],
};

function simulateGuiZhouRain() {
  const thunderMap = new Cesium.AssociativeArray();
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309064800.bin', {
    id: 0,
    longitude: 105.06316789168868,
    latitude: 24.563248580214715,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309065400.bin', {
    id: 0,
    longitude: 105.08119594619123,
    latitude: 24.581865950048634,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309070000.bin', {
    id: 0,
    longitude: 105.1130834118801,
    latitude: 24.58178814150861,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309070600.bin', {
    id: 0,
    longitude: 105.15201084847642,
    latitude: 24.5854622713972,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309071200.bin', {
    id: 0,
    longitude: 105.19059642217799,
    latitude: 24.604328635584483,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309071800.bin', {
    id: 0,
    longitude: 105.25649749620494,
    latitude: 24.60231353055191,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309072400.bin', {
    id: 0,
    longitude: 105.28476217352738,
    latitude: 24.609908601706017,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309073600.bin', {
    id: 0,
    longitude: 105.34398093835708,
    latitude: 24.61559539854327,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309075400.bin', {
    id: 0,
    longitude: 105.44960041722246,
    latitude: 24.61746336337688,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309080000.bin', {
    id: 0,
    longitude: 105.42256560772852,
    latitude: 24.546161817026025,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309084800.bin', {
    id: 0,
    longitude: 105.77253497517944,
    latitude: 24.52465046225511,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309084800.bin', {
    id: 0,
    longitude: 105.77253497517944,
    latitude: 24.52465046225511,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309085400.bin', {
    id: 0,
    longitude: 105.81617522332283,
    latitude: 24.513952992116174,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309090000.bin', {
    id: 0,
    longitude: 105.85870144212939,
    latitude: 24.524839876189183,
  });
  thunderMap.set('Z_OTHE_RADAMOSAIC_20210309091800.bin', {
    id: 0,
    longitude: 105.99664505565309,
    latitude: 24.51112098957622,
  });
  const rainUrl = `${WeatherEarth.Config.AssetUrl}/rain.gif`;
  const thunderUrl = `${WeatherEarth.Config.AssetUrl}/thunder.gif`;
  return {
    rainUrl,
    thunderUrl,
    thunderMap
  };
}

function simulateWHRain() {
  const rainUrl = `${WeatherEarth.Config.AssetUrl}/rain.gif`;
  return {
    rainUrl,
    threshold: 30
  };
}

expRadarData.animeData = {
  黑格比组网: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/heigebi.json`,
    urlParseFunction: parseNameFunc3,
    varname: 'DBZ',
    ext: 'bz2',
    offsetZ: 0,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: taiFengValueAndColorRampDBZ,
    showEco: false,
    showInner: false
  },
  黑格比单站: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/wenzhou.json`,
    urlParseFunction: parseNameFunc4,
    varname: 'EF6A0A74',
    ext: 'bz2',
    nearestSample: true,
    offsetZ: 0,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: taiFengValueAndColorRampDBZ,
    showEco: true,
    showInner: false
  },
  武汉站200321: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/Wh200321.json`,
    urlParseFunction: parseNameFunc4,
    varname: 'EF6A0A74',
    ext: 'bz2',
    nearestSample: true,
    offsetZ: 25000,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: guizhouValueAndColorRampDBZ,
    showEco: false,
    showInner: false,
    analystRain: simulateWHRain
  },
  模拟回波降水: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/guizhou.json`,
    urlParseFunction: parseNameFunc3,
    varname: 'DBZ',
    ext: 'bz2',
    nearestSample: true,
    offsetZ: 25000.0,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: guizhouValueAndColorRampDBZ,
    showEco: false,
    showInner: false,
    analystRain: simulateGuiZhouRain
  },
  柳林20210812: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/liulin/柳林2021081112.json`,
    urlParseFunction: parseNameFunc4Multiply8,
    varname: 'EF6A0A74',
    ext: 'bz2',
    nearestSample: true,
    offsetZ: 25000,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: guizhouValueAndColorRampDBZ,
    showEco: true,
    showInner: false,
    buildChildVolume: true,
    analystRain: simulateWHRain
  },
  柳林20210812_B: {
    url: `${import.meta.VITE_APP_ASSETS_APP_ASSETS}/liulin/柳林2021081112.json`,
    urlParseFunction: parseNameFunc4Multiply8,
    varname: 'EF6A0A74',
    ext: 'bz2',
    nearestSample: true,
    offsetZ: 25000,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    ValueAndColorRampChild: guizhouValueAndColorRampDBZ,
    showEco: true,
    showInner: false,
    buildChildVolume: false
  },
};

expRadarData.otherData = {
  SWAN:
    {
      name: 'Z_OTHE_RADAMOSAIC_20200718153000.bin',
      varname: 'DBZ',
      ext: 'bz2',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
      showInner: false,
    },
  Z9572_20220322033532:
    {
      name: 'Z_RADR_I_Z9572_20220322033532_O_DOR_SAD_CAP_FMT.bin',
      varname: 'EF6A0A74',
      ext: 'bz2',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
      showInner: false,
    },
  Z9571_20220322033424:
    {
      name: 'Z_RADR_I_Z9571_20220322033424_O_DOR_SAD_CAP_FMT.bin',
      varname: 'EF6A0A74',
      ext: 'bz2',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
      showInner: false,
    },
  Z9270_20200321113000_O_DOR_SA_CAP:
    {
      name: 'Z_RADR_I_Z9270_20200321113000_O_DOR_SA_CAP.bin',
      varname: 'EF6A0A74',
      ext: 'bz2',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
      showInner: false,
    },
  西南风场:
    {
      name: 'eastward_wind_00',
      varname: '2639B195',
      ext: 'npy',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV,
      showInner: true,
      scaleZ: 8,
    },
  温度场:
    {
      name: 'ANA-2019070516_201907051550_201907051547',
      varname: 'z_t',
      ext: 'nc',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZT,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZT,
      showInner: true,
      scaleZ: 8,
    },
  湿度场:
    {
      name: 'ANA-2019070516_201907051550_201907051547',
      varname: 'z_q',
      ext: 'nc',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_ZQ,
      showInner: true,
      scaleZ: 8,
    },
  NC风场:
    {
      name: 'ANA-2019070516_201907051550_201907051547',
      varname: 'FBB611F9',
      ext: 'nc',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV,
      showInner: true,
      scaleZ: 8,
    },
  '20220428_054757_bjanc_mergedDbz':
    {
      name: '20220428_054757_bjanc_mergedDbz',
      varname: 'DBZ',
      ext: 'nc',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
    },
  EZHOU_CAPPI_20210930170109:
    {
      name: 'EZHOU_CAPPI_20210930170109',
      varname: 'DBZ',
      ext: 'nc',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
    },
  'BJXCP.20210908.084800.AR2':
    {
      name: 'BJXCP.20210908.084800.AR2',
      varname: 'CD25FDE6',
      ext: 'bz2',
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      ValueAndColorRampChild: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
      nearestSample: true,
    },
};

export default expRadarData;
