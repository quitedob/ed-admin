import { Boot } from '@wangeditor/editor'
import ImageMenu from './Custom/image.js'
import FormulaMenu from './Custom/formula.js'
import CodeMenu from './Custom/code.js'
import HighlightMenu from './Custom/highlight.js'
import TableMenu from './Custom/table.js'

const MenusList = [
  {
    index: 20,
    key: 'ImageMenu',
    class: ImageMenu
  },
  {
    index: 21,
    key: 'FormulaMenu',
    class: FormulaMenu
  },
  {
    index: 22,
    key: 'CodeMenu',
    class: CodeMenu
  },
  {
    index: 23,
    key: 'HighlightMenu',
    class: HighlightMenu
  },
  {
    index: 24,
    key: 'TableMenu',
    class: TableMenu
  }
]

const registerMenu = function (editor, toolbarConfig) {
  const allRegisterMenu = editor.getAllMenuKeys() // 获取所有已注册的菜单
  let keys = []
  for (let item of MenusList) {
    if (allRegisterMenu.indexOf(item.key) < 0) {
      // 如果未注册，则注册
      const menuObj = {
        key: item.key,
        factory() {
          return new item.class()
        }
      }
      Boot.registerMenu(menuObj)
    }
    keys.push(item.key)
  }
  toolbarConfig.insertKeys = {
    index: MenusList[0].index,
    keys: keys
  }
}

export default registerMenu
