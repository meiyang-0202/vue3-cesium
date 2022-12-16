function apiTest() {

}

apiTest.testRequest = function () {
  const url1 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_12&ext=grib&varName=NcepUV&filter';
  const url2 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_18&ext=grib&varName=NcepUV&filter';
  const url3 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_12&ext=grib&varName=NcepTmp&filter=undefined';
  const url4 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_18&ext=grib&varName=NcepTmp&filter=undefined';
  const url5 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_12&ext=grib&varName=NcepRH&filter=undefined';
  const url6 = 'http://127.0.0.1:8084/OCserver/OC?name=20220604_18&ext=grib&varName=NcepRH&filter=undefined';
  Cesium.Resource.fetchBlob(url1);
  Cesium.Resource.fetchBlob(url1);
  Cesium.Resource.fetchBlob(url1);
  Cesium.Resource.fetchBlob(url2);
  Cesium.Resource.fetchBlob(url2);
  Cesium.Resource.fetchBlob(url3);
  Cesium.Resource.fetchBlob(url3);
  Cesium.Resource.fetchBlob(url4);
  Cesium.Resource.fetchBlob(url4);
  Cesium.Resource.fetchBlob(url5);
  Cesium.Resource.fetchBlob(url5);
  Cesium.Resource.fetchBlob(url6);
  Cesium.Resource.fetchBlob(url6);
};

apiTest.testRequest = function () {
  const urlRoot = '../../FireService/';
  Cesium.Resource.fetchText(urlRoot).then((text) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    const links = xmlDoc.getElementsByTagName('a');
    const files = [];
    links.forEach((element) => {
      const content = element.textContent;
      if (content.endsWith('.json')) {
        files.push(content);
      }
    });
    files.sort();
    if (files.length > 0) {
      const url = urlRoot + files[files.length - 1];
      Cesium.Resource.fetchText(url).then((json) => {
        console.info(json);
      });
    }
  });
};

apiTest.test = function () {
  apiTest.testRequest();
};

export default apiTest;
