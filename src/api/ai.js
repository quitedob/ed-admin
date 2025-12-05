import request from '@/utils/request'

// 模拟AI对话数据
const mockConversations = [
  {
    id: 1,
    title: 'JavaScript闭包问题讨论',
    messages: [
      {
        id: 1,
        type: 'user',
        content: '我不太理解JavaScript中的闭包概念，能解释一下吗？',
        timestamp: '2024-01-20 14:30:00'
      },
      {
        id: 2,
        type: 'ai',
        content: '闭包是JavaScript中的一个重要概念。简单来说，闭包是指函数可以访问其外部作用域中的变量，即使在外部函数执行完毕后。让我用一个例子来说明：\n\n```javascript\nfunction outerFunction(x) {\n  return function innerFunction(y) {\n    return x + y; // innerFunction可以访问outerFunction的参数x\n  };\n}\n\nconst addFive = outerFunction(5);\nconsole.log(addFive(3)); // 输出8\n```\n\n在这个例子中，innerFunction形成了闭包，它可以访问outerFunction的参数x，即使outerFunction已经执行完毕。',
        timestamp: '2024-01-20 14:30:15'
      },
      {
        id: 3,
        type: 'user',
        content: '这个例子我能理解，但闭包在实际开发中有什么用途呢？',
        timestamp: '2024-01-20 14:32:00'
      },
      {
        id: 4,
        type: 'ai',
        content: '闭包在实际开发中有很多用途，我来列举几个常见的：\n\n1. **数据私有化**：创建私有变量\n2. **函数工厂**：生成特定功能的函数\n3. **事件处理**：保存状态\n4. **模块化**：创建模块\n\n你想深入了解哪个应用场景呢？',
        timestamp: '2024-01-20 14:32:20'
      }
    ],
    createdAt: '2024-01-20 14:30:00',
    updatedAt: '2024-01-20 14:32:20',
    courseId: 1,
    courseName: 'JavaScript基础编程',
    chapterId: 2,
    chapterName: '第2章：函数与作用域'
  }
]

// 模拟AI提示库
const mockHints = [
  {
    id: 1,
    category: 'debugging',
    title: '调试JavaScript代码的常用方法',
    content: '当你的JavaScript代码出现问题时，可以尝试以下调试方法：\n\n1. 使用console.log()输出变量值\n2. 使用浏览器开发者工具的断点功能\n3. 检查控制台错误信息\n4. 使用debugger语句设置断点\n5. 验证数据类型和结构',
    tags: ['调试', 'JavaScript', '错误处理'],
    difficulty: 'beginner'
  },
  {
    id: 2,
    category: 'algorithm',
    title: '解决算法问题的思考步骤',
    content: '遇到算法问题时，建议按照以下步骤思考：\n\n1. **理解问题**：明确输入输出和约束条件\n2. **分析例子**：通过具体例子理解问题规律\n3. **设计思路**：考虑暴力解法，然后优化\n4. **选择数据结构**：根据问题特点选择合适的数据结构\n5. **编写代码**：先写主要逻辑，再处理边界情况\n6. **测试验证**：用多种情况测试你的解法',
    tags: ['算法', '解题思路', '编程'],
    difficulty: 'intermediate'
  },
  {
    id: 3,
    category: 'vue',
    title: 'Vue组件通信的最佳实践',
    content: 'Vue组件通信的几种方式：\n\n1. **父子通信**：props down, events up\n2. **子父通信**：$emit触发事件\n3. **兄弟通信**：事件总线或状态管理\n4. **跨级通信**：provide/inject或状态管理\n5. **复杂场景**：Vuex/Pinia状态管理\n\n选择合适的通信方式取决于组件关系的复杂度和数据流向。',
    tags: ['Vue', '组件通信', '状态管理'],
    difficulty: 'intermediate'
  }
]

