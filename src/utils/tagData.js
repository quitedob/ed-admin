// 三级标签数据模型

// 标签分类数据（三级结构）
export const tagCategories = [
  // 第一级：学科门类
  {
    id: 'subject_001',
    name: '计算机科学',
    level: 1,
    parentId: null,
    sort: 1,
    children: [
      // 第二级：专业方向
      {
        id: 'subject_001_001',
        name: '编程语言',
        level: 2,
        parentId: 'subject_001',
        sort: 1,
        children: [
          // 第三级：具体知识点
          { id: 'subject_001_001_001', name: 'Java基础', level: 3, parentId: 'subject_001_001', sort: 1 },
          { id: 'subject_001_001_002', name: 'Python编程', level: 3, parentId: 'subject_001_001', sort: 2 },
          { id: 'subject_001_001_003', name: 'C++语言', level: 3, parentId: 'subject_001_001', sort: 3 },
          { id: 'subject_001_001_004', name: 'JavaScript', level: 3, parentId: 'subject_001_001', sort: 4 },
          { id: 'subject_001_001_005', name: 'Go语言', level: 3, parentId: 'subject_001_001', sort: 5 },
        ]
      },
      {
        id: 'subject_001_002',
        name: '数据结构与算法',
        level: 2,
        parentId: 'subject_001',
        sort: 2,
        children: [
          { id: 'subject_001_002_001', name: '线性表', level: 3, parentId: 'subject_001_002', sort: 1 },
          { id: 'subject_001_002_002', name: '树与图', level: 3, parentId: 'subject_001_002', sort: 2 },
          { id: 'subject_001_002_003', name: '排序算法', level: 3, parentId: 'subject_001_002', sort: 3 },
          { id: 'subject_001_002_004', name: '搜索算法', level: 3, parentId: 'subject_001_002', sort: 4 },
          { id: 'subject_001_002_005', name: '动态规划', level: 3, parentId: 'subject_001_002', sort: 5 },
        ]
      },
      {
        id: 'subject_001_003',
        name: '软件开发',
        level: 2,
        parentId: 'subject_001',
        sort: 3,
        children: [
          { id: 'subject_001_003_001', name: '设计模式', level: 3, parentId: 'subject_001_003', sort: 1 },
          { id: 'subject_001_003_002', name: '软件工程', level: 3, parentId: 'subject_001_003', sort: 2 },
          { id: 'subject_001_003_003', name: '版本控制', level: 3, parentId: 'subject_001_003', sort: 3 },
          { id: 'subject_001_003_004', name: '测试驱动', level: 3, parentId: 'subject_001_003', sort: 4 },
        ]
      },
      {
        id: 'subject_001_004',
        name: '数据库',
        level: 2,
        parentId: 'subject_001',
        sort: 4,
        children: [
          { id: 'subject_001_004_001', name: 'SQL基础', level: 3, parentId: 'subject_001_004', sort: 1 },
          { id: 'subject_001_004_002', name: '数据库设计', level: 3, parentId: 'subject_001_004', sort: 2 },
          { id: 'subject_001_004_003', name: '事务处理', level: 3, parentId: 'subject_001_004', sort: 3 },
          { id: 'subject_001_004_004', name: 'NoSQL', level: 3, parentId: 'subject_001_004', sort: 4 },
        ]
      }
    ]
  },
  {
    id: 'subject_002',
    name: '数学',
    level: 1,
    parentId: null,
    sort: 2,
    children: [
      {
        id: 'subject_002_001',
        name: '高等数学',
        level: 2,
        parentId: 'subject_002',
        sort: 1,
        children: [
          { id: 'subject_002_001_001', name: '极限与连续', level: 3, parentId: 'subject_002_001', sort: 1 },
          { id: 'subject_002_001_002', name: '导数与微分', level: 3, parentId: 'subject_002_001', sort: 2 },
          { id: 'subject_002_001_003', name: '积分学', level: 3, parentId: 'subject_002_001', sort: 3 },
          { id: 'subject_002_001_004', name: '级数', level: 3, parentId: 'subject_002_001', sort: 4 },
        ]
      },
      {
        id: 'subject_002_002',
        name: '线性代数',
        level: 2,
        parentId: 'subject_002',
        sort: 2,
        children: [
          { id: 'subject_002_002_001', name: '矩阵运算', level: 3, parentId: 'subject_002_002', sort: 1 },
          { id: 'subject_002_002_002', name: '向量空间', level: 3, parentId: 'subject_002_002', sort: 2 },
          { id: 'subject_002_002_003', name: '特征值', level: 3, parentId: 'subject_002_002', sort: 3 },
        ]
      },
      {
        id: 'subject_002_003',
        name: '概率论',
        level: 2,
        parentId: 'subject_002',
        sort: 3,
        children: [
          { id: 'subject_002_003_001', name: '概率基础', level: 3, parentId: 'subject_002_003', sort: 1 },
          { id: 'subject_002_003_002', name: '随机变量', level: 3, parentId: 'subject_002_003', sort: 2 },
          { id: 'subject_002_003_003', name: '数理统计', level: 3, parentId: 'subject_002_003', sort: 3 },
        ]
      }
    ]
  },
  {
    id: 'subject_003',
    name: '英语',
    level: 1,
    parentId: null,
    sort: 3,
    children: [
      {
        id: 'subject_003_001',
        name: '词汇语法',
        level: 2,
        parentId: 'subject_003',
        sort: 1,
        children: [
          { id: 'subject_003_001_001', name: '词汇辨析', level: 3, parentId: 'subject_003_001', sort: 1 },
          { id: 'subject_003_001_002', name: '语法结构', level: 3, parentId: 'subject_003_001', sort: 2 },
          { id: 'subject_003_001_003', name: '时态语态', level: 3, parentId: 'subject_003_001', sort: 3 },
        ]
      },
      {
        id: 'subject_003_002',
        name: '阅读理解',
        level: 2,
        parentId: 'subject_003',
        sort: 2,
        children: [
          { id: 'subject_003_002_001', name: '主旨大意', level: 3, parentId: 'subject_003_002', sort: 1 },
          { id: 'subject_003_002_002', name: '细节理解', level: 3, parentId: 'subject_003_002', sort: 2 },
          { id: 'subject_003_002_003', name: '推理判断', level: 3, parentId: 'subject_003_002', sort: 3 },
        ]
      }
    ]
  }
]

