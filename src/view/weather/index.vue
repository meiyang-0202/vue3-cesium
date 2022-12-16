<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <VolumeToolbar />
    <Command />
    <EagleMap />
    <EchartsView />
    <!--  DatGUI  -->
    <div class="ToolGUI">
      <DatGUI></DatGUI>
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

<script setup lang="ts" name="weather">
import { ref, onMounted } from 'vue'
import { WeStore } from '@/store/modules/weState'
import { DefaultStore } from '@/store/index'
import CesiumMap from '@/components/map/CesiumMap.vue'
import DatGUI from '@/components/DatGUI.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'
import VolumeToolbar from '@/components/volume/VolumeToolbar.vue'
import PositionInfo from '@/components/volume/PositionInfo.vue'
import EagleMap from '@/components/map/EagleMap.vue'
import EchartsView from '@/components/map/EchartsView.vue'
import Command from '@/components/Command.vue'
import PointTooltip from '@/components/CesToolTip/PointTooltip.vue'
import Tooltip from '@/components/CesToolTip/Tooltip.vue'
import TiltTootip from '@/components/CesToolTip/TiltTootip.vue'

const weStore = WeStore()
const defaultStore = DefaultStore()
const cesiumMapOptions = ref<object>({
  statusBar: true
})

interface optionsObj {
  image: any,
  counts: number,
  value: number[]
}

onMounted(() => {
  // const { WE } = window as any
  // WE.viewer.skyAtmosphere = false
  // WE.viewer.scene.sun.show = false
  // WE.viewer.scene.moon.show = false
  // WE.viewer.scene.globe.showGroundAtmosphere = false
  // weStore.ChangeLengend(WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_UV)
  // weStore.ShowLengend(true)
  // getImageColor()
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}

const getImageColor = async() => {
  const url = await import('@/assets/images/rainbow-legend.png')
  Cesium.Resource.fetchImage(url.default).then((img: any) => {
    const options = {
      image: img,
      counts: 13,
      value: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70]
    }
    const ColorAndValueRamp = createFlashCanvas(options)
    weStore.ChangeLengend(ColorAndValueRamp)
    weStore.ShowLengend(true)
  })
}

/**
 * 对图片颜色进行处理并返回一个color和value的Object
 * @param options
 * @returns {{ColorRamp: *[], ValueRamp}}
 */
const createFlashCanvas = (options: optionsObj) => {
  const { image, counts, value } = options
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const ctx: any = canvas.getContext('2d')
  ctx.drawImage(image, 0, 0)
  const imageData = (ctx.getImageData(0, 0, image.width, image.height)).data
  const imageWidth = image.width - 100
  const ColorRamp = []
  for (let i = 0; i < counts; i++) {
    const offsetUnit = i / counts
    const offset = 100 + Math.floor(offsetUnit * imageWidth)
    const r = imageData[offset * 4 + 0]
    const g = imageData[offset * 4 + 1]
    const b = imageData[offset * 4 + 2]
    const rgba = [r, g, b, 255]
    ColorRamp.push(rgba)
  }
  ColorRamp.unshift([0, 0, 0, 0])
  const ValueRamp = value
  return { ColorRamp, ValueRamp }
}
</script>

<style lang="less" scoped>
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
