export default class HighlightMenu {
  constructor() {
    this.title = '重点标注'
    this.iconSvg = '<svg t="1710986184014" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4528" width="200" height="200"><path d="M256 256h512v128H256z" fill="#ffeb3b"/><path d="M192 192h640v192H192z" fill="none" stroke="#333" stroke-width="2"/></svg>'
    this.tag = 'button'
  }

  getValue(editor) {
    return ''
  }

  isActive(editor) {
    return false
  }

  isDisabled(editor) {
    return false
  }

  exec(editor, value) {
    if (this.isDisabled(editor)) return
    editor.emit('HighlightMenuClick', value)
  }
}