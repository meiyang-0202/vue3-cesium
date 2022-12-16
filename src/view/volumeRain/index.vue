<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <Command/>
    <EagleMap/>
    <EchartsView/>
    <div style="position: absolute;top: 0px;left: 35%">
      <h1 id='timeh' style="color:rgb(255, 255, 255);font-size:50px;display: none;">This is heading 1</h1>
    </div>
    <!-- 经纬度 -->
    <div class="map-latlng">
      <PositionInfo></PositionInfo>
    </div>
    <!--  色卡  -->
    <div class="wrapper" v-show="weStore._showLengend">
      <VolumeColorCard
        :colorArr="weStore._lengedColorArray"
        wrapperClass="activeVolume"
        wrapperWidth="360"
        colorType="linear"
        @volumeColorFilter="activeVolumeFilter"
      ></VolumeColorCard>
    </div>
    <div>
      <PointTooltip v-for="item in defaultStore.pointToolTips" :key="item.label" :id="item.label"></PointTooltip>
    </div>
    <div>
      <Tooltip v-for='item in defaultStore.popupToolTips' :key='item.label' :id='item.label'></Tooltip>
    </div>
    <div>
      <TiltTootip v-for='item in defaultStore.tiltToolTips' :key='item.label' :id='item.label'></TiltTootip>
    </div>
  </div>
</template>

<script setup lang="ts" name="volumeRain">
import { ref, onMounted, computed } from 'vue'
import { WeStore } from '@/store/modules/weState'
import { DefaultStore } from '@/store/index'
import CesiumMap from '@/components/map/CesiumMap.vue'
import EagleMap from '@/components/map/EagleMap.vue'
import EchartsView from '@/components/map/EchartsView.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'
import PositionInfo from '@/components/volume/PositionInfo.vue'
import Command from '@/components/Command.vue'
import Tooltip from '@/components/CesToolTip/Tooltip.vue'
import PointTooltip from '@/components/CesToolTip/PointTooltip.vue'
import TiltTootip from '@/components/CesToolTip/TiltTootip.vue'
import apiRadar from '@/WeatherEarthForVue/exp/apiRadar'
import RadarRainSimulator from '@/WeatherEarthForVue/WeatherEarthExtension/RadarRainSimulator'
import { parseNameFunc4 } from '@/WeatherEarthForVue/exp/expTimeParse'

interface ValueAndColor {
  ValueRamp: number[],
  ColorRamp: number[][]
}
interface Options {
  rainUrl: string,
  threshold: number
}

const weStore = WeStore()
const defaultStore = DefaultStore()

const imageryProviders = computed(() => {
  WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.TDT_Ter_Blend
  const imageryProviders = []
  imageryProviders.push(WeatherEarth.CommonLayers.Base_WorldVM)
  imageryProviders.push(WeatherEarth.CommonLayers.Arcgis_VM)
  return imageryProviders
})

const cesiumMapOptions = ref<object>({
  statusBar: false,
  shouldAnimate: true,
  defaultImagery: 1,
  defaultView: {
    longitude: 1.994371, latitude: 0.407744, height: 447159.639, heading: 0.02, pitch: -0.60, roll: 6.28
  },
  imageryProviders: imageryProviders,
  terrainProviders: [],
  animation: true
})

const ValueAndColorRamp_DBZ = ref<ValueAndColor>({
  ValueRamp: [0.0, 10.0, 15.0, 20.0, 25.0, 30.0, 35.0, 40.0, 45.0, 50.0, 55.0, 60.0, 65.0, 70.0],
  ColorRamp: [[0.0, 0.0, 0.0, 0.0],
    [1.0, 160.0, 246.0, 255.0],
    [0.0, 236.0, 236.0, 255.0],
    [0.0, 215.0, 0.0, 255.0],
    [0.0, 145.0, 0.0, 255.0],
    [255.0, 255.0, 0.0, 255.0],
    [230.0, 190.0, 0.0, 255.0],
    [255.0, 145.0, 0.0, 255.0],
    [255.0, 80.0, 80.0, 255.0],
    [215.0, 0.0, 0.0, 255.0],
    [190.0, 0.0, 0.0, 255.0],
    [255.0, 0.0, 240.0, 255.0],
    [150.0, 0.0, 180.0, 255.0],
    [175.0, 145.0, 240.0, 255.0]]
})
const layerName = ref<string>('雷达图层')
const hostUrl = ref<string>('http://39.101.187.20:10002/Wuhan202003/')
const rainOptions = ref<Options>({
  rainUrl: 'http://39.101.187.20:10002/Wuhan202003/rain.gif',
  threshold: 25
})

onMounted(() => {
  load()
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}

const requestFileList = async() => {
  return new Promise((resolve) => {
    const url = `${hostUrl.value}f.json`
    Cesium.Resource.fetchJson(url).then((files: any) => {
      resolve(files)
    }).catch(() => {
      resolve(null)
    })
  })
}

const load = async() => {
  WeatherEarth.Config.EnableCacheW3dm = true
  const { WE } = window as any
  const files: any = await requestFileList()
  if (files && files.length > 0) {
    const options = {
      TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
      ValueAndColorRamp: ValueAndColorRamp_DBZ.value,
      ValueAndColorRampChild: ValueAndColorRamp_DBZ.value,
      nearestSample: true,
      makeUrlCallback: getUrl,
      layerName: layerName.value,
      offsetZ: 25000,
      name: ''
    }
    options.name = files[files.length - 1]
    const layer = apiRadar.addRadarLayer(options)
    layer.alpha = 0.8
    layer.readyPromise.then(() => {
      layer.buildChildVolume = true
      const timeSampleArray = new WeatherEarth.TimeSampleArray(
        files,
        parseNameFunc4
      )
      layer.timeSampleArray = timeSampleArray
      WE.timeSystem.setRange(timeSampleArray.start, timeSampleArray.end)
      RadarRainSimulator.create(layer, rainOptions.value)
      WE.globalVolumeState.childState.filtrationMin = 25
      WE.viewer.clock.multiplier = 10
    })
  }
}

const getUrl = (name: string) => {
  return hostUrl.value + name
}
</script>

<style scoped lang="less">
.ToolGUI {
  position: absolute;
  top: 0px;
  left: 15px;
}

.map-latlng {
  position: absolute;
  bottom: 40px;
  left: 170px;
}

.wrapper {
  position: absolute;
  bottom: 50px;
  right: 10px;
  height: 40px;
  padding: 10px 15px;
  background-color: rgba(30, 30, 30, 0.8);
  font-size: 12px;
}
</style>
