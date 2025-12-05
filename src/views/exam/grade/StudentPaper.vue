<template>
  <GradingWorkbench
    type="exam"
    :title="examInfo.title"
    :class-id="examInfo.classId"
    :submissions="submissions"
    :classes="classes"
    @submit-grading="handleSubmitGrading"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import GradingWorkbench from '@/components/GradingWorkbench/GradingWorkbench.vue'

const route = useRoute()
const examId = computed(() => route.params.id)
const submissionId = computed(() => route.params.submissionId)

// 班级数据
const classes = [
  { id: 'class_t001', name: '计算机2101班' },
  { id: 'class_t002', name: '软件工程2201班' },
  { id: 'class_t003', name: '数据科学2201班' }
]

// 考试数据
const examData = {
  'exam_001': { id: 'exam_001', title: 'Python程序设计期中考试', classId: 'class_t001', totalScore: 120 }
}

// 提交数据 - 考试版本，包含分数和7个题型（添加了判断题）
const submissionsData = [
  {
    id: 'sub_001', studentId: '2021001', studentName: '张三', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 14:30', isGraded: false, totalComment: '', score: 0, totalScore: 120,
    answers: [
      { type: 'single', questionText: '1. Python中，以下哪个关键字用于定义函数？', userAnswer: 'B', correctAnswer: 'B', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'multiple', questionText: '2. 以下哪些是Python的基本数据类型？（多选）', userAnswer: ['A', 'B', 'C'], correctAnswer: ['A', 'B', 'C', 'D'], isCorrect: false, score: 15, studentScore: 12, comment: '漏选了D选项' },
      { type: 'fill', questionText: '3. Python中用于输出内容到控制台的函数是______。', userAnswer: 'print', correctAnswer: 'print', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'true/false', questionText: '4. Python是一种解释型语言。', userAnswer: 'true', correctAnswer: 'true', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'essay', questionText: '5. 请解释什么是递归，并举例说明递归的应用场景。', userAnswer: '递归是一种编程技术，函数调用自身来解决问题...', correctAnswer: null, isCorrect: null, score: 25, studentScore: 0, comment: '' },
      { type: 'programming', questionText: '6. 请编写一个Python函数，实现冒泡排序算法。', userAnswer: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr`, files: ['bubble_sort.py'], correctAnswer: null, isCorrect: null, score: 30, studentScore: 0, comment: '' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画作品，要求包含角色移动和场景切换。', userAnswer: '完成了Scratch小游戏项目，包含角色动画和互动功能', files: ['game_project.sb3'], projectUrl: 'https://scratch.mit.edu/projects/123456', correctAnswer: null, isCorrect: null, score: 20, studentScore: 0, comment: '' }
    ]
  },
  {
    id: 'sub_002', studentId: '2021002', studentName: '李四', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 15:20', isGraded: true, totalComment: '整体完成度不错，编程题需要加强', score: 85, totalScore: 120,
    answers: [
      { type: 'single', questionText: '1. Python中，以下哪个关键字用于定义函数？', userAnswer: 'A', correctAnswer: 'B', isCorrect: false, score: 10, studentScore: 0, comment: '答案错误' },
      { type: 'multiple', questionText: '2. 以下哪些是Python的基本数据类型？（多选）', userAnswer: ['A', 'B', 'C', 'D'], correctAnswer: ['A', 'B', 'C', 'D'], isCorrect: true, score: 15, studentScore: 15, comment: '答案正确' },
      { type: 'fill', questionText: '3. Python中用于输出内容到控制台的函数是______。', userAnswer: 'console', correctAnswer: 'print', isCorrect: false, score: 10, studentScore: 0, comment: '这是JavaScript的函数' },
      { type: 'true/false', questionText: '4. Python是一种解释型语言。', userAnswer: 'false', correctAnswer: 'true', isCorrect: false, score: 10, studentScore: 0, comment: '答案错误' },
      { type: 'essay', questionText: '5. 请解释什么是递归，并举例说明递归的应用场景。', userAnswer: '递归就是函数自己调用自己。', correctAnswer: null, isCorrect: null, score: 25, studentScore: 15, comment: '理解基本概念，可以更深入一些' },
      { type: 'programming', questionText: '6. 请编写一个Python函数，实现冒泡排序算法。', userAnswer: `# 简单排序\ndef sort_arr(arr):\n    return sorted(arr)`, files: ['simple_sort.py'], correctAnswer: null, isCorrect: null, score: 30, studentScore: 15, comment: '使用内置函数排序，不符合题目要求' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画作品，要求包含角色移动和场景切换。', userAnswer: '制作了Scratch动画演示', files: ['animation_demo.sb3'], projectUrl: 'https://scratch.mit.edu/projects/789012', correctAnswer: null, isCorrect: null, score: 20, studentScore: 40, comment: '基本完成动画要求，可以增加更多交互功能' }
    ]
  },
  {
    id: 'sub_003', studentId: '2021003', studentName: '王五', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 16:00', isGraded: false, totalComment: '', score: 0, totalScore: 120,
    answers: [
      { type: 'single', questionText: '1. Python中，以下哪个关键字用于定义函数？', userAnswer: 'B', correctAnswer: 'B', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'multiple', questionText: '2. 以下哪些是Python的基本数据类型？（多选）', userAnswer: ['A', 'B'], correctAnswer: ['A', 'B', 'C', 'D'], isCorrect: false, score: 15, studentScore: 8, comment: '漏选了C、D选项' },
      { type: 'fill', questionText: '3. Python中用于输出内容到控制台的函数是______。', userAnswer: 'print', correctAnswer: 'print', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'true/false', questionText: '4. Python是一种解释型语言。', userAnswer: 'true', correctAnswer: 'true', isCorrect: true, score: 10, studentScore: 10, comment: '' },
      { type: 'essay', questionText: '5. 请解释什么是递归，并举例说明递归的应用场景。', userAnswer: '递归插入删除快O(1)，数组查询快O(1)', correctAnswer: null, isCorrect: null, score: 25, studentScore: 0, comment: '' },
      { type: 'programming', questionText: '6. 请编写一个Python函数，实现冒泡排序算法。', userAnswer: '# 不会编程题', files: [], correctAnswer: null, isCorrect: null, score: 30, studentScore: 0, comment: '' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画作品，要求包含角色移动和场景切换。', userAnswer: '完成了基础动画', files: ['simple.sb3'], projectUrl: 'https://scratch.mit.edu/projects/789012', correctAnswer: null, isCorrect: null, score: 20, studentScore: 0, comment: '' }
    ]
  }
]

const examInfo = ref({ id: '', title: '', classId: '', totalScore: 120 })
const submissions = ref([])

const handleSubmitGrading = (submission) => {
  // 可以在这里添加额外的处理逻辑，如保存到服务器
  console.log('提交批改:', submission)
}

const loadData = () => {
  examInfo.value = examData[examId.value] || examData['exam_001']

  // 如果有指定的submissionId，找到对应的提交记录并设置为当前显示
  let submissionsList = JSON.parse(JSON.stringify(submissionsData))

  if (submissionId.value) {
    const targetIndex = submissionsList.findIndex(s => s.id === submissionId.value)
    if (targetIndex !== -1) {
      // 调整数组顺序，将目标记录放在第一位
      const [targetSubmission] = submissionsList.splice(targetIndex, 1)
      submissionsList.unshift(targetSubmission)
    }
  }

  submissions.value = submissionsList
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
/* 页面布局由GradingWorkbench组件处理 */
</style>