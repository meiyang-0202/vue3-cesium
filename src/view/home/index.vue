<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <Command/>
    <VolumeToolbar/>
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
  </div>
</template>

<script setup lang="ts" name="home">
import { ref, onMounted } from 'vue'
import { WeStore } from '@/store/modules/weState'
import CesiumMap from '@/components/map/CesiumMap.vue'
import VolumeToolbar from '@/components/volume/VolumeToolbar.vue'
import Command from '@/components/Command.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'

const weStore = WeStore()
const cesiumMapOptions = ref<object>({
  animation: false
})

onMounted(() => {
  const initWe = Cesium.defaultValue((window as any).initWe, {})
  initWe.animation = false
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}
</script>

<style lang="less" scoped>
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
  height: 40px;
  padding: 10px;
  background-color: rgba(30, 30, 30, 0.8);
  font-size: 12px;
}
</style>
