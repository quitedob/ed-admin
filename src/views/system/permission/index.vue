<template>
  <div class="permission-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">权限管理</h2>
      <p class="page-description">管理系统角色和权限配置，控制用户访问权限</p>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreateRole">
        <el-icon><Plus /></el-icon>
        创建角色
      </el-button>
      <el-button @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <!-- 权限概览卡片 -->
    <div class="permission-overview">
      <el-row :gutter="20">
        <el-col :span="6" v-for="(stat, index) in permissionStats" :key="index">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-icon">
              <el-icon :class="stat.icon"></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 权限模块列表 -->
    <div class="permission-modules">
      <el-card shadow="never">
        <template #header>
          <div class="module-header">
            <span>权限模块</span>
            <el-button size="small" @click="toggleAllModules">
              {{ allExpanded ? '收起全部' : '展开全部' }}
            </el-button>
          </div>
        </template>

        <div class="module-list">
          <div
            v-for="(module, moduleIndex) in permissionModules"
            :key="moduleIndex"
            class="module-item"
            :class="{ 'is-system': module.code === 'system' }"
          >
            <div class="module-header" @click="toggleModule(moduleIndex)">
              <el-icon class="expand-icon">
                <component :is="module.expanded ? 'ArrowDown' : 'ArrowRight'" />
              </el-icon>
              <span class="module-name">{{ module.label }}</span>
              <span class="module-count">({{ module.permissions.length }}个权限)</span>
              <div class="module-actions">
                <el-tag :type="getModuleStatusType(module.status)">
                  {{ getModuleStatusText(module.status) }}
                </el-tag>
              </div>
            </div>

            <!-- 权限列表 -->
            <div v-show="module.expanded" class="permission-list">
              <div
                v-for="(permission, permIndex) in module.permissions"
                :key="permIndex"
                class="permission-item"
              >
                <div class="permission-header">
                  <div class="permission-info">
                    <el-checkbox
                      v-model="permission.selected"
                      :disabled="permission.disabled"
                      @change="handlePermissionChange(moduleIndex, permIndex)"
                    >
                      <span class="permission-code">{{ permission.code }}</span>
                    </el-checkbox>
                    <span class="permission-label">{{ permission.label }}</span>
                  </div>
                  <div class="permission-meta">
                    <el-tag v-if="permission.level" size="small" type="info">
                      {{ getLevelText(permission.level) }}
                    </el-tag>
                    <el-tag v-if="permission.children && permission.children.length > 0" size="small" type="warning">
                      {{ permission.children.length }}子权限
                    </el-tag>
                  </div>
                </div>

                <!-- 权限描述 -->
                <div class="permission-description">
                  {{ permission.description }}
                </div>

                <!-- 子权限列表 -->
                <div v-if="permission.children && permission.children.length > 0" class="sub-permissions">
                  <div
                    v-for="(childPerm, childIndex) in permission.children"
                    :key="childIndex"
                    class="sub-permission-item"
                  >
                    <el-checkbox
                      v-model="childPerm.selected"
                      :disabled="permission.disabled || childPerm.disabled"
                      @change="handleSubPermissionChange(moduleIndex, permIndex, childIndex)"
                    >
                      <span class="permission-code">{{ childPerm.code }}</span>
                    </el-checkbox>
                    <span class="permission-label">{{ childPerm.label }}</span>
                    <span class="permission-description">{{ childPerm.description }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 角色列表 -->
    <div class="roles-section">
      <el-card shadow="never">
        <template #header>
          <div class="roles-header">
            <span>角色列表</span>
            <el-button size="small" @click="handleCreateRole">
              <el-icon><Plus /></el-icon>
              新建角色
            </el-button>
          </div>
        </template>

        <el-table :data="roles" stripe>
          <el-table-column prop="name" label="角色名称" width="200" />
          <el-table-column prop="code" label="角色代码" width="150" />
          <el-table-column prop="description" label="角色描述" min-width="200" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="权限数量" width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ row.permissions.length }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button
                size="small"
                @click="handleEditRole(row)"
                :disabled="row.code === 'admin'"
              >
                编辑
              </el-button>
              <el-button
                size="small"
                type="danger"
                @click="handleDeleteRole(row)"
                :disabled="row.code === 'admin'"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 创建/编辑角色对话框 -->
    <el-dialog
      v-model="roleDialogVisible"
      :title="isEdit ? '编辑角色' : '创建角色'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色代码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色代码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="角色状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio label="active">启用</el-radio>
            <el-radio label="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRole">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, ArrowDown, ArrowRight } from '@element-plus/icons-vue'

