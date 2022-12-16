<template>
  <div class="main-content">
    <CesiumMap class="contentRight" ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <DoubleMap class="contentLeft"></DoubleMap>
    <!-- ToolGUI -->
    <div class="ToolGUI">
      <DatGUI></DatGUI>
    </div>
  </div>
</template>

<script setup lang="ts" name="doubleView">
import CesiumMap from '@/components/map/CesiumMap.vue'
import DoubleMap from '@/components/map/DoubleMap.vue'
import DatGUI from '@/components/DatGUI.vue'
import { ref, onMounted } from 'vue'

const cesiumMapOptions = ref<object>({
  statusBar: false,
  showNavigationWidget: true
})

onMounted(() => {
  const { WE } = window as any
  WE.viewer.skyAtmosphere = false
  WE.viewer.scene.sun.show = false
  WE.viewer.scene.moon.show = false
  WE.viewer.scene.globe.showGroundAtmosphere = false
})
</script>

<style scoped lang="less">
.ToolGUI {
  position: absolute;
  top: 0px;
  left: 15px;
}

.contentLeft {
  left: 0;
  width: 50%;
  height: 100%;
  position: absolute;
}

.contentRight {
  right: 0;
  width: 50%;
  height: 100%;
  position: absolute;
}
</style>
