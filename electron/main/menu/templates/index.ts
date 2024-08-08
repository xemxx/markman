import edit from './edit'
import prefEdit from './prefEdit'
import file from './file'
import help from './help'
import view from './view'
import window from './window'
import markman from './markman'
import { isOsx } from '../../config'
import Keybindings from '../../keyboard/shortcutHandler'

/**
 * 创建偏好设置菜单
 * @param {Keybindings} keybindings 快捷键资源
 */
export const configSettingMenu = (keybindings: Keybindings) => {
  // 返回通过各个配置函数创建的对应的菜单项
  return [
    ...(isOsx ? [markman(keybindings)] : []), // MacOs上的菜单第一个选项与其他平台不一致
    prefEdit(keybindings),
    help(),
  ]
}

/**
 * 创建主界面菜单
 * @param {Keybindings} keybindings 快捷键资源
 */
export const configEditorMenu = (
  keybindings: Keybindings,
  userPreference: any,
) => {
  // 返回通过各个配置函数创建的对应的菜单项
  return [
    ...(isOsx ? [markman(keybindings)] : []), // MacOs上的菜单第一个选项与其他平台不一致
    file(keybindings, userPreference),
    edit(keybindings),
    window(keybindings),
    view(keybindings, userPreference),
    help(),
  ]
}
