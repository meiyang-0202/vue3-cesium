<template>
  <div class="color-line" v-show="weState._showVolumeButton">
    <div class="btnWraper">
      <div class="toolbar-button">
        <el-button
          size="large"
          :round="true"
          @click="handleParams"
          :style="{ color: showParams?'#3a8ee6':'#606266', borderColor: showParams?'#3a8ee6':'#DCDFE6' }">参数
        </el-button>
      </div>
      <div class="toolbar-button">
        <el-button
          size="large"
          :round="true"
          @click="handleCommand('actionLineClip')">剖切
        </el-button>
      </div>
      <div class="toolbar-button">
        <el-button
          size="large"
          :round="true"
          @click="handleCommand('actionRectClip')">区域
        </el-button>
      </div>
      <div class="toolbar-button">
        <el-button
          size="large"
          :round="true"
          @click="handleCommand('actionRectFloor')">分层
        </el-button>
      </div>
      <div class="toolbar-button">
        <el-button
          size="large"
          :round="true"
          @click="handleCommand('actionClear')">清除
        </el-button>
      </div>
    </div>

    <div class="legend-box">
      <div class="legend-text"><span>透明度</span></div>
      <div class="legend-line legend-line1">
        <el-slider v-model="layerAlpha" :max="1.0" :min="0.0" :step="0.01" @input="changelayerAlpha"></el-slider>
      </div>
    </div>

    <div v-if="hierarchyScaleZSlider" class="legend-box">
      <div class="legend-text"><span>分层缩放</span></div>
      <div class="legend-line legend-line1">
        <el-slider v-model="hierarchyScaleZ" :max="100" :min="1" :step="1" @input="changeHierarchyScaleZ"></el-slider>
      </div>
    </div>

    <div v-if="hierarchyScaleZSlider" class="legend-box legend-box2">
      <div class="legend-list legend-list3">
        <div class="legend-bar"><span>Z</span></div>
        <div class="legend-line legend-line3">
          <el-slider v-model="valueZ" :max="100.0" :step="1" @input="changePlaneZ"></el-slider>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="VolumeToolbar">
import { ref } from 'vue'
import { WeStore } from '@/store/modules/weState'

const weState = WeStore()

interface DrawObject {
  geometry: Cartographic[]
}
interface Cartographic {
  height: number,
  latitude: number,
  longitude: number
}

const layerAlpha = ref<number>(1.0)
const hierarchyScaleZ = ref<number>(10.0)
const hierarchyScaleZSlider = ref<boolean>(false)
const valueZ = ref<number>(0.0)
const showParams = ref<boolean>(false)

const handleCommand = (command: string) => {
  if (command === 'actionLineClip') {
    lineClip()
  } else if (command === 'actionRectClip') {
    rectClip()
  } else if (command === 'actionRectFloor') {
    rectFloor()
  } else if (command === 'actionClear') {
    clearAll()
  }
}

const handleParams = () => {
  showParams.value = !showParams.value
  const { WE } = window as any
  if (showParams.value) {
    WE.handlerManager.startPickVolume()
  } else {
    WE.handlerManager.stop()
  }
}

