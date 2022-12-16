<template>
  <div :class="props.wrapperClass">
    <div class="color-box">
      <div class="color-btn left" v-show="props.showSlider"></div>
      <div class="color-btn right" v-show="props.showSlider"></div>
      <div
        v-for="(item, index) in props.colorArr"
        :key="index"
        :style="{ background: props.colorType==='none'?item.color:'transparent' }"
        class="color-list">
        <div class="color-text">{{ item.value }}</div>
      </div>
      <div class="linear-color" v-if="props.colorType==='linear'"></div>
    </div>
  </div>
</template>

<script setup lang="ts" name="volumeColorCard">
import $ from 'jquery'
import { ref, withDefaults, onMounted, getCurrentInstance, onBeforeUnmount, watch } from 'vue'

interface MoveInfo {
  x: number,
  y: number,
  l: number,
  t: number,
  isDown: boolean,
  value: null
}
interface Color {
  color: string,
  value: number
}
interface Props {
  wrapperClass?: string,
  colorArr?: Color[],
  wrapperWidth?: string,
  colorType?: string,
  showSlider?: boolean
}
interface EventInfo {
  button: number,
  clientX: number,
  clientY: number
}

const props = withDefaults(defineProps<Props>(), {
  wrapperClass: '',
  wrapperWidth: '360',
  colorType: 'none',
  colorArr: () => [] as [],
  showSlider: true
})
const emits = defineEmits(['volumeColorFilter'])
const { ctx } = getCurrentInstance() as any

const right = ref<MoveInfo>({
  x: 0,
  y: 0,
  l: 0,
  t: 0,
  isDown: false,
  value: null
})
const left = ref<MoveInfo>({
  x: 0,
  y: 0,
  l: 0,
  t: 0,
  isDown: false,
  value: null
})
const slideValue = ref<[number, number]>([0, 100])

watch(props, () => {
  ctx.$nextTick(() => {
    initColorList()
  })
}, { deep: true })

