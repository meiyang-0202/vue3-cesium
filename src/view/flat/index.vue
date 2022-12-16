<template>
  <div class="main-content">
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
  </div>
</template>

<script setup lang="ts" name="flat">
import { ref, onMounted, getCurrentInstance } from 'vue'
import CesiumMap from '@/components/map/CesiumMap.vue'

interface Highlighted {
  feature: any,
  originalColor: any
}

const { ctx } = getCurrentInstance() as any

const layerName = ref<string>('机房')
const cesiumMapOptions = ref<object>({
  animation: false,
  emptyScene: true,
  timeline: false
})

onMounted(() => {
  ctx.$nextTick(() => {
    init()
  })
})

const init = () => {
  const { WE } = window as any
  const assets = import.meta.env.VITE_APP_ASSETS
  const url = `${assets}/jf/tileset.json`
  const options = {
    url,
    debugShowBoundingVolume: false,
    cullWithChildrenBounds: false,
    cullRequestsWhileMoving: false,
    shadows: Cesium.ShadowMode.ENABLED,
    preloadWhenHidden: true,
    immediatelyLoadDesiredLevelOfDetail: true,
    skipLevelOfDetail: true,
    skipLevels: 4
  }
  const tileset = WE.layerManager.addTilesetLayer(options, layerName.value)
  tileset.readyPromise.then(() => {
    WE.viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0.0, -0.8, tileset.boundingSphere.radius * 2.6))
  })

  let queryid = ''
  const silhouetteBlue = Cesium.PostProcessStageLibrary.createEdgeDetectionStage()
  silhouetteBlue.uniforms.color = Cesium.Color.BLUE
  silhouetteBlue.uniforms.length = 0.1
  silhouetteBlue.selected = []

  WE.viewer.scene.postProcessStages.add(
    Cesium.PostProcessStageLibrary.createSilhouetteStage([
      silhouetteBlue
    ])
  )

  const highlighted: Highlighted = {
    feature: undefined,
    originalColor: new Cesium.Color()
  }
  const handler1 = new Cesium.ScreenSpaceEventHandler(WE.viewer.scene.canvas)
  handler1.setInputAction((movement: { endPosition: any }) => {
    if (Cesium.defined(highlighted.feature)) {
      highlighted.feature.color = highlighted.originalColor
      highlighted.feature = undefined
    }
    silhouetteBlue.selected = []
    const pickedFeature = WE.viewer.scene.pick(movement.endPosition)
    if (pickedFeature instanceof Cesium.Cesium3DTileFeature && pickedFeature !== highlighted.feature) {
      const name = pickedFeature.getProperty('name')
      if (name.startsWith('waike')) {
        queryid = name
        highlighted.feature = pickedFeature
        Cesium.Color.clone(pickedFeature.color, highlighted.originalColor)
        pickedFeature.color = Cesium.Color.BLUE
        silhouetteBlue.selected = [pickedFeature]
      }
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  const handler2 = new Cesium.ScreenSpaceEventHandler(WE.viewer.scene.canvas)
  handler2.setInputAction((movement: { position: any }) => {
    queryid = ''
    const pickedFeature = WE.viewer.scene.pick(movement.position)
    if (Cesium.defined(pickedFeature) && pickedFeature instanceof Cesium.Cesium3DTileFeature) {
      const name = pickedFeature.getProperty('name')
      if (name.startsWith('waike')) {
        queryid = name

        const cartesian = WE.viewer.scene.pickPosition(movement.position)
        if (Cesium.defined(cartesian)) {
          let pin = WE.earthPinCollection.getById(name)
          if (!Cesium.defined(pin)) {
            let t = 0.0
            let news = name + '\n温度:' + t++ + '°'

            const targetDiv = document.createElement('div')
            targetDiv.className = 'common-popup'

            const contentWrapper = document.createElement('div')
            contentWrapper.className = 'popup-content-wrapper'
            const contentNode = document.createElement('div')
            contentNode.className = 'popup-content'

            contentNode.innerHTML = news
            contentWrapper.appendChild(contentNode)

            const tipContainer = document.createElement('div')
            tipContainer.className = 'popup-tip-wrapper'
            const tip = document.createElement('div')
            tip.className = 'popup-tip'
            tipContainer.appendChild(tip)

            const close = document.createElement('div')
            close.className = 'popup-close-button'
            close.innerText = '×'
            close.addEventListener('click', () => {
              WE.earthPinCollection.remove(pin)
            })
            targetDiv.appendChild(contentWrapper)
            targetDiv.appendChild(tipContainer)
            targetDiv.appendChild(close)

            pin = WE.earthPinCollection.add({
              id: name,
              position: cartesian,
              content: news,
              target: targetDiv
            })
            setInterval(() => {
              news = name + '\n温度:' + t++ + '°'
              contentNode!.innerHTML = news
            }, 500)
          }
          pin.position = cartesian
        }
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_UP)
}
</script>

<style scoped lang="less">
.legend {
  position: absolute;
  bottom: 20px;
  left: 20px;
  width: 25em;
  height: 4em;
  background-color: rgba(30, 30, 30, 0.8);
  color: #ffffff;
  display: flex;
  align-items: center;
  user-select: none;
}

.wrapper {
  position: absolute;
  bottom: 50px;
  right: 10px;
  width: 360px;
  height: 40px;
  padding: 10px;
  background-color: rgba(30, 30, 30, 0.8);
  font-size: 14px;
}
</style>