const lineClip = () => {
  const { WE } = window as any
  const collection = WE.layerManager.getVolumeLayerCollection()
  if (collection.length === 0) {
    return
  }

  const promise = WE.handlerManager.startDraw({
    type: 'line'
  })
  WeatherEarth.Config.AxesFloorsRatio = [0.0, 0.05, 0.1, 0.15, 0.2, 0.4, 0.7, 1.0]

  promise.then((drawObject: DrawObject) => {
    WE.handlerManager.stop()
    const geometry = drawObject.geometry
    const firstPosition = geometry[0]
    const secondPosition = geometry[1]
    const positions = [
      firstPosition.longitude, firstPosition.latitude,
      secondPosition.longitude, secondPosition.latitude
    ]

    const extraOptions = {
      EditablePoint: true,
      showGrid: true
    }
    const noCheckExtent = collection.length === 1
    collection.forEach((layer: any) => {
      if (noCheckExtent || (Cesium.Rectangle.contains(layer.rectangle, firstPosition) &&
            Cesium.Rectangle.contains(layer.rectangle, secondPosition))) {
        const lengthWay = layer.weatherVolume.addLengthWay(positions, extraOptions)
        if (Cesium.defined(lengthWay) && Cesium.defined(WE.WeExt.eagleMap)) {
          lengthWay.onUpdate = function() {
            WE.WeExt.eagleMap.requestRender()
          }
          lengthWay.onDestroy = function() {
            WE.WeExt.eagleMap.clear()
            WE.WeExt.eagleMap.requestRender()
            WE.WeExt.eagleMap.show = false
          }

          const sampler = new Cesium.Sampler({
            wrapS: Cesium.TextureWrap.CLAMP_TO_EDGE,
            wrapT: Cesium.TextureWrap.CLAMP_TO_EDGE,
            minificationFilter: Cesium.TextureMinificationFilter.NEAREST,
            magnificationFilter: Cesium.TextureMagnificationFilter.NEAREST
          })
          WE.WeExt.eagleMap.bindVolumeLayer({ layer, slice: lengthWay, sampler })
          WE.WeExt.eagleMap.show = true
        }
      }
    })
    WE.handlerManager.startEdit()
  })
}

const rectFloor = () => {
  const { WE } = window as any
  const collection = WE.layerManager.getVolumeLayerCollection()
  if (collection.length === 0) {
    return
  }

  const promise = WE.handlerManager.startDraw({
    type: 'rectangle'
  })

  promise.then((drawObject: DrawObject) => {
    WE.globalVolumeState.childState.offsetZ = 1000.0
    const rectangle = drawObject.geometry
    collection.forEach((layer: any) => {
      layer.weatherVolume.hierarchy(rectangle)
      hierarchyScaleZSlider.value = true
    })
  })
}

const rectClip = () => {
  const { WE } = window as any
  // WE.globalVolumeState.childState.showGrid = true;
  const collection = WE.layerManager.getVolumeLayerCollection()
  if (collection.length === 0) {
    return
  }

  const promise = WE.handlerManager.startDraw({
    type: 'rectangle'
  })

  promise.then((drawObject: DrawObject) => {
    const rectangle = drawObject.geometry
    WE.globalVolumeState.childState.offsetZ = 1000.0
    collection.forEach((layer: any) => {
      layer.addChildVolume(rectangle)
    })
  })
}

const clearAll = () => {
  const { WE } = window as any
  const collection = WE.layerManager.getVolumeLayerCollection()
  collection.forEach((layer: any) => {
    layer.removeChildVolume()
    layer.weatherVolume.clearLengthWay()
    layer.weatherVolume.hierarchy(undefined)
  })
  WE.handlerManager.stop()
  hierarchyScaleZSlider.value = false
}

const changeHierarchyScaleZ = (value: number) => {
  const { WE } = window as any
  if (Cesium.defined(WE)) {
    WE.globalVolumeState.hierarchyScaleZ = value
  }
}

const changePlaneZ = (value: number) => {
  const { WE } = window as any
  const collection = WE.layerManager.getVolumeLayerCollection()
  collection.forEach((layer: any) => {
    if (Cesium.defined(layer.weatherVolume) && Cesium.defined(layer.weatherVolume._hierarchy)) {
      layer.weatherVolume._hierarchy.showAtHeight = value * 0.01
    }
  })
}

