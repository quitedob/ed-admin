一、功能模块原子化权限清单

## 1. 仪表盘模块 (Dashboard)
- **路由**: `/dashboard`
- **页面文件**: `src/views/dashboard/index.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
dashboard:view | 访问仪表盘 | 查看仪表盘页面 | 页面访问
stat:data | 数据统计 | 查看系统数据统计模块 | 数据统计卡片显示
stat:login | 登录统计 | 查看用户登录统计 | 登录统计卡片显示
stat:vod | 视频统计 | 查看视频学习统计 | 视频统计卡片显示

## 2. 班级管理模块 (Class Management)
- **路由**: `/class/management`
- **页面文件**: `src/views/class/management/index.vue`
- **资源管理组件**: `src/views/class/management/components/ResourceManagementDrawer.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
class:view | 查看班级 | 查看班级列表和详情 | 班级卡片展示、详情访问
class:create | 创建班级 | 新建班级 | "新建班级"按钮
class:import | 批量导入 | Excel批量导入班级 | "批量导入"按钮
class:edit | 编辑班级 | 修改班级信息 | "编辑信息"按钮
class:delete | 删除班级 | 删除班级 | "删除"按钮（卡片操作）
class:manage-resources | 管理清单 | 管理班级关联的资源 | "管理清单"按钮
class:manage-courses | 管理课程 | 为班级添加/移除课程 | 资源管理抽屉课程标签页
class:manage-homeworks | 管理作业 | 为班级添加/移除作业 | 资源管理抽屉作业标签页
class:manage-exams | 管理考试 | 为班级添加/移除考试 | 资源管理抽屉考试标签页
class:manage-teachers | 管理教师 | 为班级分配/移除教师 | 资源管理抽屉教师标签页
class:manage-students | 管理学生 | 为班级添加/移除学生 | 资源管理抽屉学生标签页

## 3. 学生管理模块 (Student Management)
- **说明**: 学生管理主要通过班级管理模块和用户详情页面实现，没有独立的学生列表管理页面
- **主要路由**:
  - 班级管理: `/class/management` (通过StudentManagementDrawer组件管理班级学生)
  - 学生详情: `/users/detail/:id` (查看具体学生详细信息)
