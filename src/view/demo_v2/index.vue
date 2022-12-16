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
      <el-select v-model="select_mode" placeholder="请选择" style="width:100%" @change="selectModeChangeEvent">
        <el-option v-for="item in modeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
    </div>
    <div class="block" style="position: absolute;top: 10em;left: 1em;">
      <span class="demonstration">切片模式下滑动动态切片</span>
      <el-slider v-model="valueX" @change="selectSliderChangeEvent"></el-slider>
      <el-slider v-model="valueY" @change="selectSliderChangeEvent"></el-slider>
      <el-slider v-model="valueZ" @change="selectSliderChangeEvent"></el-slider>
    </div>
  </div>
</template>

<script setup lang="ts" name="demo_v2">
import CesiumMap from '@/components/map/CesiumMap.vue'
import { ref, onMounted, getCurrentInstance } from 'vue'

const { ctx } = getCurrentInstance() as any

interface Option {
  value: string,
  label: string
}

const cesiumMapOptions = ref<object>({
  statusBar: false
})
const valueX = ref<number>(0)
const valueY = ref<number>(0)
const valueZ = ref<number>(0)
const select_value = ref<string>('11')
const select_mode = ref<string>('体')
const input = ref<string>('')
const modeOptions = ref<Option[]>([
  {
    value: '切片',
    label: '切片'
  },
  {
    value: '体',
    label: '体'
  }
])
const options = ref<Option[]>([
  {
    value: '11',
    label: '属性模型网格_剪切波速'
  },
  {
    value: '22',
    label: '属性模型网格_固结快剪粘聚力'
  }
])
const vtlimage = ref<any>(null)
// eslint-disable-next-line no-multi-str
const Transfunction_VTK = ref<string>('vec4 v_transfer(float v,float z,bool usePhongLight,vec4 color)\n\
  {\n\
    float smin = statisticMatrix[0][0];\n\
    float smax = statisticMatrix[0][1];\n\
    float saver = statisticMatrix[0][2];\n\
    float filtrationmin = clipMatrix[3][2];\n\
    float filtrationmax = clipMatrix[3][3];\n\
    float svariance = statisticMatrix[0][3];\n\
    float offset = u_attribute[0][1];\n\
    float range = u_attribute[0][2] - u_attribute[0][1];\n\
    v -= offset;\n\
    float index = v/range;\n\
    vec4 fragColor = vec4(0.0,0.0,0.0,0.0); \n\
    vec4 floatColor = texture2D(tfTexture, vec2(index, 0.0)); \n\
    vec4 floatColor0 = texture2D(tfTexture, vec2(index, 1.0)); \n\
    float clampA = floatColor0.x * 255.0; \n\
    float clampB = floatColor0.y * 255.0; \n\
    floatColor.a = index * floatColor.a * (z > 0.0 ? (0.6 - z * 0.4) : 1.0); \n\
    if(index > filtrationmax * 0.01 || index < filtrationmin * 0.01)\n\
    {\n\
      floatColor.a = 0.0;\n\
    }\n\
     ragColor = floatColor; \n\
    return fragColor; \n\
  }\n\
  ')

onMounted(() => {
  const promise = Cesium.Resource.fetchImage('http://127.0.0.1:8083/Assets/rainbow-legend.png')
  promise.then((data: any) => {
    vtlimage.value = data
  })
  bindMVVM()
  loadVolume(select_value.value)
})

const selectSliderChangeEvent = () => {
  const { WE } = window as any
  WE.globalVolumeState.SlicePlaneX = valueX.value / 100.0
  WE.globalVolumeState.SlicePlaneY = valueY.value / 100.0
  WE.globalVolumeState.SlicePlaneZ = valueZ.value / 100.0
}

const makeUrlCallback = () => {
  return 'http://127.0.0.1:8083/Assets/tmpGrid_Time_0.vtk.w3dm'
}

const loadVolume = (name: string) => {
  const { WE } = window as any
  WeatherEarth.Config.CreateTransferTextureFunction = CreateTransferTextureFunctionForStk
  const layername = 'volume'
  WE.layerManager.remove(layername)
  const volumeOptions = {
    name,
    varname: 'vtk',
    ext: 'vtk',
    TransFunction: Transfunction_VTK.value,
    ValueAndColorRamp: WeatherEarth.WeatherVolumeTransfunctions.ValueAndColorRamp_DBZ,
    filterCustom: true,
    makeUrlCallback
  }
  const layer = WE.layerManager.addVolumeLayer(volumeOptions, layername)
  layer.show = true
  layer.showInner = true
}

const CreateTransferTextureFunctionForStk = () => {
  const { WE } = window as any
  if (Cesium.defined(vtlimage.value)) {
    return new Cesium.Texture({
      context: WE.viewer.scene.context,
      source: vtlimage.value
    })
  }
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

const selectChangeEvent = () => {
  loadVolume(select_value.value)
}

const selectModeChangeEvent = () => {
  const { WE } = window as any
  WE.globalVolumeState.displayMode = select_mode.value
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

.demonstration {
  color: #FFFFFF;
}
</style>
