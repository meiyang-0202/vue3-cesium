
function apiPick() {

}

apiPick.pickKML = function (entity) {
  console.info(entity.id.kml.extendedData);
};

apiPick.pickBillboard = function (entity) {
  console.info(entity.primitive.id);
};

apiPick.pick = function (value) {
  const { WE } = window;
  if (!value) {
    WE.handlerManager.stop();
    return;
  }
  WE.handlerManager.startPick({
    handleType: 'CommonPick',
    color: Cesium.Color.RED,
    infomation: false
  });
  WE.handlerManager.currentHander.onMovePickFeature = undefined;
  WE.handlerManager.currentHander.onPickFeature = function (entity, propertyName, screenPosition, oldValue) {
    if (Cesium.defined(entity)) {
      if (entity.id instanceof Cesium.Entity) {
        if (Cesium.defined(entity.id.kml) && Cesium.defined(entity.id.kml.extendedData)) {
          apiPick.pickKML(entity);
        }
      } else if (entity.primitive instanceof Cesium.Label || entity.primitive instanceof Cesium.Billboard) {
        apiPick.pickBillboard(entity);
      }
    }
  };
};

export default apiPick;
