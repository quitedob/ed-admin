<template>
  <div class="fill-blank-editor">
    <el-alert
      title="提示"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      在题目描述中使用 _____ 表示填空位置，系统会自动识别填空数量
    </el-alert>

    <div class="blanks-list">
      <div 
        v-for="(blank, index) in localValue.blanks" 
        :key="blank.id" 
        class="blank-section"
      >
        <div class="blank-header">
          <span class="blank-title">
            <el-icon><Edit /></el-icon>
            第{{ index + 1 }}空:
          </span>
          <el-button
            v-if="localValue.blanks.length > 1"
            type="danger"
            text
            size="small"
            @click="removeBlank(index)"
          >
            <el-icon><Delete /></el-icon>
            删除此空
          </el-button>
        </div>

        <div class="answers-list">
          <div 
            v-for="(answer, aIndex) in blank.answers" 
            :key="aIndex" 
            class="answer-row"
          >
            <el-input
              v-model="blank.answers[aIndex]"
              placeholder="输入可接受的答案"
              class="answer-input"
            >
              <template #prepend>
                <span>答案{{ aIndex + 1 }}</span>
              </template>
            </el-input>
            <el-button
              v-if="blank.answers.length > 1"
              type="danger"
              text
              @click="removeAnswer(index, aIndex)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <el-button 
          type="text" 
          @click="addAnswer(index)"
          class="add-answer-btn"
        >
          <el-icon><Plus /></el-icon>
          添加可接受答案
        </el-button>
      </div>
    </div>

    <el-button type="primary" plain @click="addBlank" class="add-btn">
      <el-icon><Plus /></el-icon>
      添加填空
    </el-button>

    <el-divider />

    <el-form label-width="100px">
      <el-form-item label="评分方式">
        <el-radio-group v-model="localValue.scoringMethod">
          <el-radio label="all">
            <span>全对得分</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">
              所有空都正确才得分
            </span>
          </el-radio>
          <el-radio label="partial">
            <span>部分得分</span>
            <span style="color: #909399; font-size: 12px; margin-left: 8px">
              每个空按比例得分
            </span>
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="题目解析">
        <el-input
          v-model="localValue.explanation"
          type="textarea"
          :rows="4"
          placeholder="请输入题目解析（可选）"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Plus, Delete, Edit } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

const localValue = ref({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localValue.value = { ...newVal }
}, { deep: true })

watch(localValue, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

const addBlank = () => {
  const newId = Math.max(...localValue.value.blanks.map(b => b.id), 0) + 1
  localValue.value.blanks.push({ id: newId, answers: [''] })
}

const removeBlank = (index) => {
  localValue.value.blanks.splice(index, 1)
}

const addAnswer = (blankIndex) => {
  localValue.value.blanks[blankIndex].answers.push('')
}

const removeAnswer = (blankIndex, answerIndex) => {
  localValue.value.blanks[blankIndex].answers.splice(answerIndex, 1)
}
</script>

<style lang="scss" scoped>
.fill-blank-editor {
  .blanks-list {
    .blank-section {
      margin-bottom: 24px;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e4e7ed;

      .blank-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;

        .blank-title {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 15px;
          color: #303133;
        }
      }

      .answers-list {
        .answer-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;

          .answer-input {
            flex: 1;
          }
        }
      }

      .add-answer-btn {
        margin-top: 8px;
      }
    }
  }

  .add-btn {
    width: 100%;
    margin-top: 12px;
  }
}
</style>
