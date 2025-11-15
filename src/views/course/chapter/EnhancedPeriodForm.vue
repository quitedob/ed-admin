<template>
  <el-dialog
    :append-to-body="true"
    :model-value="visible"
    :title="formModel.id ? '修改课次' : '添加课次'"
    width="900px"
    center
    align-center
    :destroy-on-close="true"
    @close="onClose"
  >
    <el-form ref="formRef" :model="formModel" :rules="rules" label-width="100px" @submit.prevent>
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 基本信息 -->
        <el-tab-pane label="基本信息" name="basic">
          <el-form-item class="form-group" label="课次名称" prop="periodName">
            <el-input v-model="formModel.periodName" maxlength="100" show-word-limit />
          </el-form-item>

          <el-form-item v-if="coursePrice > 0" class="form-group" label="收费设置" prop="isFree">
            <enum-radio v-model="formModel.isFree" :enum-name="'FreeEnum'" />
          </el-form-item>

          <el-form-item label="课次描述" prop="description">
            <el-input
              v-model="formModel.description"
              type="textarea"
              :rows="3"
              placeholder="请输入课次描述"
            />
          </el-form-item>

          <el-form-item label="学习目标" prop="learningObjectives">
            <el-input
              v-model="formModel.learningObjectives"
              type="textarea"
              :rows="3"
              placeholder="请输入学习目标"
            />
          </el-form-item>
        </el-tab-pane>

        <!-- 资源管理 -->
        <el-tab-pane label="资源管理" name="resource">
          <div class="resource-section">
            <div class="section-header">
              <h4>教学资源</h4>
              <el-button size="small" @click="resourceSelect">添加资源</el-button>
            </div>

            <div v-if="formModel.resources && formModel.resources.length > 0" class="resource-list">
              <div
                v-for="(resource, index) in formModel.resources"
                :key="resource.id"
                class="resource-item"
              >
                <div class="resource-info">
                  <el-tag>{{ getResourceTypeLabel(resource.resourceType) }}</el-tag>
                  <span class="resource-name">{{ resource.resourceName }}</span>
                  <span v-if="resource.resourceType < 3" class="resource-duration">
                    时长：{{ formatTime(resource.videoLength) }}
                  </span>
                </div>
                <div class="resource-actions">
                  <el-button size="small" text @click="removeResource(index)">移除</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="暂无资源，请添加教学资源" />
          </div>
        </el-tab-pane>

        <!-- OJ题目关联 -->
        <el-tab-pane label="OJ题目关联" name="problems">
          <div class="problems-section">
            <div class="section-header">
              <h4>关联编程题目</h4>
              <div class="header-actions">
                <el-button size="small" @click="openProblemSelector">选择题目</el-button>
                <el-button size="small" @click="createNewProblem">创建新题</el-button>
              </div>
            </div>

            <div class="filter-bar">
              <el-form :inline="true" size="small">
                <el-form-item label="难度筛选">
                  <el-select v-model="problemFilter.difficulty" placeholder="全部难度" clearable>
                    <el-option label="简单" value="easy" />
                    <el-option label="中等" value="medium" />
                    <el-option label="困难" value="hard" />
                  </el-select>
                </el-form-item>
                <el-form-item label="类型筛选">
                  <el-select v-model="problemFilter.category" placeholder="全部类型" clearable>
                    <el-option label="数组" value="array" />
                    <el-option label="字符串" value="string" />
                    <el-option label="链表" value="linked-list" />
                    <el-option label="树" value="tree" />
                    <el-option label="图" value="graph" />
                    <el-option label="动态规划" value="dp" />
                  </el-select>
                </el-form-item>
              </el-form>
            </div>

            <div v-if="filteredProblems.length > 0" class="problems-list">
              <draggable
                v-model="formModel.problems"
                item-key="id"
                @end="handleProblemSort"
              >
                <template #item="{ element, index }">
                  <div class="problem-item" :class="{ 'main-problem': element.isMain }">
                    <div class="problem-drag-handle">
                      <el-icon><Rank /></el-icon>
                    </div>
                    <div class="problem-info">
                      <div class="problem-header">
                        <span class="problem-id">{{ element.id }}.</span>
                        <span class="problem-title">{{ element.title }}</span>
                        <el-tag size="small" :type="getDifficultyTagType(element.difficulty)">
                          {{ getDifficultyLabel(element.difficulty) }}
                        </el-tag>
                        <el-tag size="small" type="info">{{ getCategoryLabel(element.category) }}</el-tag>
                        <el-tag v-if="element.isMain" size="small" type="success">主题目</el-tag>
                      </div>
                      <div class="problem-meta">
                        <span>通过率：{{ element.acceptanceRate }}%</span>
                        <span>提交数：{{ element.submissionCount }}</span>
                        <span>时间限制：{{ element.timeLimit }}ms</span>
                        <span>内存限制：{{ element.memoryLimit }}KB</span>
                      </div>
                      <div class="problem-tags">
                        <el-tag
                          v-for="tag in element.tags"
                          :key="tag"
                          size="small"
                          class="problem-tag"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </div>
                    <div class="problem-actions">
                      <el-dropdown @command="(cmd) => handleProblemAction(cmd, element, index)">
                        <el-button size="small" text>
                          操作<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </el-button>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <el-dropdown-item command="setMain" v-if="!element.isMain">
                              设为主题目
                            </el-dropdown-item>
                            <el-dropdown-item command="unsetMain" v-if="element.isMain">
                              取消主题目
                            </el-dropdown-item>
                            <el-dropdown-item command="edit">编辑题目</el-dropdown-item>
                            <el-dropdown-item command="remove" divided>移除</el-dropdown-item>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
            <el-empty v-else description="暂无关联题目，请添加编程题目" />
          </div>
        </el-tab-pane>

        <!-- 练习设置 -->
        <el-tab-pane label="练习设置" name="practice">
          <el-form-item label="练习模式" prop="practiceMode">
            <el-radio-group v-model="formModel.practiceMode">
              <el-radio value="sequential">顺序练习</el-radio>
              <el-radio value="free">自由练习</el-radio>
              <el-radio value="adaptive">自适应练习</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="完成条件" prop="completionCondition">
            <el-checkbox-group v-model="formModel.completionCondition">
              <el-checkbox value="watch_video">观看视频</el-checkbox>
              <el-checkbox value="complete_problems">完成编程题</el-checkbox>
              <el-checkbox value="pass_all_problems">通过所有题目</el-checkbox>
              <el-checkbox value="main_problem_only">仅主题目</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="最少题目数" prop="minProblems">
            <el-input-number
              v-model="formModel.minProblems"
              :min="1"
              :max="20"
              :disabled="!formModel.completionCondition.includes('complete_problems')"
            />
          </el-form-item>

          <el-form-item label="练习时长限制" prop="timeLimit">
            <el-input-number
              v-model="formModel.timeLimit"
              :min="10"
              :max="300"
              :step="10"
            />
            <span style="margin-left: 10px;">分钟（0表示不限制）</span>
          </el-form-item>

          <el-form-item label="允许查看答案" prop="allowAnswer">
            <el-switch
              v-model="formModel.allowAnswer"
              active-text="允许"
              inactive-text="不允许"
            />
          </el-form-item>

          <el-form-item label="答案查看条件" prop="answerConditions" v-if="formModel.allowAnswer">
            <el-checkbox-group v-model="formModel.answerConditions">
              <el-checkbox value="after_completion">完成课后</el-checkbox>
              <el-checkbox value="after_attempts">尝试3次后</el-checkbox>
              <el-checkbox value="after_time">学习30分钟后</el-checkbox>
              <el-checkbox value="paid_only">仅付费用户</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="onClose()">取消</el-button>
        <el-button type="primary" @click="onSubmit()" :loading="loading">确定</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 题目选择器 -->
  <problem-selector
    v-if="problemSelectorVisible"
    :visible="problemSelectorVisible"
    :selected-problems="formModel.problems || []"
    @close="problemSelectorVisible = false"
    @confirm="handleProblemSelected"
  />
