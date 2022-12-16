<template>
  <div id="header">
    <div class="title">
      <a class="logo"></a>
      <div class='weatherlabDiv'>WeatherLab</div>
      <div class="b">
        <a class="min" href="javascript:void(0);" @click="showMinimized"></a>
        <a class="max" href="javascript:void(0);" @click="showMaximized"></a>
        <a class="close" href="javascript:void(0);" @click="actionExit"></a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="Header">
import { onMounted, getCurrentInstance } from 'vue'

onMounted(() => {
  const windows = window as any
  windows.header = this
})

const showMinimized = () => {
  // eslint-disable-next-line no-eval
  eval('showMinimized')
}

const showMaximized = () => {
  // eslint-disable-next-line no-eval
  eval('showMaximized')
}

const actionExit = () => {
  // eslint-disable-next-line no-eval
  eval('actionExit')
}
</script>

<style scoped lang="less">
#header {
  height: 26px;
  display: flex;
  align-items: center;

  .title {
    position: absolute;
    width: 100%;
    height: 20px;
    background: #ffffff;

    h2 {
      position: absolute;
      font-size: 14px;
    }

    div {
      position: absolute;
      height: 19px;
      top: 0px;
    }

    .b {
      position: absolute;
      height: 19px;
      top: 0px;
      right: 3px;
    }

    a, a.open {
      float: left;
      width: 21px;
      height: 19px;
      background: url('../../assets/images/tool.png') no-repeat;
    }

    a.min {
      background-position: -29px 0;
    }

    a.min:hover {
      background-position: -29px -29px;
    }

    a.max {
      background-position: -60px 0;
    }

    a.max:hover {
      background-position: -60px -29px;
    }

    a.close {
      background-position: -89px 0;
    }

    a.close:hover {
      background-position: -89px -29px;
    }

    a.logo {
      float: left;
      width: 18px;
      height: 18px;
      background: url('../../assets/images/app.png') no-repeat;
      background-size: cover;
      margin-top: 1px;
      margin-left: 2px;
    }

    .weatherlabDiv {
      left: 22px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
}
</style>
