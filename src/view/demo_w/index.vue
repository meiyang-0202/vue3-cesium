<template>
  <div class="main-content">
    <div class="wrapper">
      <CesiumMap :cesium-map-options="cesiumMapOptions"></CesiumMap>
    </div>
    <div id="my-gui-container" style="position: absolute;top: 1em;left: 1em;" v-show="false"></div>
    <div class="legend" v-if="weStore._showLengend">
      <wl-color-legend :colorArr="weStore._lengedColorArray" @change="slideChangeEvent"></wl-color-legend>
    </div>
    <div style="position: absolute;top: 11em;left: 1em;" v-show="false">
      <button @click="clearAll">清除</button>
    </div>
    <Command />
  </div>
</template>

<script setup lang="ts" name="demo_w">
import CesiumMap from '@/components/map/CesiumMap.vue'
import Command from '@/components/Command.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'
import { WeStore } from '@/store/modules/weState'

const weStore = WeStore()
const { ctx } = getCurrentInstance() as any

const cesiumMapOptions = ref<object>({
  statusBar: false
})

onMounted(() => {
  const { WE } = window as any
  loadVolume('humidity')
  WE.viewer.scene._terrainExaggeration = 50.0
  WE.viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
    url: `${import.meta.env.VITE_APP_TJURL}155/Assets/ggter/`
  })
})

const loadVolume = (type: string) => {
  const { WE } = window as any
  const nc = {
    name: 'eastward_wind_00',
    varname: '2639B195',
    ext: 'npy',
    url: `${import.meta.env.VUE_APP_TJURL}OCserver/p/OC?method=nc&f=html&param={0}%3B{1}%3B{2}`
  }
  const windLayer = WE.layerManager.addWindLayer(nc, '风场')
  windLayer.showAnimation = true
  windLayer.disableGlobelDepth = true
  windLayer.alpha = 0.5
  windLayer.sliceZ = 0.7
  windLayer.panel.maxParticles = 256 * 256
  windLayer.panel.dropRateBump = 0.0
  windLayer.scaleHeight = 400.0
  windLayer.filtrationMin = 6.0

  jumpto()
  WE.debugShowFramesPerSecond = false

  const leftBtn = ctx.$el.querySelector('.legend .wl-color-legend .color-box .color-btn.left')
  ctx.$nextTick(() => {
    ctx.$nextTick(() => {
      leftBtn.style.left = 110 - leftBtn.clientWidth * 0.5 + 'px'
    })
  })
}

const slideChangeEvent = (valueArr: any[]) => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    WE.globalVolumeState.filtrationMin = valueArr[0]
    WE.globalVolumeState.filtrationMax = valueArr[1]

    const windLayer = WE.layerManager.getById('风场')
    windLayer.filtrationMin = valueArr[0]
    windLayer.filtrationMax = valueArr[1]
  }
}

const clearAll = () => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    WE.weatherVolumeManager.clear()
  }
}

const jumpto = () => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    const vjson = '{longitude:1.894532847256766,latitude:0.14176301300629043,height:1109309.6881067294,heading:6.1793995683016245,pitch:-0.6056262713696681,roll:0.00020313220599277315}'
    // eslint-disable-next-line no-eval
    const options = eval('(' + vjson + ')')
    const vp = new WeatherEarth.ViewPoint(options)
    WE.viewer.camera.flyTo({
      alt: undefined, clone(): LatLng {
        return undefined
      }, distanceTo(otherLatLng: LatLngExpression): number {
        return 0
      }, equals(otherLatLng: LatLngExpression, maxMargin: number | undefined): boolean {
        return false
      }, lat: 0, lng: 0, toBounds(sizeInMeters: number): LatLngBounds {
        return undefined
      }, toString(): string {
        return ''
      }, wrap(): LatLng {
        return undefined
      },
      destination: vp.cartesion3,
      orientation: {
        heading: vp.heading,
        pitch: vp.pitch,
        roll: vp.roll
      },
      duration: 5.0
    })
  }
}
</script>

<style scoped lang="less">
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 36em;
  height: 4em;
  background-color: rgba(30, 30, 30, 0.8);
  color: #ffffff;
  display: flex;
  align-items: center;
  user-select: none;
}

.wrapper {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  margin: 0;

  .main-content {
    height: 100%;
    position: relative;
  }
}
</style>
