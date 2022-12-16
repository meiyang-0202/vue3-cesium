function apiRenderTest2() {

}

let scene;
let camera;

function addPrimitive(lon, lat, height, heading) {
  const center = Cesium.Cartesian3.fromRadians(lon, lat, height);

  const pointLightCamera = new Cesium.Camera(scene);
  pointLightCamera.position = center;

  camera.lookAt(center, new Cesium.Cartesian3(25.0, 25.0, 30.0));
  camera.lookAtTransform(Cesium.Matrix4.IDENTITY);

  const shadowMap = new Cesium.ShadowMap({
    context: scene.context,
    lightCamera: pointLightCamera,
    isPointLight: true,
    softShadows: false,
  });

  shadowMap.enabled = true;
  // shadowMap.debugCascadeColors = true;

  const model = scene.primitives.add(
    Cesium.Model.fromGltf({
      url: `${import.meta.env.VITE_APP_ASSETS}/SampleData/models/ShadowTester/Shadow_Tester_Point.glb`,
      modelMatrix: Cesium.Transforms.headingPitchRollToFixedFrame(
        center,
        new Cesium.HeadingPitchRoll(heading, 0.0, 0.0)
      ),
    })
  );

  model.readyPromise
    .then(() => {
      // Play and loop all animations at half-speed
      model.activeAnimations.addAll({
        multiplier: 0.5,
        loop: Cesium.ModelAnimationLoop.REPEAT,
      });
    })
    .catch(() => {

    });

  return shadowMap;
}

apiRenderTest2.Test = function () {
  const { WE } = window;
  scene = WE.viewer.scene;
  camera = scene.camera;

  const longitude = -1.3324415110874286;
  const latitude = 0.6954224325279967;
  const height = 200.0;

  const shadowMap1 = addPrimitive(
    longitude + 0.00005,
    latitude,
    height,
    0.0
  );
  const shadowMap2 = addPrimitive(
    longitude - 0.00005,
    latitude,
    height,
    Math.PI
  );

  shadowMap1.debugShow = true;
  shadowMap2.debugShow = false;
  shadowMap1.debugCascadeColors = true;
  shadowMap1.debugFreezeFrame = true;

  //   setInterval(() => {
  //     shadowMap1.debugShow = !shadowMap1.debugShow;
  //     shadowMap2.debugShow = !shadowMap2.debugShow;
  //   }, 3000);


  scene.shadowMap = shadowMap1;

  // TODO : workaround until Cesium supports multiple light sources
  const CustomPrimitive = function (shadowMap) {
    this.shadowMap = shadowMap;
  };

  CustomPrimitive.prototype.update = function (frameState) {
    frameState.shadowMaps.push(this.shadowMap);
  };

  scene.primitives.add(new CustomPrimitive(shadowMap2));
  scene.debugShowFramesPerSecond = true;
};

export default apiRenderTest2;
