export default class TableMenu {
  constructor() {
    this.title = '插入表格'
    this.iconSvg = '<svg t="1710986184014" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4528" width="200" height="200"><path d="M128 256h768v512H128z" fill="none" stroke="#333" stroke-width="2"/><path d="M128 384h768M128 512h768M384 256v512M640 256v512" fill="none" stroke="#333" stroke-width="2"/></svg>'
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
    editor.emit('TableMenuClick', value)
  }
}