// 模拟学习建议
const mockSuggestions = [
  {
    id: 1,
    type: 'concept',
    title: '建议复习：变量作用域',
    description: '根据你的提问历史，建议你复习JavaScript中的变量作用域概念，这对理解闭包很重要。',
    resourceId: 1,
    resourceType: 'video',
    resourceName: 'JavaScript作用域详解',
    priority: 'high'
  },
  {
    id: 2,
    type: 'exercise',
    title: '推荐练习：闭包实战题',
    description: '通过实际编程练习来巩固闭包概念，包含5道不同难度的练习题。',
    resourceId: 2,
    resourceType: 'exercise',
    resourceName: '闭包练习题集',
    priority: 'medium'
  },
  {
    id: 3,
    type: 'reading',
    title: '扩展阅读：深入理解闭包',
    description: '一篇关于JavaScript闭包机制的深度文章，包含内存管理和性能优化相关内容。',
    resourceId: 3,
    resourceType: 'article',
    resourceName: 'JavaScript闭包完全指南',
    priority: 'low'
  }
]

// 模拟代码分析
const mockCodeAnalysis = [
  {
    id: 1,
    code: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}',
    analysis: {
      complexity: 'O(n)',
      spaceComplexity: 'O(n)',
      issues: [],
      suggestions: [
        '这是一个递归实现的阶乘函数',
        '时间复杂度为O(n)，空间复杂度为O(n)',
        '对于大数输入可能存在栈溢出风险',
        '可以考虑用迭代方式优化空间复杂度'
      ],
      improvements: [
        '可以考虑添加输入验证',
        '对于大数情况，可以使用迭代或尾递归优化'
      ]
    }
  }
]

