import { ref, onMounted, onUnmounted, nextTick } from 'vue'

// 无障碍功能组合式函数
export function useAccessibility(options = {}) {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableFocusManagement = true,
    enableAriaLabels = true,
    customKeyBindings = {}
  } = options

  // 响应式数据
  const currentFocusIndex = ref(0)
  const focusableElements = ref([])
  const isKeyboardUser = ref(false)
  const announcementText = ref('')
  const skipLinks = ref([])

  // 检测键盘用户
  const handleKeyDown = (event) => {
    if (event.key === 'Tab') {
      isKeyboardUser.value = true
      document.body.classList.add('keyboard-user')
    }

    // 自定义快捷键
    if (customKeyBindings[event.key]) {
      customKeyBindings[event.key](event)
    }
  }

  const handleMouseDown = () => {
    isKeyboardUser.value = false
    document.body.classList.remove('keyboard-user')
  }

  // 获取可聚焦元素
  const getFocusableElements = (container = document) => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')

    return Array.from(container.querySelectorAll(focusableSelectors))
      .filter(element => {
        // 检查元素是否可见和可交互
        const style = window.getComputedStyle(element)
        return style.display !== 'none' &&
               style.visibility !== 'hidden' &&
               !element.hasAttribute('disabled') &&
               element.tabIndex !== -1
      })
  }

  // 焦点管理
  const trapFocus = (container) => {
    focusableElements.value = getFocusableElements(container)
    currentFocusIndex.value = 0

    const handleFocusTrap = (event) => {
      if (event.key === 'Tab') {
        const firstElement = focusableElements.value[0]
        const lastElement = focusableElements.value[focusableElements.value.length - 1]

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault()
            lastElement?.focus()
            currentFocusIndex.value = focusableElements.value.length - 1
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault()
            firstElement?.focus()
            currentFocusIndex.value = 0
          }
        }
      }
    }

    container.addEventListener('keydown', handleFocusTrap)

    return () => {
      container.removeEventListener('keydown', handleFocusTrap)
    }
  }

  // 焦点导航
  const navigateFocus = (direction = 'next') => {
    if (focusableElements.value.length === 0) return

    if (direction === 'next') {
      currentFocusIndex.value = (currentFocusIndex.value + 1) % focusableElements.value.length
    } else {
      currentFocusIndex.value = currentFocusIndex.value === 0
        ? focusableElements.value.length - 1
        : currentFocusIndex.value - 1
    }

    focusableElements.value[currentFocusIndex.value]?.focus()
  }

  // 屏幕阅读器公告
  const announce = (text, priority = 'polite') => {
    announcementText.value = text

    // 创建临时的aria-live区域
    const liveRegion = document.createElement('div')
    liveRegion.setAttribute('aria-live', priority)
    liveRegion.setAttribute('aria-atomic', 'true')
    liveRegion.className = 'sr-only'
    liveRegion.textContent = text

    document.body.appendChild(liveRegion)

    // 清理
    setTimeout(() => {
      document.body.removeChild(liveRegion)
    }, 1000)
  }

  // 添加跳转链接
  const addSkipLink = (href, text, position = 'start') => {
    const skipLink = {
      id: `skip-link-${Date.now()}`,
      href,
      text,
      position
    }

    skipLinks.value.push(skipLink)
    return skipLink.id
  }

  // 生成唯一的ID
  const generateId = (prefix = 'accessible') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // 设置ARIA属性
  const setAriaAttributes = (element, attributes) => {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(`aria-${key}`, value)
      } else {
        element.removeAttribute(`aria-${key}`)
      }
    })
  }

  // 设置角色属性
  const setRole = (element, role) => {
    if (role) {
      element.setAttribute('role', role)
    } else {
      element.removeAttribute('role')
    }
  }

  // 标签管理
  const addLabel = (element, label) => {
    const labelId = generateId('label')
    const labelElement = document.createElement('div')
    labelElement.id = labelId
    labelElement.className = 'sr-only'
    labelElement.textContent = label

    element.setAttribute('aria-labelledby', labelId)
    document.body.appendChild(labelElement)

    return labelId
  }

  // 描述管理
  const addDescription = (element, description) => {
    const descId = generateId('description')
    const descElement = document.createElement('div')
    descElement.id = descId
    descElement.className = 'sr-only'
    descElement.textContent = description

    element.setAttribute('aria-describedby', descId)
    document.body.appendChild(descElement)

    return descId
  }

  // 错误状态
  const setErrorMessage = (element, message) => {
    const errorId = generateId('error')
    const errorElement = document.createElement('div')
    errorElement.id = errorId
    errorElement.setAttribute('role', 'alert')
    errorElement.setAttribute('aria-live', 'assertive')
    errorElement.className = 'error-message'
    errorElement.textContent = message

    element.setAttribute('aria-invalid', 'true')
    element.setAttribute('aria-errormessage', errorId)

    // 插入错误消息
    element.parentNode?.insertBefore(errorElement, element.nextSibling)

    return errorId
  }

  const clearErrorMessage = (element) => {
    element.removeAttribute('aria-invalid')
    element.removeAttribute('aria-errormessage')

    const errorId = element.getAttribute('data-error-id')
    if (errorId) {
      const errorElement = document.getElementById(errorId)
      if (errorElement) {
        errorElement.remove()
      }
      element.removeAttribute('data-error-id')
    }
  }

  // 加载状态
  const setBusy = (element, busy = true) => {
    element.setAttribute('aria-busy', busy.toString())
  }

  // 展开状态
  const setExpanded = (element, expanded = true) => {
    element.setAttribute('aria-expanded', expanded.toString())
  }

  // 选中状态
  const setSelected = (element, selected = true) => {
    element.setAttribute('aria-selected', selected.toString())
  }

  // 禁用状态
  const setDisabled = (element, disabled = true) => {
    element.setAttribute('aria-disabled', disabled.toString())
    element.tabIndex = disabled ? -1 : 0
  }

  // 隐藏状态
  const setHidden = (element, hidden = true) => {
    element.setAttribute('aria-hidden', hidden.toString())
  }

  // 键盘快捷键助手
  const createKeyboardHelper = (element, shortcuts) => {
    const helperId = generateId('keyboard-helper')
    const helperElement = document.createElement('div')
    helperElement.id = helperId
    helperElement.setAttribute('role', 'tooltip')
    helperElement.className = 'keyboard-helper'

    const shortcutList = Object.entries(shortcuts)
      .map(([key, description]) => `${key}: ${description}`)
      .join(' | ')

    helperElement.innerHTML = `
      <div class="keyboard-shortcuts">
        <strong>键盘快捷键:</strong> ${shortcutList}
      </div>
    `

    document.body.appendChild(helperElement)

    // 显示/隐藏快捷键帮助
    const toggleHelper = (show) => {
      helperElement.style.display = show ? 'block' : 'none'
      element.setAttribute('aria-describedby', show ? helperId : null)
    }

    return {
      id: helperId,
      show: () => toggleHelper(true),
      hide: () => toggleHelper(false),
      toggle: () => toggleHelper(helperElement.style.display === 'none')
    }
  }

  // 颜色对比度检查
  const checkColorContrast = (foreground, background) => {
    // 简化的对比度计算
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g)
      if (!rgb) return 0

      const [r, g, b] = rgb.map(val => {
        val = val / 255
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
      })

      return 0.2126 * r + 0.7152 * g + 0.0722 * b
    }

    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)

    return (lighter + 0.05) / (darker + 0.05)
  }

  // 初始化
  onMounted(() => {
    if (enableKeyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleMouseDown)
    }

    // 添加屏幕阅读器样式
    if (enableScreenReader) {
      const style = document.createElement('style')
      style.textContent = `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .keyboard-user *:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        .keyboard-helper {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          padding: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          max-width: 300px;
        }

        .keyboard-shortcuts {
          font-size: 12px;
          line-height: 1.4;
        }

        .error-message {
          color: var(--color-danger);
          font-size: 14px;
          margin-top: 4px;
        }
      `
      document.head.appendChild(style)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleMouseDown)
    document.body.classList.remove('keyboard-user')
  })

  return {
    // 状态
    currentFocusIndex,
    focusableElements,
    isKeyboardUser,
    announcementText,
    skipLinks,

    // 方法
    getFocusableElements,
    trapFocus,
    navigateFocus,
    announce,
    addSkipLink,
    generateId,
    setAriaAttributes,
    setRole,
    addLabel,
    addDescription,
    setErrorMessage,
    clearErrorMessage,
    setBusy,
    setExpanded,
    setSelected,
    setDisabled,
    setHidden,
    createKeyboardHelper,
    checkColorContrast
  }
}

