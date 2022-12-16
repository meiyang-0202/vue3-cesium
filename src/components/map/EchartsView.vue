<template>
  <div id="echarts-container" class="Echarts" v-show="show"></div>
</template>

<script setup lang="ts" name="EchartsView">
import * as echarts from 'echarts'
import { ref, onMounted, computed } from 'vue'

const charts = ref<any>(null)
const xAxis = ref<(number | string)[]>([0, 100])
const yAxis = ref<(number | string)[]>([0, 100])
const top = ref<number>(40)
const bottom = ref<number>(20)
const left = ref<number>(50)
const right = ref<number>(20)
const dirty = ref<boolean>(false)
const show = ref<boolean>(false)

const chartOptions = computed(() => {
  const { WE } = window as any
  const gridWidth = WE.WeExt.eagleMap.viewer.container.offsetWidth - left.value - right.value
  const gridHeight = WE.WeExt.eagleMap.viewer.container.offsetHeight - bottom.value - top.value
  const options = {
    grid: [{
      width: gridWidth,
      height: gridHeight,
      top: top.value,
      left: left.value,
      bottom: bottom.value,
      show: true,
      backgroundColor: '#283c55F0'
    }],
    graphic: [{
      type: 'image',
      left: left.value,
      bottom: bottom.value,
      style: {}
    }],
    xAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      axisTick: {
        show: true
      },
      data: xAxis.value
    },
    yAxis: {
      type: 'category',
      boundaryGap: false,
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: ['#fff', 'ccc'],
          opacity: 0.2
        }
      },
      data: yAxis.value
    }
  }
  return options
})

onMounted(() => {
  const { WE } = window as any
  const { eagleMap } = WE.WeExt
  eagleMap.viewer.container.style.opacity = 0.0
  eagleMap.viewer.scene.postRender.addEventListener(() => {
    if (!eagleMap.dirty) {
      return
    }
    if (charts.value === null) {
      const element: HTMLElement = document.getElementById('echarts-container') as HTMLElement
      charts.value = echarts.init(element)
      WE.globalVolumeState.onContentChanged = function() {
        eagleMap.dirty = true
        eagleMap.viewer.scene.requestRender()
      }
    }
    computeXAxis()
    eagleMap.dirty = false
    const options = chartOptions.value
    options.graphic[0].style = {
      image: eagleMap.viewer.scene.canvas,
      width: eagleMap.viewer.container.offsetWidth - left.value - right.value,
      height: eagleMap.viewer.container.offsetHeight - bottom.value - top.value
    }
    charts.value.setOption(options, true, false)
  })
})

const computeXAxis = () => {
  const { WE } = window as any
  show.value = WE && WE.WeExt && WE.WeExt.eagleMap && WE.WeExt.eagleMap.show
  const { bindObject } = WE.WeExt.eagleMap
  xAxis.value = []
  yAxis.value = []
  if (bindObject instanceof WeatherEarth.WeatherLengthWay) {
    if (bindObject.isDestroyed()) {
      return
    }
    const height = bindObject._volume.meter.depth
    const positions = bindObject.positions
    const xmin = Cesium.Math.toDegrees(positions[0])
    const ymin = Cesium.Math.toDegrees(positions[1])
    const xmax = Cesium.Math.toDegrees(positions[2])
    const ymax = Cesium.Math.toDegrees(positions[3])
    const p1 = new Cesium.Cartesian2(xmin, ymin)
    const p2 = new Cesium.Cartesian2(xmax, ymax)
    const n = Cesium.Cartesian2.subtract(p2, p1, new Cesium.Cartesian2())
    const l = Cesium.Cartesian2.magnitude(n)
    Cesium.Cartesian2.normalize(n, n)
    const step = l / 4.0
    for (let i = 0; i < 4; i++) {
      const d = Cesium.Cartesian2.multiplyByScalar(n, i * step, new Cesium.Cartesian2())
      const p = Cesium.Cartesian2.add(p1, d, new Cesium.Cartesian2())
      const label = i < 3 ? `${p.x.toFixed(2)},${p.y.toFixed(2)}` : ''
      xAxis.value.push(label)
    }

    const length = Math.floor(height * 0.001)
    yAxis.value = []
    for (let i = 0; i < length + 1; i++) {
      const label = i % 2 === 1 ? `${i}km` : ''
      yAxis.value.push(label)
    }
    yAxis.value = []
    yAxis.value.push('0.5')
    yAxis.value.push('1.0')
    yAxis.value.push('1.5')
    yAxis.value.push('2.0')
    yAxis.value.push('2.5')
    yAxis.value.push('3.0')
    yAxis.value.push('3.5')
    yAxis.value.push('4.0')
    yAxis.value.push('4.5')
    yAxis.value.push('5.0')
    yAxis.value.push('5.5')
    yAxis.value.push('6.0')
    yAxis.value.push('7.0')
    yAxis.value.push('8.0')
    yAxis.value.push('9.0')
    yAxis.value.push('10.0')
    yAxis.value.push('12.0')
    yAxis.value.push('14.0')
    yAxis.value.push('15.5')
    yAxis.value.push('17.0')
    yAxis.value.push('19.0')
  }
}
</script>

<style scoped lang="less">
.Echarts {
  position: absolute;
  right: 390px;
  bottom: 40px;
  width: 740px;
  height: 400px;
  pointer-events: none;
}
</style>
