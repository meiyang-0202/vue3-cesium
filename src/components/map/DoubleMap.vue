<template>
  <div class="cesium-container2"></div>
</template>

<script setup lang="ts" name="DoubleMap">
import WeExt from '@/WeatherEarthForVue/WeatherEarthExtension/WeExt'
import { onMounted, getCurrentInstance } from 'vue'
const { ctx } = getCurrentInstance() as any

onMounted(() => {
  const { WE } = window as any
  let imageryProvider
  const baseLayerPicker = false
  const options = {
    imageryProvider,
    baseLayerPicker,
    geocoder: false,
    fullscreenButton: false,
    homeButton: false,
    scene3DOnly: true,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    requestRenderMode: false,
    shouldAnimate: true,
    directionLight: true
  }
  WE.secondWE = new WeatherEarth.We(ctx.$el, options)
  WE.secondWE.WeExt = new WeExt(WE.secondWE)
  WE.secondWE.viewer.scene.globe.show = true
  WE.secondWE.viewer.skyAtmosphere = false
  WE.secondWE.viewer.scene.sun.show = false
  WE.secondWE.viewer.scene.moon.show = false
  WE.secondWE.viewer.scene.globe.showGroundAtmosphere = false
  WE.secondWE.showSkyBox = true
})
</script>

<style scoped lang="less">
.cesium-container2 {
  right: 0;
  width: 50%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