// 响应式数据
const permissionModules = ref([])
const roles = ref([])
const roleDialogVisible = ref(false)
const isEdit = ref(false)
const roleFormRef = ref(null)
const allExpanded = ref(true)

// 表单数据
const roleForm = reactive({
  name: '',
  code: '',
  description: '',
  status: 'active',
  permissions: []
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色代码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_-]*$/, message: '代码格式不正确，应为字母、数字、下划线组成', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ]
}

// 权限统计
const permissionStats = ref([
  { label: '权限模块', value: 0, icon: 'Menu' },
  { label: '总权限数', value: 0, icon: 'Key' },
  { label: '角色数量', value: 0, icon: 'User' },
  { label: '启用角色', value: 0, icon: 'Check' }
])

// 初始化权限模块
const initPermissionModules = () => {
  permissionModules.value = [
    {
      code: 'data-view',
      label: '数据视角',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'data:global-view',
          label: '全局视角',
          description: '可以查看系统中所有数据（所有班级、课程、作业、考试等）',
          selected: false,
          disabled: false,
          level: 'admin'
        },
        {
          code: 'data:personal-view',
          label: '个人视角',
          description: '只能查看被授权的数据（被分配的班级、课程等）',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'dashboard',
      label: '仪表盘',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'dashboard:view',
          label: '访问仪表盘',
          description: '查看统计数据和概览',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'class',
      label: '班级管理',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'class:view',
          label: '查看班级',
          description: '查看班级列表和详情',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'class:create',
          label: '创建班级',
          description: '新建班级',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'class:edit',
          label: '编辑班级',
          description: '修改班级基本信息',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'class:delete',
          label: '删除班级',
          description: '删除班级',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'class:import',
          label: '批量导入',
          description: 'Excel批量导入班级',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'class:manage-resources',
          label: '管理班级资源',
          description: '为班级授权课程、作业、考试',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'class:manage-courses',
              label: '管理课程',
              description: '为班级添加/移除课程',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'class:manage-homeworks',
              label: '管理作业',
              description: '为班级添加/移除作业',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'class:manage-exams',
              label: '管理考试',
              description: '为班级添加/移除考试',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        },
        {
          code: 'class:manage-members',
          label: '管理班级成员',
          description: '管理班级的教师和学生',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'class:manage-teachers',
              label: '管理教师',
              description: '为班级分配/移除教师',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'class:manage-students',
              label: '管理学生',
              description: '为班级添加/移除学生',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        }
      ]
    },
    {
      code: 'course',
      label: '课程管理',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'course:view',
          label: '查看课程',
          description: '查看课程列表和详情',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'course:create',
          label: '创建课程',
          description: '新建课程',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'course:edit',
          label: '编辑课程',
          description: '修改课程基本信息和设置',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'course:delete',
          label: '删除课程',
          description: '删除课程',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'course:manage-chapters',
          label: '管理章节',
          description: '管理课程章节和小节',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'course:chapter:create',
              label: '创建章节',
              description: '新增课程章节',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'course:chapter:edit',
              label: '编辑章节',
              description: '修改章节信息',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'course:chapter:delete',
              label: '删除章节',
              description: '删除课程章节',
              selected: false,
              disabled: false,
              level: 'danger'
            },
            {
              code: 'course:section:create',
              label: '创建小节',
              description: '新增课程小节',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'course:section:edit',
              label: '编辑小节',
              description: '修改小节内容',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'course:section:delete',
              label: '删除小节',
              description: '删除课程小节',
              selected: false,
              disabled: false,
              level: 'danger'
            }
          ]
        },
        {
          code: 'course:manage-resources',
          label: '管理课程资源',
          description: '管理课程的视频、文档等资源',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'course:upload-video',
              label: '上传视频',
              description: '上传小节视频文件',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'course:upload-document',
              label: '上传文档',
              description: '上传PDF、图片等文档',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        }
      ]
    },
    {
      code: 'question',
      label: '题库管理',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'question:view',
          label: '查看题库',
          description: '查看题库题目列表',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:create',
          label: '创建题目',
          description: '新建题目',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:edit',
          label: '编辑题目',
          description: '修改题目内容',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:delete',
          label: '删除题目',
          description: '删除题目',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'question:import',
          label: '导入题目',
          description: 'JSON/Excel批量导入题目',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:export',
          label: '导出题目',
          description: '导出题目数据',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:manage-tags',
          label: '管理标签',
          description: '管理题目标签分类',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'question:subject-access',
          label: '科目访问权限',
          description: '控制教师可访问的科目题库',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'homework',
      label: '作业管理',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'homework:view',
          label: '查看作业',
          description: '查看作业列表',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:create',
          label: '创建作业',
          description: '新建作业',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:edit',
          label: '编辑作业',
          description: '修改作业内容和设置',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:delete',
          label: '删除作业',
          description: '删除作业',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'homework:import',
          label: '批量导入',
          description: '导入作业模板',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:export',
          label: '导出作业',
          description: '导出作业数据',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:manage-questions',
          label: '管理作业题目',
          description: '为作业添加/删除题目',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'homework:add-question',
              label: '添加题目',
              description: '单个添加题目(搜索选择)',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'homework:batch-add',
              label: '批量添加题目',
              description: '通过题目ID批量添加',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        },
        {
          code: 'homework:grade',
          label: '批改作业',
          description: '批改学生作业',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'homework:view-statistics',
          label: '查看统计',
          description: '查看作业统计数据',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'exam',
      label: '考试管理',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'exam:view',
          label: '查看考试',
          description: '查看考试列表',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'exam:create',
          label: '创建考试',
          description: '新建考试',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'exam:edit',
          label: '编辑考试',
          description: '修改考试内容和设置',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'exam:delete',
          label: '删除考试',
          description: '删除考试',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'exam:manage-questions',
          label: '管理考试题目',
          description: '为考试添加/删除题目',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'exam:add-question',
              label: '添加题目',
              description: '单个添加题目(搜索选择)',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'exam:batch-add',
              label: '批量添加题目',
              description: '通过题目ID批量添加',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        },
        {
          code: 'exam:monitor',
          label: '考试监控',
          description: '实时监控考试进行',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'exam:grade',
          label: '批改试卷',
          description: '批改主观题和成绩管理',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'exam:view-statistics',
          label: '查看统计',
          description: '查看考试统计数据',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'teacher',
      label: '教师管理',
      expanded: false,
      status: 'active',
      permissions: [
        {
          code: 'teacher:view',
          label: '查看教师',
          description: '查看教师列表',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'teacher:create',
          label: '创建教师',
          description: '新增教师账号',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'teacher:edit',
          label: '编辑教师',
          description: '修改教师基本信息',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'teacher:delete',
          label: '删除教师',
          description: '删除教师账号',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'teacher:toggle-status',
          label: '启用/禁用',
          description: '切换教师账号状态',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'teacher:authorize',
          label: '授权教师',
          description: '为教师分配班级和资源',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'teacher:authorize-class',
              label: '授权班级',
              description: '为教师分配班级权限',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'teacher:authorize-resource',
              label: '授权资源',
              description: '为教师分配课程、作业、考试权限',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        }
      ]
    },
    {
      code: 'student',
      label: '学生管理',
      expanded: false,
      status: 'active',
      permissions: [
        {
          code: 'student:view',
          label: '查看学生',
          description: '通过班级查看学生信息',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'student:view-detail',
          label: '查看详情',
          description: '查看学生详细信息页面',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'student:view-records',
          label: '查看学习记录',
          description: '查看学生作业、考试、学习记录',
          selected: false,
          disabled: false,
          level: 'module',
          children: [
            {
              code: 'student:view-homework',
              label: '查看作业记录',
              description: '访问学生作业记录页面',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'student:view-exam',
              label: '查看考试记录',
              description: '访问学生考试记录页面',
              selected: false,
              disabled: false,
              level: 'basic'
            },
            {
              code: 'student:view-learning',
              label: '查看学习记录',
              description: '访问学生学习记录页面',
              selected: false,
              disabled: false,
              level: 'basic'
            }
          ]
        }
      ]
    },
    {
      code: 'material',
      label: '素材管理',
      expanded: false,
      status: 'active',
      permissions: [
        {
          code: 'material:view',
          label: '查看素材',
          description: '查看素材列表',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'material:upload',
          label: '上传素材',
          description: '上传新素材文件',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'material:edit',
          label: '编辑素材',
          description: '修改素材信息',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'material:delete',
          label: '删除素材',
          description: '删除素材',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'material:batch-operate',
          label: '批量操作',
          description: '批量上传/删除/移动素材',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'aigc',
      label: 'AIGC作品管理',
      expanded: false,
      status: 'active',
      permissions: [
        {
          code: 'aigc:view',
          label: '查看作品墙',
          description: '查看AIGC作品展示墙',
          selected: false,
          disabled: false,
          level: 'basic'
        },
        {
          code: 'aigc:delete',
          label: '删除作品',
          description: '删除作品',
          selected: false,
          disabled: false,
          level: 'danger'
        },
        {
          code: 'aigc:batch-manage',
          label: '批量管理',
          description: '批量操作作品',
          selected: false,
          disabled: false,
          level: 'basic'
        }
      ]
    },
    {
      code: 'system',
      label: '系统设置',
      expanded: true,
      status: 'active',
      permissions: [
        {
          code: 'system:config',
          label: '系统配置',
          description: '访问系统配置页面',
          selected: false,
          disabled: false,
          level: 'admin'
        },
        {
          code: 'system:manage-users',
          label: '用户管理',
          description: '管理系统用户',
          selected: false,
          disabled: false,
          level: 'admin'
        },
        {
          code: 'system:manage-roles',
          label: '角色权限管理',
          description: '管理角色和权限配置',
          selected: false,
          disabled: false,
          level: 'admin',
          children: [
            {
              code: 'system:create-role',
              label: '创建角色',
              description: '新建角色',
              selected: false,
              disabled: false,
              level: 'admin'
            },
            {
              code: 'system:edit-role',
              label: '编辑角色',
              description: '修改角色权限',
              selected: false,
              disabled: false,
              level: 'admin'
            },
            {
              code: 'system:delete-role',
              label: '删除角色',
              description: '删除角色',
              selected: false,
              disabled: false,
              level: 'admin'
            },
            {
              code: 'system:assign-permissions',
              label: '分配权限',
              description: '为角色分配权限',
              selected: false,
              disabled: false,
              level: 'admin'
            }
          ]
        },
        {
          code: 'system:view-logs',
          label: '查看日志',
          description: '查看系统操作日志',
          selected: false,
          disabled: false,
          level: 'admin'
        }
      ]
    }
  ]

  // 更新统计信息
  updatePermissionStats()
}

