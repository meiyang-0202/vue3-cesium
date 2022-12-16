/* eslint-disable space-before-function-paren */

function apiRenderTest() {

}

apiRenderTest.Test = function (value) {
  const viewport = new Cesium.BoundingRectangle(400, 200, 480, 440);
  const { WE } = window;
  const scene = WE.viewer.scene;
  const context = WE.viewer.scene.context;
  const framebuffer = new Cesium.Framebuffer({
    context,
    colorTextures: [
      new Cesium.Texture({
        context,
        width: context.canvas.width,
        height: context.canvas.height
      })
    ],
    depthStencilRenderbuffer: new Cesium.Renderbuffer({
      context,
      width: context.canvas.width,
      height: context.canvas.height,
      format: Cesium.RenderbufferFormat.DEPTH_STENCIL
    })
  });
  const modelMatrix = Cesium.Matrix4.multiplyByTranslation(Cesium.Transforms.eastNorthUpToFixedFrame(
    Cesium.Cartesian3.fromDegrees(-95.59777, 40.03883)
  ), new Cesium.Cartesian3(0.0, 0.0, 500000.0), new Cesium.Matrix4());
  
  const ellipsoidInstance = new Cesium.GeometryInstance({
    geometry: new Cesium.EllipsoidGeometry({
      radii: new Cesium.Cartesian3(500000.0, 500000.0, 1000000.0),
      vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
    }),
    id: 'ellipsoid',
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.AQUA)
    }
  });
  const rectangleInstance = new Cesium.GeometryInstance({
    geometry: new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(-140.0, 30.0, -100.0, 40.0),
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT
    }),
    id: 'rectangle',
    attributes: {
      color: new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 1.0)
    }
  });

  const testPrimitive = new Cesium.Primitive({
    geometryInstances: [ellipsoidInstance],
    appearance: new Cesium.PerInstanceColorAppearance({
      translucent: true
    }),
    asynchronous: false,
    modelMatrix,
  });

  const testPrimitive2 = new Cesium.Primitive({
    geometryInstances: [rectangleInstance],
    appearance: new Cesium.PerInstanceColorAppearance({
      translucent: true
    }),
    asynchronous: false,
  });

  testPrimitive.readyPromise.then(() => {
    testPrimitive._colorCommands[0]._framebuffer = framebuffer;
    testPrimitive._colorCommands[0].pass = Cesium.Pass.OPAQUE;
  });

  testPrimitive2.readyPromise.then(() => {
    testPrimitive2._colorCommands[0]._framebuffer = framebuffer;
    testPrimitive2._colorCommands[0].pass = Cesium.Pass.OPAQUE;
  });

  scene.primitives.add(testPrimitive);
  scene.primitives.add(testPrimitive2);

  const rs = Cesium.RenderState.fromCache({
    blending111: {
      enabled: true,
      equationRgb: Cesium.BlendEquation.MIN,
      equationAlpha: Cesium.BlendEquation.MIN,
      functionSourceRgb: Cesium.BlendFunction.ONE,
      functionSourceAlpha: Cesium.BlendFunction.ONE,
      functionDestinationRgb: Cesium.BlendFunction.ZERO,
      functionDestinationAlpha: Cesium.BlendFunction.ZERO
    },
    viewport,
  });
  const fs = `
        uniform sampler2D texture1;
        varying vec2 v_textureCoordinates;
        void main()
        {
            gl_FragColor = texture2D(texture1, v_textureCoordinates);
        }`;
  const viewportQuadCommand = context.createViewportQuadCommand(fs, {
    uniformMap: {
      texture1() {
        return framebuffer._colorTextures[0];
      }
    },
    renderState: rs,
    pass: Cesium.Pass.OPAQUE
  });
  
  const customPrimitive = new Cesium.Primitive();
  const clearCommand = new Cesium.ClearCommand({
    pass: Cesium.Pass.OPAQUE,
    framebuffer,
    color: new Cesium.Color(0.0, 0.0, 0.0, 0.0),
  });

  customPrimitive.update = function (frameState) {
    testPrimitive.modelMatrix = modelMatrix;
    frameState.commandList.push(viewportQuadCommand);
    frameState.commandList.push(clearCommand);
  };

  scene.primitives.add(customPrimitive);
};
  
export default apiRenderTest;
