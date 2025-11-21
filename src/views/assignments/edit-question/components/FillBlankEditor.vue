<template>
  <div id="fill-blank-editor" class="fill-blank-editor">
    <el-alert
      id="fill-blank-alert"
      title="提示"
      type="info"
      :closable="false"
      style="margin-bottom: 20px"
    >
      在题目描述中使用 _____ 表示填空位置，系统会自动识别填空数量
    </el-alert>

    <div id="blanks-list" class="blanks-list">
      <div
        v-for="(blank, index) in localValue.blanks"
        :key="blank.id"
        :id="`blank-section-${index}`"
        class="blank-section"
      >
        <div :id="`blank-header-${index}`" class="blank-header">
          <span :id="`blank-title-${index}`" class="blank-title">
            <el-icon><Edit /></el-icon>
            第{{ index + 1 }}空:
          </span>
          <el-button
            :id="`remove-blank-btn-${index}`"
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

        <div :id="`answers-list-${index}`" class="answers-list">
          <div
            v-for="(answer, aIndex) in blank.answers"
            :key="aIndex"
            :id="`answer-row-${index}-${aIndex}`"
            class="answer-row"
          >
            <el-input
              :id="`answer-input-${index}-${aIndex}`"
              v-model="blank.answers[aIndex]"
              placeholder="输入可接受的答案"
              class="answer-input"
            >
              <template #prepend>
                <span>答案{{ aIndex + 1 }}</span>
              </template>
            </el-input>
            <el-button
              :id="`remove-answer-btn-${index}-${aIndex}`"
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
          :id="`add-answer-btn-${index}`"
          type="text"
          @click="addAnswer(index)"
          class="add-answer-btn"
        >
          <el-icon><Plus /></el-icon>
          添加可接受答案
        </el-button>
      </div>
    </div>

    <el-button id="add-blank-btn" type="primary" plain @click="addBlank" class="add-btn">
      <el-icon><Plus /></el-icon>
      添加填空
    </el-button>

    <el-divider />

    <el-form id="fill-blank-form" label-width="100px">
      <el-form-item id="scoring-method-item" label="评分方式">
        <el-radio-group id="scoring-method-group" v-model="localValue.scoringMethod">
          <el-radio id="scoring-all" label="all">
