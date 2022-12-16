<template>
  <div class='radar-slider'>
    <el-button
      :icon="CaretLeft"
      link
      @click='changeLastRadar'
    ></el-button>
    <el-button
      :icon="VideoPlay"
      link
      v-if="!judge"
      @click="play"
    ></el-button>
    <el-button
      :icon="VideoPause"
      link
      v-else
      @click="stop"
    ></el-button>
    <el-button
      :icon="CaretRight"
      link
      @click='changeNextRadar'
    ></el-button>

    <el-date-picker
      style="width: 130px;margin-right: 20px;margin-left: 12px"
      v-model="date"
      type="date"
      format="YYYY-MM-DD"
      value-format="YYYY-MM-DD"
      @change="changeRadarTime"
      placeholder="选择日期"
    ></el-date-picker>

    <el-slider
      v-model="index"
      :max='max'
      :min='0'
      :step="1"
      :format-tooltip="formatTime"
      :marks='marks'
      @change="changeRadarIndex"
    ></el-slider>
  </div>
</template>

<script setup lang="ts" name="RadarSlider">
import { ref, withDefaults, watch } from 'vue'
import { CaretLeft, VideoPause, VideoPlay, CaretRight } from '@element-plus/icons-vue'
import moment from 'moment'

interface Props {
  allTimeList?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  allTimeList: () => [] as []
})

const emits = defineEmits(['change'])

const judge = ref<boolean>(false)
const index = ref<number>(0)
const marks = ref<any>({})
const max = ref<number>(0)
const interval = ref<any>(null)
const timeList = ref<string[]>([])
const date = ref<string>('')

watch(props, () => {
  const { allTimeList } = props
  date.value = moment(allTimeList[allTimeList.length - 1]).format('YYYY-MM-DD')
  initData()
})

const initData = () => {
  const arr: string[] = []
  const markObj: any = {}
  const { allTimeList } = props
  if (timeList.value.length !== 0) {
    timeList.value = []
  }
  allTimeList.forEach((item) => {
    if (moment(item).format('YYYY-MM-DD') === date.value) {
      timeList.value.push(moment(item).format('HH:mm'))
      arr.push(item)
    }
  })
  for (let i = 0; i <= arr.length - 1; i++) {
    let text = ''
    if (moment(arr[i]).format('mm') === '00') {
      text = moment(arr[i]).format('HH')
    }
    markObj[i] = {
      style: { color: '#FFF' },
      label: text
    }
  }
  max.value = timeList.value.length - 1
  marks.value = markObj
  if (index.value > max.value) {
    index.value = max.value
  } else {
    index.value = timeList.value.length - 1
  }
}

const changeRadarTime = () => {
  initData()
  triggerEmit()
}

const changeRadarIndex = (val: number) => {
  index.value = val
  triggerEmit()
}

const formatTime = (val: number) => {
  return date.value + ' ' + timeList.value[val]
}

const changeLastRadar = () => {
  if (index.value < 1) {
    return
  }
  index.value -= 1
  triggerEmit()
}

const changeNextRadar = () => {
  if (index.value >= timeList.value.length - 1) {
    return
  }
  index.value += 1
  triggerEmit()
}

const play = () => {
  judge.value = true
  interval.value = setInterval(() => {
    if (index.value === timeList.value.length - 1) {
      stop()
    }
    changeNextRadar()
  }, 3000)
}

const stop = () => {
  judge.value = false
  clearInterval(interval.value)
}

const triggerEmit = () => {
  emits('change', date.value + ' ' + timeList.value[index.value])
}
</script>

<style scoped lang='less'>
.radar-slider {
  position: absolute;
  bottom: 30px;
  left: 12px;
  display: flex;
  align-items: center;
  width: 1440px;
  height: 70px;
  background-color: rgba(0, 23, 50, 0.7);
  padding: 0 12px;

  :deep(.el-button) {
    font-size: 24px;
    padding: 0;
    color: #FFFFFF;
  }

  .el-slider {
    flex: 1;
    margin-top: -20px;

    :deep(.el-slider__bar) {
      background-color: #6982b6;
    }

    :deep(.el-slider__stop) {
      background-color: #FFFFFF;
      border-radius: 0;
      top: 6px;
      width: 1px;
      height: 7px;
    }

    :deep(.el-slider__stop:nth-child(10n+1)) {
      height: 14px;
    }

    :deep(.el-slider__marks-text) {
      margin-top: 20px;
    }
  }
}
</style>