// API接口定义
export default {
  // 发送AI消息
  sendMessage(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟AI回复
        const aiResponses = {
          'javascript': 'JavaScript是一种动态类型的编程语言，主要用于网页开发。它的特点是：\n\n1. 动态类型：变量类型在运行时确定\n2. 函数式编程：支持高阶函数和闭包\n3. 面向对象：支持原型继承\n4. 异步编程：支持Promise和async/await\n\n你想了解JavaScript的哪个方面呢？',
          'vue': 'Vue.js是一个渐进式JavaScript框架，用于构建用户界面。它的核心特性包括：\n\n1. **响应式数据绑定**：数据变化时自动更新视图\n2. **组件化开发**：将UI拆分为可复用的组件\n3. **虚拟DOM**：提高页面渲染性能\n4. **指令系统**：简化DOM操作\n\n有什么具体的Vue问题需要帮助吗？',
          'algorithm': '算法问题解决思路：\n\n1. **分析问题**：明确输入输出和约束条件\n2. **设计思路**：从简单到复杂，逐步优化\n3. **选择数据结构**：根据问题特点选择合适的数据结构\n4. **编写代码**：注意边界条件和异常情况\n5. **测试验证**：用多种情况测试\n\n可以分享具体的算法问题，我来帮你分析解题思路。',
          'debug': '代码调试步骤：\n\n1. **重现问题**：找到触发问题的具体步骤\n2. **定位错误**：查看错误信息和堆栈跟踪\n3. **分析原因**：理解错误产生的根本原因\n4. **修复问题**：选择合适的解决方案\n5. **验证修复**：确保问题已解决且没有引入新问题\n\n可以分享一下具体的错误信息吗？'
        }

        // 根据用户输入内容匹配回复
        let response = '我在这里帮助你学习！请告诉我你遇到了什么问题，或者想了解什么概念。'
        const message = data.message.toLowerCase()

        if (message.includes('javascript') || message.includes('js')) {
          response = aiResponses.javascript
        } else if (message.includes('vue')) {
          response = aiResponses.vue
        } else if (message.includes('算法') || message.includes('algorithm')) {
          response = aiResponses.algorithm
        } else if (message.includes('错误') || message.includes('bug') || message.includes('调试')) {
          response = aiResponses.debug
        } else if (message.includes('代码') || message.includes('code')) {
          response = '我可以帮你分析代码问题。请分享你的代码，我会：\n\n1. 检查语法错误\n2. 分析逻辑问题\n3. 提供优化建议\n4. 解释复杂概念\n\n请粘贴你的代码吧！'
        }

        resolve({
          code: 200,
          data: {
            id: Date.now(),
            type: 'ai',
            content: response,
            timestamp: new Date().toLocaleString(),
            suggestions: Math.random() > 0.5 ? [mockSuggestions[Math.floor(Math.random() * mockSuggestions.length)]] : []
          }
        })
      }, 1000 + Math.random() * 2000) // 模拟思考时间
    })
  },

  // 获取对话历史
  getConversations(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { page = 1, limit = 10, courseId = '' } = params
        let filteredData = mockConversations

        if (courseId) {
          filteredData = filteredData.filter(item => item.courseId === courseId)
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

  // 获取对话详情
  getConversationDetail(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const conversation = mockConversations.find(item => item.id === id)
        if (conversation) {
          resolve({
            code: 200,
            data: conversation
          })
        } else {
          resolve({
            code: 404,
            message: '对话不存在'
          })
        }
      }, 200)
    })
  },

  // 获取AI提示
  getHints(params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const { category = '', difficulty = '', keyword = '' } = params
        let filteredData = mockHints

        if (category) {
          filteredData = filteredData.filter(item => item.category === category)
        }

        if (difficulty) {
          filteredData = filteredData.filter(item => item.difficulty === difficulty)
        }

        if (keyword) {
          filteredData = filteredData.filter(item =>
            item.title.includes(keyword) || item.content.includes(keyword)
          )
        }

        resolve({
          code: 200,
          data: filteredData
        })
      }, 300)
    })
  },

  // 获取学习建议
  getSuggestions(userId, courseId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟基于用户历史和课程内容的个性化建议
        const suggestions = mockSuggestions.slice(0, 2)

        resolve({
          code: 200,
          data: suggestions
        })
      }, 400)
    })
  },

  // 分析代码
  analyzeCode(code, language) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟代码分析
        const analysis = {
          complexity: Math.random() > 0.5 ? 'O(n)' : 'O(n²)',
          spaceComplexity: Math.random() > 0.5 ? 'O(1)' : 'O(n)',
          issues: [],
          suggestions: [
            '代码结构清晰，逻辑正确',
            '建议添加更多注释说明',
            '考虑边界情况的处理'
          ],
          improvements: [
            '可以考虑使用更高效的算法',
            '添加错误处理机制',
            '优化代码可读性'
          ]
        }

        resolve({
          code: 200,
          data: {
            code,
            language,
            analysis
          }
        })
      }, 1500)
    })
  },

  // 生成代码示例
  generateCodeExample(concept, language) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const examples = {
          'closure': {
            javascript: `// 闭包示例\nfunction counter() {\n  let count = 0;\n  return function() {\n    count++;\n    return count;\n  };\n}\n\nconst increment = counter();\nconsole.log(increment()); // 1\nconsole.log(increment()); // 2`,
            python: `# 闭包示例\ndef counter():\n    count = 0\n    def increment():\n        nonlocal count\n        count += 1\n        return count\n    return increment\n\nincrement = counter()\nprint(increment())  # 1\nprint(increment())  # 2`
          },
          'recursion': {
            javascript: `// 递归示例：阶乘\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5)); // 120`,
            python: `# 递归示例：阶乘\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))  # 120`
          }
        }

        const example = examples[concept]?.[language] || '示例代码生成中...'

        resolve({
          code: 200,
          data: {
            concept,
            language,
            code: example,
            explanation: `这是一个${concept}概念在${language}中的实现示例。`
          }
        })
      }, 1200)
    })
  },

  // 保存对话
  saveConversation(conversation) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newConversation = {
          id: mockConversations.length + 1,
          ...conversation,
          createdAt: new Date().toLocaleString(),
          updatedAt: new Date().toLocaleString()
        }
        mockConversations.push(newConversation)

        resolve({
          code: 200,
          message: '对话保存成功',
          data: newConversation
        })
      }, 500)
    })
  },

  // 删除对话
  deleteConversation(id) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockConversations.findIndex(item => item.id === id)
        if (index > -1) {
          mockConversations.splice(index, 1)
          resolve({
            code: 200,
            message: '对话删除成功'
          })
        } else {
          resolve({
            code: 404,
            message: '对话不存在'
          })
        }
      }, 300)
    })
  }
}