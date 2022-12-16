<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
  </div>
</template>

<script setup lang="ts" name="volume">
import { ref, onMounted, getCurrentInstance } from 'vue'
import CesiumMap from '@/components/map/CesiumMap.vue'
import apiRadar from '@/WeatherEarthForVue/exp/apiRadar'

const { ctx } = getCurrentInstance() as any

const layerName = ref<string>('体数据')
const cesiumMapOptions = ref<object>({
  animation: false,
  emptyScene: true
})

onMounted(() => {
  ctx.$nextTick(() => {
    init()
  })
})

const init = () => {
  const position = new Cesium.Cartesian3(114, 33, 0)
  const { WE } = window as any
  WE.showTimeLine = false
  const fileName = ''
  const options = {
    position,
    name: fileName,
    layerName: layerName.value,
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    showEco: false,
    showInner: true,
    makeUrlCallback() {
      const url = 'http://127.0.0.1:8083/158/Assets/ANA-2019070516_201907051550_201907051547.z_q.w3dm'
      return url
    }
  }
  const layer = apiRadar.addRadarLayer(options)
  layer.readyPromise.then(() => {
    WE.globalVolumeState.summationInEdge = true
    // WE.globalVolumeState.displayMode = 'Slice';
    WE.globalVolumeState.scaleZ = 5
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
