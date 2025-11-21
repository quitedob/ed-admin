<template>
  <div class="my-courses-container" id="student-my-courses-container">
    <div class="page-header" id="student-my-courses-header">
      <h2>我的课程</h2>
      <p>您已授权学习的课程列表</p>
    </div>

    <div class="courses-grid" id="student-my-courses-grid">
      <div
        v-for="course in coursesList"
        :key="course.id"
        class="course-card"
        :id="`student-course-card-${course.id}`"
        @click="goToCourseDetail(course)"
      >
        <div class="course-image">
          <img :src="course.coverImage" :alt="course.courseName" />
          <div class="course-status">
            <span v-if="course.progress === 100" class="completed">已完成</span>
            <span v-else class="in-progress">学习中</span>
          </div>
        </div>
        <div class="course-info">
          <h3>{{ course.courseName }}</h3>
          <p class="lecturer">讲师：{{ course.lecturerName }}</p>
          <div class="progress-bar">
            <el-progress :percentage="course.progress" :show-text="false" />
            <span class="progress-text">{{ course.progress }}% 完成</span>
          </div>
          <div class="course-meta">
            <span class="category">{{ course.categoryName }}</span>
            <span class="last-study">最后学习：{{ course.lastStudyTime }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="coursesList.length === 0" class="empty-state" id="student-my-courses-empty">
      <el-empty description="暂无授权课程，请联系管理员获取课程权限">
        <template #image>
          <svg-icon name="course" />
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'

  const router = useRouter()

  // 课程列表 - 模拟数据
  const coursesList = ref([
    {
      id: 1,
      courseName: 'Vue.js入门到精通',
      lecturerName: '张老师',
      coverImage: 'https://via.placeholder.com/300x200?text=Vue.js',
      categoryName: '前端开发',
      progress: 65,
      lastStudyTime: '2024-01-15 14:30',
      totalLessons: 24,
      completedLessons: 16
    },
    {
      id: 2,
      courseName: 'Python数据分析实战',
      lecturerName: '李老师',
      coverImage: 'https://via.placeholder.com/300x200?text=Python',
      categoryName: '数据科学',
      progress: 30,
      lastStudyTime: '2024-01-14 10:15',
      totalLessons: 18,
      completedLessons: 5
    },
    {
      id: 3,
      courseName: 'JavaWeb开发全栈课程',
      lecturerName: '王老师',
      coverImage: 'https://via.placeholder.com/300x200?text=JavaWeb',
      categoryName: '后端开发',
      progress: 100,
      lastStudyTime: '2024-01-10 16:45',
      totalLessons: 32,
      completedLessons: 32
    },
    {
      id: 4,
      courseName: '人工智能基础与应用',
      lecturerName: '刘老师',
      coverImage: 'https://via.placeholder.com/300x200?text=AI',
      categoryName: '人工智能',
      progress: 10,
      lastStudyTime: '2024-01-16 09:20',
      totalLessons: 20,
      completedLessons: 2
    }
  ])

  // 进入课程详情
  const goToCourseDetail = (course) => {
    router.push({
      path: '/student/course-detail',
      query: { courseId: course.id }
    })
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/student/my-courses/index.vue`);
    // 模拟加载课程数据
    ElMessage.success('课程列表加载完成')
  })
</script>

<style lang="scss" scoped>
  .my-courses-container {
    padding: 20px;

    .page-header {
      margin-bottom: 30px;

      h2 {
        color: #333;
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }

      p {
        color: #666;
        font-size: 16px;
      }
    }

    .courses-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;

      .course-card {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .course-image {
          position: relative;
          height: 180px;
          overflow: hidden;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .course-status {
            position: absolute;
            top: 12px;
            right: 12px;

            span {
              padding: 4px 12px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: 500;

              &.completed {
                background: #67c23a;
                color: #fff;
              }

              &.in-progress {
                background: #409eff;
                color: #fff;
              }
            }
          }
        }

        .course-info {
          padding: 20px;

          h3 {
            color: #333;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 8px;
            line-height: 1.4;
          }

          .lecturer {
            color: #666;
            font-size: 14px;
            margin-bottom: 12px;
          }

          .progress-bar {
            margin-bottom: 12px;

            .progress-text {
              display: block;
              text-align: right;
              font-size: 12px;
              color: #666;
              margin-top: 4px;
            }
          }

          .course-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #999;

            .category {
              background: #f5f7fa;
              padding: 4px 8px;
              border-radius: 4px;
            }
          }
        }
      }
    }

    .empty-state {
      text-align: center;
      margin-top: 60px;
    }
  }
</style>
