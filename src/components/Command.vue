<template>
  <div style="position:absolute;left:40%;bottom: 10%" v-show="showCommand">
    <el-input
      ref="inputRef"
      v-model="input"
      placeholder="指令"
      :fetch-suggestions="querySearch"
      :trigger-on-focus="false"
      @select="handleSelect"
      :select-when-unmatched="true"
      :popper-append-to-body="false"
    ></el-input>
  </div>
</template>

<script setup lang="ts" name="Command">
import { ref, onMounted, computed, getCurrentInstance, Ref } from 'vue'
import { DefaultStore } from '@/store/index'

const defaultStore = DefaultStore()
const { ctx } = getCurrentInstance() as any

interface Command {
  value: string,
  command: string
}
interface EventKey {
  keyCode: number,
  which: number,
  charCode: number
}
interface Positions {
  x: number,
  y: number,
  z: number
}

const restaurants = ref<Command[]>([
  { value: 'to 3dtiles', command: 'actionObj23dtiles' },
  { value: 'to kml', command: 'actionConvertKML' },
  { value: 'to obj', command: 'actionConvertObj' }
])
const input = ref<string>('')

const showCommand = computed(() => {
  return defaultStore.showCommand
})

onMounted(() => {
  document.addEventListener('keyup', enterKey)
})

const excuteCommand = () => {
  let command = input.value.trim()
  if (command !== '') {
    Object.keys(restaurants.value).forEach((key) => {
      const keys = Number(key)
      const v = restaurants.value[keys]
      if (v.value === command) {
        command = v.command
        // eslint-disable-next-line no-eval
        eval(command)
      }
    })
    const { WE } = window as any
    if (command === 'travel world') {
      WE.travelWorld()
    } else if (command === 'clear') {
      clear2()
    } else if (command === 'slice') {
      slice()
    } else if (command.startsWith('v ')) {
      setProperty(command)
    }
  }
}

const enterKey = (event: EventKey) => {
  const componentName = ctx.$options.name
  if (componentName === 'Command') {
    const code = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode
    if (code === 13) {
      const showCommand = !defaultStore.showCommand
      if (showCommand) {
        defaultStore.showCommand = showCommand
        ctx.$nextTick(() => {
          input.value = ''
          if (ctx.$refs.inputRef) {
            ctx.$refs.inputRef.focus()
          }
        })
      } else {
        defaultStore.showCommand = showCommand
        ctx.$nextTick(() => {
          excuteCommand()
        })
      }
    } else if (code === 27) {
      defaultStore.showCommand = false
    }
  }
}

const querySearch = (queryString: string, cb: (arg0: { value: string; command: string }[] | Ref<{ value: string; command: string }[]>) => void) => {
  const restaurantArr = restaurants.value
  const results = queryString ? restaurantArr.filter(createFilter(queryString)) : restaurants
  cb(results)
}

const createFilter = (queryString: string) => {
  return (restaurant: { value: string }) => restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
}
const handleSelect = (item: Command) => {
  if (item && item.command) {
    input.value = item.command
  }
}

const slice = () => {
  const { WE } = window as any
  const activeVolume = WE.weatherVolumeManager.activeVolume

  if (!Cesium.defined(activeVolume)) {
    return
  }

  activeVolume.clearLengthWay()
  WE.weatherVolumeManager.clearState()

  WE.globalVolumeState.displayMode = 'Slice'
  WE.globalVolumeState.SlicePlaneX = 0.0
  WE.globalVolumeState.SlicePlaneY_Unit = 1.0
  WE.globalVolumeState.SlicePlaneZ = 0.0

  const promise = WE.handlerManager.startDraw({
    handleType: 'line'
  })

  promise.then((pointPositions: Positions[]) => {
    WE.handlerManager.stop()
    const firstPosition = Cesium.Cartographic.fromCartesian(
      new Cesium.Cartesian3(pointPositions[0].x, pointPositions[0].y, pointPositions[0].z)
    )
    const secondPosition = Cesium.Cartographic.fromCartesian(
      new Cesium.Cartesian3(pointPositions[1].x, pointPositions[1].y, pointPositions[1].z)
    )
    const positions = [firstPosition.longitude, firstPosition.latitude, secondPosition.longitude, secondPosition.latitude]
    WE.weatherVolumeManager.childLengthWayPositions = positions
    activeVolume.addLengthWay(positions)
    WE.handlerManager.startEdit()
  })
}

const setProperty = (command: string) => {
  const { WE } = window as any
  const activeVolume = WE.weatherVolumeManager.activeVolume
  if (Cesium.defined(activeVolume)) {
    command = command.replace('v ', '')
    const sv = command.split('=')
    if (sv.length === 2) {
      const pro = sv[0].trim()
      const value = sv[1].trim()
      WE.globalVolumeState[pro] = value === 'false' ? false : value === 'true' ? true : value
    }
  }
}

const clear2 = () => {
  const { WE } = window as any
  const activeVolume = WE.weatherVolumeManager.activeVolume
  if (Cesium.defined(activeVolume)) {
    const removedChild = WE.weatherVolumeManager.removeById(activeVolume.name + '_child')
    if (activeVolume._lengthway || activeVolume._hierarchy || removedChild) {
      activeVolume.clearLengthWay()
      activeVolume.hierarchy(undefined)
    } else {
      WE.weatherVolumeManager.clear()
    }
  } else {
    WE.weatherVolumeManager.clearState()
  }
  WE.handlerManager.stop()
}
</script>

<style scoped lang="less">
.el-input {
  width: 330px;
}
</style>
