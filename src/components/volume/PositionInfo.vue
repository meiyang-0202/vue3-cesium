<template>
  <div class="position-info">
    <div class="distance-legend-zdy">
      <div class="distance-legend-label-zdy"></div>
      <div class="distance-legend-scale-bar-zdy"></div>
    </div>
    <div class="lat">
      纬度: {{ weState._viewPoint ? weState._viewPoint.lat : '' }}
    </div>
    <div class="lng">
      经度: {{weState._viewPoint ? weState._viewPoint.lon : '' }}
    </div>
    <div class="view-height">
      视点高度: {{ weState._viewPoint ? weState._viewPoint.altitude : '' }}千米
    </div>
  </div>
</template>

<script setup lang="ts" name="PositionInfo">
import { WeStore } from '@/store/modules/weState'

const weState = WeStore()
</script>

<style scoped lang="less">
@import '../../assets/css/global.less';
.position-info {
  background: @MAIN-BG;
  color: #fff;
  z-index: 9999;

  display: flex;
  padding: 8px 10px;
  box-sizing: border-box;
  font-size: 13px;
  border-radius: 4px;

  .distance-legend-zdy {
    float: left;
    margin: 0 14px;
  }

  .distance-legend-label-zdy {
    font-size: 13px;
    font-weight: lighter;
    text-align: center;
  }

  .distance-legend-scale-bar-zdy {
    border: 1px solid #4B5154;
    border-top: 0;
    position: absolute;
    height: 0.925rem;
    top: 10px;
    width: 50px;
  }

  .lng {
    margin: 0 10px;
  }

  .view-height {
    margin-left: 10px;
  }
}
</style>
