<template>
  <el-dialog
    v-model="visible"
    title="晚交扣分设置"
    width="600px"
    @close="handleClose"
  >
    <el-form :model="localConfig" label-width="120px">
      <el-form-item label="启用晚交扣分">
        <el-switch v-model="localConfig.enabled" />
        <div class="form-tip">
          开启后，学生在截止时间后提交将按规则扣分
        </div>
      </el-form-item>

      <template v-if="localConfig.enabled">
        <el-form-item label="扣分方式">
          <el-radio-group v-model="localConfig.deductionType">
            <el-radio label="percentage">按百分比扣分</el-radio>
            <el-radio label="fixed">固定扣分</el-radio>
            <el-radio label="tiered">分段扣分</el-radio>
          </el-radio-group>
        </el-form-item>

        <!-- 按百分比扣分 -->
        <template v-if="localConfig.deductionType === 'percentage'">
          <el-form-item label="扣分比例">
            <el-slider
              v-model="localConfig.deductionRate"
              :min="0"
              :max="100"
              :marks="{ 0: '0%', 25: '25%', 50: '50%', 75: '75%', 100: '100%' }"
              show-stops
            />
            <div class="form-tip">
              每晚交一天扣除总分的 {{ localConfig.deductionRate }}%
            </div>
          </el-form-item>

          <el-form-item label="最大扣分">
            <el-input-number
              v-model="localConfig.maxDeduction"
              :min="0"
              :max="100"
            />
            <span style="margin-left: 8px">%</span>
            <div class="form-tip">
              最多扣除总分的 {{ localConfig.maxDeduction }}%
            </div>
          </el-form-item>
        </template>

        <!-- 固定扣分 -->
        <template v-if="localConfig.deductionType === 'fixed'">
          <el-form-item label="每天扣分">
            <el-input-number
              v-model="localConfig.fixedDeduction"
              :min="0"
              :max="100"
            />
            <span style="margin-left: 8px">分</span>
            <div class="form-tip">
              每晚交一天扣除 {{ localConfig.fixedDeduction }} 分
            </div>
          </el-form-item>

          <el-form-item label="最大扣分">
            <el-input-number
              v-model="localConfig.maxFixedDeduction"
              :min="0"
              :max="100"
            />
            <span style="margin-left: 8px">分</span>
          </el-form-item>
        </template>

        <!-- 分段扣分 -->
        <template v-if="localConfig.deductionType === 'tiered'">
          <el-form-item label="扣分规则">
            <div class="tiered-rules">
              <div
                v-for="(tier, index) in localConfig.tieredRules"
                :key="index"
                class="tier-item"
              >
                <span>晚交</span>
                <el-input-number
                  v-model="tier.days"
                  :min="1"
                  :max="30"
                  size="small"
                  style="width: 80px; margin: 0 8px"
                />
                <span>天内，扣</span>
                <el-input-number
                  v-model="tier.deduction"
                  :min="0"
                  :max="100"
                  size="small"
                  style="width: 80px; margin: 0 8px"
                />
                <span>%</span>
                <el-button
                  v-if="localConfig.tieredRules.length > 1"
                  link
                  type="danger"
                  size="small"
                  @click="removeTier(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="text" @click="addTier">
                <el-icon><Plus /></el-icon>
                添加规则
              </el-button>
            </div>
          </el-form-item>
        </template>

        <el-form-item label="宽限期">
          <el-input-number
            v-model="localConfig.gracePeriod"
            :min="0"
            :max="24"
          />
          <span style="margin-left: 8px">小时</span>
          <div class="form-tip">
            截止时间后的宽限期内提交不扣分
          </div>
        </el-form-item>

        <el-form-item label="最晚提交时间">
          <el-input-number
            v-model="localConfig.maxLateDays"
            :min="1"
            :max="30"
          />
          <span style="margin-left: 8px">天</span>
          <div class="form-tip">
            超过此时间将不再接受提交
          </div>
        </el-form-item>
      </template>

      <!-- 示例说明 -->
      <el-alert
        v-if="localConfig.enabled"
        title="示例"
        type="info"
        :closable="false"
        style="margin-top: 16px"
      >
        <div v-if="localConfig.deductionType === 'percentage'">
          假设作业总分100分，学生晚交2天：<br />
          扣分 = 100 × {{ localConfig.deductionRate }}% × 2 = {{ calculateExample() }}分<br />
          实际得分 = 原得分 - {{ calculateExample() }}分
        </div>
        <div v-else-if="localConfig.deductionType === 'fixed'">
          假设学生晚交2天：<br />
          扣分 = {{ localConfig.fixedDeduction }} × 2 = {{ localConfig.fixedDeduction * 2 }}分<br />
          实际得分 = 原得分 - {{ localConfig.fixedDeduction * 2 }}分
        </div>
        <div v-else>
          根据晚交天数按分段规则扣分
        </div>
      </el-alert>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lateFeeConfig: {
    type: Object,
    default: () => ({
      enabled: false,
      deductionType: 'percentage',
      deductionRate: 10,
      maxDeduction: 50,
      fixedDeduction: 5,
      maxFixedDeduction: 50,
      tieredRules: [
        { days: 1, deduction: 10 },
        { days: 3, deduction: 30 },
        { days: 7, deduction: 50 }
      ],
      gracePeriod: 0,
      maxLateDays: 7
    })
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const localConfig = ref({ ...props.lateFeeConfig })

watch(() => props.lateFeeConfig, (newVal) => {
  localConfig.value = { ...newVal }
}, { deep: true })

const calculateExample = () => {
  return (100 * localConfig.value.deductionRate / 100 * 2).toFixed(1)
}

const addTier = () => {
  localConfig.value.tieredRules.push({ days: 1, deduction: 0 })
}

const removeTier = (index) => {
  localConfig.value.tieredRules.splice(index, 1)
}

const handleSave = () => {
  emit('save', localConfig.value)
  handleClose()
}

const handleClose = () => {
  visible.value = false
}
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.tiered-rules {
  width: 100%;

  .tier-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
  }
}
</style>
