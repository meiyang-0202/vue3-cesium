<template>
  <div class="main-content">
    <div
      class="loading"
      v-loading="loading"
      element-loading-text="加载中..."
      element-loading-background="rgba(1, 0, 0, 1)"/>
    <div class="title" v-text="time"></div>
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <VolumeToolbar/>
    <div class="wrapper" v-show="weStore._showLengend">
      <VolumeColorCard
        :colorArr="weStore._lengedColorArray"
        wrapperClass="activeVolume"
        wrapperWidth="400"
        colorType="linear"
        :show-slider="false"
        @volumeColorFilter="activeVolumeFilter"
      ></VolumeColorCard>
    </div>
  </div>
</template>

<script setup lang="ts" name="ncep">
import { ref, onMounted, computed } from 'vue'
import CesiumMap from '@/components/map/CesiumMap.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'
import VolumeToolbar from '@/components/volume/VolumeToolbar.vue'
import expImageryData from '@/WeatherEarthForVue/exp/expImageryData'
import expWindData from '@/WeatherEarthForVue/exp/expWindData'
import getAssetsFile from '@/utils/getFiles'
import { WeStore } from '@/store/modules/weState'

const weStore = WeStore()

const imageryProviders = computed(() => {
  WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.TDT_Ter_Blend
  const imageryProviders = []
  WeatherEarth.Config.TDT_VecIconUrl = getAssetsFile('/src/assets/images/vec_c.png')
  WeatherEarth.Config.TDT_ImgGrayIconUrl = getAssetsFile('/src/assets/images/img_b.jpg')
  WeatherEarth.Config.TDT_TerIconUrl = getAssetsFile('/src/assets/images/ter_c.png')
  WeatherEarth.Config.TDT_TerBlueIconUrl = getAssetsFile('/src/assets/images/ter_b.png')

  imageryProviders.push(WeatherEarth.CommonLayers.Base_WorldVM)
  imageryProviders.push(WeatherEarth.CommonLayers.TDT_VecVM)
  imageryProviders.push(WeatherEarth.CommonLayers.TDT_ImgGrayVM)
  imageryProviders.push(WeatherEarth.CommonLayers.TDT_TerBlueVM)
  return imageryProviders
})

const cesiumMapOptions = ref<object>({
  statusBar: false,
  shouldAnimate: true,
  defaultImagery: 0,
  defaultView: {
    longitude: 2.047554, latitude: 0.540423, height: 4965956.774, heading: 6.28, pitch: -1.57, roll: 0.00
  },
  imageryProviders,
  terrainProviders: [],
  animation: true
})
const time = ref<string>('')
const layerNameWind = ref<string>('风场')
const layerNameTmp = ref<string>('温度')
const loading = ref<boolean>(false)
const host = ref<string>('../../OCserverNew')
const jDate = ref<any>(null)