// 标签库数据
export const questionTags = [
  // 计算机科学相关标签
  { id: 'tag_001', name: '面向对象', categoryId: 'subject_001_003_001', color: '#409eff', description: '面向对象编程概念', isSystem: true, usageCount: 25 },
  { id: 'tag_002', name: '封装继承多态', categoryId: 'subject_001_003_001', color: '#409eff', description: '面向对象三大特性', isSystem: true, usageCount: 18 },
  { id: 'tag_003', name: 'Java集合', categoryId: 'subject_001_001_001', color: '#67c23a', description: 'Java集合框架', isSystem: true, usageCount: 15 },
  { id: 'tag_004', name: '异常处理', categoryId: 'subject_001_001_001', color: '#67c23a', description: 'Java异常机制', isSystem: true, usageCount: 12 },
  { id: 'tag_005', name: '数组操作', categoryId: 'subject_001_002_001', color: '#e6a23c', description: '数组相关操作', isSystem: true, usageCount: 30 },
  { id: 'tag_006', name: '链表操作', categoryId: 'subject_001_002_001', color: '#e6a23c', description: '链表相关操作', isSystem: true, usageCount: 20 },
  { id: 'tag_007', name: '二叉树遍历', categoryId: 'subject_001_002_002', color: '#f56c6c', description: '二叉树遍历算法', isSystem: true, usageCount: 22 },
  { id: 'tag_008', name: '快速排序', categoryId: 'subject_001_002_003', color: '#f56c6c', description: '快速排序算法', isSystem: true, usageCount: 16 },
  { id: 'tag_009', name: '二分查找', categoryId: 'subject_001_002_004', color: '#909399', description: '二分查找算法', isSystem: true, usageCount: 14 },
  { id: 'tag_010', name: '单例模式', categoryId: 'subject_001_003_001', color: '#606266', description: '单例设计模式', isSystem: true, usageCount: 10 },

  // 数学相关标签
  { id: 'tag_011', name: '极限计算', categoryId: 'subject_002_001_001', color: '#409eff', description: '数学极限计算', isSystem: true, usageCount: 8 },
  { id: 'tag_012', name: '导数应用', categoryId: 'subject_002_001_002', color: '#409eff', description: '导数的应用', isSystem: true, usageCount: 12 },
  { id: 'tag_013', name: '矩阵运算', categoryId: 'subject_002_002_001', color: '#67c23a', description: '矩阵相关运算', isSystem: true, usageCount: 15 },
  { id: 'tag_014', name: '概率计算', categoryId: 'subject_002_003_001', color: '#e6a23c', description: '概率相关计算', isSystem: true, usageCount: 10 },

  // 英语相关标签
  { id: 'tag_015', name: '词汇辨析', categoryId: 'subject_003_001_001', color: '#f56c6c', description: '英语词汇辨析', isSystem: true, usageCount: 20 },
  { id: 'tag_016', name: '时态用法', categoryId: 'subject_003_001_003', color: '#909399', description: '英语时态用法', isSystem: true, usageCount: 18 },
]

