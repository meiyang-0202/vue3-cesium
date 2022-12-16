<template>
  <div ref="datcontainer"></div>
</template>

<script setup lang="ts" name="DatGUI">
import { onMounted, getCurrentInstance } from 'vue'
import dat from 'dat.gui'
import expGUI from '@/WeatherEarthForVue/gui/expGUI'

const currentInstance = getCurrentInstance()

onMounted(() => {
  const gui = new dat.GUI({ autoPlace: false })
  const customContainer = (currentInstance as any).ctx.$refs.datcontainer
  customContainer.appendChild(gui.domElement)
  expGUI.bind(gui)
})
</script>

<style lang="less" scoped>
.ToolGUI ul li .c select {
  color: #333;
}
</style>
