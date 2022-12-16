<template>
  <div class="main-content">
    <div class="title" v-text="time"></div>
    <CesiumMap ref="cesiumMap" :cesiumMapOptions="cesiumMapOptions"></CesiumMap>
    <VolumeToolbar/>
    <div ref="datcontainer" class="ToolGUI"></div>
    <div class="wrapper" v-show="weStore._showLengend">
      <VolumeColorCard
        :colorArr="weStore._lengedColorArray"
        wrapperClass="activeVolume"
        wrapperWidth="360"
        colorType="none"
        @volumeColorFilter="activeVolumeFilter"
      ></VolumeColorCard>
    </div>
    <RadarSlider @change="changeTime" :allTimeList="allTimeList"></RadarSlider>
  </div>
</template>

<script setup lang="ts" name="SimpleRadar">
import { ref, onMounted, getCurrentInstance } from 'vue'
import { WeStore } from '@/store/modules/weState'
import dat from 'dat.gui'
import moment from 'moment'
import apiRadar from '@/WeatherEarthForVue/exp/apiRadar'
import expSystem from '@/WeatherEarthForVue/gui/expSystem'
import expRadarData from '@/WeatherEarthForVue/exp/expRadarData'
import bindGUI from '@/WeatherEarthForVue/gui/expBind'
import CesiumMap from '@/components/map/CesiumMap.vue'
import VolumeColorCard from '@/components/volume/ColorCard.vue'
import VolumeToolbar from '@/components/volume/VolumeToolbar.vue'
import RadarSlider from '@/components/RadarSlider.vue'

const weStore = WeStore()
const { ctx } = getCurrentInstance() as any

interface Options {
  statusBar: boolean,
  shouldAnimate: boolean,
  defaultImagery: number,
  defaultView: {
    longitude: number,
    latitude: number,
    height: number,
    heading: number,
    itch: number,
    roll: number
  }
}

interface Ramp {
  ValueRamp: number[],
  ColorRamp: any[]
}

const time = ref<string>('')
const list = ref<string[]>([])
const allTimeList = ref<string[]>([])
const cesiumMapOptions = ref<Options>({
  statusBar: false,
  shouldAnimate: false,
  defaultImagery: 4,
  defaultView: {
    longitude: 2.090374,
    latitude: 0.505016,
    height: 1390532.521,
    heading: 6.28,
    itch: -1.57,
    roll: 0.00
  }
})
const ValueAndColorRamp_DBZ = ref<Ramp>({
  ValueRamp: [0, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
  ColorRamp: [
    [0, 0, 0, 0],
    [1, 160, 246, 255],
    [0, 236, 236, 255],
    [0, 215, 0, 255],
    [0, 145, 0, 255],
    [255, 255, 0, 255],
    [230, 190, 0, 255],
    [255, 145, 0, 255],
    [255, 80, 80, 255],
    [215, 0, 0, 255],
    [190, 0, 0, 255],
    [255, 0, 240, 255],
    [150, 0, 180, 255],
    [175, 145, 240, 255]
  ]
})

onMounted(() => {
  const preUrl = import.meta.env.VITE_APP_ZHEJIANG_API
  // http://localhost:8020/OCserver/p/OC?method=nc&param=Z_OTHE_RADAMOSAIC_20210303133000.bin%3Bundefined%3Bnc%3B2
  // https://www.qxjcfw.cn/ZJDatacenterV2/RADA_L3_FOR_SWAN3D_ZJ/OC?method=nc&param=Z_OTHE_RADAMOSAIC_20220405071200.bin;DBZ;bz2;2
  WeatherEarth.Config.WeatherDataTemplateUrl = `${preUrl}RADA_L3_FOR_SWAN3D_ZJ/OC?method=nc&param={0}%3B{1}%3B{2}%3B{3}`

  const gui = new dat.GUI({ autoPlace: false })
  const customContainer = ctx.$refs.datcontainer
  customContainer.appendChild(gui.domElement)
  const ui = {
    雷达回波: { 雷达回波: [], func: apiRadar.loadRadarOther }
  }
  const volumeOptions = {
    TransFunction: WeatherEarth.WeatherVolumeTransfunctions.Transfunction_CommonTF,
    ValueAndColorRamp: ValueAndColorRamp_DBZ.value,
    ValueAndColorRampChild: ValueAndColorRamp_DBZ.value
  }
  const url = `${preUrl}RADA_L3_FOR_SWAN3DFILES_ZJ`
  Cesium.Resource.fetchJson(url).then((json: { returnCode: number; DS: any }) => {
    expRadarData.otherData = {} as any
    if (json.returnCode === 0) {
      const data = json.DS
      data.forEach((element: string) => {
        const name = element.replaceAll('.DBZ.w3dm', '')
        const varname = 'DBZ'
        const ext = 'bz2'
        ui.雷达回波.雷达回波.push(name as never)
        const d = {
          name, varname, ext, ...volumeOptions
        }
        expRadarData.otherData[name] = d
      })
      bindGUI(gui, ui)
      const list1 = ui.雷达回波.雷达回波
      list.value = list1
      if (list1.length > 0) {
        apiRadar.loadRadarOther(list1[list1.length - 1])
      }
      list.value.forEach((item) => {
        const time = item.substr(18, 14).replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3 $4:$5:$6')
        allTimeList.value.push(moment(time).add(8, 'hours').format('YYYY-MM-DD HH:mm:ss'))
      })
      time.value = moment(allTimeList.value[allTimeList.value.length - 1]).format('YYYY年MM月DD日HH时mm分') + '(雷达回波)'
    }
  })
  expSystem.showAnnotation(true)
})

const activeVolumeFilter = (transparencyValueArr: number[]) => {
  const { WE } = window as any
  WE.WeExt.activeVolumeFilter(transparencyValueArr)
}

const changeTime = (timeStr: string) => {
  time.value = moment(timeStr).format('YYYY年MM月DD日HH时mm分') + '(雷达回波)'
  const time1 = moment(timeStr).subtract(8, 'hours').format('YYYYMMDDHHmmss')
  const item = list.value[0]
  apiRadar.loadRadarOther(item.substr(0, 18) + time1 + item.substr(32))
}
</script>

<style scoped lang="less">
.ToolGUI {
  position: absolute;
  top: 0px;
  left: 15px;
  display: none;
}

.map-latlng {
  position: absolute;
  bottom: 40px;
  left: 170px;
}

.wrapper {
  position: absolute;
  bottom: 36px;
  right: 10px;
  width: 360px;
  height: 40px;
  padding: 10px;
  background-color: rgba(30, 30, 30, 0.8);
  font-size: 14px;
}

.title {
  position: absolute;
  z-index: 101;
  color: red;
  font-size: 28px;
  width: 500px;
  top: 12px;
  text-align: center;
  left: calc(50% - 250px);
  background-color: rgba(0, 0, 0, 0.2);
}

.main-content {
  position: relative;

}
</style>
