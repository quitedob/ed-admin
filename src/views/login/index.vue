<template>
  <div class="login-container">
    <div class="login-content">
      <div class="login-info">
        <p class="title">欢迎来到芝麻信奥管理后台</p>
        <p class="info">

        </p>
        <div style="text-align: center; font-size: 10px">
          <img src="@/assets/images/weixin.jpg" alt="作者微信公众号" style="width: 120px; height: auto" />
          <div style="text-align: center; margin-top: 5px">关注微信公众号，可获取更多资料</div>
        </div>
      </div>
      <div class="login-panel">
        <el-form v-loading="loading" :model="loginForm" label-position="left" @keyup.enter="handleLogin()">
          <h3 class="login-head">管理员登录</h3>
          <div class="demo-badge">
            <el-tag type="info" size="large" effect="light" class="white-tag">
              <span class="demo-icon">🧪</span>
              测试端演示
            </el-tag>
          </div>
          <el-form-item class="form-group" prop="mobile">
            <el-input v-model="loginForm.mobile" placeholder="用户名" />
          </el-form-item>
          <el-form-item class="form-group" prop="mobilePwd">
            <el-input v-model="loginForm.mobilePwd" placeholder="密码" type="password" show-password />
          </el-form-item>
          <el-form-item class="form-group" prop="verCode">
            <el-input v-model="loginForm.verCode" class="var-input" placeholder="验证码" />
            <img class="var-img" :src="verImg" alt="" @click="getCaptcha" />
          </el-form-item>
          <el-button class="login-button" type="primary" @click="handleLogin">登 录</el-button>
          <div class="tip">
            <div style="color: white; font-weight: bold; margin-bottom: 5px;">
              🎯 测试端演示：任意用户名密码均可登录
            </div>
            <div>建议账号：admin / 123456</div>
          </div>
        </el-form>
      </div>
    </div>
    <div class="footer">
      <div v-if="service.websiteCopyright" class="copyright">
        <span v-html="service.websiteCopyright" />
      </div>
      <div>
        <a v-if="service.websiteIcp" href="http://beian.miit.gov.cn/" target="_blank">{{ service.websiteIcp }}</a>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <img v-if="service.websitePrn" class="website-prn" :alt="service.websitePrn" src="../../assets/images/common/beian.png" />
        <a v-if="service.websitePrn" :href="'http://www.beian.gov.cn/portal/registerSystemInfo?recordcode=' + service.websitePrnNo" target="_blank">&nbsp;{{ service.websitePrn }} </a>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { loginApi } from '@/api/login'
  import { onMounted, reactive, ref } from 'vue'
  import { setToken } from '@/utils/cookie'
  import { useRouter } from 'vue-router'
  import { useUserStore } from '@/store/modules/user'
  import { createNewRouter } from '@/router'
  import { PATH } from '@/utils/constants/system'
  import { ElMessage } from 'element-plus'
  import { encrypt } from '@/utils/base.js'

  const router = useRouter()
  const loading = ref(false)
  const verImg = ref()

  // 站点信息
  const service = ref({
    websiteCopyright: '© 2024 芝麻信奥教育系统',
    websiteIcp: '浙ICP备12345678号',
    websitePrn: '浙公网安备330000000000号',
    websitePrnNo: '330000000000'
  })
  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/login/index.vue`);
    loginApi.getWebsite().then((res) => {
      service.value = res
    }).catch((error) => {
      console.warn('获取站点配置失败，使用默认配置:', error)
      // 使用默认配置，不影响登录功能
    })
    // 验证码
    getCaptcha()
  })

  // 登录
  const loginForm = reactive({
    mobile: '13300000000',
    mobilePwd: '123456'
  })

  // 获取验证码
  async function getCaptcha() {
    try {
      const res = await loginApi.getCodeImg()
      loginForm.verToken = res.verToken
      verImg.value = res.img
    } catch (error) {
      console.error(error)
    }
  }

  async function handleLogin() {
    // 演示模式：直接登录成功
    loading.value = true

    // 模拟登录过程
    setTimeout(() => {
      try {
        const mockToken = 'demo-token-' + Date.now()
        const mockUser = {
          id: 1,
          username: loginForm.mobile || 'demo',
          nickname: '演示管理员',
          roleList: ['ADMIN'],
          routerList: [
            { id: 1, path: '/dashboard', menuName: '首页', component: '/dashboard/index.vue' },
            { id: 2, path: '/course', menuName: '课程管理', component: '/course/list/index.vue' },
            { id: 3, path: '/course/detail', menuName: '课程详情', component: '/course/detail/index.vue' },
            { id: 4, path: '/course/create', menuName: '创建课程', component: '/course/create/index.vue' },
            { id: 5, path: '/course/update', menuName: '编辑课程', component: '/course/update/index.vue' },
            { id: 6, path: '/course/update/modern', menuName: '现代编辑课程', component: '/course/update/ModernEditCourse.vue' },
            { id: 7, path: '/course/analytics', menuName: '课程分析', component: '/course/analytics/index.vue' },
            { id: 8, path: '/course/chapter', menuName: '章节管理', component: '/course/chapter/index.vue' },
            { id: 9, path: '/course/record', menuName: '课程数据', component: '/course/record/index.vue' },
            { id: 10, path: '/users', menuName: '用户管理', component: '/users/list/index.vue' },
            { id: 11, path: '/aigc/works', menuName: 'AIGC作品', component: '/aigc/works/index.vue' },
            { id: 12, path: '/aigc/gallery', menuName: '作品墙', component: '/aigc/gallery/index.vue' },
            { id: 13, path: '/oj/problems', menuName: '题库管理', component: '/assignments/index.vue' },
            { id: 14, path: '/oj/submission', menuName: '提交记录', component: '/oj/submission/index.vue' },
            { id: 15, path: '/homework/list', menuName: '作业列表', component: '/homework/list/index.vue' },
            { id: 16, path: '/homework/review', menuName: '作业批改', component: '/homework/review/index.vue' },
            { id: 17, path: '/homework/statistics', menuName: '作业统计', component: '/homework/statistics/index.vue' },
            { id: 18, path: '/exam/list', menuName: '考试列表', component: '/exam/list/index.vue' },
            { id: 19, path: '/exam/monitor', menuName: '考试监控', component: '/exam/monitor/index.vue' },
            { id: 20, path: '/exam/grades', menuName: '成绩管理', component: '/exam/grades/index.vue' },
            { id: 15, path: '/ai/assistant', menuName: 'AI助教', component: '/ai/assistant/index.vue' },
            { id: 16, path: '/assessment/analysis', menuName: '能力测评', component: '/assessment/analysis/index.vue' },
            { id: 16, path: '/assessment/plan', menuName: '提分计划', component: '/assessment/plan/index.vue' },
            { id: 17, path: '/learning/report', menuName: '学习报告', component: '/learning/report/index.vue' },
            { id: 18, path: '/authorization', menuName: '授权管理', component: '/authorization/index.vue' },
            { id: 19, path: '/student/my-courses', menuName: '我的课程', component: '/student/my-courses/index.vue' },
            { id: 20, path: '/student/course-detail', menuName: '课程详情', component: '/student/course-detail/index.vue' },
            { id: 21, path: '/system', menuName: '系统管理', component: '/system/user/index.vue' }
          ],
          menuList: [
            { id: 1, menuName: '首页', path: '/dashboard', menuIcon: 'dashboard', parentId: 0, children: [] },
            {
              id: 2,
              menuName: '课程管理',
              path: '/course',
              menuIcon: 'course',
              parentId: 0,
              children: [
                { id: 21, menuName: '课程列表', path: '/course', parentId: 2 },
                { id: 22, menuName: '课程详情', path: '/course/detail', parentId: 2 },
                { id: 23, menuName: '创建课程', path: '/course/create', parentId: 2 },
                { id: 24, menuName: '编辑课程', path: '/course/update', parentId: 2 },
                { id: 25, menuName: '课程分析', path: '/course/analytics', parentId: 2 },
                { id: 26, menuName: '章节管理', path: '/course/chapter', parentId: 2 },
                { id: 27, menuName: '课程数据', path: '/course/record', parentId: 2 }
              ]
            },
            {
              id: 3,
              menuName: '学生管理',
              path: '/users',
              menuIcon: 'users',
              parentId: 0,
              children: [
                { id: 31, menuName: '学生列表', path: '/users', parentId: 3 },
                { id: 32, menuName: '学生记录', path: '/users/record', parentId: 3 },
                { id: 33, menuName: '学习报告', path: '/learning/report', parentId: 3 },
                { id: 34, menuName: '授权管理', path: '/authorization', parentId: 3 },
                { id: 35, menuName: '我的课程', path: '/student/my-courses', parentId: 3 }
              ]
            },
            {
              id: 4,
              menuName: 'AIGC管理',
              path: '/aigc',
              menuIcon: 'picture',
              parentId: 0,
              children: [
                { id: 41, menuName: '作品管理', path: '/aigc/works', parentId: 4 },
                { id: 42, menuName: '作品墙', path: '/aigc/gallery', parentId: 4 }
              ]
            },
            {
              id: 5,
              menuName: '题库管理',
              path: '/oj',
              menuIcon: 'document',
              parentId: 0,
              children: [
                { id: 51, menuName: '题库管理', path: '/oj/problems', parentId: 5 },
                { id: 52, menuName: '提交记录', path: '/oj/submission', parentId: 5 }
              ]
            },
            {
              id: 7,
              menuName: '作业管理',
              path: '/homework',
              menuIcon: 'edit-pen',
              parentId: 0,
              children: [
                { id: 71, menuName: '作业列表', path: '/homework/list', parentId: 7 },
                { id: 72, menuName: '作业批改', path: '/homework/review', parentId: 7 },
                { id: 73, menuName: '作业统计', path: '/homework/statistics', parentId: 7 }
              ]
            },
            {
              id: 8,
              menuName: '考试管理',
              path: '/exam',
              menuIcon: 'video-play',
              parentId: 0,
              children: [
                { id: 81, menuName: '考试列表', path: '/exam/list', parentId: 8 },
                { id: 82, menuName: '考试监控', path: '/exam/monitor', parentId: 8 },
                { id: 83, menuName: '成绩管理', path: '/exam/grades', parentId: 8 }
              ]
            },
            {
              id: 6,
              menuName: 'AI助教',
              path: '/ai',
              menuIcon: 'chat-dot-round',
              parentId: 0,
              children: [
                { id: 61, menuName: '助教管理', path: '/ai/assistant', parentId: 6 }
              ]
            },
            { id: 12, menuName: '老师管理', path: '/system', menuIcon: 'user', parentId: 0, children: [
                { id: 121, menuName: '老师列表', path: '/users/lecturer', parentId: 12 },
                { id: 122, menuName: '老师日志', path: '/users/log', parentId: 12 }
              ] 
            }
          ],
          permissionList: [
            // 系统管理权限
            'system:user:view', 'system:user:add', 'system:user:edit', 'system:user:delete',
            'system:role:view', 'system:role:add', 'system:role:edit', 'system:role:delete',
            'system:menu:view', 'system:menu:add', 'system:menu:edit', 'system:menu:delete',
            'system:config:view', 'system:config:edit',

            // 课程管理权限
            'course:view', 'course:add', 'course:edit', 'course:delete', 'course:copy', 'course:analytics',
            'course:chapter:view', 'course:chapter:add', 'course:chapter:edit', 'course:chapter:delete',
            'course:period:view', 'course:period:add', 'course:period:edit', 'course:period:delete',
            'course:record:view',

            // 用户管理权限
            'users:view', 'users:add', 'users:edit', 'users:delete',
            'users:lecturer:view', 'users:lecturer:add', 'users:lecturer:edit', 'users:lecturer:delete',
            'users:record:view',

            // AIGC管理权限
            'aigc:works:view', 'aigc:works:add', 'aigc:works:edit', 'aigc:works:delete', 'aigc:works:audit',
            'aigc:gallery:view',

            // OJ系统权限
            'oj:problem:view', 'oj:problem:add', 'oj:problem:edit', 'oj:problem:delete', 'oj:problem:copy',
            'oj:submission:view', 'oj:submission:rejudge', 'oj:submission:delete',

            // AI助教权限
            'ai:assistant:view', 'ai:assistant:config', 'ai:assistant:feedback',

            // 能力测评权限
            'assessment:analysis:view', 'assessment:plan:view', 'assessment:plan:add', 'assessment:plan:edit', 'assessment:plan:delete',

            // 学习报告权限
            'learning:report:view', 'learning:report:generate', 'learning:report:export',

            // 授权管理权限
            'authorization:view', 'authorization:add', 'authorization:edit', 'authorization:delete',
            'authorization:batch', 'authorization:toggle'
          ]
        }

        // 存入cookie
        setToken(mockToken)
        // 更新store
        useUserStore().login(mockUser)
        // 初始化路由
        createNewRouter(mockUser.routerList)

        // 使用alert显示登录成功信息
        alert('🎉 登录成功！欢迎使用芝麻信奥教育系统测试端\n\n当前为演示环境，所有功能待开发中')

        router.push(PATH.URL_DASHBOARD)
      } catch (error) {
        console.error(error)
        alert('登录失败，请重试')
      } finally {
        loading.value = false
      }
    }, 800) // 模拟网络延迟
  }
</script>

<style lang="scss" scoped>
  .login-container {
    height: 100vh;
    background: var(--gradient-primary);
  }

  .login-content {
    position: absolute;
    top: calc((100vh - 520px) / 2);
    left: 0;
    right: 0;
    width: 800px;
    margin: 0 auto;

    .login-info {
      float: left;
      width: 350px;
      padding: 25px;
      height: 450px;
      color: var(--color-text-inverse);
      background: var(--color-primary-800);
      border-radius: 12px 0 0 12px;

      .title {
        font-size: 20px;
        font-weight: 700;
      }

      .info {
        font-size: 15px;
        font-weight: 300;
        line-height: 25px;
      }
    }

    .login-panel {
      float: right;
      background: var(--color-bg-primary);
      height: 450px;
      width: 350px;
      padding: 25px;
      border-radius: 0 12px 12px 0;

      .login-head {
        text-align: center;
        font-size: 28px;
        font-weight: 700;
      }

      .demo-badge {
        text-align: center;
        margin-bottom: 20px;

        .demo-icon {
          margin-right: 5px;
          font-size: 16px;
        }
      }

      .login-button {
        width: 350px;
        height: 45px;
        background: var(--gradient-primary);
        border-radius: var(--radius-base);
        font-size: 16px;
        font-weight: 700;
        text-align: center;
        color: var(--color-text-inverse);
        line-height: 50px;
        cursor: pointer;
        border: none;
        box-shadow: 0 4px 12px var(--color-shadow-primary);
        transition: var(--transition);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px var(--color-shadow-primary-hover);
        }
      }

      .tip {
        margin-top: 20px;
        font-size: 14px;
      }
    }
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    color: var(--color-text-inverse);
    text-align: center;
    padding-bottom: 20px;
    font-size: 13px;
    line-height: 25px;

    a {
      text-decoration: none;
      color: var(--color-text-inverse);
    }
    .website-prn {
      width: auto;
    }
  }

  .var-input {
    width: 200px;
  }

  .var-img {
    margin-left: 20px;
    width: 80px;
    height: auto;
  }

  .el-input {
    height: 40px;
  }
</style>