- **学生相关页面**: `src/views/student/my-courses/index.vue`, `src/views/student/personal/index.vue` (学生端页面)
- **组件文件**:
  - `src/views/class/management/components/StudentManagementDrawer.vue`
  - `src/views/class/management/components/StudentManagementPanel.vue`
  - `src/views/users/detail/index.vue`
  - `src/views/users/detail/components/UserBasicInfo.vue`
  - `src/views/users/detail/components/HomeworkRecords.vue`
  - `src/views/users/detail/components/ExamRecords.vue`
  - `src/views/users/detail/components/LearningRecords.vue`
  - `src/views/users/detail/components/QuestionPracticeList.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
student:view | 查看学生 | 通过班级管理查看学生信息 | 班级卡片中学生数量显示
student:view-detail | 查看学生详情 | 查看学生详细信息页面 | 学生详情页面访问
student:view-basic | 查看基本信息 | 访问学生基本信息标签页 | "基本信息"标签页
student:view-profile | 查看个人资料 | 查看学生个人资料信息 | UserBasicInfo组件
student:view-status | 查看学生状态 | 查看学生账户状态 | 状态标签显示
student:view-classes | 查看所属班级 | 查看学生关联的班级信息 | 班级标签信息
student:view-homework | 查看作业记录 | 访问学生作业记录页面 | "作业记录"标签页/homework.vue
student:view-exam | 查看考试记录 | 访问学生考试记录页面 | "考试记录"标签页/exam.vue
student:view-practice | 查看题库记录 | 访问学生题库练习记录 | "题库记录"标签页
student:view-learning | 查看学习记录 | 访问学生学习记录页面 | "学习记录"标签页
student:manage-in-class | 管理班级学生 | 在班级中管理学生 | StudentManagementDrawer组件
student:add-to-class | 添加学生到班级 | 将学生添加到指定班级 | StudentManagementDrawer右侧面板
student:remove-from-class | 从班级移除学生 | 从班级中移除学生 | StudentManagementDrawer移除按钮
student:search-in-class | 搜索班级学生 | 在班级内搜索学生 | StudentManagementDrawer搜索框
student:search-global | 搜索全局学生 | 搜索可添加到班级的学生 | StudentManagementDrawer全局搜索
student:edit | 编辑学生信息 | 编辑学生基本信息 | "编辑信息"按钮
student:view-stats | 查看学生统计 | 查看学生统计数据 | 作业/考试完成统计
student:view-submission | 查看作业提交 | 查看学生作业提交详情 | SubmissionDetailDialog组件
student:view-practice-detail | 查看练习详情 | 查看学生练习详情 | PracticeDetailDialog组件
student:personal-access | 个人端访问 | 访问学生个人页面 | student目录下页面

## 4. 教师管理模块 (Teacher Management)
- **路由**: `/users/lecturer`, `/users/lecturer/list`, `/users/lecturer/detail/:id`
- **页面文件**: `src/views/users/lecturer/index.vue`, `src/views/users/lecturer/list/index.vue`, `src/views/users/lecturer/detail/index.vue`
- **组件文件**: `src/views/users/lecturer/components/TeacherForm.vue`, `src/views/users/lecturer/components/AuthorizeDialog.vue`, `src/views/users/lecturer/components/ResourceAuthorizationDialog.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
lecturer:view | 查看教师 | 查看教师列表 | 教师列表页面访问
lecturer:search | 搜索教师 | 按姓名、工号、手机号、邮箱等搜索 | 搜索框功能
lecturer:filter-status | 按状态筛选 | 按账号状态筛选教师 | 状态筛选下拉框
lecturer:filter-role | 按角色筛选 | 按教师角色筛选 | 角色筛选下拉框
lecturer:filter-subject | 按科目筛选 | 按授课科目筛选 | 科目筛选下拉框
lecturer:create | 创建教师 | 新增教师账号 | "新建老师"按钮
lecturer:save | 保存教师 | 保存教师信息 | "添加讲师"按钮
lecturer:edit | 编辑教师 | 修改教师基本信息 | "编辑"按钮
lecturer:delete | 删除教师 | 删除教师账号 | "删除"按钮
lecturer:batch-delete | 批量删除 | 批量删除选中教师 | "批量删除"按钮
lecturer:view-detail | 查看详情 | 查看教师详细信息 | "查看详情"按钮
lecturer:status-toggle | 切换状态 | 启用/禁用教师账号 | "启用"/"禁用"按钮
lecturer:authorize-class | 授权班级 | 为教师分配班级权限 | "授权班级"按钮
lecturer:authorize-resource | 授权资源 | 为教师分配课程、作业、考试权限 | "授权资源"按钮
lecturer:view-profile | 查看个人资料 | 查看教师个人信息 | 教师基本信息区域
lecturer:view-subjects | 查看授课科目 | 查看教师教授的科目 | 授课科目标签
lecturer:view-teaching-years | 查看教学年限 | 查看教师教学年限信息 | 教学年限显示
lecturer:view-classes | 查看负责班级 | 查看教师负责的班级数量 | 负责班级数量显示
lecturer:view-stats | 查看统计信息 | 查看教师教学统计数据 | 统计数据区域
lecturer:sort | 排序教师 | 调整教师列表顺序 | 拖拽排序功能