onMounted(() => {
  ctx.$nextTick(() => {
    initColorList()
    bindControllerMoveEvent()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('onmousemove', moveRightEvent)
  window.removeEventListener('onmousemove', moveLeftEvent)
})

const initColorList = () => {
  const {
    colorArr,
    wrapperClass,
    wrapperWidth,
    colorType
  } = props
  const colorBox = $('.' + wrapperClass + ' .color-box')
  colorBox.css({ width: `${wrapperWidth}px` })
  const colorList = $('.' + wrapperClass + ' .color-box .color-list')
  const unitWidth = Number(wrapperWidth) / (colorArr.length - 1)
  colorList.css('width', `${unitWidth}px`)

  if (colorType === 'linear') {
    let fullColor = ''
    const average = 100 / (colorArr.length - 2)
    for (let i = 1; i < colorArr.length; i++) {
      const colors = ` ${colorArr[i].color} ${(i - 1) * average}%,`
      fullColor = `${fullColor}${colors}`
    }
    const linearColor = `linear-gradient(90deg, ${fullColor.substring(0, fullColor.length - 1)})`
    const linearBox = $('.' + wrapperClass + ' .color-box .linear-color')
    linearBox.css({
      width: `${wrapperWidth}px`,
      background: linearColor
    })
  }

  $(colorList[0]).css({ width: '0px', marginLeft: '-5px' })
  $(colorList[0])
    .find('.color-text')
    .css({ left: '-' + unitWidth / 8 + 'px' })

  const leftBtn = $('.' + wrapperClass + ' .color-box .color-btn.left') as any
  leftBtn.css('left', -leftBtn.width() * 0.5 + 'px')
  $('.' + wrapperClass + ' .color-box .color-btn.right')
    .css('left', Number(wrapperWidth) - leftBtn.width() * 0.5 + 'px')
}

/**
 * 拖动事件
 */
const bindControllerMoveEvent = () => {
  const goRight = document.querySelector('.' + props.wrapperClass + ' .color-box .color-btn.left') as any
  const goLeft = document.querySelector('.' + props.wrapperClass + ' .color-box .color-btn.right') as any
  // 右滑事件绑定
  goRight.onmousedown = (event: EventInfo) => {
    // 鼠标按下事件
    if (event.button === 0) {
      // 获取x坐标和y坐标
      right.value.x = event.clientX
      right.value.y = event.clientY
      // 获取左部和顶部的偏移量
      right.value.l = goRight.offsetLeft
      right.value.t = goRight.offsetTop
      // 开关打开
      right.value.isDown = true

      // 这里最好用window的移动事件监听
      window.onmousemove = moveRightEvent
      // 鼠标抬起事件
      window.onmouseup = function() {
        // 开关关闭
        right.value.isDown = false

        // 清不掉...
        window.removeEventListener('onmousemove', moveRightEvent)
        $(window).unbind('onmousemove')
      }
    }
    return false
  }
  // 左滑事件绑定
  goLeft.onmousedown = (event: EventInfo) => {
    // 鼠标按下事件
    if (event.button === 0) {
      // 获取x坐标和y坐标
      left.value.x = event.clientX
      left.value.y = event.clientY
      // 获取左部和顶部的偏移量
      left.value.l = goLeft.offsetLeft
      left.value.t = goLeft.offsetTop
      // 开关打开
      left.value.isDown = true

      // 这里最好用window的移动事件监听
      window.onmousemove = moveLeftEvent
      // 鼠标抬起事件
      window.onmouseup = function() {
        // 开关关闭
        left.value.isDown = false
        // goLeft.style.cursor = 'default'
        // 清不掉...
        window.removeEventListener('onmousemove', moveLeftEvent)
        $(window).unbind('onmousemove')
      }
    }
    return false
  }
}

/**
 * 向右移动
 * @param e
 */
const moveRightEvent = (e: any) => {
  // 获取元素
  const goRight = $('.' + props.wrapperClass + ' .color-box .color-btn.left') as any
  const goLeft = $('.' + props.wrapperClass + ' .color-box .color-btn.right') as any
  if (right.value.isDown === false) {
    return
  }
  // 获取x和y
  const nx = e.clientX
  // 计算移动后的左偏移量和顶部的偏移量
  let nl = nx - (right.value.x - right.value.l)
  // 滑块厚度
  const width = goRight.width()
  // 最左边
  if (nl <= -width * 0.5) {
    nl = -width * 0.5
  }

  const goLeftVal = parseFloat(goLeft.css('left').replace('px', ''))
  const goRightVal = parseFloat(goRight.css('left').replace('px', ''))
  if (goLeftVal - goRightVal >= Math.floor(width)) {
    if (nl + width >= goLeftVal) {
      nl = goLeftVal - width
    }
    goRight.css('left', `${nl}px`)
    updateColorCard()
    emits('volumeColorFilter', slideValue.value)
  }
}

/**
 * 向左移动
 * @param e
 */
const moveLeftEvent = (e: any) => {
  // 获取元素
  const goLeft = $('.' + props.wrapperClass + ' .color-box .color-btn.right') as any
  const goRight = $('.' + props.wrapperClass + ' .color-box .color-btn.left') as any
  if (left.value.isDown === false) {
    return
  }
  // 获取x和y
  const nx = e.clientX
  // 计算移动后的左偏移量和顶部的偏移量
  let nl = nx - (left.value.x - left.value.l)
  // 为滑块厚度
  const width = goLeft.width()
  const wrapperWidth = ($('.' + props.wrapperClass + ' .color-box') as any).width()
  // 最右边
  if (nl >= wrapperWidth - width * 0.5) {
    nl = wrapperWidth - width * 0.5
  }

  const goLeftVal = parseFloat(goLeft.css('left').replace('px', ''))
  const goRightVal = parseFloat(goRight.css('left').replace('px', ''))
  if (goLeftVal - goRightVal >= Math.floor(width)) {
    if (nl - width <= goRightVal) {
      nl = goRightVal + width
    }
    goLeft.css('left', `${nl}px`)
    updateColorCard()
    emits('volumeColorFilter', slideValue.value)
  }
}

/**
 * 更新色卡状态
 */
const updateColorCard = () => {
  const colorList = $('.' + props.wrapperClass + ' .color-box .color-list')
  const unitWidth = $(colorList[1]).width()

  const goRight = document.querySelector('.' + props.wrapperClass + ' .color-box .color-btn.left') as any
  const goLeft = document.querySelector('.' + props.wrapperClass + ' .color-box .color-btn.right') as any
  const minLeft = goRight.offsetLeft
  const maxLeft = goLeft.offsetLeft
  const valueArr = []
  for (let i = 1; i < colorList.length; i++) {
    const number = i * (Number(unitWidth) + 1)
    if (number < minLeft || number > maxLeft + unitWidth) {
      $(colorList[i])
        .addClass('disabled')
    } else {
      $(colorList[i])
        .removeClass('disabled')
      valueArr.push(props.colorArr[i].value)
      if (props.colorArr[i - 1]) {
        valueArr.push(props.colorArr[i - 1].value)
      }
    }
  }
  if (minLeft >= 0) {
    $(colorList[0]).addClass('disabled')
  } else {
    $(colorList[0]).removeClass('disabled')
  }
  if (valueArr.length > 0) {
    valueArr.sort((a, b) => {
      return a - b
    })
    slideValue.value = [valueArr[0], valueArr[valueArr.length - 1]]
  }
}
</script>

<style scoped lang="less">
.color-box {
  display: flex;
  flex-wrap: nowrap;
  position: relative;
  left: 0;
  top: -8px;

  .color-list {
    position: relative;
    top: 15px;
    display: flex;
    flex-wrap: nowrap;
    width: 18px;
    height: 16px;
    text-align: center;

    .color-text {
      position: absolute;
      top: 20px;
      color: #fff;
      left: 23px;
    }
  }

  .color-list:last-child {
    margin-right: 0;
  }

  .color-list.disabled {
    opacity: 0.35;
    z-index: 99;
  }

  .color-btn {
    position: absolute;
    width: 10px;
    height: 20px;
    top: 13px;
    background: -webkit-gradient(linear, left top, left bottom, from(#fcfcfc), to(#456680));
    background: linear-gradient(180deg, #fcfcfc, #456680);
    -webkit-box-shadow: 0 0 0.25rem #000;
    box-shadow: 0 0 0.25rem #000;
    cursor: pointer;
    z-index: 300;
  }

  .linear-color {
    display: flex;
    flex-wrap: nowrap;
    position: absolute;
    height: 16px;
    left: 0;
    top: 15px;
  }
}
</style>>
