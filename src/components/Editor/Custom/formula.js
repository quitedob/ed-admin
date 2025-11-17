export default class FormulaMenu {
  constructor() {
    this.title = '数学公式'
    this.iconSvg = '<svg t="1710986184014" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4528" width="200" height="200"><path d="M128 128h768v768H128z" fill="none" stroke="#333" stroke-width="2"/><path d="M256 320h512M384 480l128-160 128 160M320 640h384M256 800h512" fill="none" stroke="#333" stroke-width="2"/></svg>'
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
    editor.emit('FormulaMenuClick', value)
  }
}