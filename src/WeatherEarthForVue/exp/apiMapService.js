function apiMapService() {

}

apiMapService.layerName = '地图服务';

apiMapService.loadWMS = function (value) {
  const { WE } = window;
  const { layerName } = apiMapService;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }

  const DATE = '20220420';
  const TIME = '0000';

  const privider = new Cesium.WebMapServiceImageryProvider({
    url: 'https://satellite.nsmc.org.cn/mongoTile_DSS/FY/getLatestTile.php',
    layers: 'FY3D_MERSI',
    parameters: {
      service: 'WMS',
      format: 'image/jpeg',
      layer: 'PRODUCT',
      PRODUCT: 'FY3D_MERSI_L2_PAD_MLT_GLL_YYYYMMDD_POAD_0250M_MS.HDF',
      //   DATE,
      //   TIME,
    },
    tilingScheme: new Cesium.GeographicTilingScheme(),
    maximumLevel: 8,
  });
  WE.viewer.scene.sun.show = false;
  WE.viewer.scene.moon.show = false;
  WE.viewer.scene.globe.showGroundAtmosphere = false;

  WE.layerManager.addImageryProvider(privider, layerName);
};

apiMapService.loadWMTS = function (value) {
  const { WE } = window;
  const { layerName } = apiMapService;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }

  // eslint-disable-next-line max-len
  const url = `${import.meta.env.VITE_APP_PROXY_MAP_URL}ter_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=ter&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.png&tk=`;
  const privider1 = new Cesium.WebMapTileServiceImageryProvider({
    url,
    layer: 'ter',
    style: 'default',
    format: 'image/jpg',
    tileMatrixSetID: 'w',
    show: true,
    minimumLevel: 1,
    maximumLevel: 14,
  });

  const privider2 = WeatherEarth.CommonLayers._Google_t();

  const privider3 = new Cesium.ArcGisMapServerImageryProvider({
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer',
  });
  const privider = new Cesium.ArcGisMapServerImageryProvider({
    url: 'https://services.arcgisonline.com/arcgis/rest/services/Ocean/World_Ocean_Base/MapServer',
  });

  const url3 = 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}';
  const url2 = 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}';
  const privider4 = new Cesium.UrlTemplateImageryProvider({
    url: url2,
    minimumLevel: 0,
    maximumLevel: 13
  });

  const fragmentShaderSource = `
  precision highp sampler2D;
  uniform sampler2D baseTexture;
  varying vec2 v_textureCoordinates;
  vec4 photoshop_desaturate(vec3 color)
  {
      float bw = (min(color.r, min(color.g, color.b)) + max(color.r, max(color.g, color.b))) * 0.5;
      return vec4(bw, bw, bw, 1.0);
  }
  void main()
  {
    vec4 color = texture2D(baseTexture,v_textureCoordinates);
    //color.rgb = photoshop_desaturate(color.rgb).rgb;
    //float alpha = max(color.r,max(color.b,color.g));
    float alpha = color.b;
    color.a = pow(alpha, 1.0);
    //color.a = 1.0 - alpha;
    //color.rgb *= 0.0;
    gl_FragColor = color;
  }
  `;

  const fragmentShaderSource22 = `
  precision highp sampler2D;
  uniform sampler2D baseTexture;
  varying vec2 v_textureCoordinates;
  vec4 photoshop_desaturate(vec3 color)
  {
      float bw = (min(color.r, min(color.g, color.b)) + max(color.r, max(color.g, color.b))) * 0.5;
      return vec4(bw, bw, bw, 1.0);
  }
  void main()
  {
    vec4 color = texture2D(baseTexture,v_textureCoordinates);
    color.rgb = photoshop_desaturate(color.rgb).rgb;
    float alpha = max(color.r,max(color.b,color.g));
    float a = min(color.a,1.0 - alpha);
    color.a = pow(a, 1.0);
    color.rgb *= 0.0;
    gl_FragColor = color;
  }
  `;

  privider.createComputeCommand = function (that, texture) {
    const context = WE.viewer.scene.context;
    const uniformMap = {
      baseTexture() {
        return texture;
      },
    };

    return new Cesium.ComputeCommand({
      uniformMap,
      fragmentShaderSource,
      preExecute(command) {
        command.outputTexture = new Cesium.Texture({
          context,
          width: texture.width,
          height: texture.height,
          pixelFormat: texture.pixelFormat,
          pixelDatatype: texture.pixelDatatype,
          preMultiplyAlpha: texture.preMultiplyAlpha,
        });
      },
      persists: true,
    });
  };
  WE.layerManager.addImageryProvider(privider, layerName);
};


let jumped = false;

apiMapService.loadTMS = function (value) {
  const { WE } = window;
  const { layerName } = apiMapService;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }

  const map = value === 'new' ? 'shiyanNew' : 'shiyanOld';
  const url = `http://10.104.207.155:9080/Map/${map}/{z}/{x}/{y}.png`;
  const privider = new Cesium.UrlTemplateImageryProvider({
    url,
    minimumLevel: 5,
    maximumLevel: 19
  });

  // WE.layerManager.addImageryProvider(privider, layerName);

  if (!jumped) {
    const vp = {
      longitude: 1.935349, latitude: 0.565328, height: 2460.713, heading: 0.20, pitch: -0.76, roll: 0.00
    };

    WE.WeExt.jumpToViewpoint(vp);
    jumped = true;
  }
};

apiMapService.loadXYZ = function (value) {
  const { WE } = window;
  const { layerName } = apiMapService;
  WE.layerManager.remove(layerName);
  if (value === '') {
    return;
  }

  const privider = new Cesium.TileMapServiceImageryProvider({
    url: 'http://127.0.0.1:8083/158/Assets/map/123',
    maximumLevel: 18,
  });
  WE.viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(110.767, 32.2886, 1000),
    duration: 0.5,
    convert: false
  });
  WE.layerManager.addImageryProvider(privider, layerName);
};

export default apiMapService;
