import request from '@/utils/request'

// 模拟内容数据
const mockContents = [
  {
    id: 1,
    title: 'JavaScript基础知识总结',
    type: 'article',
    content: '<h2>JavaScript基础知识点</h2><p>本文总结了JavaScript的核心基础知识...</p>',
    coverImage: 'https://via.placeholder.com/300x200/409EFF/ffffff?text=JavaScript',
    tags: ['JavaScript', '前端', '基础'],
    categoryId: 1,
    categoryName: '编程技术',
    author: '张老师',
    viewCount: 1250,
    likeCount: 89,
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-16 15:45:00',
    status: 1
  },
  {
    id: 2,
    title: 'Vue.js组件开发实战',
    type: 'video',
    content: '<h2>Vue.js组件开发</h2><p>本视频介绍了Vue.js组件开发的核心概念...</p>',
    videoUrl: 'https://example.com/video1.mp4',
    videoDuration: 1800,
    coverImage: 'https://via.placeholder.com/300x200/67C23A/ffffff?text=Vue.js',
    tags: ['Vue.js', '组件', '实战'],
    categoryId: 1,
    categoryName: '编程技术',
    author: '李老师',
    viewCount: 2100,
    likeCount: 156,
    createTime: '2024-01-18 09:15:00',
    updateTime: '2024-01-19 14:20:00',
    status: 1
  }
]

// 模拟AIGC作品数据
const mockAIGCWorks = [
  {
    id: 1,
    title: 'AI生成的网页设计',
    type: 'webpage',
    description: '使用AI工具生成的响应式网页设计作品',
    thumbnail: 'https://via.placeholder.com/400x300/E6A23C/ffffff?text=网页设计',
    previewUrl: 'https://example.com/preview1',
    author: '张三',
    authorId: 1,
    className: '前端开发基础班',
    classId: 1,
    courseId: 1,
    courseName: 'JavaScript基础编程',
    chapterId: 1,
    chapterName: '第1章：变量与数据类型',
    files: [
      {
        id: 1,
        name: 'index.html',
        type: 'html',
        size: 15234,
        url: 'https://example.com/files/index.html'
      },
      {
        id: 2,
        name: 'style.css',
        type: 'css',
        size: 8567,
        url: 'https://example.com/files/style.css'
      }
    ],
    tags: ['AI生成', '网页设计', '响应式'],
    likeCount: 23,
    commentCount: 5,
    viewCount: 156,
    submitTime: '2024-01-20 14:30:00',
    status: 1,
    isPublic: true
  },
  {
    id: 2,
    title: 'AI生成的插画作品',
    type: 'image',
    description: '使用Midjourney生成的科幻主题插画',
    thumbnail: 'https://via.placeholder.com/400x300/F56C6C/ffffff?text=AI插画',
    previewUrl: 'https://example.com/preview2',
    author: '李四',
    authorId: 2,
    className: '前端开发基础班',
    classId: 1,
    courseId: 1,
    courseName: 'JavaScript基础编程',
    chapterId: 2,
    chapterName: '第2章：函数与作用域',
    files: [
      {
        id: 3,
        name: 'scifi-art.png',
        type: 'image',
        size: 2457890,
        url: 'https://example.com/files/scifi-art.png'
      }
    ],
    tags: ['AI生成', '插画', '科幻'],
    likeCount: 45,
    commentCount: 12,
    viewCount: 289,
    submitTime: '2024-01-21 10:15:00',
    status: 1,
    isPublic: true
  },
  {
    id: 3,
    title: 'AI生成的音乐作品',
    type: 'audio',
    description: '使用Suno AI生成的电子音乐作品',
    thumbnail: 'https://via.placeholder.com/400x300/909399/ffffff?text=AI音乐',
    previewUrl: 'https://example.com/preview3',
    author: '王五',
    authorId: 3,
    className: 'Vue.js进阶班',
    classId: 2,
    courseId: 2,
    courseName: 'Vue.js组件开发',
    chapterId: 4,
    chapterName: '第1章：组件基础',
    files: [
      {
        id: 4,
        name: 'electronic-music.mp3',
        type: 'audio',
        size: 4567890,
        url: 'https://example.com/files/electronic-music.mp3'
      }
    ],
    tags: ['AI生成', '音乐', '电子'],
    likeCount: 67,
    commentCount: 8,
    viewCount: 412,
    submitTime: '2024-01-22 16:45:00',
    status: 1,
    isPublic: true
  }
]

// 模拟分类数据
const mockCategories = [
  { id: 1, name: '编程技术', description: '编程相关技术内容' },
  { id: 2, name: '设计艺术', description: '设计类作品和教程' },
  { id: 3, name: '项目实战', description: '实际项目案例' },
  { id: 4, name: '理论知识', description: '理论基础和概念' }
]