## 5. 作业管理模块 (Homework Management)
- **路由**: `/homework`, `/homework/list`, `/homework/create`, `/homework/edit/:id`, `/homework/detail/:id`, `/homework/grading`, `/homework/statistics`, `/homework/review`
- **页面文件**: `src/views/homework/index.vue`, `src/views/homework/list/index.vue`, `src/views/homework/create/index.vue`, `src/views/homework/edit/index.vue`, `src/views/homework/detail/index.vue`, `src/views/homework/grading/index.vue`, `src/views/homework/statistics/index.vue`, `src/views/homework/review/index.vue`
- **组件文件**: `src/views/homework/components/HomeworkDialog.vue`, `src/views/homework/components/QuestionManagementDrawer.vue`, `src/views/homework/components/QuestionSelectorDialog.vue`, `src/views/homework/components/OJQuestionImportDialog.vue`, `src/views/homework/components/SubmissionsDialog.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
homework:view | 查看作业 | 查看作业列表 | 作业列表页面访问
homework:search | 搜索作业 | 按作业名称搜索 | 搜索框功能
homework:filter-class | 按班级筛选 | 按班级筛选作业 | 班级筛选下拉框
homework:create | 创建作业 | 新建作业 | "新建作业"按钮
homework:import | 导入作业 | 批量导入作业 | "导入"按钮
homework:export | 导出作业 | 导出作业数据 | "导出"按钮
homework:edit | 编辑作业 | 修改作业内容和设置 | "编辑"按钮
homework:detail | 查看详情 | 查看作业详细信息 | 作业详情页面
homework:delete | 删除作业 | 删除作业 | "删除"按钮
homework:grade | 批改作业 | 批改学生作业 | "批改"按钮、批改页面
homework:review | 批改查看 | 查看作业批改情况 | 批改页面访问
homework:statistics | 作业统计 | 查看作业统计数据 | 统计页面、统计图表
homework:view-submissions | 查看提交 | 查看学生作业提交情况 | 提交查看功能
homework:manage-question | 管理题目 | 管理作业题目 | 题目管理功能
homework:add-question | 添加题目 | 为作业添加题目 | 题目添加功能
homework:import-question | 导入题目 | 从题库导入题目 | 题目导入功能
homework:oJ-import | OJ题导入 | 导入编程题目 | OJ题目导入对话框
homework:manage-deadline | 管理截止时间 | 设置作业截止时间 | 截止时间管理
homework:late-submission | 迟交设置 | 配置迟交作业扣分 | 迟交设置功能
homework:assign-class | 分配班级 | 为作业分配班级 | 作业分配功能
homework:batch-operate | 批量操作 | 批量处理作业 | 批量选择、删除等功能

## 6. 考试管理模块 (Exam Management)
- **路由**: `/exam/list`, `/exam/create`, `/exam/edit/:id`, `/exam/detail/:id`, `/exam/grade/:id`, `/exam/grade/:id/paper/:submissionId`, `/exam/monitor`, `/exam/grades`
- **页面文件**: `src/views/exam/list/index.vue`, `src/views/exam/create/index.vue`, `src/views/exam/detail/index.vue`, `src/views/exam/grade/index.vue`, `src/views/exam/grade/StudentPaper.vue`, `src/views/exam/grades/index.vue`, `src/views/exam/monitor/index.vue`, `src/views/exam/index.vue`
- **组件文件**: `src/views/exam/components/ExamWizardDialog.vue`, `src/views/exam/create/components/PaperBuilder.vue`, `src/views/exam/create/components/QuestionBankForm.vue`, `src/views/exam/create/components/QuestionSelector.vue`, `src/views/exam/grade/components/AnswerReview.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
exam:view | 查看考试 | 查看考试列表 | 考试列表页面访问
exam:search | 搜索考试 | 按标题搜索考试 | 搜索框功能
exam:filter-type | 按类型筛选 | 按考试类型筛选 | 考试类型筛选下拉框
exam:filter-status | 按状态筛选 | 按考试状态筛选 | 状态筛选下拉框
exam:create | 创建考试 | 新建考试 | "新建考试"按钮
exam:edit | 编辑考试 | 修改考试内容和设置 | "编辑"按钮
exam:detail | 查看详情 | 查看考试详细信息 | 考试详情页面
exam:delete | 删除考试 | 删除考试 | "删除"按钮
exam:monitor | 考试监控 | 实时监控考试进行 | "监考"按钮、监控页面
exam:grade | 批改试卷 | 批改主观题和成绩管理 | "批改"按钮、批改页面
exam:grades | 成绩管理 | 查看和管理考试成绩 | 成绩管理页面
exam:view-paper | 查看答卷 | 查看学生考试答卷 | 答卷查看页面、StudentPaper组件
exam:review-answer | 批阅答案 | 批阅具体题目答案 | AnswerReview组件
exam:wizard | 考试向导 | 使用考试创建向导 | ExamWizardDialog组件
exam:paper-builder | 试卷构建 | 构建考试试卷 | PaperBuilder组件
exam:question-select | 题目选择 | 选择考试题目 | QuestionSelector组件
exam:bank-manage | 题库管理 | 管理考试题库 | QuestionBankForm组件
exam:config-duration | 配置时长 | 设置考试时长 | 时长配置功能
exam:config-score | 配置分数 | 设置考试总分和分值 | 分数配置功能
exam:config-questions | 配置题目 | 设置考试题目数量 | 题目数量配置
exam:manage-participants | 管理参与者 | 管理考试参与学生 | 参与者管理功能
exam:export-paper | 导出试卷 | 导出考试试卷 | 试卷导出功能
exam:batch-operate | 批量操作 | 批量处理考试 | 批量选择、删除等功能

