<template>
  <div class="course-detail-container">
    <!-- AI助教组件 -->
    <chat-interface
      :context="'video'"
      :course-id="courseInfo.id"
      :video-id="currentLesson?.id"
    />
    <!-- 课程头部信息 -->
    <div class="course-header">
      <div class="course-info">
        <img :src="courseInfo.coverImage" :alt="courseInfo.courseName" class="course-cover" />
        <div class="course-meta">
          <h1>{{ courseInfo.courseName }}</h1>
          <p class="lecturer">讲师：{{ courseInfo.lecturerName }}</p>
          <div class="course-stats">
            <span>共 {{ courseInfo.totalLessons }} 节课</span>
            <span>已学 {{ courseInfo.completedLessons }} 节</span>
            <span>{{ courseInfo.progress }}% 完成</span>
          </div>
          <div class="progress-bar">
            <el-progress :percentage="courseInfo.progress" :show-text="false" />
          </div>
        </div>
      </div>
      <div class="course-actions">
        <el-button type="primary" size="large" @click="continueLearning">
          继续学习
        </el-button>
      </div>
    </div>

    <!-- 课程目录 -->
    <div class="course-content">
      <div class="content-sidebar">
        <h3>课程目录</h3>
        <div class="chapter-list">
          <div
            v-for="chapter in courseChapters"
            :key="chapter.id"
            class="chapter-item"
          >
            <div class="chapter-header" @click="toggleChapter(chapter)">
              <span class="chapter-title">{{ chapter.chapterName }}</span>
              <span class="chapter-progress">{{ chapter.completedLessons }}/{{ chapter.totalLessons }}</span>
              <el-icon class="toggle-icon">
                <ArrowRight v-if="!chapter.expanded" />
                <ArrowDown v-else />
              </el-icon>
            </div>
            <div v-if="chapter.expanded" class="lesson-list">
              <div
                v-for="lesson in chapter.lessons"
                :key="lesson.id"
                class="lesson-item"
                :class="{ active: lesson.id === currentLessonId }"
                @click="selectLesson(lesson)"
              >
                <div class="lesson-content">
                  <el-icon class="lesson-icon">
                    <VideoPlay v-if="lesson.type === 'video'" />
                    <Document v-else-if="lesson.type === 'document'" />
                    <ChatDotRound v-else-if="lesson.type === 'practice'" />
                  </el-icon>
                  <span class="lesson-title">{{ lesson.title }}</span>
                  <span class="lesson-duration">{{ lesson.duration }}</span>
                </div>
                <div class="lesson-status">
                  <el-icon v-if="lesson.completed" color="#67c23a">
                    <Check />
                  </el-icon>
                  <el-icon v-else-if="lesson.isFree" color="#409eff">
                    <Unlock />
                  </el-icon>
                  <el-icon v-else color="#e6a23c">
                    <Lock />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-main">
        <!-- 学习内容区域 -->
        <div v-if="currentLesson" class="lesson-content-area">
          <div class="lesson-header">
            <h2>{{ currentLesson.title }}</h2>
            <div class="lesson-meta">
              <span class="lesson-type">
                <el-tag :type="getLessonTypeTag(currentLesson.type)">
                  {{ getLessonTypeText(currentLesson.type) }}
                </el-tag>
              </span>
              <span class="lesson-duration">{{ currentLesson.duration }}</span>
            </div>
          </div>

          <!-- 视频播放区域 -->
          <div v-if="currentLesson.type === 'video'" class="video-player">
            <div class="video-container">
              <video
                ref="videoPlayer"
                :src="currentLesson.videoUrl"
                controls
                @timeupdate="updateProgress"
                @ended="markCompleted"
              ></video>
            </div>
          </div>

          <!-- 文档内容 -->
          <div v-else-if="currentLesson.type === 'document'" class="document-content">
            <div class="document-viewer">
              <h3>课件内容</h3>
              <div class="document-text">
                {{ currentLesson.content }}
              </div>
            </div>
          </div>

          <!-- 练习区域 -->
          <div v-else-if="currentLesson.type === 'practice'" class="practice-area">
            <div class="practice-info">
              <h3>编程练习</h3>
              <p>{{ currentLesson.description }}</p>
              <el-button type="primary" @click="goToPractice">前往练习</el-button>
            </div>
          </div>

          <!-- 学习控制 -->
          <div class="lesson-controls">
            <el-button
              v-if="prevLesson"
              @click="selectLesson(prevLesson)"
              :disabled="!prevLesson"
            >
              上一节
            </el-button>
            <el-button
              v-if="nextLesson"
              type="primary"
              @click="selectLesson(nextLesson)"
            >
              下一节
            </el-button>
          </div>
        </div>

        <!-- 默认状态 -->
        <div v-else class="default-state">
          <el-empty description="请选择要学习的章节">
            <template #image>
              <svg-icon name="course" />
            </template>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import { ArrowRight, ArrowDown, VideoPlay, Document, ChatDotRound, Check, Lock, Unlock } from '@element-plus/icons-vue'
  import ChatInterface from '@/components/ai/ChatInterface.vue'

  const route = useRoute()
  const router = useRouter()

  // 课程信息
  const courseInfo = ref({
    id: 1,
    courseName: 'Vue.js入门到精通',
    lecturerName: '张老师',
    coverImage: 'https://via.placeholder.com/300x200?text=Vue.js',
    totalLessons: 24,
    completedLessons: 16,
    progress: 65
  })

  // 章节数据
  const courseChapters = ref([
    {
      id: 1,
      chapterName: '第一章：Vue.js基础',
      totalLessons: 6,
      completedLessons: 6,
      expanded: true,
      lessons: [
        {
          id: 11,
          title: '1.1 Vue.js简介',
          type: 'video',
          duration: '15:30',
          completed: true,
          isFree: true,
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
          content: 'Vue.js 是一套用于构建用户界面的渐进式框架...'
        },
        {
          id: 12,
          title: '1.2 安装和配置',
          type: 'video',
          duration: '20:45',
          completed: true,
          isFree: true,
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
          content: '安装 Vue.js 的几种方式...'
        },
        {
          id: 13,
          title: '1.3 第一个Vue应用',
          type: 'practice',
          duration: '25:10',
          completed: true,
          isFree: false,
          description: '创建你的第一个Vue.js应用',
          problemId: 1001
        }
      ]
    },
    {
      id: 2,
      chapterName: '第二章：组件开发',
      totalLessons: 8,
      completedLessons: 5,
      expanded: false,
      lessons: [
        {
          id: 21,
          title: '2.1 组件基础',
          type: 'video',
          duration: '30:20',
          completed: true,
          isFree: false,
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
        },
        {
          id: 22,
          title: '2.2 组件通信',
          type: 'video',
          duration: '35:15',
          completed: false,
          isFree: false,
          videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4'
        },
        {
          id: 23,
          title: '2.3 组件生命周期',
          type: 'document',
          duration: '25:00',
          completed: false,
          isFree: false,
          content: 'Vue组件的生命周期钩子函数详解...'
        }
      ]
    }
  ])

  const currentLessonId = ref(null)
  const videoPlayer = ref(null)

  // 当前课时
  const currentLesson = computed(() => {
    for (const chapter of courseChapters.value) {
      const lesson = chapter.lessons.find(l => l.id === currentLessonId.value)
      if (lesson) return lesson
    }
    return null
  })

  // 上一节
  const prevLesson = computed(() => {
    const allLessons = courseChapters.value.flatMap(ch => ch.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId.value)
    return currentIndex > 0 ? allLessons[currentIndex - 1] : null
  })

  // 下一节
  const nextLesson = computed(() => {
    const allLessons = courseChapters.value.flatMap(ch => ch.lessons)
    const currentIndex = allLessons.findIndex(l => l.id === currentLessonId.value)
    return currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  })

  // 切换章节展开
  const toggleChapter = (chapter) => {
    chapter.expanded = !chapter.expanded
  }

  // 选择课时
  const selectLesson = (lesson) => {
    if (!lesson.isFree && !lesson.completed) {
      ElMessage.warning('该章节需要解锁后才能学习')
      return
    }
    currentLessonId.value = lesson.id
  }

  // 继续学习
  const continueLearning = () => {
    // 找到第一个未完成的课时
    for (const chapter of courseChapters.value) {
      for (const lesson of chapter.lessons) {
        if (!lesson.completed && lesson.isFree) {
          selectLesson(lesson)
          return
        }
      }
    }
    ElMessage.info('所有课时已完成')
  }

  // 更新学习进度
  const updateProgress = () => {
    if (videoPlayer.value && currentLesson.value) {
      const progress = (videoPlayer.value.currentTime / videoPlayer.value.duration) * 100
      // 这里可以调用API保存学习进度
      console.log(`学习进度: ${progress.toFixed(1)}%`)
    }
  }

  // 标记完成
  const markCompleted = () => {
    if (currentLesson.value) {
      currentLesson.value.completed = true
      ElMessage.success('恭喜完成本节学习！')
      // 更新章节完成数
      updateChapterProgress()
    }
  }

  // 更新章节进度
  const updateChapterProgress = () => {
    courseChapters.value.forEach(chapter => {
      chapter.completedLessons = chapter.lessons.filter(l => l.completed).length
    })
    // 更新总进度
    const totalLessons = courseChapters.value.reduce((sum, ch) => sum + ch.lessons.length, 0)
    const completedLessons = courseChapters.value.reduce((sum, ch) => sum + ch.completedLessons, 0)
    courseInfo.value.completedLessons = completedLessons
    courseInfo.value.progress = Math.round((completedLessons / totalLessons) * 100)
  }

  // 前往练习
  const goToPractice = () => {
    if (currentLesson.value && currentLesson.value.problemId) {
      router.push({
        path: '/oj/problems',
        query: { problemId: currentLesson.value.problemId }
      })
    }
  }

  // 获取课时类型标签
  const getLessonTypeTag = (type) => {
    const types = {
      video: 'success',
      document: 'info',
      practice: 'warning'
    }
    return types[type] || 'info'
  }

  // 获取课时类型文本
  const getLessonTypeText = (type) => {
    const types = {
      video: '视频',
      document: '文档',
      practice: '练习'
    }
    return types[type] || '未知'
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/student/course-detail/index.vue`);
    const courseId = route.query.courseId
    if (courseId) {
      // 加载课程详情数据
      ElMessage.success('课程详情加载完成')
    }
  })
</script>

<style lang="scss" scoped>
  .course-detail-container {
    min-height: 100vh;
    background: #f5f7fa;
  }

  .course-header {
    background: #fff;
    padding: 30px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .course-info {
      display: flex;
      gap: 24px;

      .course-cover {
        width: 200px;
        height: 120px;
        object-fit: cover;
        border-radius: 8px;
      }

      .course-meta {
        flex: 1;

        h1 {
          color: #333;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .lecturer {
          color: #666;
          font-size: 16px;
          margin-bottom: 12px;
        }

        .course-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 12px;

          span {
            color: #666;
            font-size: 14px;
          }
        }

        .progress-bar {
          width: 300px;
        }
      }
    }

    .course-actions {
      margin-top: 20px;
      text-align: right;
    }
  }

  .course-content {
    display: flex;
    padding: 30px;
    gap: 30px;

    .content-sidebar {
      width: 350px;
      background: #fff;
      border-radius: 8px;
      padding: 20px;
      height: fit-content;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      h3 {
        color: #333;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 20px;
      }

      .chapter-list {
        .chapter-item {
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .chapter-header {
            display: flex;
            align-items: center;
            padding: 16px 0;
            cursor: pointer;
            transition: background-color 0.2s;

            &:hover {
              background: #f9f9f9;
            }

            .chapter-title {
              flex: 1;
              color: #333;
              font-weight: 500;
            }

            .chapter-progress {
              color: #666;
              font-size: 12px;
              margin-right: 12px;
            }

            .toggle-icon {
              color: #999;
              transition: transform 0.2s;
            }
          }

          .lesson-list {
            .lesson-item {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              cursor: pointer;
              transition: background-color 0.2s;

              &:hover {
                background: #f9f9f9;
              }

              &.active {
                background: #e3f2fd;
                border-left: 3px solid #409eff;
              }

              .lesson-content {
                flex: 1;
                display: flex;
                align-items: center;
                gap: 8px;

                .lesson-icon {
                  color: #666;
                }

                .lesson-title {
                  flex: 1;
                  color: #333;
                  font-size: 14px;
                }

                .lesson-duration {
                  color: #999;
                  font-size: 12px;
                }
              }

              .lesson-status {
                margin-left: 12px;
              }
            }
          }
        }
      }
    }

    .content-main {
      flex: 1;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-height: 600px;

      .lesson-content-area {
        .lesson-header {
          padding: 24px 30px;
          border-bottom: 1px solid #f0f0f0;

          h2 {
            color: #333;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 12px;
          }

          .lesson-meta {
            display: flex;
            align-items: center;
            gap: 16px;

            .lesson-duration {
              color: #666;
              font-size: 14px;
            }
          }
        }

        .video-player {
          padding: 30px;

          .video-container {
            background: #000;
            border-radius: 8px;
            overflow: hidden;

            video {
              width: 100%;
              height: auto;
              max-height: 500px;
            }
          }
        }

        .document-content {
          padding: 30px;

          .document-viewer {
            h3 {
              color: #333;
              font-size: 20px;
              margin-bottom: 20px;
            }

            .document-text {
              color: #666;
              line-height: 1.8;
              font-size: 16px;
            }
          }
        }

        .practice-area {
          padding: 30px;

          .practice-info {
            h3 {
              color: #333;
              font-size: 20px;
              margin-bottom: 16px;
            }

            p {
              color: #666;
              margin-bottom: 24px;
              line-height: 1.6;
            }
          }
        }

        .lesson-controls {
          padding: 24px 30px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: space-between;
        }
      }

      .default-state {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 400px;
      }
    }
  }
</style>
