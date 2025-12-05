<template>
  <div class="renderer-demo">
    <el-card class="demo-header">
      <template #header>
        <h2>JSON 内容渲染器演示</h2>
      </template>
      <div class="demo-controls">
        <el-button-group>
          <el-button
            :type="activeTab === 'course' ? 'primary' : ''"
            @click="activeTab = 'course'"
          >
            课程内容
          </el-button>
          <el-button
            :type="activeTab === 'homework' ? 'primary' : ''"
            @click="activeTab = 'homework'"
          >
            作业内容
          </el-button>
          <el-button
            :type="activeTab === 'exam' ? 'primary' : ''"
            @click="activeTab = 'exam'"
          >
            考试内容
          </el-button>
        </el-button-group>
      </div>
    </el-card>

    <!-- 课程内容渲染器演示 -->
    <div v-if="activeTab === 'course'" class="demo-section">
      <CourseContentRenderer :course-data="mockCourseData" />
    </div>

    <!-- 作业渲染器演示 -->
    <div v-if="activeTab === 'homework'" class="demo-section">
      <HomeworkRenderer :homework-data="mockHomeworkData" />
    </div>

    <!-- 考试渲染器演示 -->
    <div v-if="activeTab === 'exam'" class="demo-section">
      <ExamRenderer :exam-data="mockExamData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { CourseContentRenderer, HomeworkRenderer, ExamRenderer } from '@/components/Renderer'

const activeTab = ref('course')

// 模拟课程数据
const mockCourseData = ref({
  id: 'course_001',
  type: 'course',
  basicInfo: {
    title: '软件工程导论',
    description: '本课程介绍软件工程的基本概念、方法和工具，帮助学生掌握软件开发的全流程管理。',
    cover: 'https://cdn.example.com/courses/course_001.jpg',
    duration: 48,
    level: 'intermediate',
    teacher: {
      id: 'teacher_001',
      name: '李教授',
      avatar: 'https://cdn.example.com/avatars/teacher_001.jpg'
    },
    tags: ['软件工程', '编程', '计算机']
  },
  schedule: {
    startDate: '2024-08-31',
    endDate: '2025-06-30',
    publishStatus: 'published'
  },
  chapters: [
    {
      id: 'chapter_001',
      number: 1,
      title: '第一章：软件工程基础',
      description: '介绍软件工程的基本概念',
      order: 1,
      sections: [
        {
          id: 'section_001',
          number: '1.1',
          title: '软件工程概述',
          description: '什么是软件工程',
          order: 1,
          contentType: 'video',
          contentUrl: 'https://video.example.com/section_001.mp4',
          duration: 1800,
          resources: {
            materials: [
              {
                id: 'material_001',
                type: 'pdf',
                title: '课件讲义',
                url: 'https://cdn.example.com/materials/material_001.pdf'
              },
              {
                id: 'material_002',
                type: 'image',
                title: '课程相关图片',
                images: [
                  {
                    id: 'img_001',
                    url: 'https://cdn.example.com/images/img_001.jpg',
                    title: '软件工程概述图',
                    description: '这张图片展示了软件工程的基本概念和主要组成部分',
                    alt: '软件工程概述图'
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  ]
})

// 模拟作业数据
const mockHomeworkData = ref({
  id: 'homework_001',
  type: 'homework',
  basicInfo: {
    title: '第一周作业',
    description: '完成软件工程基础的练习题',
    type: 'exercise',
    difficulty: 'easy'
  },
  schedule: {
    releaseDate: '2024-09-01T00:00:00Z',
    dueDate: '2024-09-07T23:59:59Z',
    remindDate: '2024-09-06T12:00:00Z'
  },
  questions: [
    {
      id: 'question_001',
      type: 'single',
      questionText: '什么是软件工程的三要素？',
      score: 5,
      difficulty: 'easy',
      order: 1,
      options: [
        {
          id: 'opt_a',
          value: 'A',
          text: '方法、工具、过程'
        },
        {
          id: 'opt_b',
          value: 'B',
          text: '代码、文档、测试'
        },
        {
          id: 'opt_c',
          value: 'C',
          text: '需求、设计、实现'
        }
      ],
      correctAnswer: 'A',
      explanation: '软件工程的三要素是方法、工具和过程'
    },
    {
      id: 'question_002',
      type: 'multiple',
      questionText: '软件生命周期包括哪些阶段？',
      score: 10,
      difficulty: 'medium',
      order: 2,
      options: [
        {
          id: 'opt_a',
          value: 'A',
          text: '需求分析'
        },
        {
          id: 'opt_b',
          value: 'B',
          text: '系统设计'
        },
        {
          id: 'opt_c',
          value: 'C',
          text: '编码实现'
        },
        {
          id: 'opt_d',
          value: 'D',
          text: '测试维护'
        }
      ],
      correctAnswers: ['A', 'B', 'C', 'D'],
      explanation: '软件生命周期包括需求分析、系统设计、编码实现和测试维护等阶段'
    },
    {
      id: 'question_003',
      type: 'fill',
      questionText: '软件工程的目标是提高软件的___和___。',
      score: 5,
      difficulty: 'easy',
      order: 3,
      correctAnswers: ['质量', '可维护性']
    }
  ]
})

// 模拟考试数据
const mockExamData = ref({
  id: 'exam_001',
  type: 'exam',
  basicInfo: {
    title: '期中考试',
    description: '软件工程课程期中考试',
    type: 'midterm',
    difficulty: 'medium'
  },
  schedule: {
    startTime: '2024-11-15T10:00:00Z',
    endTime: '2024-11-15T11:30:00Z',
    duration: 90,
    reviewStartTime: '2024-11-20T00:00:00Z'
  },
  settings: {
    totalScore: 100,
    passingScore: 60,
    showScoreAfterSubmit: true,
    randomOrder: false,
    randomQuestions: false
  },
  questionBanks: [
    {
      id: 'bank_001',
      name: '单选题库',
      type: 'single',
      questionCount: 20,
      scorePerQuestion: 2,
      totalQuestionsNeeded: 10,
      questions: [
        {
          id: 'question_001',
          questionText: '软件工程的核心目标是什么？',
          options: [
            {
              id: 'opt_a',
              value: 'A',
              text: '提高开发速度'
            },
            {
              id: 'opt_b',
              value: 'B',
              text: '降低开发成本'
            },
            {
              id: 'opt_c',
              value: 'C',
              text: '提高软件质量和可维护性'
            }
          ],
          correctAnswer: 'C',
          explanation: '软件工程的核心目标是通过系统的方法提高软件质量和可维护性',
          knowledgePoints: ['软件工程基础'],
          difficulty: 'easy'
        }
      ]
    }
  ]
})

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/demo/RendererDemo.vue`);
  });

</script>

<style scoped>
.renderer-demo {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  min-height: 100vh;
}

.demo-header {
  margin-bottom: var(--spacing-lg);
}

.demo-header h2 {
  margin: 0;
  color: var(--color-text-primary);
}

.demo-controls {
  display: flex;
  justify-content: center;
  margin: var(--spacing-md) 0;
}

.demo-section {
  margin-top: var(--spacing-lg);
}
</style>