## 7. 课程管理模块 (Course Management)
- **路由**: `/course/list`, `/course/detail`, `/course/chapter`
- **页面文件**: `src/views/course/list/index.vue`, `src/views/course/detail/index.vue`, `src/views/course/update/ModernCourseUpdate.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
course:view | 查看课程 | 查看课程列表和详情 | 列表展示、详情页面
course:search | 搜索课程 | 按课程名称搜索 | 搜索框功能
course:create | 创建课程 | 新增课程 | "添加课程"按钮
course:edit | 编辑课程 | 修改课程信息 | "编辑"按钮
course:delete | 删除课程 | 删除课程 | "删除"按钮
course:view-detail | 查看详情页 | 访问课程详情页面 | "详情"按钮
course:view-metadata | 查看元数据 | 查看课程元数据信息 | 元数据信息区域
course:view-statistics | 查看统计数据 | 查看课程学习统计 | 统计数据区域
course:view-chapters | 查看章节内容 | 访问章节内容标签页 | "章节内容"标签页
course:view-learning-data | 查看学习数据 | 访问学习数据标签页 | "学习数据"标签页
course:manage-chapters | 管理章节 | 管理课程章节结构 | "管理章节"按钮
course:edit-basic | 编辑基础信息 | 编辑课程基础信息 | "基础信息"标签页
course:edit-settings | 编辑课程设置 | 修改播放设置等 | "课程设置"标签页
course-chapter:create | 创建章节 | 新增课程章节 | "添加章节"按钮
course-chapter:edit | 编辑章节 | 修改章节信息 | "编辑"按钮
course-chapter:delete | 删除章节 | 删除课程章节 | "删除"按钮
course-section:create | 创建小节 | 新增课程小节 | "添加小节"按钮
course-section:edit | 编辑小节 | 修改小节内容 | "编辑"按钮
course-section:delete | 删除小节 | 删除课程小节 | "删除"按钮
course-section:upload-video | 上传视频 | 上传小节视频文件 | 视频上传组件
course-section:upload-pdf | 上传PDF | 上传PDF文档 | PDF上传组件
course-section:upload-image | 上传图片 | 上传图片资源 | 图片上传组件
course-section:set-content | 设置内容 | 配置文本内容 | 文本输入框
course-section:manage-practice | 管理练习 | 配置小节练习题 | 练习题管理区域
course-section:manage-questions | 管理题目 | 添加/编辑练习题目 | 题目管理功能
course-section:programming | 编程内容 | 设置编程相关内容 | 编程类型小节配置
course-section:hoj-problem | HOJ编程题 | 管理HOJ编程题目 | HOJ题目管理功能
course-section:homework-config | 作业配置 | 设置章节作业 | 作业类型小节配置

## 8. 素材管理模块 (Material Management)
- **路由**: `/material/index`
- **页面文件**: `src/views/material/index.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
material:view | 查看素材 | 查看素材列表 | 素材列表页面访问
material:browse | 浏览分类 | 按分类浏览素材 | 左侧分类树点击
material:filter-type | 类型筛选 | 按素材类型筛选 | 类型筛选功能
material:search | 搜索素材 | 按名称搜索素材 | 搜索框功能
material:upload | 上传素材 | 上传新素材文件 | "上传"按钮
material:batch-upload | 批量上传 | 批量上传多个素材 | 批量上传功能
material:edit | 编辑素材 | 修改素材信息 | "编辑"按钮
material:delete | 删除素材 | 删除单个素材 | "删除"按钮
material:batch-delete | 批量删除 | 批量删除多个素材 | 批量删除功能
material:batch-move | 批量移动 | 批量移动到其他分类 | 批量移动功能
material:preview | 预览素材 | 预览素材内容 | 素材点击预览
material:download | 下载素材 | 下载素材文件 | 下载功能

