/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
import { DefaultStore } from '@/store/index'
const defaultStore = DefaultStore()
function apiWidget() {}

apiWidget.showPointToolTip = function (value, jsonUrl) {
  const { WE } = window;
  if (value) {
    const url = Cesium.defaultValue(jsonUrl, './data/PointToolTip.json');
    Cesium.Resource.fetchJson(url).then((data) => {
      defaultStore.pointToolTips = data;
    });
  } else {
    const data = defaultStore.pointToolTips;
    Object.keys(data).forEach((id) => {
      WE.WeExt.tooltipManager.remove(id);
    });
    defaultStore.pointToolTips = {};
  }
};

apiWidget.showPopuToolTip = function (value, jsonUrl) {
  const { WE } = window;
  if (value) {
    const url = Cesium.defaultValue(jsonUrl, './data/PopupToolTip.json');
    Cesium.Resource.fetchJson(url).then((data) => {
      defaultStore.popupToolTips = data;
    });
  } else {
    const data = defaultStore.popupToolTips;
    Object.keys(data).forEach((id) => {
      WE.WeExt.tooltipManager.remove(id);
    });
    defaultStore.popupToolTips = {};
  }
};

apiWidget.showTiltToolTip = function (value, jsonUrl) {
  const { WE } = window;
  if (value) {
    const url = Cesium.defaultValue(jsonUrl, './data/TiltToolTip.json');
    const promise = Cesium.Resource.fetchJson(url);
    promise.then((data) => {
      defaultStore.tiltToolTips = data;
    });
    return promise;
  }
  const data = defaultStore.tiltToolTips;
  Object.keys(data).forEach((id) => {
    WE.WeExt.tooltipManager.remove(id);
  });
  defaultStore.tiltToolTips = {};
  return new Promise();
};

apiWidget.clampToGround = function (value) {
  WE.WeExt.toolTipManager.clampToGround = value;
};

function createH1() {
  const news = '\n温度:30°';

  // 1 internal
  const targetDiv = document.createElement('div');
  targetDiv.className = 'common-popup';

  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'popup-content-wrapper';
  const contentNode = document.createElement('div');
  contentNode.className = 'popup-content';

  contentNode.innerHTML = news;
  contentWrapper.appendChild(contentNode);

  const tipContainer = document.createElement('div');
  tipContainer.className = 'popup-tip-wrapper';
  const tip = document.createElement('div');
  tip.className = 'popup-tip';
  tipContainer.appendChild(tip);

  const close = document.createElement('a');
  close.className = 'popup-close-button';
  close.href = '#close';
  close.innerText = '×';
  close.addEventListener('click', () => {
    const { WE } = window;
    WE.earthPinCollection.removeById('style1');
  });
  targetDiv.appendChild(contentWrapper);
  targetDiv.appendChild(tipContainer);
  targetDiv.appendChild(close);

  return targetDiv;
}

apiWidget.data = {
  CreateElement: {
    func: createH1,
  },
};

apiWidget.addPoint = function (position) {
  const pointCollection = new Cesium.PointPrimitiveCollection();
  pointCollection.add({
    position,
    outlineWidth: 2,
  });
  apiWidget.pointCollection = WE.viewer.scene.primitives.add(pointCollection);
};

apiWidget.addTooltip = function (value) {
  apiWidget.removeTooltip();
  const { WE } = window;
  if (value === '') {
    return;
  }

  if (value === 'style1') {
    WE.earthPinCollection.add({
      id: value,
      position: Cesium.Cartesian3.fromDegrees(110, 30, 0),
      target: createH1(),
    });
  } else if (value === 'style2') {
    const options = {
      callback() {
        WE.earthPinCollection.removeById(value);
      },
    };
    const pin = new WeatherEarth.EarthPin({
      id: value,
      graphy: new WeatherEarth.Popup(options),
      content: '多行信息<br/>第二行信息<br/>',
      position: Cesium.Cartesian3.fromDegrees(120, 30, 0),
    });
    WE.earthPinCollection.add(pin);
  } else if (value === 'style3') {
    const positions = [
      Cesium.Cartesian3.fromDegrees(120, 30, 0),
      Cesium.Cartesian3.fromDegrees(120, 22, 0),
      Cesium.Cartesian3.fromDegrees(118, 25, 0),
      Cesium.Cartesian3.fromDegrees(122, 25, 0),
    ];
    const pointCollection = new Cesium.PointPrimitiveCollection();
    for (let i = 0; i < positions.length; i++) {
      pointCollection.add({
        position: positions[i],
        outlineWidth: 2,
      });

      // eslint-disable-next-line no-nested-ternary
      const align = i === 0 ? 'top' : i === 1 ? 'bottom' : i === 2 ? 'left' : 'right';
      const pin = new WeatherEarth.EarthPin({
        id: 'style' + (i + 3),
        graphy: new WeatherEarth.Tooltip({ align }),
        content:
          '多行信息<br/>第二行信息<br/>第3行信息<br/>第3行信息<br/>第3行信息<br/>第3行信息',
        position: positions[i],
      });
      WE.earthPinCollection.add(pin);
    }
    apiWidget.pointCollection = WE.viewer.scene.primitives.add(pointCollection);
  }
};

export default apiWidget;
