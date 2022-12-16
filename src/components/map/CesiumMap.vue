<template>
  <div class="cesium-container"></div>
</template>

<script>
import getAssetsFile from '@/utils/getFiles'
import WeExt from '@/WeatherEarthForVue/WeatherEarthExtension/WeExt'
import { WeStore } from '@/store/modules/weState'

const weStore = WeStore()
export default {
  name: 'CesiumMap',
  props: {
    cesiumMapOptions: {
      type: Object
    }
  },
  mounted() {
    const initWe = Cesium.defaultValue(window.initWe, this.cesiumMapOptions)
    const statusBar = Cesium.defaultValue(initWe.statusBar, false)
    const emptyScene = Cesium.defaultValue(initWe.emptyScene, false)
    let baseLayerPicker = true
    const contextOptions = Cesium.defaultValue(initWe.contextOptions, { requestWebgl2: true })
    const imageryProvider = initWe.imageryProvider
    let imageryProviders
    let terrainProviders
    if (emptyScene || imageryProvider) {
      imageryProviders = undefined
      terrainProviders = undefined
      baseLayerPicker = false
    } else {
      imageryProviders = Cesium.defaultValue(initWe.imageryProviders, this.getImageProviders())
      terrainProviders = Cesium.defaultValue(initWe.terrainProviders, this.getTerrainProviders())
    }

    let defaultImagery = Cesium.defaultValue(initWe.defaultImagery, 0)
    if (Cesium.defined(imageryProviders) && defaultImagery >= imageryProviders.length) {
      defaultImagery = 0
    }

    const imageryProviderViewModels = imageryProviders
    const selectedImageryProviderViewModel = imageryProviders ? imageryProviders[defaultImagery] : undefined

    const defaultOptions = {
      imageryProviderViewModels,
      selectedImageryProviderViewModel,
      terrainProviderViewModels: terrainProviders,
      imageryProvider,
      baseLayerPicker,
      requestRenderMode: Cesium.defaultValue(initWe.requestRenderMode, false),
      scene3DOnly: Cesium.defaultValue(initWe.scene3DOnly, true),
      geocoder: false,
      animation: Cesium.defaultValue(initWe.shouldAnimate, true) && Cesium.defaultValue(initWe.animation, true),
      shouldAnimate: Cesium.defaultValue(initWe.shouldAnimate, true),
      timeline: Cesium.defaultValue(initWe.shouldAnimate, true),
      homeButton: Cesium.defaultValue(initWe.homeButton, false),
      fullscreenButton: Cesium.defaultValue(initWe.fullscreenButton, false),
      navigationHelpButton: Cesium.defaultValue(initWe.navigationHelpButton, false),
      emptyScene,
      contextOptions,
      directionLight: Cesium.defaultValue(initWe.directionLight, false)
    }
    const WE = (window.WE = new WeatherEarth.We(this.$el, Object.assign(defaultOptions, this.cesiumMapOptions)))
    WE.showNavigationWidget = Cesium.defaultValue(initWe.showNavigationWidget, true)
    WE.showDistanceLengthWidget = Cesium.defaultValue(initWe.showDistanceLengthWidget, false)
    WE.debugShowFramesPerSecond = Cesium.defaultValue(initWe.debugShowFramesPerSecond, false)
    if (emptyScene) {
      WE.viewer.scene.postProcessStages.fxaa.enabled = true
    }
    if (statusBar) {
      this.moveListen()
      WE.scaleListener.onScale = this.updateScale
      this._scalaLabel = document.querySelectorAll('.distance-legend-zdy .distance-legend-label-zdy')[0]
      this._scaleBar = document.querySelectorAll('.distance-legend-zdy .distance-legend-scale-bar-zdy')[0]
    }
    this.bindMVVM()
    WE.WeExt = new WeExt(WE)
    WeatherEarth.Config.WeatherDataTemplateUrl = import.meta.env.VITE_APP_OC_SERVER

    WE.WeExt.tooltipManager.clampToTerrain = Cesium.defaultValue(initWe.tooltipClampToTerrain, false)
    const defaultView = initWe.defaultView
    if (Cesium.defined(defaultView)) {
      const vp = new WeatherEarth.ViewPoint(defaultView)
      WE.viewer.camera.flyTo({
        destination: vp.cartesion3,
        orientation: {
          heading: vp.heading,
          pitch: vp.pitch,
          roll: vp.roll
        },
        duration: 1.0
      })
    }
  },
  methods: {
    getImageProviders() {
      WeatherEarth.CommonLayers.UseInternalImageryLayer = true
      const tdtUrl = `${import.meta.env.VITE_APP_PROXY_MAP_URL}`
      if (Cesium.defined(tdtUrl) && tdtUrl !== '') {
        WeatherEarth.CommonLayers.TDT_Url = tdtUrl
        WeatherEarth.CommonLayers.World_HillshadeUrl = `${tdtUrl}arcgis/rest/services/MapServer?s=World_Hillshade&z={z}&y={y}&x={x}`
        WeatherEarth.CommonLayers.Google_Host = tdtUrl
        WeatherEarth.CommonLayers.CesT_url = `${tdtUrl}cesium?terrain/`
      }

      const ggUrl = `${import.meta.env.VITE_APP_PROXY_MAP_URLGG}`
      if (Cesium.defined(ggUrl) && ggUrl !== '') {
        WeatherEarth.CommonLayers.World_HillshadeUrl = `${ggUrl}arcgis/rest/services/MapServer?s=World_Hillshade&z={z}&y={y}&x={x}`
        // WeatherEarth.CommonLayers.Google_Host = 'http://gac-geo.googlecnapps.cn/maps/';
        WeatherEarth.CommonLayers.Google_Host = ggUrl
      }

      WeatherEarth.CommonLayers.TDT_Token = `${import.meta.env.VITE_APP_TDT_TOKEN}`
      WeatherEarth.Config.ResourceImageImgUrl = getAssetsFile('/src/assets/images/img_c.png')
      WeatherEarth.Config.ResourceImageVecUrl = getAssetsFile('/src/assets/images/vec_c.png')
      WeatherEarth.Config.ResourceImageTerUrl = getAssetsFile('/src/assets/images/ter_c.png')
      WeatherEarth.Config.ResourceImageImgGrayUrl = getAssetsFile('/src/assets/images/img_b.jpg')
      WeatherEarth.Config.ResourceImageVecBlueUrl = getAssetsFile('/src/assets/images/vec_b.png')
      WeatherEarth.Config.ResourceImageTerBlueUrl = getAssetsFile('/src/assets/images/ter_b.png')
      WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.World_Hillshade_Blend

      const imageryProviders = []
      imageryProviders.push(WeatherEarth.CommonLayers.Base_WorldVM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_ImgVM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_VecVM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_TerVM)
      imageryProviders.push(WeatherEarth.CommonLayers.Arcgis_VM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_ImgGrayVM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_VecBlueVM)
      imageryProviders.push(WeatherEarth.CommonLayers.TDT_TerBlueVM)

      WeatherEarth.Config.Google_mIconUrl = getAssetsFile('/src/assets/images/google_m.png')
      WeatherEarth.Config.Google_pIconUrl = getAssetsFile('/src/assets/images/google_m.png')
      WeatherEarth.Config.Google_m_blueIconUrl = getAssetsFile('/src/assets/images/google_b.png')
      imageryProviders.push(WeatherEarth.CommonLayers.Google_sVM)
      imageryProviders.push(WeatherEarth.CommonLayers.Google_pVM)
      imageryProviders.push(WeatherEarth.CommonLayers.Google_mVM)
      imageryProviders.push(WeatherEarth.CommonLayers.Google_m_blueVM)
      imageryProviders.push(WeatherEarth.CommonLayers.ArcgisWorld_HillshadeVM)
      WeatherEarth.Config.GaoDe_stIconUrl = getAssetsFile('/src/assets/images/img_gd.png')
      WeatherEarth.Config.GaoDe_rdIconUrl = getAssetsFile('/src/assets/images/img_gd.png')
      WeatherEarth.Config.GaoDe_rd_blueIconUrl = getAssetsFile('/src/assets/images/gaode_b.png')
      imageryProviders.push(WeatherEarth.CommonLayers.GaoDe_stVM)
      imageryProviders.push(WeatherEarth.CommonLayers.GaoDe_rdVM)
      imageryProviders.push(WeatherEarth.CommonLayers.GaoDe_rd_blueVM)

      // imageryProviders.push(WeatherEarth.CommonLayers.ArcgisStreetPurplishBlue_VM);
      return imageryProviders
    },
    getTerrainProviders() {
      // WeExt.CesiumDemUrl = '../../CesT';
      const terrainProviders = []
      terrainProviders.push(WeatherEarth.CommonLayers.Empty_DemVM)
      terrainProviders.push(WeatherEarth.CommonLayers.CesT_VM)
      return terrainProviders
    },
    bindMVVM() {
      const _this = this
      _this.$nextTick(() => {
        const { WE } = window
        WE.globalVolumeState.bindAll()
        /**
        * 改变影像、地形
        */
        const tempDomArr = document.getElementsByClassName('cesium-baseLayerPicker-sectionTitle')
        Array.from(tempDomArr).forEach((item, i) => {
          if (item.textContent === 'Imagery') {
            tempDomArr[i].innerHTML = '影像'
          } else {
            tempDomArr[i].innerHTML = '地形'
          }
        })
      })
    },
    /**
     * 鼠标移动监听事件（底部的经纬度、高程）
     */
    moveListen() {
      const { WE } = window
      WE.handlerManager.internalHandler.moveEvent.addEventListener((cartesian) => {
        if (cartesian) {
          const cartographic = WE.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian)
          const lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4)
          const lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4)
          const altitude = (WE.viewer.camera.positionCartographic.height / 1000).toFixed(2)
          weStore.VIEW_MOVE({
            lat,
            lon,
            altitude
          })
        }
      })
    },
    updateScale(sender, distance, pixelDistance) {
      const label = distance >= 1000 ? `${distance / 1000} km` : ` ${distance} m`
      const scalaLength = (distance / pixelDistance) * 1.0
      this._scalaLabel.innerText = label
      this._scalaLabel.style.width = scalaLength + 'px'
      this._scaleBar.style.width = scalaLength + 'px'
      const { WE } = window
      if (Cesium.defined(WE.WeExt._tooltipManager)) {
        WE.WeExt._tooltipManager.updateScale(distance)
      }
    }
  }
}
</script>

<style lang="less">
.cesium-container {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#navigationDiv {
  position: absolute;
  top: -2.1001em;
  right: 0.625em;
}

.cesium-viewer-timelineContainer {
  bottom: 0px;
  height: 36px;
  left: 0 !important;

  .cesium-timeline-bar {
    background: rgba(2, 25, 48, 0.82);
    height: 32px;
  }

  // .cesium-timeline-ticLabel {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   white-space: nowrap;
  //   font-size: 80%;
  //   color: #eee;
  //   display: none;
  // }
}

.cesium-viewer-animationContainer {
    width: 169px;
    height: 241px;
    position: absolute;
    bottom: 36px;
    right: 99px;
}

.cesium-performanceDisplay-defaultContainer {
  position: absolute;
  top: 15em;
  right: 0.625em;
  text-align: right;
}
</style>