## 9. AIGC作品管理模块 (AIGC Works)
- **路由**: `/aigc/works`
- **页面文件**: `src/views/content/aigc/works-wall.vue`
- **相关页面**: `src/views/aigc/works/index.vue`, `src/views/aigc/gallery/index.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
aigc:view | 查看作品墙 | 查看AIGC作品展示墙 | 作品墙页面访问
aigc:filter-class | 按班级筛选 | 按班级筛选作品 | 班级筛选下拉框
aigc:filter-course | 按课程筛选 | 按课程筛选作品 | 课程筛选下拉框
aigc:filter-type | 按类型筛选 | 按作品类型筛选 | 类型筛选下拉框
aigc:search | 搜索作品 | 按标题搜索作品 | 搜索框功能
aigc:preview | 预览作品 | 预览作品详细内容 | 作品卡片预览
aigc:view-detail | 查看详情 | 查看作品详细信息 | 详情按钮
aigc:like | 点赞作品 | 为作品点赞 | 点赞按钮
aigc:delete | 删除作品 | 删除作品 | 删除按钮
aigc:download | 下载作品 | 下载作品文件 | 下载按钮
aigc:share | 分享作品 | 分享作品链接 | 分享功能
aigc:batch-manage | 批量管理 | 批量操作作品 | 批量选择、删除等功能
aigc:upload | 上传作品 | 上传新作品 | 上传功能
aigc:edit | 编辑作品 | 编辑作品信息 | 编辑按钮

## 10. 题库管理模块 (Question Bank)
- **路由**: `/assignments`
- **页面文件**: `src/views/assignments/index.vue`
- **题目编辑组件**: `src/views/assignments/edit-question/index.vue`
- **题目管理抽屉**: `src/views/assignments/components/QuestionManagementDrawer.vue`

权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
question:view | 查看题库 | 查看题库题目列表 | 题库页面访问、题目列表展示
question:create | 添加题目 | 新建题目 | "添加题目"按钮
question:edit | 编辑题目 | 修改题目内容 | 题目编辑功能
question:delete | 删除题目 | 删除题目 | "删除"按钮
question:import | 导入题目 | JSON批量导入题目 | "导入题目"按钮
question:export | 导出题目 | 导出题目数据 | 导出功能
question:manage-tags | 标签管理 | 管理题目标签分类 | "标签管理"按钮
question:filter-type | 按题型筛选 | 按题型筛选题目 | 题型筛选功能
question:filter-difficulty | 按难度筛选 | 按难度筛选题目 | 难度筛选功能
question:filter-tag | 按标签筛选 | 按标签筛选题目 | 标签筛选功能
question:batch-operate | 批量操作 | 批量处理题目 | 批量选择、删除等功能
question:preview | 预览题目 | 预览题目内容 | 题目预览功能
question:manage-programming | 管理编程题 | 管理OJ编程题设置 | 编程题配置
question:manage-scratch | 管理Scratch题 | 管理Scratch图形化题 | Scratch题配置
question:upload-testcase | 导入测试用例 | 批量导入测试用例 | 测试用例导入功能

## 11. 用户认证模块 (Authentication)
权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
auth:login | 登录系统 | 用户登录 | 登录页面访问
auth:logout | 登出系统 | 用户登出 | 登出功能
auth:profile | 个人资料 | 查看修改个人资料 | 个人资料页面
auth:change-password | 修改密码 | 修改登录密码 | 密码修改功能

## 12. 系统设置模块 (System Settings)
权限代码 | 权限名称 | 说明 | 对应操作
---|---|---|---
system:config | 系统配置 | 访问系统配置页面 | 配置页面访问
system:manage-users | 用户管理 | 管理系统用户 | 用户管理功能
system:manage-roles | 角色管理 | 管理用户角色 | 角色管理功能
system:manage-permissions | 权限管理 | 管理权限配置 | 权限管理功能
system:view-logs | 查看日志 | 查看系统操作日志 | 日志查看功能
system:backup | 系统备份 | 备份系统数据 | 备份功能
system:restore | 系统恢复 | 恢复系统数据 | 恢复功能