// API接口定义
export default {
  // 获取内容列表
  getContentList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, keyword = '', type = '', categoryId = '' } = params
        let filteredData = mockContents

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.title.includes(keyword) || item.content.includes(keyword)
          )
        }

        if (type) {
          filteredData = filteredData.filter(item => item.type === type)
        }

        if (categoryId) {
          filteredData = filteredData.filter(item => item.categoryId === categoryId)
        }

        const start = (page - 1) * limit
        const end = start + limit
        const items = filteredData.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: items,
            page: page,
            limit: limit
          }
        })
      }, 300)
    })
  },

  // 获取内容详情
  getContentDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = mockContents.find(item => item.id === id)
        if (content) {
          resolve({
            code: 200,
            data: content
          })
        } else {
          resolve({
            code: 404,
            message: '内容不存在'
          })
        }
      }, 200)
    })
  },

  // 创建内容
  createContent(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newContent = {
          id: mockContents.length + 1,
          ...data,
          viewCount: 0,
          likeCount: 0,
          createTime: new Date().toLocaleString(),
          updateTime: new Date().toLocaleString(),
          status: 1
        }
        mockContents.push(newContent)

        resolve({
          code: 200,
          message: '内容创建成功',
          data: newContent
        })
      }, 400)
    })
  },

  // 更新内容
  updateContent(id, data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const content = mockContents.find(item => item.id === id)
        if (content) {
          Object.assign(content, data, {
            updateTime: new Date().toLocaleString()
          })
          resolve({
            code: 200,
            message: '内容更新成功',
            data: content
          })
        } else {
          resolve({
            code: 404,
            message: '内容不存在'
          })
        }
      }, 400)
    })
  },

  // 删除内容
  deleteContent(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockContents.findIndex(item => item.id === id)
        if (index > -1) {
          mockContents.splice(index, 1)
          resolve({
            code: 200,
            message: '内容删除成功'
          })
        } else {
          resolve({
            code: 404,
            message: '内容不存在'
          })
        }
      }, 300)
    })
  },

  // 获取分类列表
  getCategoryList() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          code: 200,
          data: mockCategories
        })
      }, 200)
    })
  },

  // 获取AIGC作品列表
  getAIGCWorksList(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 12, classId = '', courseId = '', type = '', keyword = '' } = params
        let filteredData = mockAIGCWorks

        if (classId) {
          filteredData = filteredData.filter(item => item.classId === classId)
        }

        if (courseId) {
          filteredData = filteredData.filter(item => item.courseId === courseId)
        }

        if (type) {
          filteredData = filteredData.filter(item => item.type === type)
        }

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.title.includes(keyword) || item.description.includes(keyword)
          )
        }

        const start = (page - 1) * limit
        const end = start + limit
        const items = filteredData.slice(start, end)

        resolve({
          code: 200,
          data: {
            total: filteredData.length,
            items: items,
            page: page,
            limit: limit
          }
        })
      }, 300)
    })
  },

  // 获取AIGC作品详情
  getAIGCWorkDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const work = mockAIGCWorks.find(item => item.id === id)
        if (work) {
          resolve({
            code: 200,
            data: work
          })
        } else {
          resolve({
            code: 404,
            message: '作品不存在'
          })
        }
      }, 200)
    })
  },

  // 提交AIGC作品
  submitAIGCWork(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newWork = {
          id: mockAIGCWorks.length + 1,
          ...data,
          likeCount: 0,
          commentCount: 0,
          viewCount: 0,
          submitTime: new Date().toLocaleString(),
          status: 1,
          isPublic: data.isPublic !== false
        }
        mockAIGCWorks.push(newWork)

        resolve({
          code: 200,
          message: '作品提交成功',
          data: newWork
        })
      }, 500)
    })
  },

  // 点赞/取消点赞
  toggleLike(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const work = mockAIGCWorks.find(item => item.id === id)
        if (work) {
          // 模拟点赞逻辑
          const isLiked = Math.random() > 0.5
          work.likeCount += isLiked ? 1 : -1
          resolve({
            code: 200,
            message: isLiked ? '点赞成功' : '取消点赞',
            data: {
              liked: isLiked,
              likeCount: work.likeCount
            }
          })
        } else {
          resolve({
            code: 404,
            message: '作品不存在'
          })
        }
      }, 200)
    })
  },

  // 批量操作内容
  batchOperateContent(operation, ids) {
    return new Promise((resolve) => {
      setTimeout(() => {
        let successCount = 0
        ids.forEach(id => {
          const index = mockContents.findIndex(item => item.id === id)
          if (index > -1) {
            if (operation === 'delete') {
              mockContents.splice(index, 1)
            } else if (operation === 'publish') {
              mockContents[index].status = 1
            } else if (operation === 'draft') {
              mockContents[index].status = 0
            }
            successCount++
          }
        })

        resolve({
          code: 200,
          message: `批量操作成功，处理了 ${successCount} 条内容`,
          data: { successCount }
        })
      }, 400)
    })
  },

  // 文件上传
  uploadFile(file) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟文件上传
        const fileUrl = `https://example.com/uploads/${file.name}`
        resolve({
          code: 200,
          message: '上传成功',
          data: {
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type
          }
        })
      }, 1000 + Math.random() * 2000) // 模拟上传时间
    })
  }
}