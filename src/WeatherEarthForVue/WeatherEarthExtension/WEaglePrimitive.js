
function WEaglePrimitive(options) {
  this._material = options.material;
  this._renderState = Cesium.defaultValue(options.renderState, Cesium.RenderState.fromCache({
    blending: Cesium.BlendingState.ALPHA_BLEND,
    depthTest: {
      enabled: false,
    },
  }));
  this._pass = Cesium.Pass.OPAQUE;
}


WEaglePrimitive.prototype.update = function (frameState) {
  if (!frameState.passes.render) {
    return;
  }

  if (!Cesium.defined(this._command)) {
    const fs = new Cesium.ShaderSource({
      sources: [this._material.shaderSource, Cesium._shadersViewportQuadFS],
    });
    this._command = frameState.context.createViewportQuadCommand(fs, {
      pass: this._pass,
      renderState: this._renderState,
    });
  }
  if (Cesium.defined(this._material)) {
    this._material.update(frameState.context);
    this._command.uniformMap = this._material._uniforms;
  }
  frameState.commandList.push(this._command);
};

WEaglePrimitive.prototype.isDestroyed = function () {
  return false;
};
  
WEaglePrimitive.prototype.destroy = function () {
  if (Cesium.defined(this._command)) {
    this._command.shaderProgram = this._command.shaderProgram
          && this._command.shaderProgram.destroy();
  }
};
  

  
export default WEaglePrimitive;