// 初始化角色数据
const initRoles = () => {
  roles.value = [
    {
      id: 1,
      name: '系统管理员',
      code: 'admin',
      description: '拥有系统所有权限，负责系统管理和维护',
      status: 'active',
      permissions: [],
      createdAt: '2024-01-01 10:00:00'
    },
    {
      id: 2,
      name: '教师',
      code: 'teacher',
      description: '教师角色，可管理班级、课程、作业、考试等教学资源',
      status: 'active',
      permissions: [],
      createdAt: '2024-01-01 10:00:00'
    },
    {
      id: 3,
      name: '学生',
      code: 'student',
      description: '学生角色，可查看学习资源和提交作业考试',
      status: 'active',
      permissions: [],
      createdAt: 'new Date().toISOString().slice(0, 19)'
    }
  ]
}

// 更新权限统计
const updatePermissionStats = () => {
  let totalPermissions = 0
  let activeModules = 0
  let activeRoles = 0

  permissionModules.value.forEach(module => {
    const countPermissions = (permissions) => {
      let count = permissions.length
      permissions.forEach(perm => {
        if (perm.children) {
          count += perm.children.length
        }
      })
      return count
    }

    totalPermissions += countPermissions(module.permissions)
    activeModules++
  })

  roles.value.forEach(role => {
    if (role.status === 'active') {
      activeRoles++
    }
  })

  permissionStats.value[0].value = activeModules
  permissionStats.value[1].value = totalPermissions
  permissionStats.value[2].value = roles.value.length
  permissionStats.value[3].value = activeRoles
}