// 工具函数：扁平化分类数据
export const flattenCategories = (categories, level = null) => {
  const result = []

  const traverse = (items) => {
    items.forEach(item => {
      if (level === null || item.level === level) {
        result.push(item)
      }
      if (item.children && item.children.length > 0) {
        traverse(item.children)
      }
    })
  }

  traverse(categories)
  return result
}

// 工具函数：根据父级ID获取子级分类
export const getChildCategories = (parentId) => {
  const allCategories = flattenCategories(tagCategories)
  return allCategories.filter(cat => cat.parentId === parentId)
}

// 工具函数：获取分类路径
export const getCategoryPath = (categoryId) => {
  const allCategories = flattenCategories(tagCategories)
  const path = []

  const findPath = (id) => {
    const category = allCategories.find(cat => cat.id === id)
    if (!category) return

    path.unshift(category)
    if (category.parentId) {
      findPath(category.parentId)
    }
  }

  findPath(categoryId)
  return path
}

// 工具函数：根据分类ID获取标签
export const getTagsByCategory = (categoryId) => {
  return questionTags.filter(tag => tag.categoryId === categoryId)
}

// 工具函数：根据分类路径获取标签
export const getTagsByCategoryPath = (categoryIds) => {
  if (!categoryIds || categoryIds.length === 0) return []

  // 获取选中的第三级分类
  const selectedLevel3Id = categoryIds[categoryIds.length - 1]
  return getTagsByCategory(selectedLevel3Id)
}

// 工具函数：获取一级分类
export const getLevel1Categories = () => {
  return tagCategories
}

// 工具函数：获取二级分类
export const getLevel2Categories = (parentId) => {
  const parent = tagCategories.find(cat => cat.id === parentId)
  return parent ? parent.children : []
}

// 工具函数：获取三级分类
export const getLevel3Categories = (parentId) => {
  const level1Categories = tagCategories
  for (const level1 of level1Categories) {
    const level2 = level1.children.find(cat => cat.id === parentId)
    if (level2) {
      return level2.children
    }
  }
  return []
}

// 默认导出
export default {
  tagCategories,
  questionTags,
  flattenCategories,
  getChildCategories,
  getCategoryPath,
  getTagsByCategory,
  getTagsByCategoryPath,
  getLevel1Categories,
  getLevel2Categories,
  getLevel3Categories
}