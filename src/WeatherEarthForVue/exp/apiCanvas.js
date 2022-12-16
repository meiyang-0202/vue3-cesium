function apiCanvas() {

}

async function getImage(url) {
  return new Promise((resolve, reject) => {
    Cesium.Resource.fetchImage(url).then((image) => {
      resolve(image);
    }).catch(() => {
      resolve(null);
    });
  });
}

apiCanvas.image2blue = async function () {
  const url = require('@/assets/images/google_m.png');
  const image = await getImage(url);
  if (image !== null) {
    const c = document.createElement('canvas');
    c.width = image.width;
    c.height = image.height;
    const ctx1 = c.getContext('2d');
    ctx1.drawImage(image, 0, 0);
    const imgData = (ctx1.getImageData(0, 0, image.width, image.height));
    const count = image.width * image.height;
    for (let i = 0; i < count; i++) {
      let r = imgData.data[i * 4 + 0] / 255.0;
      let g = imgData.data[i * 4 + 1] / 255.0;
      let b = imgData.data[i * 4 + 2] / 255.0;
      const bw = (Math.min(r, Math.min(g, b)) + Math.max(r, Math.max(g, b))) * 0.5;
      r = bw;
      g = bw;
      b = bw;
      r = Cesium.Math.clamp(0.21 - r, 0.0, 1.0);
      g = 1.0 - g;
      b = 1.2 - b;

      imgData.data[i * 4 + 0] = r * 255;
      imgData.data[i * 4 + 1] = g * 255;
      imgData.data[i * 4 + 2] = b * 255;
    }
    ctx1.putImageData(imgData, 0, 0);
    const {WE} = window;
    WE.WeExt.debugCanvas(c);
  }
};

apiCanvas.test = function () {

};

apiCanvas.drawVars = function (vars) {

};

export default apiCanvas;
