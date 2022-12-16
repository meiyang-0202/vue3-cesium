<template>
  <div class="leaf-let">
    <LeafLetMap :urlKey="mapName"></LeafLetMap>
    <div class="select-map">
      <div
        class="map-item"
        v-for="(item, index) in mapLayers"
        :key="index"
        :class="{'active':item.name===mapName}"
        @click="changeMapLayer(item.name)">
        <img class="item-img" :src="item.url">
        <div class="item-name">{{item.name}}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="LeafLet">
import LeafLetMap from '@/components/map/LeafLetMap.vue'
import { ref } from 'vue'

const mapLayers = ref<{ name: string, url: string }[]>([
  { name: '影像', url: 'src/assets/images/img_c.png' },
  { name: '矢量', url: 'src/assets/images/vec_c.png' },
  { name: '地形', url: 'src/assets/images/ter_c.png' }
])
const mapName = ref<string>('影像')

const changeMapLayer = (name: string) => {
  mapName.value = name
}
</script>

<style scoped lang="less">
.leaf-let {
  width: 100%;
  height: 100%;
  position: relative;

  .select-map {
    position: absolute;
    right: 20px;
    top: 20px;
    z-index: 999;
    display: flex;

    .map-item {
      margin-left: 15px;
      color: #FFFFFF;
      font-size: 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }

    .item-img {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      margin-bottom: 8px;
    }

    .active {
      color: #1b70b0;

      img {
        border: 2px solid #1b70b0;
      }
    }
  }
}
</style>
