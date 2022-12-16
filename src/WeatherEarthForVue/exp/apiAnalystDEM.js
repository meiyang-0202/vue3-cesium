
function apiAnalystDEM() {

}



const elevationRamp = [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0];
const slopeRamp = [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0];
const aspectRamp = [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0];
function getColorRamp(selectedShading) {
  const ramp = document.createElement('canvas');
  ramp.width = 100;
  ramp.height = 1;
  const ctx = ramp.getContext('2d');

  const grd = ctx.createLinearGradient(0, 0, 100, 0);
  let values;
  if (selectedShading === '高程') {
    values = elevationRamp;
    grd.addColorStop(values[0], '#00000011'); // black
    grd.addColorStop(values[1], '#2747E022'); // blue
    grd.addColorStop(values[2], '#D33B7D33'); // pink
    grd.addColorStop(values[3], '#D3303844'); // red
    grd.addColorStop(values[4], '#FF974255'); // orange
    grd.addColorStop(values[5], '#ffd70066'); // yellow
    grd.addColorStop(values[6], '#ffffff'); // white
  } else if (selectedShading === '坡度') {
    values = slopeRamp;
    grd.addColorStop(values[0], '#00000055'); // black
    grd.addColorStop(values[1], '#2747E055'); // blue
    grd.addColorStop(values[2], '#D33B7DFF'); // pink
    grd.addColorStop(values[3], '#D33038FF'); // red
    grd.addColorStop(values[4], '#FF9742FF'); // orange
    grd.addColorStop(values[5], '#ffd700FF'); // yellow
    grd.addColorStop(values[6], '#FFFFFF'); // white
  } else if (selectedShading === '坡向') {
    values = aspectRamp;
    grd.addColorStop(values[0], '#00000055'); // black
    grd.addColorStop(values[1], '#2747E055'); // blue
    grd.addColorStop(values[2], '#D33B7DFF'); // pink
    grd.addColorStop(values[3], '#D33038FF'); // red
    grd.addColorStop(values[4], '#FF9742FF'); // orange
    grd.addColorStop(values[5], '#ffd700FF'); // yellow
    grd.addColorStop(values[6], '#FFFFFF'); // white
  }



  //   grd.addColorStop(values[0], '#000000'); // black
  //   grd.addColorStop(values[1], '#2747E0'); // blue
  //   grd.addColorStop(values[2], '#D33B7D'); // pink
  //   grd.addColorStop(values[3], '#D33038'); // red
  //   grd.addColorStop(values[4], '#FF9742'); // orange
  //   grd.addColorStop(values[5], '#ffd700'); // yellow
  //   grd.addColorStop(values[6], '#ffff00'); // white

  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, ramp.width, ramp.height);

  return ramp;
}

apiAnalystDEM.minHeight = 200;
apiAnalystDEM.maxHeight = 1200;
function getElevationContourMaterial() {
  const { minHeight, maxHeight } = apiAnalystDEM;

  const material = new Cesium.Material({
    fabric: {
      type: 'ElevationColorContour',
      materials: {
        contourMaterial: {
          type: 'ElevationContour',
        },
        elevationRampMaterial: {
          type: 'ElevationRamp',
        },
      },
      components: {
        diffuse:
                'contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse',
        alpha:
                'max(contourMaterial.alpha, elevationRampMaterial.alpha)',
      },
    },
    translucent: false,
  });

  const shadingUniforms = material.materials.elevationRampMaterial.uniforms;
  shadingUniforms.minimumHeight = minHeight;
  shadingUniforms.maximumHeight = maxHeight;

  return material;
}

function getSlopeContourMaterial() {
  // Creates a composite material with both slope shading and contour lines
  return new Cesium.Material({
    fabric: {
      type: 'SlopeColorContour',
      materials: {
        contourMaterial: {
          type: 'ElevationContour',
        },
        slopeRampMaterial: {
          type: 'SlopeRamp',
        },
      },
      components: {
        diffuse:
            'contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse',
        alpha: 'max(contourMaterial.alpha, slopeRampMaterial.alpha)',
      },
    },
    translucent: false,
  });
}

function getAspectContourMaterial() {
  // Creates a composite material with both aspect shading and contour lines
  return new Cesium.Material({
    fabric: {
      type: 'AspectColorContour',
      materials: {
        contourMaterial: {
          type: 'ElevationContour',
        },
        aspectRampMaterial: {
          type: 'AspectRamp',
        },
      },
      components: {
        diffuse:
            'contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse',
        alpha: 'max(contourMaterial.alpha, aspectRampMaterial.alpha)',
      },
    },
    translucent: false,
  });
}

function getElevationMaterial() {
  const { minHeight, maxHeight } = apiAnalystDEM;
  
  const material = new Cesium.Material({
    fabric: {
      type: 'ElevationRamp',
      components: {
        alpha:
                'max(contourMaterial.alpha, elevationRampMaterial.alpha)',
      },
    },
    translucent: false,
  });
  const shadingUniforms = material.uniforms;
  shadingUniforms.minimumHeight = minHeight;
  shadingUniforms.maximumHeight = maxHeight;
  
  return material;
}

apiAnalystDEM.hasContourLine = false;
apiAnalystDEM.getDemMaterial = function (value) {
  const { hasContourLine } = apiAnalystDEM;
  let material;
  let shadingUniforms;
  let contourUniforms;
  if (value === '高程') {
    if (hasContourLine) {
      material = getElevationContourMaterial();
      shadingUniforms = material.materials.elevationRampMaterial.uniforms;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else {
      material = getElevationMaterial();
      shadingUniforms = material.uniforms;
    }
  } else if (value === '坡度') {
    if (hasContourLine) {
      material = getSlopeContourMaterial();
      shadingUniforms = material.materials.slopeRampMaterial.uniforms;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else {
      material = Cesium.Material.fromType('SlopeRamp');
      shadingUniforms = material.uniforms;
    }
  } else if (value === '坡向') {
    if (hasContourLine) {
      material = getAspectContourMaterial();
      shadingUniforms = material.materials.aspectRampMaterial.uniforms;
      contourUniforms = material.materials.contourMaterial.uniforms;
    } else {
      material = Cesium.Material.fromType('AspectRamp');
      shadingUniforms = material.uniforms;
    }
  } else if (hasContourLine) {
    material = Cesium.Material.fromType('ElevationContour');
    contourUniforms = material.uniforms;
  }
  
  if (contourUniforms) {
    contourUniforms.width = 2;
    contourUniforms.spacing = 50;
    contourUniforms.color = Cesium.Color.RED;
  }

  if (shadingUniforms) {
    shadingUniforms.image = getColorRamp(value);
  }
  return material;
};

  
export default apiAnalystDEM;