// 展开/收起所有模块
const toggleAllModules = () => {
  const expanded = !allExpanded.value
  permissionModules.value.forEach(module => {
    module.expanded = expanded
  })
  allExpanded.value = expanded
}

// 展开/收起单个模块
const toggleModule = (index) => {
  permissionModules.value[index].expanded = !permissionModules.value[index].expanded
}

// 获取模块状态类型
const getModuleStatusType = (status) => {
  return status === 'active' ? 'success' : 'info'
}

// 获取模块状态文本
const getModuleStatusText = (status) => {
  return status === 'active' ? '启用' : '禁用'
}

// 获取权限等级文本
const getLevelText = (level) => {
  const map = {
    basic: '基础',
    module: '模块',
    danger: '危险',
    admin: '管理员'
  }
  return map[level] || '基础'
}

// 权限选择变化处理
const handlePermissionChange = (moduleIndex, permIndex) => {
  const permission = permissionModules.value[moduleIndex].permissions[permIndex]

  if (permission.children && permission.children.length > 0) {
    // 父权限变化时，子权限同步变化
    permission.children.forEach(child => {
      child.selected = permission.selected
    })
  }
}

// 子权限选择变化处理
const handleSubPermissionChange = (moduleIndex, permIndex, childIndex) => {
  const permission = permissionModules.value[moduleIndex].permissions[permIndex]
  const childPermission = permission.children[childIndex]

  // 检查是否所有子权限都被选中
  const allChildrenSelected = permission.children.every(child => child.selected)

  // 同步父权限状态
  permission.selected = allChildrenSelected
}