onMounted(() => {
  const { WE } = window as any
  WE.WeExt.initWebSocket(import.meta.env.VITE_APP_WS)
  loading.value = true

  const dates = expWindData.getNecpTimeDate(2)
  const jDates = expWindData.toJulianDate(dates)
  jDates.reverse()
  jDate.value = jDates

  WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.World_Hillshade_Blend
  WE.layerManager.showAnnotation = true
  WE.layerManager.showTerrainFilter = true
  WE.layerManager.showCountryBorder = true

  const layer = loadWind()
  layer._onLoadNew = onLoadNew
  loadTmp()

  if (Cesium.defined(layer.timeSampleArray)) {
    WE.timeSystem.setRange(layer.timeSampleArray.start, layer.timeSampleArray.end)
    WE.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
    WE.viewer.clock.currentTime = layer.timeSampleArray.end
  }
  WE.layerManager.raiseToTop('地形蒙皮')
  WE.layerManager.raiseToTop('境界')
  WE.layerManager.raiseToTop('注记')

  weStore.ChangeLengend(expImageryData.TFWindyTemprature)
  weStore.ShowLengend(true)
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}

const loadWind = () => {
  const names: any[] = []
  jDate.value.forEach((d: any) => {
    const gregorianDate = Cesium.JulianDate.toGregorianDate(d)
    const year = gregorianDate.year.toString().padStart(2, '0')
    const month = gregorianDate.month.toString().padStart(2, '0')
    const day = gregorianDate.day.toString().padStart(2, '0')
    const noHour = Math.floor(gregorianDate.hour / 6) * 6
    const hour = noHour.toString().padStart(2, '0')
    const time = `${year}${month}${day}_${hour}`
    names.push(time)
  })

  let i = 0
  const timeSampleArray = new WeatherEarth.TimeSampleArray(
    names,
    () => Cesium.JulianDate.addHours(jDate.value[i++], 0, new Cesium.JulianDate())
  )

  const dataTime = names[names.length - 1]

  const { WE } = window as any
  const layerName = layerNameWind.value
  const options = {
    showSpeed: false,
    flipY: true,
    flipX: false,
    imageryBaseWind: false,
    name: dataTime,
    makeUrlCallback(time: string) {
      const url = `${host.value}/OC?name=${time}&ext=grib&varName=NcepUV`
      return url
    }
  }

  const layer = WE.layerManager.addMapBoxWindImageryLayer(options, layerName)
  layer.colorWithSpeed = false
  layer.timeSampleArray = timeSampleArray
  return layer
}

const loadTmp = () => {
  const names: any[] = []
  jDate.value.forEach((d: any) => {
    const gregorianDate = Cesium.JulianDate.toGregorianDate(d)
    const year = gregorianDate.year.toString().padStart(2, '0')
    const month = gregorianDate.month.toString().padStart(2, '0')
    const day = gregorianDate.day.toString().padStart(2, '0')
    const noHour = Math.floor(gregorianDate.hour / 6) * 6
    const hour = noHour.toString().padStart(2, '0')
    const time = `${year}${month}${day}_${hour}`
    names.push(`${host.value}/OC?name=${time}&ext=grib&varName=NcepTmp`)
  })

  let i = 0
  const timeSampleArray = new WeatherEarth.TimeSampleArray(
    names,
    () => Cesium.JulianDate.addHours(jDate.value[i++], 0, new Cesium.JulianDate())
  )

  const dataTime = names[names.length - 1]

  const { WE } = window as any
  const layerName = layerNameTmp.value
  const options = {
    url: '{name}',
    ext: 'w3dm',
    ValueAndColorRamp: expImageryData.TFWindyTemprature,
    flipX: false,
    name: dataTime
  }
  const layer = WE.layerManager.addAnimationImageryLayer(options, layerName)
  layer.timeSampleArray = timeSampleArray
  layer.alpha = 0.8
}

const onLoadNew = (lastName: string, currentName: string) => {
  loading.value = false
  const year = currentName.substr(0, 4)
  const month = currentName.substr(4, 2)
  const day = currentName.substr(6, 2)
  const hour = currentName.substr(9, 2)
  time.value = `数据时间 ${year}年${month}月${day}日${hour}时`
}
</script>

<style scoped lang="less">
.main-content {
  position: relative;

  .ToolGUI {
    position: absolute;
    top: 0px;
    left: 15px;
    display: none;
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

  .title {
    position: absolute;
    z-index: 101;
    color: rgb(255, 255, 255);
    font-size: 28px;
    width: 800px;
    top: 12px;
    text-align: center;
    left: calc(50% - 400px);
    background-color: rgba(0, 0, 0, 0.2);
    pointer-events: none;
  }

  .loading {
    position: absolute;
    z-index: 101;
    font-size: 28px;
    width: 200px;
    top: calc(50%);
    text-align: center;
    left: calc(50% - 100px);
    pointer-events: none;
  }
}
</style>
