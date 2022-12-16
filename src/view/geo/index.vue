<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
  </div>
</template>

<script setup lang="ts" name="geo">
import { ref, onMounted, getCurrentInstance } from 'vue'
import CesiumMap from '@/components/map/CesiumMap.vue'

const { ctx } = getCurrentInstance() as any

const layerName = ref<string>('地质')
const style_entity = ref<any>(null)
const style_rawEntity = ref<any>(null)
const cesiumMapOptions = ref<object>({
  animation: false,
  emptyScene: true
})

onMounted(() => {
  initStyle()
  ctx.$nextTick(() => {
    init()
  })
})

const init = () => {
  const { WE } = window as any
  WE.showSkyBox = false
  WE.backgroundColor = new Cesium.Color(0.2, 0.2, 0.3, 1.0)
  WE.showTimeLine = false
  // const assets = 'http://127.0.0.1:8083/Assets';
  const assets = import.meta.env.VITE_APP_ASSETS
  const url = `${assets}/dizhi/xiongan/tileset.json`
  const options = {
    url,
    debugShowBoundingVolume: false,
    cullWithChildrenBounds: false,
    cullRequestsWhileMoving: false,
    shadows: Cesium.ShadowMode.ENABLED,
    preloadWhenHidden: true,
    immediatelyLoadDesiredLevelOfDetail: true,
    skipLevelOfDetail: true,
    skipLevels: 4,
    showOutline: false
  }

  const lontitude = 116.017106
  const latitude = 38.964298

  const tileset = WE.layerManager.addTilesetLayer(options, layerName.value)
  // tileset.tileLoad.addEventListener((tile: { content: any }) => {
  //   const content = tile.content
  //   const innerContents = content.innerContents
  //   if (Cesium.defined(innerContents)) {
  //     const length = innerContents.length
  //     for (let i = 0; i < length; ++i) {
  //       const featuresLength = content.featuresLength
  //       for (let j = 0; j < featuresLength; ++j) {
  //         const feature = content.getFeature(j)
  //       }
  //     }
  //   } else {
  //     const featuresLength = content.featuresLength
  //     for (let j = 0; j < featuresLength; ++j) {
  //       const feature = content.getFeature(j)
  //     }
  //   }
  // })

  tileset.readyPromise.then(() => {
    const center = Cesium.Cartesian3.fromDegrees(lontitude, latitude, 1.0)
    const m = Cesium.Transforms.eastNorthUpToFixedFrame(center)
    Cesium.Matrix4.multiplyByScale(m, { x: 1.0, y: 1.0, z: 100.0 }, tileset._root.transform)
    WE.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.8, tileset.boundingSphere.radius * 2.3))
    tileset.style = style_rawEntity.value
  })

  WE.handlerManager.startPick({
    handleType: 'CommonPick',
    color: Cesium.Color.RED,
    infomation: false
  })
}

const initStyle = () => {
  // style_entity.value = new Cesium.Cesium3DTileStyle({
  //   color: {
  //     conditions: [
  //       ["${file} === '1_415441_4314348_0'", 'rgba(113, 134 125,0.1)'],
  //       ["${file} === '2_415441_4314348_0'", 'rgba(206, 184, 0,0.1)'],
  //       ["${file} === '3_415441_4314348_0'", 'rgba(199, 169, 0,0.1)'],
  //       ["${file} === '4_415441_4314348_0'", 'rgba(205, 184, 0,0.1)'],
  //       ["${file} === '5_415441_4314348_0'", 'rgba(203, 205, 0,0.1)'],
  //       ["${file} === '6_415441_4314348_0'", 'rgba(1, 204, 201,0.1)'],
  //       ["${file} === '7_415441_4314348_0'", 'rgba(204, 165, 0,0.1)'],
  //       ["${file} === '8_415441_4314348_0'", 'rgba(207, 115, 6,0.1)'],
  //       ["${file} === '9_415441_4314348_0'", 'rgba(206, 118, 0,0.1)'],
  //       ["${file} === '10_415441_4314348_0'", 'rgba(10, 199, 205,0.1)'],
  //       ["${file} === '11_415441_4314348_0'", 'rgba(202, 205, 0,0.1)'],
  //       ["${file} === '12_415441_4314348_0'", 'rgba(206, 118, 0,0.1)'],
  //       ["${file} === '13_415441_4314348_0'", 'rgba(207, 115, 6,0.1)'],
  //       ["${file} === '14_415441_4314348_0'", 'rgba(206, 118, 0,0.1)'],
  //       ["${file} === '15_415441_4314348_0'", 'rgba(10, 199, 205,0.1)'],
  //       ["${file} === '16_415441_4314348_0'", 'rgba(206, 118, 0,0.1)'],
  //       ["${file} === '17_415441_4314348_0'", 'rgba(10, 199, 205,0.1)'],
  //       ["${file} === '18_415441_4314348_0'", 'rgba(206, 118, 0,0.1)'],
  //       ['true', 'rgb(255, 255, 255)']
  //     ]
  //   }
  // })

  style_rawEntity.value = new Cesium.Cesium3DTileStyle({
    color: {
      conditions: [
        ["${name} === '1'", 'rgba(113, 134,125,1.0)'],
        ["${name} === '2'", 'rgba(206, 184, 0,1.0)'],
        ["${name} === '3'", 'rgba(199, 169, 0,1.0)'],
        ["${name} === '4'", 'rgba(205, 184, 0,1.0)'],
        ["${name} === '5'", 'rgba(203, 205, 0,1.0)'],
        ["${name} === '6'", 'rgba(1, 204, 201,1.0)'],
        ["${name} === '7'", 'rgba(204, 165, 0,1.0)'],
        ["${name} === '8'", 'rgba(207, 115, 6,1.0)'],
        ["${name} === '9'", 'rgba(206, 118, 0,1.0)'],
        ["${name} === '10'", 'rgba(10, 199, 205,1.0)'],
        ["${name} === '11'", 'rgba(202, 205, 0,1.0)'],
        ["${name} === '12'", 'rgba(206, 118, 0,1.0)'],
        ["${name} === '13'", 'rgba(207, 115, 6,1.0)'],
        ["${name} === '14'", 'rgba(206, 118, 0,1.0)'],
        ["${name} === '15'", 'rgba(10, 199, 205,1.0)'],
        ["${name} === '16'", 'rgba(206, 118, 0,1.0)'],
        ["${name} === '17'", 'rgba(10, 199, 205,1.0)'],
        ["${name} === '18'", 'rgba(206, 118, 0,1.0)'],
        ['true', 'rgba(255, 255, 255, 1)']
      ]
    }
  })
}
</script>

<style scoped lang="less">
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 25em;
  height: 4em;
  background-color: rgba(30, 30, 30, 0.8);
  color: #ffffff;
  display: flex;
  align-items: center;
  user-select: none;
}

.wrapper {
  position: absolute;
  bottom: 50px;
  right: 10px;
  width: 360px;
  height: 40px;
  padding: 10px;
  background-color: rgba(30, 30, 30, 0.8);
  font-size: 14px;
}
</style>