// 键盘导航指令
export const vKeyboardNavigation = {
  mounted(el, binding) {
    const { container = el, circular = false } = binding.value || {}

    const focusableElements = () => {
      const selectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex]:not([tabindex="-1"])'
      ].join(', ')

      return Array.from(container.querySelectorAll(selectors))
    }

    const handleKeydown = (event) => {
      const elements = focusableElements()
      if (elements.length === 0) return

      const currentIndex = elements.indexOf(document.activeElement)
      let nextIndex

      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault()
          nextIndex = currentIndex + 1
          if (circular && nextIndex >= elements.length) {
            nextIndex = 0
          }
          break
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault()
          nextIndex = currentIndex - 1
          if (circular && nextIndex < 0) {
            nextIndex = elements.length - 1
          }
          break
        case 'Home':
          event.preventDefault()
          nextIndex = 0
          break
        case 'End':
          event.preventDefault()
          nextIndex = elements.length - 1
          break
        default:
          return
      }

      if (nextIndex >= 0 && nextIndex < elements.length) {
        elements[nextIndex].focus()
      }
    }

    el.addEventListener('keydown', handleKeydown)
    el._keyboardNavigationHandler = handleKeydown
  },

  unmounted(el) {
    if (el._keyboardNavigationHandler) {
      el.removeEventListener('keydown', el._keyboardNavigationHandler)
      delete el._keyboardNavigationHandler
    }
  }
}