<template>
  <div id="map-core" class="map-core"></div>
</template>

<script setup lang="ts" name="LeafLetMap">
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, watch, withDefaults } from 'vue'

interface Url {
  [key: string]: string
}
interface Props {
  urlKey?: string
}

const props = withDefaults(defineProps<Props>(), {
  urlKey: '影像'
})

let map: any = null
const urls = ref<Url>({
  影像: 'http://www.hxgis.com:8084/OCMapCacher/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=undefined',
  矢量: 'http://www.hxgis.com:8084/OCMapCacher/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=undefined',
  地形: 'http://www.hxgis.com:8084/OCMapCacher/ter_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={z}&TileRow={y}&TileCol={x}&style=default&format=tiles&tk=undefined'
})
const mapLayer = ref<any>(null)

watch(props, () => {
  const { urlKey } = props
  if (mapLayer.value !== '') {
    map.removeLayer(mapLayer.value)
    mapLayer.value = ''
  }
  mapLayer.value = L.tileLayer(urls.value[urlKey], {
    maxZoom: 15,
    minZoom: 1,
    zoomOffset: 0
  })
  map.addLayer(mapLayer.value)
})

onMounted(() => {
  initMap()
})

const initMap = () => {
  const mapDom = document.getElementById('map-core') as any
  mapLayer.value = L.tileLayer(urls.value['影像'], {
    maxZoom: 15,
    minZoom: 3
  })
  map = L.map(mapDom, {
    zoomControl: false,
    attributionControl: false
  }).setView([30, 113], 5)
  map.addLayer(mapLayer.value)
}
</script>

<style scoped lang="less">
.map-core {
  width: 100%;
  height: 100%;
}
</style>
