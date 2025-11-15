/**
 * 模拟数据本地存储工具
 * 使用 localStorage 持久化模拟数据
 */

import { generateAllMockData } from './mockData'

const STORAGE_KEY = 'edu_system_mock_data_v1'
const STORAGE_VERSION = '1.0.0'

/**
 * 保存模拟数据到 localStorage
 */
export function saveMockData(data) {
  try {
    const dataWithVersion = {
      ...data,
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithVersion))
    console.log('✅ 模拟数据已保存到本地存储')
    return true
  } catch (e) {
    console.error('❌ 保存模拟数据失败:', e)
    if (e.name === 'QuotaExceededError') {
      console.error('存储空间不足，请清理浏览器缓存')
    }
    return false
  }
}

/**
 * 从 localStorage 加载模拟数据
 */
export function loadMockData() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      console.log('📦 未找到本地存储的模拟数据')
      return null
    }

    const parsedData = JSON.parse(data)
    
    // 检查版本
    if (parsedData.version !== STORAGE_VERSION) {
      console.warn('⚠️ 模拟数据版本不匹配，将重新生成')
      clearMockData()
      return null
    }

    console.log('✅ 已从本地存储加载模拟数据')
    return parsedData
  } catch (e) {
    console.error('❌ 读取模拟数据失败:', e)
    return null
  }
}

/**
 * 清除本地存储的模拟数据
 */
export function clearMockData() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ 已清除本地存储的模拟数据')
    return true
  } catch (e) {
    console.error('❌ 清除模拟数据失败:', e)
    return false
  }
}

/**
 * 初始化模拟数据
 * 优先使用本地存储的数据，如果不存在则生成新数据
 */
export function initializeMockData() {
  console.log('🚀 初始化模拟数据...')
  
  const existingData = loadMockData()
  
  if (existingData) {
    console.log('📊 使用已存储的模拟数据')
    return existingData
  } else {
    console.log('🔨 生成新的模拟数据...')
    const newData = generateAllMockData()
    saveMockData(newData)
    console.log('✨ 模拟数据生成完成')
    return newData
  }
}

/**
 * 重置模拟数据
 * 清除旧数据并生成新数据
 */
export function resetMockData() {
  console.log('🔄 重置模拟数据...')
  clearMockData()
  const newData = generateAllMockData()
  saveMockData(newData)
  console.log('✅ 模拟数据已重置')
  return newData
}

/**
 * 获取存储信息
 */
export function getStorageInfo() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      return {
        exists: false,
        size: 0,
        sizeKB: 0
      }
    }

    const sizeBytes = new Blob([data]).size
    const sizeKB = (sizeBytes / 1024).toFixed(2)

    return {
      exists: true,
      size: sizeBytes,
      sizeKB,
      version: JSON.parse(data).version,
      savedAt: JSON.parse(data).savedAt
    }
  } catch (e) {
    console.error('获取存储信息失败:', e)
    return null
  }
}

/**
 * 导出模拟数据为 JSON 文件
 */
export function exportMockData() {
  try {
    const data = loadMockData()
    if (!data) {
      console.error('没有可导出的数据')
      return false
    }

    const dataStr = JSON.stringify(data, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `mock-data-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    console.log('✅ 模拟数据已导出')
    return true
  } catch (e) {
    console.error('❌ 导出模拟数据失败:', e)
    return false
  }
}

/**
 * 导入模拟数据从 JSON 文件
 */
export function importMockData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        saveMockData(data)
        console.log('✅ 模拟数据已导入')
        resolve(data)
      } catch (error) {
        console.error('❌ 导入模拟数据失败:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}
