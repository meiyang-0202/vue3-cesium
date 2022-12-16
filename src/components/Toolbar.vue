<template>
  <div class="toolbar">
    <div style="position:absolute;top:0px;left:10px;display:none">
      <el-dropdown @command="handleCommand">
        <el-button circle :icon="Menu"></el-button>
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="actionOpen">打开文件</el-dropdown-item>
            <el-dropdown-item command="actionExit" divided>退出程序</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div style="position:absolute;top:0px;left:10px;">
      <el-button circle :icon="Document" @click='handleCommand("actionOpen")' title='打开'></el-button>
    </div>
    <div style="position:absolute;top:40px;left:10px;">
      <el-button circle :icon="Delete" @click='onClearAll' title='清除'></el-button>
    </div>
    <div style="position:absolute;top:80px;left:10px;display:none">
      <el-dropdown @command="handleCommand">
        <el-button circle :icon="MoreFilled"></el-button>
        <template v-slot:dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="actionObj23D">转3D</el-dropdown-item>
            <el-dropdown-item command="actionConvertKML">转KML</el-dropdown-item>
            <el-dropdown-item command="actionConvertObj">转Obj</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts" name="Toolbar">
import { Menu, Document, Delete, MoreFilled } from '@element-plus/icons-vue'

const handleCommand = (command: string) => {
  if (command === 'clearScene') {
    // this.$store.state.weInstance.weatherVolumeManager.clear()
  }
}

const onClearAll = () => {
  // const WE = this.$store.state.weInstance
  const { WE } = window as any
  const activeVolume = WE.weatherVolumeManager.activeVolume
  if (Cesium.defined(activeVolume)) {
    const removedChild = WE.weatherVolumeManager.removeById(activeVolume.name + '_child')
    if (activeVolume._lengthway ||
      activeVolume._hierarchy ||
      removedChild) {
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

<style lang="less" scoped>
.toolbar {
  position: absolute;
  left: 10px;
  top: 12px;
}
</style>
