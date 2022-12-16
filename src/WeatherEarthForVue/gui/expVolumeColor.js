import TransfunctionFomater from '../WeatherEarthExtension/TransfunctionFomater';
import expImageryData from '../exp/expImageryData';

function expVolumeColor() {

}

expVolumeColor.update = function (ValueAndColorRamp) {
  const { WE } = window;
  const collection = WE.layerManager.getVolumeLayerCollection();
  collection.forEach((layer) => {
    if (Cesium.defined(layer.childWeatherVolume)) {
      layer.childWeatherVolume.updateStyle(ValueAndColorRamp);
    }
  });
};

expVolumeColor.bind = function (gui) {
  const folder = gui.addFolder('图例');
  const Transfunctions = WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ;
  // const Transfunctions = expImageryData.TFWindyTemprature;
  const formater = new TransfunctionFomater({ Transfunctions });
  const { colors, alhpas } = formater;
  Object.keys(colors).forEach((key) => {
    folder.addColor(colors, key).name(key).onChange((color) => {
      formater.colorRamp = { value: key, color };
    });
    // folder.add(alhpas, key, 0, 255).onChange((alpha) => {
    //   formater.colorAlpha = { value: key, alpha };
    // });
  });
  
  formater.onChange = (sender, value, color) => {
    expVolumeColor.update(sender.ValueAndColorRamp);
  };
  
  return folder;
};


export default expVolumeColor;