const changelayerAlpha = (value: number) => {
  const { WE } = window as any
  const collection = WE.layerManager.getVolumeLayerCollection()
  collection.forEach((layer: any) => {
    layer.alpha = value
  })
  // test
  // WE.globalVolumeState.SlicePlaneX_Visible = false;
  // WE.globalVolumeState.SlicePlaneY_Visible = false;
  // WE.globalVolumeState.SlicePlaneZ_Visible = false;
  // WE.globalVolumeState.SlicePlaneX = value;
  // WE.globalVolumeState.SlicePlaneY = value;
  // WE.globalVolumeState.SlicePlaneZ = value;
  // WE.globalVolumeState.scaleZ = Cesium.Math.clamp(value * 20, 1.0, 100.0);
  // WE.globalVolumeState.showGrid = value > 0.5;
  // WE.globalVolumeState.childState.showGrid = value > 0.5;
}
</script>

<style lang="less" scoped>
.legend-line .el-slider__runway {
  margin-top: 0.375rem;
  background-color: #5a5959;
}

.legend-line .el-slider__bar {
  background-color: #1b70b0;
}

.legend-list1 .legend-bar,
.legend-list1 .el-slider__bar {
  background-color: #1b70b0;
}

.legend-list2 .legend-bar,
.legend-list2 .el-slider__bar {
  background-color: #fa2f57;
}

.legend-list3 .legend-bar,
.legend-list3 .el-slider__bar {
  background-color: #ff9d30;
}

.legend-line .el-slider__marks-text {
  color: #fff;
  font-size: 0.75rem;
  margin-top: 0.875rem;
}

:deep(.legend-line1 .el-slider__runway), .legend-line2 .el-slider__runway {
  width: calc(100% - 2rem) !important;
  margin: calc(1rem - 3px) 1rem !important;
}

:deep(.legend-line3) {
  .el-slider__runway {
    float: left;
    width: calc(100% - 2rem) !important;
    margin: calc(1rem - 3px) 1rem !important;
  }

  .el-slider__input {
    margin: 0;
  }
}
</style>

<style lang="less" scoped>
.color-line {
  position: absolute;
  right: 10px;
  bottom: calc(50px + 4rem);
  width: 23.5rem;
  z-index: 999;
  pointer-events: none;

  .btnWraper {
    margin-bottom: 1.5rem;
    margin-left: 18rem;
    width: fit-content;

    .toolbar-button {
      margin-bottom: 0.5rem;
      pointer-events: auto;
    }
  }

  .legend-box {
    min-height: 2rem;
    padding-left: 0.75rem;
    margin-bottom: 0.075rem;
    background-color: rgba(30, 30, 30, 0.8);
    pointer-events: auto;

    .legend-text {
      float: left;
      line-height: 2rem;
      color: #ffffff;

      span {
        font-size: 0.875rem;
      }

      pointer-events: none;
    }

    .legend-line {
      float: right;
      width: 16rem;
      height: 2rem;
      margin-right: 0.75rem;

      :deep(.el-slider) {
        height: 2rem;
      }
    }

    :deep(.el-checkbox) {
      float: left;
      height: 20px;
      margin: calc(1rem - 9px) 1em calc(1rem - 11px) 0;
      font-size: 1rem;
    }

    .legend-line1 {
      width: calc(100% - 4rem);
      margin-right: 0;
    }

    .legend-line2 {
      float: right;
      width: 13rem;
      height: 2rem;
      margin-right: 1.575rem;

      .el-slider {
        height: 2rem;
      }
    }

    .legend-list {
      height: 2rem;

      .legend-bar {
        float: left;
        width: 2rem;
        height: 2rem;
        line-height: 2rem;
        color: #fff;
        text-align: center;
        cursor: pointer;
      }

      .el-input-number {
        float: right;
      }
    }

    .legend-line3 {
      float: left;
      width: 21.5rem;
      height: 2rem;
      margin-right: 0;

      :deep(.el-slider) {
        height: 2rem;
      }
    }
  }

  .legend-box2 {
    padding: 0;
  }

  .wrapper {
    position: relative;
    height: 4rem;
    padding: 1rem 0;
    margin-top: 1rem;
    background-color: rgba(30, 30, 30, 0.8);
    font-size: 0.875rem;
  }
}
</style>
