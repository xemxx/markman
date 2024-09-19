import { usePreferenceStore } from '@/store'
import { watch } from 'vue'

// 系统监听变量
let matchMedia: any = ''
const watchSystemThemeChange = () => {
  // 仅需一次初始化
  if (matchMedia) return
  // Window 的 matchMedia() 方法返回一个新的 MediaQueryList 对象，表示指定的媒体查询 (en-US)字符串解析后的结果。返回的 MediaQueryList 可被用于判定 Document 是否匹配媒体查询，或者监控一个 document 来判定它匹配了或者停止匹配了此媒体查询。
  matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
  matchMedia.onchange = () => {
    changeTheme('system')
  }
}
/**
 * 变更主题
 * @param theme
 */
const changeTheme = (theme: any) => {
  let themeClassName = ''
  switch (theme) {
    case 'light':
      themeClassName = 'light'
      mode.value = 'light'
      break
    case 'dark':
      themeClassName = 'dark'
      mode.value = 'dark'
      break
    case 'system':
      // 调用方法监听系统主题变化
      watchSystemThemeChange()
      themeClassName = matchMedia.matches ? 'dark' : 'light'
      mode.value = 'auto'
      break
  }
  // 修改 html中class
  // const html = document.querySelector('html')
  // if (html) {
  //   html.className = themeClassName
  // }
}
import { useColorMode } from '@vueuse/core'
const mode = useColorMode()
// 监听pinia 里面定义的 变量
export const useTheme = () => {
  const performance = usePreferenceStore()
  watch(
    () => performance.themeType,
    val => {
      changeTheme(val)
    },
    {
      immediate: true,
    },
  )
}
