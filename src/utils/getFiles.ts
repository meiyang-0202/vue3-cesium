import { ElMessage } from 'element-plus'

/**
 * 获取文件
 * @param url: string
 * examples /src/assets/img/xxx.png
 */
export default function getAssetsFile(url: string) {
  try {
    // @ts-ignore
    const modules = import.meta.globEager('/src/**/*.{png,svg,jpg,jpeg}')
    return modules[url].default
  } catch (err) {
    ElMessage({
      // @ts-ignore
      message: err || 'Error 非法传参',
      type: 'error',
      showClose: true
    })
    console.error(err)
  }
}
