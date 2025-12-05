// 统一学科配置：高考科目 + 编程科目
export const SUBJECT_OPTIONS = [
  { label: 'C++编程', value: 'cpp_programming', type: 'programming' },
  { label: 'Python编程', value: 'python', type: 'programming' },
  { label: '图形化编程', value: 'graphical_programming', type: 'programming' },
  { label: '语文', value: 'chinese', type: 'gaokao' },
  { label: '数学', value: 'math', type: 'gaokao' },
  { label: '英语', value: 'english', type: 'gaokao' },
  { label: '物理', value: 'physics', type: 'gaokao' },
  { label: '化学', value: 'chemistry', type: 'gaokao' },
  { label: '生物', value: 'biology', type: 'gaokao' },
  { label: '历史', value: 'history', type: 'gaokao' },
  { label: '地理', value: 'geography', type: 'gaokao' }
]

export const getSubjectLabel = (value) => {
  const target = SUBJECT_OPTIONS.find(opt => opt.value === value)
  return target ? target.label : value
}