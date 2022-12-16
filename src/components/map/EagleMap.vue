<template>
  <div id="cesiumContainer2" class="eagleMap"></div>
</template>

<script setup lang="ts" name="EagleMap">
import { onMounted } from 'vue'

onMounted(() => {
  const { WE } = window as any
  WE.WeExt.createEagle('cesiumContainer2')
})
</script>

<style scoped lang="less">
.eagleMap {
  position: absolute;
  left: 260px;
  bottom: 100px;
  width: 740px;
  height: 400px;
  pointer-events: none;
}
</style>
