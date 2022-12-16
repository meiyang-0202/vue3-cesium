<template>
  <div ref="tooltipcontainer" class="tilt-wrapper" v-show="isVisible">
    <div class="weTiltPanel">
      <div class="weTiltPanel-wrap" :class="classObject">
        <div class="area">
          <div class="b-t"></div>
          <div class="b-r"></div>
          <div class="b-b"></div>
          <div class="b-l"></div>
          <div class="arrow-rb"></div>
          <div class="label-wrap">
            <div class="title">{{ id }}</div>
            <div class="label-content" v-show="!collapseTooltip">
              <div class="data-li" v-for="item in contentAB" :key="item.label">
                <div class="data-label">{{ item.label }}：</div>
                <div class="data-value">
                  <span class="label-num">{{ item.value }}</span
                  ><span>{{ item.unit }}</span>
                </div>
              </div>
              <div class="data-li" v-for="item in contentABC" :key="item.label">
                <div class="data-label">{{ item.label }}：</div>
                <div class="data-value">
                  <span :class="item.class">{{ item.desc }}</span
                  ><span :class="item.class">{{ item.value }} {{ item.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="b-t-l"></div>
        <div class="b-b-r"></div>
      </div>
      <div class="arrow"></div>
    </div>
  </div>
</template>

<script setup lang="ts" name="TiltTootip">
import { ref, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { DefaultStore } from '@/store'

interface Content {
  label: string,
  value: string,
  unit: string
}

const _this = getCurrentInstance() as ComponentInternalInstance
const defaultStore = DefaultStore()

const classObject = ref<string>('weTiltPanel-theme-')
const isVisible = ref<boolean>(true)
const dirty = ref<boolean>(false)
const collapseTooltip = ref<boolean>(true)
const clampToGround = ref<boolean>(true)
const id = ref<string>('')
const _offsetWidth = ref<number>(0)
const _offsetHeight = ref<number>(0)
const contentAB = ref<Content[]>([])
const contentABC = ref<Content[]>([])

onMounted(() => {
  const stationId = _this.proxy?.$attrs.id as string
  id.value = stationId
  const item = defaultStore.tiltToolTips[id.value]
  clampToGround.value = Cesium.defaultValue(item.clampToGround, true)
  classObject.value += item.color
  contentAB.value = Cesium.defaultValue(item.contentAB, [])
  contentABC.value = Cesium.defaultValue(item.contentABC, [])
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
})

const updatePotision = (position: { x: number; y: number }) => {
  const target = _this.refs.tooltipcontainer as any
  const offsetWidth = target.offsetWidth
  const offsetHeight = target.offsetHeight
  if (offsetWidth !== 0) {
    _offsetWidth.value = offsetWidth
    _offsetHeight.value = offsetHeight
  }
  const x: number = position.x
  const y: number = position.y - _offsetHeight.value

  target.style.left = x + 'px'
  target.style.top = y + 'px'
}

const updateScale = (distance: number) => {
  collapseTooltip.value = distance > 50000
  _this.proxy?.$nextTick(() => {
    dirty.value = true
  })
}

const updateContent = (content: { position: any }) => {
  const scratchCartographic = new Cesium.Cartographic()
  const position = content.position
  const cartorgrahic = Cesium.Cartographic.fromCartesian(position, Cesium.Ellipsoid.WGS84, scratchCartographic)
  const longitude = Cesium.Math.toDegrees(cartorgrahic.longitude).toFixed(3)
  const latitude = Cesium.Math.toDegrees(cartorgrahic.latitude).toFixed(3)
  const height = Cesium.Math.toDegrees(cartorgrahic.height).toFixed(1)
  contentAB.value = [
    {
      label: '经度',
      value: `${longitude}`,
      unit: '°'
    },
    {
      label: '纬度',
      value: `${latitude}`,
      unit: '°'
    },
    {
      label: '高度',
      value: `${height}`,
      unit: '米'
    }
  ]
}
</script>

<style lang="less">
@import '../../assets/css/tooltip.less';

.tilt-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
  transform-origin: left bottom 0px;
  z-index: auto;
}
</style>
