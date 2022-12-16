<template>
  <div class="main-content">
    <div class="wrapper">
      <CesiumMap :cesium-map-options="cesiumMapOptions"></CesiumMap>
    </div>
    <div style="position: absolute;top: 1em;left: 1em;">
      <el-select v-model="select_value" placeholder="请选择" style="width:100%" @change="selectChangeEvent">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <div style="position: absolute;top: 5em;left: 1em;">
      <el-button @click="play">播放</el-button>
    </div>
    <div style="position: absolute;top: 11em;left: 1em;">
      <el-input v-model="input" v-show="showplay"></el-input>
    </div>
    <div class="legend" v-show="weStore._showLengend&&window.WE">
      <wl-color-legend :colorArr="weStore._lengedColorArray" @change="slideChangeEvent"></wl-color-legend>
    </div>
    <Command/>
  </div>
</template>

<script setup lang="ts" name="demo_v">
import { ref, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue'
import CesiumMap from '@/components/map/CesiumMap.vue'
import Command from '../../components/Command.vue'
import { getWeatherVolumeOptions } from '@/utils/volume'
import { WeStore } from '@/store/modules/weState'

const weStore = WeStore()
const { ctx } = getCurrentInstance() as any

interface Option {
  value: string,
  label: string
}

const cesiumMapOptions = ref<object>({
  statusBar: false
})
const select_value = ref<string>('eastward_wind')
const input = ref<string>('')
const showplay = ref<boolean>(false)
const options = ref<Option[]>([
  {
    value: 'eastward_wind',
    label: 'eastward_wind'
  },
  {
    value: 'geopotential_height',
    label: 'geopotential_height'
  },
  {
    value: 'specific_humidity',
    label: 'specific_humidity'
  },
  {
    value: 'lagrangian_tendency_of_air_pressure',
    label: 'lagrangian_tendency_of_air_pressure'
  },
  {
    value: 'air_temperature',
    label: 'air_temperature'
  }
])

onMounted(() => {
  const { WE } = window as any
  WE.viewer.imageryLayers.addImageryProvider(WeatherEarth.CommonLayers._TDT_Cia)
  bindMVVM()
  loadVolume(select_value.value)
})

const loadVolume = (type: string) => {
  window.WE
  const { WE } = window as any
  showplay.value = false
  WE.weatherVolumeManager.clearAll()
  // WE.globalVolumeState.filtrationMin = 0
  // WE.globalVolumeState.filtrationMax = 100
  switch (type) {
    case 'temperature':
      // WE.globalVolumeState.filtrationMin = -100
      WE.globalVolumeState.displayMode = 'Cube'
      WE.globalVolumeState.scaleZ = 4.0
      WE.globalVolumeState.Sample = '线性'
      break
    case 'humidity':
      // WE.globalVolumeState.displayMode = 'Cube'
      // WE.globalVolumeState.scaleZ = 4.0
      // WE.globalVolumeState.Sample = '线性'
      break
    case 'dbz':
      WE.globalVolumeState.displayMode = 'Slice'
      WE.globalVolumeState.SlicePlaneZ = 0.0
      WE.globalVolumeState.scaleZ = 1.0
      WE.globalVolumeState.offsetZ = 500.0
      WE.globalVolumeState.summationInEdge = true
      WE.globalVolumeState.Sample = '线性'
      break
    case 'sa':
      WE.globalVolumeState.displayMode = 'Cone'
      WE.globalVolumeState.Sample = '邻近'
      WE.globalVolumeState.scaleZ = 4.0
      WE.globalVolumeState.summationInEdge = true
      break
    case 'swan':
      WE.globalVolumeState.displayMode = 'Cube'
      WE.globalVolumeState.Sample = '线性'
      break
    default:
      WE.globalVolumeState.scaleZ = 400
  }
  const options = getWeatherVolumeOptions(type)
  options.name = type + '_00'
  WE.weatherVolumeManager.add(getWeatherVolumeOptions(type), (_weatherVolume: any) => {
    weStore._showLengend = false
  })
}

const play = () => {
  const { WE } = window as any
  const type = select_value.value
  const options = getWeatherVolumeOptions(type)
  WE.weatherVolumeManager.clearAll()
  WE.globalVolumeState.summationInEdge = true
  WE.globalVolumeState.SlicePlaneZ_Visible = true
  const ncs = []

  for (let i = 0; i < 5; i++) {
    ncs.push(type + '_0' + i)
  }

  WE.globalVolumeState.childState.mode = Cesium.Volume.Mode.Cube
  WE.globalVolumeState.childState.showGrid = false
  WE.globalVolumeState.childState.offsetZ = 1000.0
  WE.globalVolumeState.childState.transparencyValue = 0.8

  const schedule = WE.weatherVolumeManager.createSchedule({
    remoteUrl: options.url,
    urls: ncs,
    varname: '4F02610A',
    ext: 'npy',
    Transfunction: options.TransFunction,
    ValueAndColorRamp: options.ValueAndColorRamp
  })

  schedule._onLoadNew = function(newValue: string, _oldValue: any) {
    input.value = newValue
  }

  showplay.value = true
}

const bindMVVM = () => {
  const { WE } = window as any
  const properties: string[] = [
    'filtrationMin',
    'filtrationMax',
    'transparencyValue',
    'scaleZ',
    'onPick',
    'showMovable',
    'showGrid',
    'SlicePlaneX',
    'SlicePlaneY',
    'SlicePlaneZ',
    'SlicePlaneX_Visible',
    'SlicePlaneY_Visible',
    'SlicePlaneZ_Visible',
    'displayMode',
    'quality',
    'lighting',
    'Sample',
    'summationInEdge',
    'offsetZ'
    // 'onDemWhenHeightZero'
  ]
  ctx.$nextTick(() => {
    if (Cesium.defined(WE)) {
      const mvvm = WE.globalVolumeState
      properties.forEach((pro) => mvvm.bind(undefined, mvvm, pro))
    }
  })
}

const slideChangeEvent = (valueArr: any[]) => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    WE.globalVolumeState.filtrationMin = valueArr[0]
    WE.globalVolumeState.filtrationMax = valueArr[1]
  }
}

const selectChangeEvent = () => {
  loadVolume(select_value.value)
}

const clearAll = () => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    WE.weatherVolumeManager.clear()
  }
}
</script>

<style scoped lang="less">
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 35em;
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

.el-select-dropdown {
  max-width: 10%;
}
</style>
