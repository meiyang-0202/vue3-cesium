<template>
  <div class="main-content">
    <div class="title" v-text="time"></div>
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <VolumeToolbar/>
    <div class="wrapper" v-show="weStore._showLengend">
      <VolumeColorCard
        :colorArr="weStore._lengedColorArray"
        wrapperClass="activeVolume"
        wrapperWidth="360"
        colorType="none"
        @volumeColorFilter="activeVolumeFilter"
      ></VolumeColorCard>
    </div>
  </div>
</template>

<script setup lang="ts" name="hubeiRadar">
import { ref, onMounted, computed } from 'vue'
import { WeStore } from '@/store/modules/weState'
import CesiumMap from '@/components/map/CesiumMap.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'
import VolumeToolbar from '@/components/volume/VolumeToolbar.vue'
import apiRadar from '@/WeatherEarthForVue/exp/apiRadar'
import { parseNameFunc4Multiply8 } from '@/WeatherEarthForVue/exp/expTimeParse'
import getAssetsFile from '@/utils/getFiles'

interface ValueAndColor {
  ValueRamp: number[],
  ColorRamp: number[][]
}

const weStore = WeStore()

const imageryProviders = computed(() => {
  WeatherEarth.CommonLayers.TDT_Url = `${import.meta.env.VITE_APP_HUBEI_PROXY_MAP_URL}`
  WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.TDT_Ter_Blend
  const imageryProviders = []
  WeatherEarth.Config.TDT_VecIconUrl = getAssetsFile('/src/assets/images/vec_c.png')
  WeatherEarth.Config.TDT_ImgGrayIconUrl = getAssetsFile('/src/assets/images/img_b.jpg')
  WeatherEarth.Config.TDT_TerIconUrl = getAssetsFile('/src/assets/images/ter_c.png')
  WeatherEarth.Config.TDT_TerBlueIconUrl = getAssetsFile('/src/assets/images/ter_b.png')

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
    longitude: 1.994390, latitude: 0.523243, height: 1492808.954, heading: 6.28, pitch: -1.57, roll: 0.00
  },
  imageryProviders,
  terrainProviders: [],
  animation: false
})
const time = ref<string>('')
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
const station = ref<string>('Z9270')
const dataCode = ref<string>('RADA_L2_FMT')

onMounted(() => {
  const { WE } = window as any
  WeatherEarth.CommonLayers.TerrainFilterLayer = WeatherEarth.CommonLayers.TDT_Ter_Blend
  WE.layerManager.showAnnotation = true
  WE.layerManager.showTerrainFilter = true

  const timestamp = Date.parse(String(new Date()))
  const host = import.meta.env.VITE_APP_HUBEI_PROXY_MAP_URL
  const url = `${host}getFileList?station=${station.value}&${timestamp}&product=w3dm`

  const options = {
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: ValueAndColorRamp_DBZ.value,
    ValueAndColorRampChild: ValueAndColorRamp_DBZ.value,
    nearestSample: true,
    makeUrlCallback: getUrl,
    layerName: layerName.value,
    showEco: false,
    name: ''
  }

  Cesium.Resource.fetchJson(url).then((json: { data: any }) => {
    const data = json.data
    if (data.length > 0) {
      const timeSampleArray = new WeatherEarth.TimeSampleArray(
        data,
        parseNameFunc4Multiply8
      )
      options.name = data[data.length - 1]
      const layer = apiRadar.addRadarLayer(options)
      layer.timeSampleArray = timeSampleArray
      WE.timeSystem.setRange(timeSampleArray.start, timeSampleArray.end)
      WE.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
      WE.viewer.clock.currentTime = timeSampleArray.end
      layer._onLoadNew = onLoadNew
    }
  })
  weStore._showLengend = true
  weStore._showVolumeButton = true
  weStore.ChangeLengend(ValueAndColorRamp_DBZ.value)
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}

const getUrl = (name: string) => {
  const host = import.meta.env.VUE_APP_HUBEI_API
  const url = `${host}getFile?station=${station.value}&fileName=${name}&product=w3dm`
  return url
}

const onLoadNew = (lastName: string, currentName: string) => {
  const time = parseNameFunc4Multiply8(currentName)
  Cesium.JulianDate.addHours(time, 8, time)
  const gregorianDate = Cesium.JulianDate.toGregorianDate(time)
  const year = gregorianDate.year.toString().padStart(2, '0')
  const month = gregorianDate.month.toString().padStart(2, '0')
  const day = gregorianDate.day.toString().padStart(2, '0')
  const hour = gregorianDate.hour.toString().padStart(2, '0')
  const minute = gregorianDate.minute.toString().padStart(2, '0')
  const second = gregorianDate.second.toString().padStart(2, '0')
  time.value = `数据时间 ${station.value} ${year}年${month}月${day}日 ${hour}:${minute}:${second}`
}
</script>

<style scoped lang="less">
.main-content {
  position: relative;

  .title {
    position: absolute;
    z-index: 101;
    color: red;
    font-size: 28px;
    width: 800px;
    top: 12px;
    text-align: center;
    left: calc(50% - 400px);
    background-color: rgba(0, 0, 0, 0.2);
  }

  .wrapper {
    position: absolute;
    bottom: 36px;
    right: 10px;
    width: 360px;
    height: 40px;
    padding: 10px;
    background-color: rgba(30, 30, 30, 0.8);
    font-size: 14px;
  }

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
}
</style>
