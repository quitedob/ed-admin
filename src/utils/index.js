// import dayjs from 'dayjs' // Removed dependency to avoid package installation

/**
 * 解析时间
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (!time) {
    return null
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date

  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }

  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }

  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })

  return time_str
}

/**
 * 格式化时间
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * 格式化日期
 * @param {Date} date
 * @param {string} fmt
 * @returns {string}
 */
export function formatDate(date, fmt = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return ''

  // 简单的格式化实现，支持常用的格式
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  if (fmt === 'YYYY-MM-DD') {
    return `${year}-${month}-${day}`
  } else if (fmt === 'HH:mm:ss') {
    return `${hours}:${minutes}:${seconds}`
  } else {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  }
}

/**
 * 获取相对时间
 * @param {Date|string|number} time
 * @returns {string}
 */
export function getTimeAgo(time) {
  const now = new Date().getTime()
  const past = new Date(time).getTime()
  const diff = now - past

  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24
  const month = day * 30
  const year = day * 365

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < month) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 深拷贝
 * @param {any} obj
 * @returns {any}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }

  if (typeof obj === 'object') {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 防抖函数
 * @param {Function} func
 * @param {number} wait
 * @param {boolean} immediate
 * @returns {Function}
 */
export function debounce(func, wait, immediate) {
  let timeout
  return function() {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    if (immediate) {
      const callNow = !timeout
      timeout = setTimeout(() => {
        timeout = null
      }, wait)
      if (callNow) func.apply(context, args)
    } else {
      timeout = setTimeout(() => {
        func.apply(context, args)
      }, wait)
    }
  }
}

/**
 * 节流函数
 * @param {Function} func
 * @param {number} wait
 * @returns {Function}
 */
export function throttle(func, wait) {
  let timeout
  return function() {
    const context = this
    const args = arguments
    if (!timeout) {
      timeout = setTimeout(() => {
        func.apply(context, args)
        timeout = null
      }, wait)
    }
  }
}

/**
 * 生成UUID
 * @returns {string}
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * 数字格式化
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 文件大小格式化
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 获取URL参数
 * @param {string} url
 * @returns {Object}
 */
export function getUrlParams(url = window.location.href) {
  const params = {}
  const urlObj = new URL(url)
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

/**
 * 设置URL参数
 * @param {Object} params
 * @param {string} url
 * @returns {string}
 */
export function setUrlParams(params, url = window.location.href) {
  const urlObj = new URL(url)
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      urlObj.searchParams.set(key, params[key])
    } else {
      urlObj.searchParams.delete(key)
    }
  })
  return urlObj.toString()
}

// 重新导出其他工具模块的内容
export { formatTime as formatDuration, formatTimeTotal, transformSize, cloneDeep } from './base.js'
export * from './storage.js'
export * from './cookie.js'
export * from './request.js'