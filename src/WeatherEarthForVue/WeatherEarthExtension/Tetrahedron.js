import apiMaterial from '../exp/apiMaterial';

function Tetrahedron(options) {
  const position = options.position;
  this._modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
  const cylinder = new Cesium.CylinderGeometry({
    length: 160,
    topRadius: 100,
    bottomRadius: 0,
    slices: 3,
  });
  const geometry = Cesium.CylinderGeometry.createGeometry(cylinder);
  const geometryInstances = [];
  geometryInstances.push(new Cesium.GeometryInstance({
    geometry
  }));

  const appearance = new Cesium.MaterialAppearance({
    renderState: {
      depthTest: { enabled: true },
      depthMask: true,
      cull: {
        enabled: true,
        face: Cesium.CullFace.BACK,
      },
    },
    flat: false,
    faceForward: true,
    closed: true,
    translucent: false,
    material: Cesium.Material.fromType('Color')
  });

  appearance.material.uniforms.color = new Cesium.Color(1.0, 1.0, 0.0, 1.0);
  const fragmentSource = apiMaterial.getFragmentSource('shaderHexagonal');
  appearance.material = new Cesium.Material({
    fabric: {
      source: fragmentSource,
    },
  });

  this._primitive = new Cesium.Primitive({
    geometryInstances,
    asynchronous: false,
    appearance,
  });

  this._AnimationHeight = 100.0;
  this._cartesian3Scratch = new Cesium.Cartesian3();
  this._matrix3Scratch = new Cesium.Matrix3();
  this._matrix4Scratch = new Cesium.Matrix4();
}


Tetrahedron.prototype.isDestroy = function () {
  return false;
};
  
Tetrahedron.prototype.destroy = function () {
  this._primitive = this._primitive && this._primitive.destroy();
};
  
Tetrahedron.prototype.computeAnimation = function (frameState) {
  Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(frameState.frameNumber * 2.0), this._matrix3Scratch);
  this._cartesian3Scratch.z = Math.sin(frameState.frameNumber / 30.0) * this._AnimationHeight;
  Cesium.Matrix4.fromRotationTranslation(this._matrix3Scratch, this._cartesian3Scratch, this._matrix4Scratch);
  Cesium.Matrix4.multiply(this._modelMatrix, this._matrix4Scratch, this._matrix4Scratch);
};

Tetrahedron.prototype.update = function (frameState) {
  if (Cesium.defined(this._primitive)) {
    this.computeAnimation(frameState);
    this._primitive.modelMatrix = this._matrix4Scratch;
    this._primitive.update(frameState);
  }
};

export default Tetrahedron;
