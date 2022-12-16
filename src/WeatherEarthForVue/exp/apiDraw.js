function apiDraw() {

}

apiDraw.drwaObj = [];

apiDraw.clear = function () {
  const { WE } = window;
  apiDraw.drwaObj.forEach((element) => {
    WE.viewer.scene.primitives.remove(element);
  });
  apiDraw.drwaObj = [];
  WE.geometryManager.removeAll();
};

apiDraw.drawTextCanvas = function () {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  ctx.font = '80px 楷体';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  const str = '24小时警戒线';
  const offsetX = 40;
  let offsetY = 80;
  for (let i = 0; i < str.length; i++) {
    ctx.fillText(str[i], offsetX, offsetY);
    offsetY += 80;
  }
  return canvas;
};

apiDraw.drawText = function (rectangle) {
  const { WE } = window;
  const image = apiDraw.drawTextCanvas();

  const geometry = new Cesium.RectangleGeometry({
    rectangle,
  });
  const geometryInstances = [];
  geometryInstances.push(
    new Cesium.GeometryInstance({
      geometry,
    })
  );
  const options = {
    geometryInstances,
    appearance: new Cesium.MaterialAppearance({
      renderState: {
        depthTest: { enabled: true },
        depthMask: true,
        blending: Cesium.BlendingState.ALPHA_BLEND,
        cull: {
          enabled: false,
          face: Cesium.CullFace.FRONT,
        },
      },
      translucent: false,
    }),
    asynchronous: true,
  };


  const primitive = new Cesium.GroundPrimitive(options);
  primitive.appearance.material = new Cesium.Material({
    fabric: {
      type: 'Image',
      uniforms: {
        image,
      },
    },
  });

  WE.viewer.scene.primitives.add(primitive);
  apiDraw.drwaObj.push(primitive);
};

  
apiDraw.draw = function (value) {
  const { WE } = window;
  const type = value === '文字' ? 'rectangle' : value;
  const isConstant = value !== '文字';
  const promise = WE.handlerManager.startDraw({
    type,
    isConstant,
  });

  promise.then((drawObject) => {
    WE.handlerManager.stop();
    if (value === '文字') {
      const rectangle = drawObject.geometry;
      apiDraw.drawText(rectangle);
    }
  });
};

export default apiDraw;
