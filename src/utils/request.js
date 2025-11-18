import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/cookie.js'
import router from '@/router/index.js'
import { PATH } from '@/utils/constants/system'
import { NetworkError, ApiError, handleError } from './errorHandler.js'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken

// create an axios instance
const request = axios.create({
  baseURL: PATH.URL_GATEWAY, // url = request url + base url
  timeout: 60000 // request timeout
})

// Mock data responses (全面使用Mock数据)
const mockResponses = {
  '/system/api/sys/config/website': {
    code: 200,
    data: {
      websiteCopyright: '© 2024 芝麻信奥教育系统',
      websiteIcp: '浙ICP备12345678号',
      websitePrn: '浙公网安备330000000000号',
      websitePrnNo: '330000000000'
    }
  },
  '/system/api/common/code': {
    code: 200,
    data: {
      verToken: 'mock-token-' + Date.now(),
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzQwOUVGRiI+MTIzNDwvdGV4dD48L3N2Zz4='
    }
  },
  // 用户相关API
  '/api/user/info': {
    code: 200,
    data: {
      id: 1,
      username: 'admin',
      nickname: '管理员',
      email: 'admin@example.com',
      avatar: '',
      roles: ['admin'],
      permissions: ['*']
    }
  },
  '/api/user/list': {
    code: 200,
    data: {
      items: [
        { id: 1, username: 'admin', nickname: '管理员', status: 'active' },
        { id: 2, username: 'teacher1', nickname: '张老师', status: 'active' },
        { id: 3, username: 'student1', nickname: '张三', status: 'active' }
      ],
      total: 3,
      page: 1,
      limit: 20
    }
  },
  // 班级相关API
  '/api/class/list': {
    code: 200,
    data: {
      items: [
        { id: 1, name: '班级A', teacher: '张老师', studentCount: 30 },
        { id: 2, name: '班级B', teacher: '李老师', studentCount: 25 }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  },
  // 作业相关API
  '/api/homework/list': {
    code: 200,
    data: {
      items: [
        { id: 1, title: 'JavaScript基础练习', class: '班级A', deadline: '2024-12-31' },
        { id: 2, title: 'React组件开发', class: '班级B', deadline: '2024-12-25' }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  },
  // 考试相关API
  '/api/exam/list': {
    code: 200,
    data: {
      items: [
        { id: 1, title: '期中考试', class: '班级A', startTime: '2024-12-20 09:00' },
        { id: 2, title: '期末考试', class: '班级B', startTime: '2024-12-28 14:00' }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  },
  // 课程相关API
  '/api/course/list': {
    code: 200,
    data: {
      items: [
        { id: 1, name: 'JavaScript基础', description: '学习JavaScript基础知识' },
        { id: 2, name: 'React开发', description: 'React框架开发课程' }
      ],
      total: 2,
      page: 1,
      limit: 20
    }
  },
  // 题库相关API
  '/api/question-bank/questions': {
    code: 200,
    data: {
      items: [],
      total: 0,
      page: 1,
      limit: 20
    }
  },
  '/api/question-bank/tags': {
    code: 200,
    data: {
      items: [
        { id: 1, name: 'JavaScript', color: '#f7df1e' },
        { id: 2, name: 'React', color: '#61dafb' }
      ],
      total: 2
    }
  },
  // 分析相关API
  '/api/analysis/dashboard': {
    code: 200,
    data: {
      totalStudents: 100,
      totalClasses: 5,
      totalHomeworks: 20,
      totalExams: 10
    }
  }
}

// request interceptor
request.interceptors.request.use(
  (config) => {
    // 强制使用Mock数据 - 拦截所有请求并返回mock响应
    const mockData = mockResponses[config.url]
    if (mockData || process.env.NODE_ENV === 'development') {
      // 如果有特定mock数据就用，否则返回通用mock响应
      const response = mockData || {
        code: 200,
        data: {},
        message: 'Mock data response'
      }
      return Promise.reject({
        config,
        response: { data: response },
        __isMock: true
      })
    }

    removePending(config, true) // 在一个ajax发送前执行一下取消操作
    const token = getToken()
    if (token) {
      config.headers['token'] = token
    }
    config.cancelToken = new CancelToken((c) => {
      // 这里的ajax标识用：请求地址&请求方式拼接的字符串
      pending.push({ u: config.url + '&' + config.method, f: c })
    })
    return config
  },
  (error) => {
    // Handle mock responses
    if (error.__isMock) {
      return Promise.resolve(error.response)
    }
    handleError(error, 'Request Setup Error')
    return Promise.reject(error)
  }
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    removePending(
      {
        url: response.config.url ? response.config.url.replace(PATH.URL_GATEWAY, '') : '',
        method: response.config.method
      },
      false
    )
    const res = response.data
    if (res.code === 200) {
      return Promise.resolve(res.data)
    }

    if (res.code === 301) {
      // token过期
      removeToken()
      router.push(PATH.URL_LOGIN).then(() => {
        ElMessage.error('登录已过期，请重新登录')
        location.reload() // 重新实例化vue-router对象
      })
      return Promise.reject(response)
    }

    if (res.code === 302 || res.code === 303 || res.code === 304 || res.code === 305) {
      // 302token异常，303登录异常，304异地登录，305菜单过期
      ElMessageBox.confirm('提示', '确定登出', {
        confirmButtonText: res.msg,
        showCancelButton: false,
        type: 'warning'
      }).then(() => {
        removeToken()
        location.reload() // 重新实例化vue-router对象
      })
      return Promise.reject(response)
    }

    if (res.code === 306) {
      // 权限不足
      router.push({ path: PATH.URL_403 }).then(() => {
        ElMessage.error('权限不足，请联系管理员')
      })
      return Promise.reject(response)
    }

    // 其他异常
    console.error(response)
    ElMessage.error({ message: res.msg, duration: 5 * 1000 })
    return Promise.reject(response)
  },
  (error) => {
    if (error.response) {
      // API错误
      handleError(new ApiError(error.response), 'API Response Error')
    } else if (error.request) {
      // 网络错误
      handleError(new NetworkError(error), 'Network Error')
    } else {
      // 其他错误
      handleError(error, 'Unknown Error')
    }
    return Promise.reject(error)
  }
)

const removePending = (config, isCancel) => {
  for (const p in pending) {
    // 枚举不处理
    if (config.url.indexOf('enum') === -1) {
      if (pending[p].u === config.url + '&' + config.method) {
        // 当前请求在数组中存在时执行函数体
        if (isCancel) {
          pending[p].f() // 执行取消操作
        }
        pending.splice(Number(p), 1) // 把这条记录从数组中移除
      }
    }
  }
}

/**
 * post请求
 */
export const postRequest = (url, data = {}) => {
  return request({ url: url, data: data ? data : {}, method: 'post' })
}

/**
 * get请求
 */
export const getRequest = (url) => {
  return request({ url: url, method: 'get' })
}

/**
 * put请求
 */
export const putRequest = (url, data = {}) => {
  return request({ url: url, data: data ? data : {}, method: 'put' })
}

/**
 * delete请求
 */
export const deleteRequest = (url) => {
  return request({ url: url, method: 'delete' })
}

export const upload = (url, file, fileName, cb, cancelFun) => {
  const formData = new FormData()
  formData.append(fileName, file)
  const config = {
    onUploadProgress: (progressEvent) => {
      const percent = Number(((progressEvent.loaded / progressEvent.total) * 100).toFixed(2))
      // 计算上传进度
      if (cb) {
        cb(percent)
      }
    }
  }
  if (cancelFun) {
    config.cancelToken = new axios.CancelToken(function excutor(c) {
      cancelFun.cancel = c
    })
  }

  return request.post(url, formData, config)
}

// 添加默认导出
export default request
