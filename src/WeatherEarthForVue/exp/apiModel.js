import expModelData from './expModelData';

function apiModel() {}

apiModel.modelPrimitive = undefined;

apiModel.clear = function () {
  const { WE } = window;
  if (Cesium.defined(apiModel.modelPrimitive)) {
    WE.viewer.scene.primitives.remove(apiModel.modelPrimitive);
    apiModel.modelPrimitive = undefined;

    if (WE.viewer.clock.multiplier === 12000) {
      WE.viewer.clock.multiplier = 1;
      WE.WeExt.zoomToToday();
    }
  }
};

// use customShader
apiModel.loadDynamicModel = function (value) {
  apiModel.clear();
  if (value === '') {
    return;
  }
  const item = expModelData.modelData[value];
  const { url, location } = item;

  const { WE } = window;
  const position = Cesium.Cartesian3.fromDegrees(116.39123, 39.90691, 0.0);


  const customShader = item.modelShader();
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  const model = WE.viewer.scene.primitives.add(
    Cesium.ModelExperimental.fromGltf({
      gltf: url,
      modelMatrix,
      customShader
    })
  );
  model.readyPromise.then(() => {
    WE.viewer.camera.flyToBoundingSphere(model.boundingSphere, {
      duration: 0.5
    });
    WE.viewer.clock.multiplier = 12000;
    model.update2 = model.update;
    model.update = function (frameState) {
      customShader.setUniform('dayTime', frameState.time.secondsOfDay);
      model.update2(frameState);
    };
  });
  apiModel.modelPrimitive = model;
};


apiModel.loadModel = function (value) {
  apiModel.clear();
  if (value === '') {
    return;
  }

  const item = expModelData.modelData[value];
  const { url, modelShader, location } = item;

  if (Cesium.defined(modelShader)) {
    apiModel.loadDynamicModel(value);
    return;
  }

  const { WE } = window;
  let position = Cesium.Cartesian3.fromDegrees(116.39123, 39.90691, 0.0);
  if (Cesium.defined(location)) {
    position = Cesium.Cartesian3.fromDegrees(location[0], location[1], location[2]);
  }
  const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  const model = WE.viewer.scene.primitives.add(
    Cesium.Model.fromGltf({
      url,
      modelMatrix,
      scale: Cesium.defaultValue(item.scale, 2),
      allowPicking: false, // not pickable
      debugShowBoundingVolume: false, // default
      debugWireframe: false,
      asynchronous: false,
      showOutline: true
    })
  );
  model.readyPromise.then(() => {
    // Play all animations when the model is ready to render
    let bs = new Cesium.BoundingSphere();
    bs = Cesium.BoundingSphere.transform(model.boundingSphere, modelMatrix, bs);
    WE.viewer.camera.viewBoundingSphere(bs, new Cesium.HeadingPitchRange(0.1, -0.3, 300.2));
    WE.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
    model.activeAnimations.addAll({
      loop: Cesium.ModelAnimationLoop.REPEAT // Loop the animation
    });
  });

  apiModel.modelPrimitive = model;
};

export default apiModel;
