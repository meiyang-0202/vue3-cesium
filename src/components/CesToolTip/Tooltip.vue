<template>
  <div ref="tooltipcontainer" class="common-popup-v" v-show="isVisible">
    <div class="popup-header-v">
      <div style="display: flex;align-items: center">
      </div>
      <img
        style="width: 25px;height:25px;margin-right: 5px;cursor:pointer;"
        src="@/assets/images/close.png"
        @click="onClickClose"/>
    </div>
    <div
      style="width: 220px;box-sizing: border-box;padding: 8px;background: rgba(3, 26, 48, 0.82);border-radius: 0 0 4px 4px;">
      <div
        style="cursor:pointer;display: flex;font-size: 14px;color: rgb(39,148,109);
                border-radius: 4px;line-height: 26px;">
        <div
          style="cursor:pointer;display: flex;
                 font-size: 14px;color: rgb(39,148,109);
                 border-radius: 4px;line-height: 26px;">
          <div
            style="cursor:pointer;width: 90px;height: 26px;text-align: center;
                    font-size: 14px;color: rgb(39,148,109);margin-top:10px;line-height: 26px;
                    border-radius: 4px;border: 1px solid rgb(28,114,91);"
            @click="onClickPic">图片实况
          </div>
          <div
            style="cursor:pointer;width: 90px;height: 26px;text-align: center;
                    font-size: 14px;color: rgb(39,148,109);margin-top:10px;line-height: 26px;
                    border-radius: 4px;border: 1px solid rgb(28,114,91);margin-left: 20px;"
            onclick="document.getElementById('expandFlyVideo').style.display='block';">视频实况
          </div>
        </div>
      </div>
    </div>
    <div class="popup-tip-wrapper-v">
      <div class="popup-tip"></div>
    </div>

    <div id="expandFlyPic" class="dialog" v-show="showPicDialog">
      <div class="dialog-header">图片实况</div>
      <img
        style="width: 35px;height:35px;margin-right: 5px;cursor:pointer;
                position:absolute;top: 1px;right:-4px;"
        src="@/assets/images/close.png"
        @click="onClosePic"/>
      <img
        style="width:100%;height:100%;padding: 8px;background: #333;
            box-sizing: border-box;box-shadow: 0 1px 1px #dff"
        :src="getAssetsFile('/src/assets/images/app.png')"/>
    </div>
  </div>
</template>

<script setup lang="ts" name="Tooltip">
import { ref, onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue'
import { DefaultStore } from '@/store'
import getAssetsFile from '@/utils/getFiles'

const _this = getCurrentInstance() as ComponentInternalInstance
const defaultStore = DefaultStore()

const isVisible = ref<boolean>(true)
const dirty = ref<boolean>(false)
const showPicDialog = ref<boolean>(false)
const showVideoDialog = ref<boolean>(false)
const id = ref<string>('')
const _offsetWidth = ref<number>(0)
const _offsetHeight = ref<number>(0)

onMounted(() => {
  const stationId = _this.proxy?.$attrs.id as string
  id.value = stationId
  const item = defaultStore.popupToolTips[id.value]
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

const onClickPic = () => {
  showPicDialog.value = true
}

const onClosePic = () => {
  showPicDialog.value = false
}

const onClickClose = () => {
  isVisible.value = false
}
//   methods: {
//     updatePotision(position, viewer) {
//       const target = this.$refs.tooltipcontainer
//       const offsetWidth = target.offsetWidth
//       const offsetHeight = target.offsetHeight
//       if (!Cesium.defined(this._offsetWidth) && offsetWidth !== 0) {
//         this._offsetWidth = offsetWidth
//         this._offsetHeight = offsetHeight
//       }
//       let x = 0
//       let y = 0
//
//       x = position.x - this._offsetWidth / 2
//       y = position.y - this._offsetHeight - 15
//
//       target.style.left = x + 'px'
//       target.style.top = y + 'px'
//     },
//     onClickPic() {
//       this.showPicDialog = true
//     },
//     onClosePic() {
//       this.showPicDialog = false
//     },
//     onClickClose() {
//       this.isVisible = false
//     }
//   },
//   mounted() {
//     const id = this.$attrs.id
//     this.id = id
//     const item = defaultStore.popupToolTips[id]
//     const { longitude, latitude, visible } = item
//     const { WE } = window
//     const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, 0)
//     WE.WeExt.tooltipManager.remove(id)
//     WE.WeExt.tooltipManager.add({
//       id,
//       node: this,
//       position
//     })
//     if (defaultStore.debugTooltip) {
//       WE.WeExt.pointCollection.add({ position })
//     }
//     this.isVisible = true
//   }
// }
</script>

<style scoped lang="less">

.common-popup-v {
  position: absolute;
  z-index: 999;
  top: 0px;
  left: 0px;
}

.popup-header-v {
  background-image: url("../../assets/images/pophead.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  height: 28px;
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.popup-tip-wrapper-v {
  width: 40px;
  height: 20px;
  position: absolute;
  left: 50%;
  margin-left: -20px;
  overflow: hidden;
  pointer-events: none
}

.popup-tip {
  width: 14px;
  height: 14px;
  background: rgba(3, 26, 48, 0.82);
  border: 1px solid rgb(39, 148, 109);
  box-shadow: 0 0 4px rgb(39, 148, 109) inset;
  transform: rotate(45deg);
}

.popup-close-button:hover {
  color: #999;
}

.popup-content {
  background: transparent;
}

.popup-content {
  margin: 0;
  box-sizing: border-box;
}

.dialog {
  top: 150px;
  left: 400px;
  position: fixed;
  width: 960px;
  height: 580px;
  z-index: 999;
}

.dialog-header {
  width: 100%;
  height: 40px;
  line-height: 40px;
  box-sizing: border-box;
  font-size: 16px;
  background-image: url("../../assets/images/pophead.png");
  padding-left: 20px;
  color: #3BDA91;
  background-repeat: no-repeat;
  background-size: 101% 100%;
  background-position: -10px;
  border-bottom: 1px solid #333;
}
</style>
