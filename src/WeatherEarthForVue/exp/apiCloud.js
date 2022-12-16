
import expCloudData from './expCloudData';

function apiCloud() {

}


apiCloud.layerName = '风云卫星';

apiCloud.loadCloud = function (value) {
  const { WE } = window;
  const { layerName } = apiCloud;
  WE.layerManager.remove(layerName);

  if (value !== '') {
    if (value === '其他') { 
      const nc = {
        name: 'FY2G_SEC_VIS_LCN_20200804_0700',
        varname: '2639B195',
        ext: 'AWX',
      };
      const layer = WE.layerManager.addCloudLayer(nc, layerName);
      layer.clearFactor = 0.5;
      layer.forceWhiteColor = true;
    } else {
      const fyObject = expCloudData.data[value];
      const url = WeatherEarth.Config.AssetUrl + '/gfkd/fy/' + fyObject.name + '.json';
      Cesium.Resource.fetchJson(url)
        .then((json) => {
          if (!Cesium.defined(json) || !Cesium.defined(json.length) || json.length < 0) {
            return;
          }
          const nc = {
            name: json[0],
            varname: '2639B195',
            ext: 'AWX',
            legendUrl: fyObject.legendUrl
          };
          const layer = WE.layerManager.addCloudLayer(nc, layerName);
          layer.clearFactor = Cesium.defaultValue(fyObject.clearFactor, 1.0);
          layer._imageryProvider.readyPromise.then(() => {
            const timeSampleArray = new WeatherEarth.TimeSampleArray(json, fyObject.parseFunction);
            layer.timeSampleArray = timeSampleArray;
            WE.timeSystem.setRange(timeSampleArray.start, timeSampleArray.end);
          });
        });
    }
  }
};

export default apiCloud;
