<template>
  <div ref="tooltipcontainer" class="tooltip-point" v-show="isVisible">
    <div class="we-animation-point" style="color:#f33349;">
    </div>
    <h1 class="wrap2" style="color:rgb(255, 255, 255);font-size:24px;">{{ id }}</h1>
  </div>
</template>

<script setup lang="ts" name="PointTooltip">
import { ref, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { DefaultStore } from '@/store'

const _this = getCurrentInstance() as ComponentInternalInstance
const defaultStore = DefaultStore()

const isVisible = ref<boolean>(false)
const dirty = ref<boolean>(false)
const id = ref<string>('')
const _offsetWidth = ref<number>(0)
const _offsetHeight = ref<number>(0)

onMounted(() => {
  const stationId = _this.proxy?.$attrs.id as string
  id.value = stationId
  const item = defaultStore.pointToolTips[id.value]
  if (!Cesium.defined(item)) {
    return
  }
  const { longitude, latitude } = item
  const { WE } = window as any
  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0)
  WE.WeExt.tooltipManager.remove(id.value)
  WE.WeExt.tooltipManager.add({
    id: id.value,
    node: _this,
    position
  })
  if (defaultStore.debugTooltip) {
    WE.WeExt.pointCollection.add({ position })
  }
  isVisible.value = true
})

const updatePotision = (position: { x: number; y: number }) => {
  const target = _this.refs.tooltipcontainer as any
  if (!Cesium.defined(target)) {
    return
  }
  const offsetWidth = target.offsetWidth
  if (!Cesium.defined(offsetWidth)) {
    return
  }
  const offsetHeight = target.offsetHeight
  if (!Cesium.defined(_offsetWidth.value) && offsetWidth !== 0) {
    _offsetWidth.value = offsetWidth
    _offsetHeight.value = offsetHeight
  }
  const x: number = position.x - _offsetWidth.value / 2
  const y: number = position.y

  target.style.left = x + 'px'
  target.style.top = y + 'px'
}
</script>

<style lang="less">
@import '../../assets/css/tooltip.less';

.tooltip-point {
  position: absolute;
  left: 0;
  top: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  height: 0px;
  width: 100px;
  pointer-events: none;
  z-index: auto;
  text-shadow: #000 2px 0 0, #000 0 1px 0,#000 -1px 0 0, #000 0 -1px 0;
  -webkit-text-shadow: #000 1px 0 0, #000 0 1px 0,#000 -1px 0 0, #000 0 -1px 0;
  -moz-text-shadow: #000 1px 0 0, #000 0 1px 0,#000 -1px 0 0, #000 0 -1px 0;
  *filter: Glow(color=#000, strength=1);
}

</style>
