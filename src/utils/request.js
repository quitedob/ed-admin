import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/cookie.js'
import router from '@/router/index.js'
import { PATH } from '@/utils/constants/system'
import { NetworkError, ApiError, handleError } from './errorHandler.js'

const pending = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken

const request = axios.create({
  baseURL: PATH.URL_GATEWAY, // url = request url + base url
  timeout: 60000 // request timeout
})

// Mock data responses
const mockResponses = {
  '\system\api\sys\config\website': {
    code: 200,
    data: {
      websiteCopyright: '© 2024 芝麻信奥教育系统',
      websiteIcp: '浙ICP备12345678号',
      websitePrn: '浙公网安备330000000000号',
      websitePrnNo: '330000000000'
    }
  },
  '\system\api\common\code': {
    code: 200,
    data: {
      verToken: 'mock-token-' + Date.now(),
      img: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSIyNSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzQwOUVGRiI+MTIzNDwvdGV4dD48L3N2Zz4='
    }
  },
  // 课程资源相关API
  '/course/admin/resource/page': {
    code: 200,
    data: [
      {
        id: 'res_1',
        name: '教学背景图1.jpg',
        type: 'image',
        url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EImage 1%3C/text%3E%3C/svg%3E',
        size: 1024000,
        groupId: 'group_1',
        createdAt: '2024-12-01T10:00:00Z'
      },
      {
        id: 'res_2',
        name: '教学视频.mp4',
        type: 'video',
        url: '#',
        size: 5120000,
        groupId: 'group_1',
        createdAt: '2024-12-02T10:00:00Z'
      },
      {
        id: 'res_3',
        name: '教学音频.mp3',
        type: 'audio',
        url: '#',
        size: 2560000,
        groupId: 'group_2',
        createdAt: '2024-12-03T10:00:00Z'
      }
    ],
    total: 3
  },
  '/course/admin/resource/group/page': {
    code: 200,
    data: [
      {
        id: 'group_1',
        name: '图片素材',
        description: '所有图片类素材',
        parentId: null,
        sort: 1,
        createdAt: '2024-12-01T09:00:00Z'
      },
      {
        id: 'group_2',
        name: '视频素材',
        description: '所有视频类素材',
        parentId: null,
        sort: 2,
        createdAt: '2024-12-01T09:00:00Z'
      },
      {
        id: 'group_3',
        name: '音频素材',
        description: '所有音频类素材',
        parentId: null,
        sort: 3,
        createdAt: '2024-12-01T09:00:00Z'
      }
    ],
    total: 3
  },
  '/course/admin/resource/group/list': {
    code: 200,
    data: [
      {
        id: 'group_1',
        name: '图片素材',
        description: '所有图片类素材',
        parentId: null,
        sort: 1
      },
      {
        id: 'group_2',
        name: '视频素材',
        description: '所有视频类素材',
        parentId: null,
        sort: 2
      },
      {
        id: 'group_3',
        name: '音频素材',
        description: '所有音频类素材',
        parentId: null,
        sort: 3
      }
    ]
  },
  // 其他常用API的Mock数据
  '/course/admin/resource/save': {
    code: 200,
    data: { id: 'new_res_' + Date.now() }
  },
  '/course/admin/resource/edit': {
    code: 200,
    data: { success: true }
  },
  '/course/admin/resource/delete': {
    code: 200,
    data: { success: true }
  },
  '/course/admin/resource/group/save': {
    code: 200,
    data: { id: 'new_group_' + Date.now() }
  },
  '/course/admin/resource/group/edit': {
    code: 200,
    data: { success: true }
  },
  '/course/admin/resource/group/delete': {
    code: 200,
    data: { success: true }
  },
  // 上传相关API
  '/system/admin/upload/pic': {
    code: 200,
    data: { url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EUploaded%3C/text%3E%3C/svg%3E' }
  },
  '/system/admin/upload/doc': {
    code: 200,
    data: { url: '#' }
  },
  '/system/admin/upload/app': {
    code: 200,
    data: { url: '#' }
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
        data: [],
        message: 'Mock data response'
      }
      // 创建一个模拟的axios响应对象
      return Promise.resolve({
        data: response,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
        __isMock: true
      })
    }

    removePending(config, true) // 在一个ajax发送前执行一下取消操作
    const token = getToken()
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }

    // 设置请求头中的Content-Type
    config.headers = config.headers || {}
    if (config.method === 'post' || config.method === 'put') {
      config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    }

    // 为请求添加唯一标识，用于取消请求
    config.cancelToken = config.cancelToken || new CancelToken(c => {
      pending.push({ u: config.url + '&' + config.method, f: c })
    })
    return config
  },
  (error) => {
    handleError(error, 'Request Setup Error')
    return Promise.reject(error)
  }
)

// response interceptor
request.interceptors.response.use(
  (response) => {
    // 如果是mock响应，直接返回
    if (response.__isMock) {
      return response
    }

    // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
    removePending(
      {
        url: response.config.url ? response.config.url.replace(PATH.URL_GATEWAY, '') : '',
        method: response.config.method
      },
      false
    )
    const res = response.data
    if (res.code === undefined || res.code === 200) {
      return response
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
        // 当执行的是取消操作时，将其从pending中移除
        if (isCancel) {
          pending[p].f('操作取消，' + config.url + '--' + config.method)
          pending.splice(p, 1)
        } else {
          // 当执行的是正常操作时，将其从pending中移除
          pending.splice(p, 1)
        }
      }
    }
  }
}

const getRequest = (url) => {
  return request({
    url,
    method: 'get'
  })
}

const postRequest = (url, params) => {
  return request({
    url,
    method: 'post',
    data: params
  })
}

const putRequest = (url, params) => {
  return request({
    url,
    method: 'put',
    data: params
  })
}

const deleteRequest = (url) => {
  return request({
    url,
    method: 'delete'
  })
}

const upload = (url, file, fileName, onUploadProgress, cancelRequest) => {
  const formData = new FormData()
  formData.append(fileName, file)

  return request({
    url,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress,
    cancelToken: cancelRequest ? new CancelToken(cancelRequest) : undefined
  })
}

export { getRequest, postRequest, putRequest, deleteRequest, upload }
export default request