// 创建角色
const handleCreateRole = () => {
  isEdit.value = false
  Object.assign(roleForm, {
    name: '',
    code: '',
    description: '',
    status: 'active',
    permissions: []
  })
  roleDialogVisible.value = true
}

// 编辑角色
const handleEditRole = (row) => {
  isEdit.value = true
  Object.assign(roleForm, {
    ...row,
    permissions: [...row.permissions]
  })
  roleDialogVisible.value = true
}

// 保存角色
const handleSaveRole = async () => {
  try {
    await roleFormRef.value.validate()

    if (isEdit.value) {
      // 更新角色
      const index = roles.value.findIndex(r => r.id === roleForm.id)
      if (index > -1) {
        roles.value[index] = { ...roleForm }
        ElMessage.success('角色更新成功')
      }
    } else {
      // 创建角色
      const newRole = {
        ...roleForm,
        id: Date.now(),
        createdAt: new Date().toISOString().slice(0, 19)
      }
      roles.value.push(newRole)
      ElMessage.success('角色创建成功')
    }

    roleDialogVisible.value = false
    updatePermissionStats()
  } catch (error) {
    console.error('保存角色失败:', error)
  }
}

// 删除角色
const handleDeleteRole = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色"${row.name}"吗？此操作不可恢复。`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = roles.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      roles.value.splice(index, 1)
      ElMessage.success('角色删除成功')
      updatePermissionStats()
    }
  } catch (error) {
    console.error('删除角色失败:', error)
  }
}

// 刷新
const handleRefresh = () => {
  initPermissionModules()
  initRoles()
  ElMessage.success('权限数据已刷新')
}

onMounted(() => {
  initPermissionModules()
  initRoles()
})
</script>

<style lang="scss" scoped>
.permission-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.page-header {
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 8px 0;
  }

  .page-description {
    color: #606266;
    font-size: 14px;
    margin: 0;
  }
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.permission-overview {
  margin-bottom: 24px;

  .stat-card {
    display: flex;
    align-items: center;
    padding: 20px;
    transition: all 0.3s;
    border-left: 4px solid #409eff;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f9ff;
      border-radius: 50%;
      color: #409eff;
      margin-right: 16px;
      font-size: 20px;
    }

    .stat-content {
      flex: 1;

      .stat-number {
        font-size: 24px;
        font-weight: 600;
        color: #303133;
        line-height: 1.2;
      }

      .stat-label {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.permission-modules {
  .module-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    padding: 16px 0;
    border-bottom: 1px solid #e4e7ed;

    .expand-icon {
      margin-right: 8px;
      transition: transform 0.3s;
    }

    .expand-icon.expanded {
      transform: rotate(90deg);
    }

    .module-name {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .module-count {
      color: #909399;
      font-size: 12px;
      margin-left: 8px;
    }

    .module-actions {
      display: flex;
      gap: 8px;
    }
  }

  .module-item {
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s;

    &.is-system {
      background: #fef0ff;
    }

    &:hover {
      background: #fafafa;
    }

    &.is-system:hover {
      background: #f0f8ff;
    }

    .permission-list {
      padding: 16px;

      .permission-item {
        margin-bottom: 12px;
        padding: 12px;
        border: 1px solid #e4e7ed;
        border-radius: 6px;
        background: white;

        &:last-child {
          margin-bottom: 0;
        }

        .permission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .permission-info {
            display: flex;
            align-items: center;
            gap: 12px;

            .permission-code {
              color: #909399;
              font-size: 12px;
              font-family: 'Courier New', monospace;
            }

            .permission-label {
              color: #303133;
              font-weight: 500;
            }
          }

          .permission-meta {
            display: flex;
            gap: 8px;
          }
        }

        .permission-description {
          color: #606266;
          font-size: 12px;
          margin-left: 28px;
          line-height: 1.4;
        }

        .sub-permissions {
          margin-left: 40px;
          margin-top: 8px;
          border-left: 2px solid #e4e7ed;
          padding-left: 16px;

          .sub-permission-item {
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;

            .permission-code {
              color: #909399;
              font-size: 12px;
              font-family: 'Courier New', monospace;
            }

            .permission-label {
              color: #303133;
              font-weight: 500;
            }

            .permission-description {
              color: #606266;
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}

.roles-section {
  margin-top: 24px;

  .roles-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.no-tags {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}

.no-subject {
  color: #909399;
  font-size: 12px;
  font-style: italic;
}
</style>