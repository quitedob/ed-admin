<template>
  <GradingWorkbench
    type="homework"
    :title="homework.title"
    :class-id="homework.classId"
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
const homeworkId = computed(() => route.params.id)

// JSON格式的班级数据
const classes = [
  { id: 'class_t001', name: '计算机2101班' },
  { id: 'class_t002', name: '软件工程2201班' },
  { id: 'class_t003', name: '数据科学2201班' }
]

// JSON格式的作业数据
const homeworksData = {
  'hw_001': { id: 'hw_001', title: '第一章作业', classId: 'class_001' },
  'hw_002': { id: 'hw_002', title: '第二章作业', classId: 'class_001' },
  'hw_003': { id: 'hw_003', title: '第三章作业', classId: 'class_001' },
  'hw_004': { id: 'hw_004', title: '综合练习', classId: 'class_002' }
}

// JSON格式的提交数据 - 包含7个题型（添加了判断题）
const submissionsData = [
  {
    id: 'sub001', studentId: '2021001', studentName: '张三', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 14:30', isGraded: false, totalComment: '',
    answers: [
      { type: 'single', questionText: '1. 单链表的特点是什么？', userAnswer: 'A', correctAnswer: 'A', isCorrect: true, comment: '' },
      { type: 'multiple', questionText: '2. 以下哪些是链表的特点？（多选）', userAnswer: ['A', 'C'], correctAnswer: ['A', 'B', 'C'], isCorrect: false, comment: '漏选了B选项' },
      { type: 'fill', questionText: '3. 在单链表中插入节点的时间复杂度是____', userAnswer: 'O(1)', correctAnswer: 'O(1)', isCorrect: true, comment: '' },
      { type: 'true/false', questionText: '4. 单链表的最后一个节点的指针域为NULL', userAnswer: 'true', correctAnswer: 'true', isCorrect: true, comment: '' },
      { type: 'essay', questionText: '5. 简述链表和数组的区别和应用场景', userAnswer: '链表是动态分配内存，适合频繁插入删除的场景...', correctAnswer: null, isCorrect: null, comment: '' },
      { type: 'programming', questionText: '6. 请实现一个单链表的反转函数', userAnswer: 'def reverse_list(head):\n    prev = None\n    current = head\n    while current:\n        next_node = current.next\n        current.next = prev\n        prev = current\n        current = next_node\n    return prev', files: ['list_reverse.py'], correctAnswer: null, isCorrect: null, comment: '' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画', userAnswer: '已完成 Scratch 作品', files: ['animation.sb3'], projectUrl: 'https://scratch.mit.edu/projects/123456', correctAnswer: null, isCorrect: null, comment: '' }
    ]
  },
  {
    id: 'sub002', studentId: '2021002', studentName: '李四', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 15:20', isGraded: true, totalComment: '整体完成度不错，编程题需要加强',
    answers: [
      { type: 'single', questionText: '1. 单链表的特点是什么？', userAnswer: 'B', correctAnswer: 'A', isCorrect: false, comment: '答案错误，需要复习链表基础概念' },
      { type: 'multiple', questionText: '2. 以下哪些是链表的特点？（多选）', userAnswer: ['A', 'B', 'C'], correctAnswer: ['A', 'B', 'C'], isCorrect: true, comment: '答案正确' },
      { type: 'fill', questionText: '3. 在单链表中插入节点的时间复杂度是____', userAnswer: 'O(n)', correctAnswer: 'O(1)', isCorrect: false, comment: '插入操作在已知位置是O(1)' },
      { type: 'true/false', questionText: '4. 单链表的最后一个节点的指针域为NULL', userAnswer: 'false', correctAnswer: 'true', isCorrect: false, comment: '答案错误' },
      { type: 'essay', questionText: '5. 简述链表和数组的区别和应用场景', userAnswer: '数组连续存储，查询快；链表非连续存储，插入删除快...', correctAnswer: null, isCorrect: null, comment: '理解基本概念，可以更深入一些' },
      { type: 'programming', questionText: '6. 请实现一个单链表的反转函数', userAnswer: '# 不会做', files: [], correctAnswer: null, isCorrect: null, comment: '需要加强编程练习' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画', userAnswer: '', files: [], projectUrl: '', correctAnswer: null, isCorrect: null, comment: '未提交Scratch作品' }
    ]
  },
  {
    id: 'sub003', studentId: '2021003', studentName: '王五', avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    submitTime: '2024-12-25 16:00', isGraded: false, totalComment: '',
    answers: [
      { type: 'single', questionText: '1. 单链表的特点是什么？', userAnswer: 'A', correctAnswer: 'A', isCorrect: true, comment: '' },
      { type: 'multiple', questionText: '2. 以下哪些是链表的特点？（多选）', userAnswer: ['A', 'B'], correctAnswer: ['A', 'B', 'C'], isCorrect: false, comment: '漏选了C选项' },
      { type: 'fill', questionText: '3. 在单链表中插入节点的时间复杂度是____', userAnswer: 'O(1)', correctAnswer: 'O(1)', isCorrect: true, comment: '' },
      { type: 'true/false', questionText: '4. 单链表的最后一个节点的指针域为NULL', userAnswer: 'true', correctAnswer: 'true', isCorrect: true, comment: '' },
      { type: 'essay', questionText: '5. 简述链表和数组的区别和应用场景', userAnswer: '链表插入删除快O(1)，数组查询快O(1)', correctAnswer: null, isCorrect: null, comment: '' },
      { type: 'programming', questionText: '6. 请实现一个单链表的反转函数', userAnswer: 'def reverse(head):\n    return head', files: ['basic.py'], correctAnswer: null, isCorrect: null, comment: '' },
      { type: 'scratch', questionText: '7. 使用Scratch创建一个简单的动画', userAnswer: '完成了基础动画', files: ['simple.sb3'], projectUrl: 'https://scratch.mit.edu/projects/789012', correctAnswer: null, isCorrect: null, comment: '' }
    ]
  }
]

const homework = ref({ id: '', title: '', classId: '' })
const submissions = ref([])

const handleSubmitGrading = (submission) => {
  // 可以在这里添加额外的处理逻辑，如保存到服务器
  console.log('提交批改:', submission)
}

const loadData = () => {
  homework.value = homeworksData[homeworkId.value] || homeworksData['hw_001']
  submissions.value = JSON.parse(JSON.stringify(submissionsData))
}

onMounted(() => loadData())
</script>

<style lang="scss" scoped>
/* 页面布局由GradingWorkbench组件处理 */
</style>