</template>

<script setup>
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { reactive, ref, computed, watch, onMounted } from 'vue'
  import { courseApi } from '@/api/course'
  import { ojApi } from '@/api/oj'
  import EnumRadio from '@/components/Enum/Radio/index.vue'
  import ProblemSelector from '@/components/Selector/Problem/index.vue'
  import draggable from 'vuedraggable'
  import { Rank, ArrowDown } from '@element-plus/icons-vue'
  import { formatTime } from '@/utils/base.js'

  // Props & Emits
  const props = defineProps({
    visible: Boolean,
    periodData: Object,
    courseInfo: Object
  })

  const emit = defineEmits(['close', 'refresh'])

  // 响应式数据
  const formRef = ref()
  const loading = ref(false)
  const activeTab = ref('basic')
  const problemSelectorVisible = ref(false)

  // 表单校验规则
  const rules = {
    periodName: [{ required: true, message: '课次名称不能为空', trigger: 'blur' }],
    practiceMode: [{ required: true, message: '请选择练习模式', trigger: 'change' }]
  }

  // 表单默认数据
  const formDefault = {
    id: undefined,
    periodName: undefined,
    periodType: 10,
    isFree: 0,
    description: '',
    learningObjectives: '',
    resources: [],
    problems: [],
    practiceMode: 'sequential',
    completionCondition: ['watch_video', 'complete_problems'],
    minProblems: 1,
    timeLimit: 0,
    allowAnswer: false,
    answerConditions: ['after_completion']
  }

  const formModel = reactive({ ...formDefault })
  const coursePrice = ref(props.courseInfo?.coursePrice || 0)

  // 题目筛选条件
  const problemFilter = reactive({
    difficulty: '',
    category: ''
  })

  // 过滤后的题目列表
  const filteredProblems = computed(() => {
    if (!formModel.problems) return []

    return formModel.problems.filter(problem => {
      if (problemFilter.difficulty && problem.difficulty !== problemFilter.difficulty) {
        return false
      }
      if (problemFilter.category && problem.category !== problemFilter.category) {
        return false
      }
      return true
    })
  })

  // 监听props变化
  watch(() => props.visible, (val) => {
    if (val) {
      initForm()
    }
  })

  // 初始化表单
  const initForm = () => {
    if (props.periodData) {
      Object.assign(formModel, props.periodData)
    } else {
      Object.assign(formModel, formDefault)
    }
    coursePrice.value = props.courseInfo?.coursePrice || 0
  }

  // 提交表单
  const onSubmit = async () => {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    try {
      // 验证至少有一个主题目
      if (formModel.problems && formModel.problems.length > 0) {
        const mainProblem = formModel.problems.find(p => p.isMain)
        if (!mainProblem) {
          ElMessage.warning('请选择一个主题目')
          loading.value = false
          return
        }
      }

      // 调用API保存数据
      if (formModel.id) {
        await courseApi.updatePeriod(formModel)
        ElMessage.success('修改成功')
      } else {
        await courseApi.createPeriod(formModel)
        ElMessage.success('添加成功')
      }

      emit('refresh')
      onClose()
    } catch (error) {
      ElMessage.error('操作失败')
    } finally {
      loading.value = false
    }
  }

  // 关闭对话框
  const onClose = () => {
    emit('close')
  }

  // 资源选择
  const resourceSelect = () => {
    // 触发资源选择器
    ElMessage.info('资源选择功能')
  }

  // 移除资源
  const removeResource = (index) => {
    formModel.resources.splice(index, 1)
  }

  // 打开题目选择器
  const openProblemSelector = () => {
    problemSelectorVisible.value = true
  }

  // 创建新题目
  const createNewProblem = () => {
    ElMessage.info('跳转到题目创建页面')
  }

  // 题目选择确认
  const handleProblemSelected = (problems) => {
    if (!formModel.problems) {
      formModel.problems = []
    }

    // 合并新选择的题目，避免重复
    problems.forEach(problem => {
      if (!formModel.problems.find(p => p.id === problem.id)) {
        formModel.problems.push({
          ...problem,
          isMain: formModel.problems.length === 0 // 第一个题目默认为主题目
        })
      }
    })

    problemSelectorVisible.value = false
  }

  // 题目排序
  const handleProblemSort = () => {
    ElMessage.success('题目顺序已更新')
  }

  // 题目操作
  const handleProblemAction = (command, problem, index) => {
    switch (command) {
      case 'setMain':
        formModel.problems.forEach(p => p.isMain = false)
        problem.isMain = true
        ElMessage.success('已设置为主题目')
        break
      case 'unsetMain':
        problem.isMain = false
        ElMessage.success('已取消主题目')
        break
      case 'edit':
        ElMessage.info('跳转到题目编辑页面')
        break
      case 'remove':
        removeProblem(index)
        break
    }
  }

  // 移除题目
  const removeProblem = (index) => {
    const problem = formModel.problems[index]
    if (problem.isMain) {
      ElMessage.warning('不能移除主题目')
      return
    }

    ElMessageBox.confirm('确定要移除这个题目吗？').then(() => {
      formModel.problems.splice(index, 1)
      ElMessage.success('题目已移除')
    })
  }

  // 工具方法
  const getResourceTypeLabel = (type) => {
    const labels = {
      1: '视频',
      2: '音频',
      3: '文档',
      4: '图片'
    }
    return labels[type] || '未知'
  }

  const getDifficultyTagType = (difficulty) => {
    const types = {
      easy: 'success',
      medium: 'warning',
      hard: 'danger'
    }
    return types[difficulty] || ''
  }

  const getDifficultyLabel = (difficulty) => {
    const labels = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return labels[difficulty] || difficulty
  }

  const getCategoryLabel = (category) => {
    const labels = {
      array: '数组',
      string: '字符串',
      'linked-list': '链表',
      tree: '树',
      graph: '图',
      dp: '动态规划',
      greedy: '贪心',
      backtracking: '回溯'
    }
    return labels[category] || category
  }

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/chapter/EnhancedPeriodForm.vue`);
  });

</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h4 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.resource-section,
.problems-section {
  margin-bottom: 20px;
}

.resource-list,
.problems-list {
  max-height: 400px;
  overflow-y: auto;
}

.resource-item,
.problem-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  background: #fafafa;
  transition: all 0.2s;
}

.resource-item:hover,
.problem-item:hover {
  background: #f0f0f0;
}

.problem-item.main-problem {
  border-color: #67c23a;
  background: #f0f9ff;
}

.problem-drag-handle {
  cursor: move;
  margin-right: 10px;
  color: #909399;
}

.resource-info,
.problem-info {
  flex: 1;
}

.resource-name,
.problem-title {
  margin: 0 8px;
  font-weight: 500;
}

.resource-duration {
  color: #909399;
  font-size: 12px;
}

.problem-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.problem-id {
  color: #909399;
  font-weight: 500;
}

.problem-meta {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.problem-meta span {
  margin-right: 15px;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.problem-tag {
  font-size: 11px;
}

.filter-bar {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>