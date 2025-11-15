<template>
  <div class="course-update-container">
    <!-- 左侧导航栏 - 240px宽度 -->
    <aside class="sidebar">
      <div class="nav-header">
        <h3>课程编辑</h3>
        <el-button type="text" @click="handlePreview">
          <el-icon><View /></el-icon>
          预览
        </el-button>
      </div>

      <nav class="nav-menu">
        <div
          v-for="section in navigationSections"
          :key="section.id"
          class="nav-item"
          :class="{ active: currentSection === section.id }"
          @click="currentSection = section.id"
        >
          <el-icon><component :is="section.icon" /></el-icon>
          <span>{{ section.title }}</span>
          <el-tag v-if="section.error" type="danger" size="small">!</el-tag>
        </div>
      </nav>
    </aside>

    <!-- 右侧详情区 -->
    <main class="main-content">
      <!-- 基础信息（包含时间安排） -->
      <section v-if="currentSection === 'basic'" class="edit-section">
        <el-card>
          <template #header>
            <div class="section-header">
              <h3>基础信息</h3>
              <el-switch
                v-model="courseData.basicInfo.schedule.publishStatus"
                active-value="published"
                inactive-value="draft"
                active-text="已发布"
                inactive-text="草稿"
              />
            </div>
          </template>

          <el-form :model="courseData.basicInfo" label-width="120px">
            <el-form-item label="课程标题" required>
              <el-input
                v-model="courseData.basicInfo.title"
                maxlength="100"
                show-word-limit
                placeholder="请输入课程标题"
              />
            </el-form-item>

            <el-form-item label="课程描述" required>
              <el-input
                v-model="courseData.basicInfo.description"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="请输入课程描述"
              />
            </el-form-item>

            <el-form-item label="课程封面">
              <selector-image
                v-model="courseData.basicInfo.cover"
                :width="'400px'"
                :height="'225px'"
              />
            </el-form-item>

            <el-form-item label="课时">
              <el-input-number
                v-model="courseData.basicInfo.duration"
                :min="1"
                :max="999"
              />
              <span class="form-tip">学时</span>
            </el-form-item>

            <el-form-item label="难度等级">
              <el-select v-model="courseData.basicInfo.level" placeholder="选择难度">
                <el-option label="初级" value="beginner" />
                <el-option label="中级" value="intermediate" />
                <el-option label="高级" value="advanced" />
              </el-select>
            </el-form-item>

            <el-form-item label="授课教师">
              <div class="lecturer-select">
                <el-input
                  v-model="courseData.basicInfo.teacher.name"
                  placeholder="选择教师"
                  readonly
                  style="flex: 1"
                />
                <el-button type="primary" @click="showLecturerSelector = true">
                  选择教师
                </el-button>
              </div>
            </el-form-item>

            <el-form-item label="课程标签">
              <el-tag
                v-for="tag in courseData.basicInfo.tags"
                :key="tag"
                closable
                @close="removeTag(tag)"
                class="tag-item"
              >
                {{ tag }}
              </el-tag>
              <el-input
                v-if="inputVisible"
                ref="inputRef"
                v-model="inputValue"
                class="tag-input"
                size="small"
                @keyup.enter="handleInputConfirm"
                @blur="handleInputConfirm"
              />
              <el-button v-else class="button-new-tag" size="small" @click="showInput">
                + 新标签
              </el-button>
            </el-form-item>

            <!-- 时间安排（合并在基础信息中） -->
            <el-divider content-position="left">
              <span class="divider-title">时间安排</span>
            </el-divider>

            <el-form-item label="开始日期">
              <el-date-picker
                v-model="courseData.basicInfo.schedule.startDate"
                type="date"
                placeholder="选择开始日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="结束日期">
              <el-date-picker
                v-model="courseData.basicInfo.schedule.endDate"
                type="date"
                placeholder="选择结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <el-form-item label="发布状态">
              <el-radio-group v-model="courseData.basicInfo.schedule.publishStatus">
                <el-radio label="published">已发布</el-radio>
                <el-radio label="draft">草稿</el-radio>
                <el-radio label="unpublished">已下架</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-card>
      </section>

      <!-- 章节内容编辑 -->
      <section v-if="currentSection === 'chapters'" class="edit-section">
        <el-card>
          <template #header>
            <div class="section-header">
              <h3>章节内容</h3>
              <el-button type="primary" @click="addChapter">
                <el-icon><Plus /></el-icon>
                添加章节
              </el-button>
            </div>
          </template>

          <div class="chapters-container">
            <div
              v-for="(chapter, chapterIndex) in courseData.chapters"
              :key="chapter.id"
              class="chapter-item"
            >
              <div class="chapter-header">
                <div class="chapter-info">
                  <span class="chapter-number">第{{ chapter.number }}章</span>
                  <el-input
                    v-model="chapter.title"
                    placeholder="章节标题"
                    class="chapter-title-input"
                  />
                </div>
                <div class="chapter-actions">
                  <el-button size="small" @click="addSection(chapterIndex)">
                    <el-icon><Plus /></el-icon>
                    添加小节
                  </el-button>
                  <el-button size="small" type="danger" @click="removeChapter(chapterIndex)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <div class="sections-list">
                <div
                  v-for="(section, sectionIndex) in chapter.sections"
                  :key="section.id"
                  :data-section-id="section.id"
                  class="section-item"
                >
                  <div class="section-header">
                    <span class="section-number">{{ section.number }}</span>
                    <el-input
                      v-model="section.title"
                      placeholder="小节标题"
                      class="section-title-input"
                    />
                    <el-button
                      size="small"
                      type="danger"
                      @click="removeSection(chapterIndex, sectionIndex)"
                    >
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>

                  <div class="section-content">
                    <el-input
                      v-model="section.description"
                      type="textarea"
                      :rows="2"
                      placeholder="小节描述"
                    />

                    <!-- 小节类型选择 -->
                    <el-divider content-position="left">
                      <span class="divider-title">小节类型</span>
                    </el-divider>

                    <el-form-item label="小节类型">
                      <el-radio-group v-model="section.contentType" @change="handleSectionTypeChange(chapterIndex, sectionIndex)">
                        <el-radio label="normal">普通课程</el-radio>
                        <el-radio label="programming">编程</el-radio>
                        <el-radio label="homework">章节作业</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <!-- 普通课程内容类型 -->
                    <template v-if="section.contentType === 'normal'">
                      <el-divider content-position="left">
                        <span class="divider-title">课程内容设置</span>
                      </el-divider>

                      <!-- 内容类型开关 -->
                      <div class="content-toggles">
                        <el-form-item label="视频学习">
                          <el-switch
                            v-model="section.contentConfig.video.enabled"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>
                        <el-form-item label="图片内容">
                          <el-switch
                            v-model="section.contentConfig.image.enabled"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>
                        <el-form-item label="PDF文档">
                          <el-switch
                            v-model="section.contentConfig.pdf.enabled"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>
                        <el-form-item label="文本内容">
                          <el-switch
                            v-model="section.contentConfig.text.enabled"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>
                      </div>

                      <el-divider content-position="left">
                        <span class="divider-title">学习内容</span>
                      </el-divider>

                      <div class="content-resources">
                        <!-- 视频内容 -->
                        <div v-if="section.contentConfig.video.enabled" class="resource-item">
                          <div class="resource-header">
                            <el-icon class="resource-icon"><VideoPlay /></el-icon>
                            <span class="resource-title">视频上传</span>
                          </div>
                          <div class="resource-content">
                            <el-form-item label="视频文件">
                              <el-upload
                                class="video-uploader"
                                :action="uploadUrl"
                                :headers="uploadHeaders"
                                :on-success="(response, file) => handleVideoUpload(response, file, chapterIndex, sectionIndex)"
                                :before-upload="beforeVideoUpload"
                                :show-file-list="false"
                                accept="video/*"
                              >
                                <div v-if="section.contentUrl" class="video-preview">
                                  <video :src="section.contentUrl" controls style="width: 200px; height: 150px;"></video>
                                  <div class="video-info">
                                    <p>{{ section.videoFileName || '已上传视频' }}</p>
                                    <el-button type="danger" size="small" @click.stop="removeVideo(chapterIndex, sectionIndex)">删除</el-button>
                                  </div>
                                </div>
                                <div v-else class="video-upload-placeholder">
                                  <el-icon class="video-upload-icon"><Plus /></el-icon>
                                  <div>点击上传视频</div>
                                </div>
                              </el-upload>
                            </el-form-item>
                            <el-form-item label="视频时长">
                              <el-input-number
                                v-model="section.duration"
                                :min="0"
                                placeholder="秒"
                              />
                              <span class="form-tip">秒</span>
                            </el-form-item>
                          </div>
                        </div>

                        <!-- 图片内容 -->
                        <div v-if="section.contentConfig.image.enabled" class="resource-item">
                          <div class="resource-header">
                            <el-icon class="resource-icon"><Picture /></el-icon>
                            <span class="resource-title">图片上传</span>
                          </div>
                          <div class="resource-content">
                            <el-form-item label="图片文件">
                              <div class="image-gallery">
                                <div
                                  v-for="(image, imgIndex) in section.images"
                                  :key="imgIndex"
                                  class="image-item"
                                >
                                  <div class="image-preview">
                                    <img :src="image.url" alt="图片预览" style="width: 100px; height: 80px; object-fit: cover;" />
                                    <div class="image-info">
                                      <el-input
                                        v-model="image.title"
                                        placeholder="图片标题"
                                        size="small"
                                      />
                                      <el-button
                                        size="small"
                                        type="danger"
                                        @click="removeImage(chapterIndex, sectionIndex, imgIndex)"
                                      >
                                        删除
                                      </el-button>
                                    </div>
                                  </div>
                                </div>
                                <el-upload
                                  class="image-uploader"
                                  :action="uploadUrl"
                                  :headers="uploadHeaders"
                                  :on-success="(response, file) => handleImageUpload(response, file, chapterIndex, sectionIndex)"
                                  :before-upload="beforeImageUpload"
                                  :show-file-list="false"
                                  accept="image/*"
                                >
                                  <div class="image-upload-placeholder">
                                    <el-icon class="image-upload-icon"><Plus /></el-icon>
                                    <div>添加图片</div>
                                  </div>
                                </el-upload>
                              </div>
                            </el-form-item>
                          </div>
                        </div>

                        <!-- PDF内容 -->
                        <div v-if="section.contentConfig.pdf.enabled" class="resource-item">
                          <div class="resource-header">
                            <el-icon class="resource-icon"><Document /></el-icon>
                            <span class="resource-title">PDF文档上传</span>
                          </div>
                          <div class="resource-content">
                            <el-form-item label="PDF文件">
                              <el-upload
                                class="pdf-uploader"
                                :action="uploadUrl"
                                :headers="uploadHeaders"
                                :on-success="(response, file) => handlePdfUpload(response, file, chapterIndex, sectionIndex)"
                                :before-upload="beforePdfUpload"
                                :show-file-list="false"
                                accept=".pdf"
                              >
                                <div v-if="section.pdfUrl" class="pdf-preview">
                                  <el-icon class="pdf-icon"><Document /></el-icon>
                                  <div class="pdf-info">
                                    <p>{{ section.pdfFileName || '已上传PDF' }}</p>
                                    <el-button type="danger" size="small" @click.stop="removePdf(chapterIndex, sectionIndex)">删除</el-button>
                                  </div>
                                </div>
                                <div v-else class="pdf-upload-placeholder">
                                  <el-icon class="pdf-upload-icon"><Plus /></el-icon>
                                  <div>点击上传PDF</div>
                                </div>
                              </el-upload>
                            </el-form-item>
                          </div>
                        </div>

                        <!-- 文本内容 -->
                        <div v-if="section.contentConfig.text.enabled" class="resource-item">
                          <div class="resource-header">
                            <el-icon class="resource-icon"><Document /></el-icon>
                            <span class="resource-title">文本内容</span>
                          </div>
                          <div class="resource-content">
                            <el-form-item label="文本内容">
                              <el-input
                                v-model="section.textContent"
                                type="textarea"
                                :rows="8"
                                placeholder="请输入文本学习内容"
                              />
                            </el-form-item>
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 编程内容类型 -->
                    <template v-if="section.contentType === 'programming'">
                      <el-divider content-position="left">
                        <span class="divider-title">编程内容设置</span>
                      </el-divider>

                      <div class="programming-section">
                        <el-form-item label="编程语言">
                          <el-select v-model="section.programming.language" placeholder="选择编程语言">
                            <el-option label="JavaScript" value="javascript" />
                            <el-option label="Python" value="python" />
                            <el-option label="Java" value="java" />
                            <el-option label="C++" value="cpp" />
                            <el-option label="HTML/CSS" value="html" />
                          </el-select>
                        </el-form-item>

                        <el-form-item label="代码示例">
                          <el-input
                            v-model="section.programming.codeExample"
                            type="textarea"
                            :rows="12"
                            placeholder="请输入代码示例"
                          />
                        </el-form-item>

                        <el-form-item label="代码说明">
                          <el-input
                            v-model="section.programming.description"
                            type="textarea"
                            :rows="4"
                            placeholder="请输入代码说明和学习要点"
                          />
                        </el-form-item>

                        <el-form-item label="在线编辑器">
                          <el-switch
                            v-model="section.programming.enableEditor"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>

                        <el-form-item label="代码执行">
                          <el-switch
                            v-model="section.programming.enableExecution"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>

                        <el-form-item label="HOJ 编程题">
                          <el-switch
                            v-model="section.programming.enableHOJ"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>

                        <!-- HOJ 题目管理 -->
                        <template v-if="section.programming.enableHOJ">
                          <el-divider content-position="left">
                            <span class="divider-title">HOJ 编程题管理</span>
                          </el-divider>

                          <div class="hoj-problems-section">
                            <div class="hoj-problems-header">
                              <span class="section-title">关联的 HOJ 题目</span>
                              <el-button type="primary" size="small" @click="addHOJProblem(chapterIndex, sectionIndex)">
                                <el-icon><Plus /></el-icon>
                                添加题目
                              </el-button>
                              <el-button type="success" size="small" @click="importHOJProblems(chapterIndex, sectionIndex)">
                                <el-icon><FolderOpened /></el-icon>
                                从题库导入
                              </el-button>
                            </div>

                            <div class="hoj-problems-list">
                              <div
                                v-for="(problem, problemIndex) in section.programming.hojProblems"
                                :key="problem.problemId"
                                class="hoj-problem-item"
                              >
                                <div class="problem-header">
                                  <span class="problem-id">{{ problem.problemId }}</span>
                                  <span class="problem-title">{{ problem.title }}</span>
                                  <el-tag :type="problem.difficulty === 1 ? 'success' : problem.difficulty === 2 ? 'warning' : 'danger'" size="small">
                                    {{ problem.difficulty === 1 ? '简单' : problem.difficulty === 2 ? '中等' : '困难' }}
                                  </el-tag>
                                  <el-button size="small" type="danger" @click="removeHOJProblem(chapterIndex, sectionIndex, problemIndex)">
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </div>
                                <div class="problem-details">
                                  <el-form-item label="题目描述">
                                    <el-input
                                      v-model="problem.description"
                                      type="textarea"
                                      :rows="3"
                                      placeholder="请输入题目描述"
                                    />
                                  </el-form-item>
                                  <el-form-item label="输入格式">
                                    <el-input
                                      v-model="problem.input"
                                      type="textarea"
                                      :rows="2"
                                      placeholder="请输入输入格式说明"
                                    />
                                  </el-form-item>
                                  <el-form-item label="输出格式">
                                    <el-input
                                      v-model="problem.output"
                                      type="textarea"
                                      :rows="2"
                                      placeholder="请输入输出格式说明"
                                    />
                                  </el-form-item>
                                  <el-form-item label="时间限制(ms)">
                                    <el-input-number
                                      v-model="problem.timeLimit"
                                      :min="100"
                                      :max="5000"
                                      :step="100"
                                    />
                                  </el-form-item>
                                  <el-form-item label="内存限制(MB)">
                                    <el-input-number
                                      v-model="problem.memoryLimit"
                                      :min="64"
                                      :max="1024"
                                      :step="64"
                                    />
                                  </el-form-item>
                                </div>
                              </div>
                            </div>
                          </div>
                        </template>

                        <el-form-item label="练习题">
                          <el-switch
                            v-model="section.programming.enableExercises"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </el-form-item>
                      </div>
                    </template>

                    <!-- 章节作业类型 -->
                    <template v-if="section.contentType === 'homework'">
                      <el-divider content-position="left">
                        <span class="divider-title">章节作业设置</span>
                      </el-divider>

                      <div class="homework-section-config">
                        <el-form-item label="作业标题">
                          <el-input
                            v-model="section.homeworkTitle"
                            placeholder="请输入章节作业标题"
                          />
                        </el-form-item>

                        <el-form-item label="作业描述">
                          <el-input
                            v-model="section.description"
                            type="textarea"
                            :rows="3"
                            placeholder="请输入章节作业描述"
                          />
                        </el-form-item>

                        <el-form-item label="关联现有作业">
                          <el-select v-model="section.homeworkId" placeholder="选择要关联的作业" clearable>
                            <el-option
                              v-for="homework in courseData.homeworks"
                              :key="homework.id"
                              :label="homework.basicInfo.title"
                              :value="homework.id"
                            />
                          </el-select>
                          <el-button type="primary" size="small" @click="createNewHomeworkForSection(chapterIndex, sectionIndex)" style="margin-left: 10px;">
                            创建新作业
                          </el-button>
                        </el-form-item>

                        <!-- 作业进度显示（模拟数据） -->
                        <div v-if="section.homeworkId" class="homework-progress">
                          <h4>作业进度</h4>
                          <div class="progress-info">
                            <el-tag :type="section.homeworkProgress?.submitted ? 'success' : 'info'">
                              {{ section.homeworkProgress?.submitted ? '已提交' : '未提交' }}
                            </el-tag>
                            <span class="score-info">
                              得分：{{ section.homeworkProgress?.score || 0 }} / {{ section.homeworkProgress?.maxScore || 0 }}
                            </span>
                            <el-progress
                              :percentage="section.homeworkProgress?.percentage || 0"
                              :color="section.homeworkProgress?.percentage === 100 ? '#67C23A' : '#409EFF'"
                            />
                          </div>
                        </div>
                      </div>
                    </template>

                    <!-- 练习题内容（适用于普通课程和编程类型的小节） -->
                    <template v-if="section.contentType === 'normal' || section.contentType === 'programming'">
                      <div class="resource-item">
                        <div class="resource-header">
                          <el-icon class="resource-icon"><EditPen /></el-icon>
                          <span class="resource-title">练习题</span>
                          <el-switch
                            v-model="section.hasPractice"
                            active-text="启用"
                            inactive-text="禁用"
                          />
                        </div>
                        <div v-if="section.hasPractice" class="resource-content">
                          <el-form-item label="是否必做">
                            <el-radio-group v-model="section.practice.optional">
                              <el-radio :label="false">必做</el-radio>
                              <el-radio :label="true">选做</el-radio>
                            </el-radio-group>
                          </el-form-item>

                          <el-divider content-position="left">
                            <span class="divider-title">题目管理</span>
                          </el-divider>

                          <div class="questions-list">
                            <div
                              v-for="(question, qIndex) in section.practice.questionList"
                              :key="question.id"
                              class="question-item"
                            >
                              <div class="question-header">
                                <span class="question-number">题目 {{ qIndex + 1 }}</span>
                                <div class="question-actions">
                                  <el-button size="small" @click="moveQuestionUp(chapterIndex, sectionIndex, qIndex)" :disabled="qIndex === 0">
                                    <el-icon><ArrowUp /></el-icon>
                                  </el-button>
                                  <el-button size="small" @click="moveQuestionDown(chapterIndex, sectionIndex, qIndex)" :disabled="qIndex === section.practice.questionList.length - 1">
                                    <el-icon><ArrowDown /></el-icon>
                                  </el-button>
                                  <el-button size="small" type="danger" @click="removeQuestion(chapterIndex, sectionIndex, qIndex)">
                                    <el-icon><Delete /></el-icon>
                                  </el-button>
                                </div>
                              </div>

  
                              <el-form-item label="题目类型">
                                <el-select v-model="question.type" placeholder="选择题型">
                                  <el-option label="单选题" value="single" />
                                  <el-option label="多选题" value="multiple" />
                                  <el-option label="填空题" value="fill" />
                                  <el-option label="问答题" value="essay" />
                                  <el-option v-if="courseData.chapters[chapterIndex].sections[sectionIndex].contentType === 'programming'" label="HOJ编程题" value="hoj" />
                                </el-select>
                              </el-form-item>

                              <el-form-item label="题目内容">
                                <el-input
                                  v-model="question.questionText"
                                  type="textarea"
                                  :rows="3"
                                  placeholder="请输入题目内容"
                                />
                              </el-form-item>

                              <el-form-item label="分值">
                                <el-input-number
                                  v-model="question.score"
                                  :min="1"
                                  :max="100"
                                />
                              </el-form-item>

                              <el-form-item label="难度">
                                <el-select v-model="question.difficulty" placeholder="选择难度">
                                  <el-option label="简单" value="easy" />
                                  <el-option label="中等" value="medium" />
                                  <el-option label="困难" value="hard" />
                                </el-select>
                              </el-form-item>

                              <el-form-item label="知识点">
                                <el-tag
                                  v-for="(kp, kpIndex) in question.knowledgePoints"
                                  :key="kpIndex"
                                  closable
                                  @close="removeKnowledgePoint(chapterIndex, sectionIndex, qIndex, kpIndex)"
                                  class="tag-item"
                                >
                                  {{ kp }}
                                </el-tag>
                                <el-input
                                  v-if="question.kpInputVisible"
                                  v-model="question.kpInputValue"
                                  class="tag-input"
                                  size="small"
                                  @keyup.enter="addKnowledgePoint(chapterIndex, sectionIndex, qIndex)"
                                  @blur="addKnowledgePoint(chapterIndex, sectionIndex, qIndex)"
                                />
                                <el-button v-else class="button-new-tag" size="small" @click="showKnowledgePointInput(chapterIndex, sectionIndex, qIndex)">
                                  + 知识点
                                </el-button>
                              </el-form-item>

                              <!-- HOJ 编程题特殊设置 -->
                              <template v-if="question.type === 'hoj'">
                                <el-divider content-position="left">
                                  <span class="divider-title">HOJ 编程题设置</span>
                                </el-divider>

                                <div class="hoj-question-settings">
                                  <el-form-item label="题目编号">
                                    <el-input
                                      v-model="question.problemId"
                                      placeholder="请输入题目编号（如：CF-1001）"
                                    />
                                  </el-form-item>

                                  <el-form-item label="输入格式">
                                    <el-input
                                      v-model="question.input"
                                      type="textarea"
                                      :rows="2"
                                      placeholder="请输入输入格式说明"
                                    />
                                  </el-form-item>

                                  <el-form-item label="输出格式">
                                    <el-input
                                      v-model="question.output"
                                      type="textarea"
                                      :rows="2"
                                      placeholder="请输入输出格式说明"
                                    />
                                  </el-form-item>

                                  <el-form-item label="时间限制(ms)">
                                    <el-input-number
                                      v-model="question.timeLimit"
                                      :min="100"
                                      :max="5000"
                                      :step="100"
                                    />
                                  </el-form-item>

                                  <el-form-item label="内存限制(MB)">
                                    <el-input-number
                                      v-model="question.memoryLimit"
                                      :min="64"
                                      :max="1024"
                                      :step="64"
                                    />
                                  </el-form-item>
                                </div>
                              </template>

                              <!-- 选择题选项 -->
                              <template v-if="question.type === 'single' || question.type === 'multiple'">
                                <el-divider content-position="left">
                                  <span class="divider-title">选项设置</span>
                                </el-divider>
                                <div class="options-list">
                                  <div
                                    v-for="(option, oIndex) in question.options"
                                    :key="option.id"
                                    class="option-item"
                                  >
                                    <el-input
                                      v-model="option.value"
                                      placeholder="选项标识 (如: A)"
                                      class="option-value"
                                      size="small"
                                    />
                                    <el-input
                                      v-model="option.text"
                                      placeholder="选项内容"
                                      class="option-text"
                                    />
                                    <el-button
                                      size="small"
                                      type="danger"
                                      @click="removeOption(chapterIndex, sectionIndex, qIndex, oIndex)"
                                    >
                                      <el-icon><Delete /></el-icon>
                                    </el-button>
                                  </div>
                                  <el-button size="small" @click="addOption(chapterIndex, sectionIndex, qIndex)">
                                    <el-icon><Plus /></el-icon>
                                    添加选项
                                  </el-button>
                                </div>

                                <el-form-item v-if="question.type === 'single'" label="正确答案">
                                  <el-select v-model="question.correctAnswer" placeholder="选择正确答案">
                                    <el-option
                                      v-for="option in question.options"
                                      :key="option.value"
                                      :label="`${option.value}. ${option.text}`"
                                      :value="option.value"
                                    />
                                  </el-select>
                                </el-form-item>

                                <el-form-item v-if="question.type === 'multiple'" label="正确答案">
                                  <el-checkbox-group v-model="question.correctAnswers">
                                    <el-checkbox
                                      v-for="option in question.options"
                                      :key="option.value"
                                      :label="option.value"
                                    >
                                      {{ option.value }}. {{ option.text }}
                                    </el-checkbox>
                                  </el-checkbox-group>
                                </el-form-item>
                              </template>

                              <!-- 填空题答案 -->
                              <template v-if="question.type === 'fill'">
                                <el-form-item label="正确答案">
                                  <div class="fill-answers">
                                    <div
                                      v-for="(answer, aIndex) in question.correctAnswers"
                                      :key="aIndex"
                                      class="answer-item"
                                    >
                                      <el-input
                                        v-model="question.correctAnswers[aIndex]"
                                        placeholder="请输入答案"
                                        class="answer-input"
                                      />
                                      <el-button
                                        size="small"
                                        type="danger"
                                        @click="removeFillAnswer(chapterIndex, sectionIndex, qIndex, aIndex)"
                                      >
                                        <el-icon><Delete /></el-icon>
                                      </el-button>
                                    </div>
                                    <el-button size="small" @click="addFillAnswer(chapterIndex, sectionIndex, qIndex)">
                                      <el-icon><Plus /></el-icon>
                                      添加答案
                                    </el-button>
                                  </div>
                                </el-form-item>
                              </template>

                              <!-- 问答题参考答案 -->
                              <template v-if="question.type === 'essay'">
                                <el-form-item label="参考答案">
                                  <el-input
                                    v-model="question.referenceAnswer"
                                    type="textarea"
                                    :rows="4"
                                    placeholder="请输入参考答案"
                                  />
                                </el-form-item>
                              </template>

                              <!-- 题目解析 -->
                              <el-form-item label="题目解析">
                                <el-input
                                  v-model="question.explanation"
                                  type="textarea"
                                  :rows="3"
                                  placeholder="请输入题目解析"
                                />
                              </el-form-item>
                            </div>

                            <el-button type="primary" @click="addQuestion(chapterIndex, sectionIndex)">
                              <el-icon><Plus /></el-icon>
                              添加题目
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </section>

  
  
  <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button size="large" @click="handleCancel">取消</el-button>
        <el-button type="primary" size="large" @click="handleSave" :loading="saving">
          保存课程
        </el-button>
      </div>
    </main>

    <!-- 教师选择器 -->
    <select-lecturer
      v-if="showLecturerSelector"
      @close="handleLecturerSelect"
    />

    <!-- 题库管理器 -->
    <QuestionBankManager
      v-if="showQuestionBankManager"
      v-model="showQuestionBankManager"
      :exam-banks="getCurrentQuestionBanks()"
      @confirm="handleQuestionBankConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Delete,
  View,
  Document,
  VideoPlay,
  Picture,
  EditPen,
  FolderOpened,
  ArrowUp,
  ArrowDown,
  Setting
} from '@element-plus/icons-vue'
import SelectorImage from '@/components/Selector/Image/index.vue'
import SelectLecturer from '@/components/Selector/Lecturer/index.vue'
import QuestionBankManager from '@/components/QuestionBankManager/index.vue'

const router = useRouter()
const route = useRoute()

// 当前编辑的section
const currentSection = ref('basic')

// 导航sections
const navigationSections = ref([
  { id: 'basic', title: '基础信息', icon: Document },
  { id: 'chapters', title: '章节内容', icon: FolderOpened }
])

// 课程数据 - 符合 rule.txt JSON 格式，时间安排合并在基础信息中
const courseData = reactive({
  id: route.query.courseId || '',
  type: 'course',
  metadata: {
    version: '1.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'current_user'
  },
  basicInfo: {
    title: '',
    description: '',
    cover: '',
    duration: 48,
    level: 'intermediate',
    teacher: {
      id: '',
      name: '',
      avatar: ''
    },
    tags: [],
    schedule: {
      startDate: '',
      endDate: '',
      publishStatus: 'draft'
    }
  },
  chapters: [],
  // 章节作业数据
  homeworks: []
})

// 状态管理
const saving = ref(false)
const showLecturerSelector = ref(false)
const showQuestionBankManager = ref(false)
const currentHomeworkIndex = ref(-1)
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref()

// 文件上传相关配置
const uploadUrl = ref('/api/upload')
const uploadHeaders = ref({
  Authorization: 'Bearer your_token_here'
})

// 处理小节类型切换
const handleSectionTypeChange = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]

  // 清空之前的内容
  section.contentUrl = ''
  section.textContent = ''
  section.images = []
  section.pdfUrl = ''
  section.hasPractice = false
  section.homeworkId = ''
  section.homeworkTitle = ''
  section.duration = 0
  section.videoFileName = ''
  section.pdfFileName = ''

  // 初始化新的内容类型配置
  if (section.contentType === 'normal') {
    section.contentConfig = {
      video: { enabled: true },
      image: { enabled: true },
      pdf: { enabled: true },
      text: { enabled: true }
    }
  } else if (section.contentType === 'programming') {
    section.programming = {
      language: 'javascript',
      codeExample: '',
      description: '',
      enableEditor: true,
      enableExecution: true,
      enableHOJ: false,
      enableExercises: false,
      hojProblems: []
    }
  }
}

// 文件上传处理函数
const beforeVideoUpload = (file) => {
  const isVideo = file.type.startsWith('video/')
  const isLt100M = file.size / 1024 / 1024 < 100

  if (!isVideo) {
    ElMessage.error('只能上传视频文件!')
    return false
  }
  if (!isLt100M) {
    ElMessage.error('上传视频大小不能超过 100MB!')
    return false
  }
  return true
}

const handleVideoUpload = (response, file, chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  if (response.code === 200) {
    section.contentUrl = response.data.url
    section.videoFileName = file.name
    ElMessage.success('视频上传成功')
  } else {
    ElMessage.error('视频上传失败')
  }
}

const removeVideo = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  section.contentUrl = ''
  section.videoFileName = ''
}

const beforePdfUpload = (file) => {
  const isPdf = file.type === 'application/pdf'
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isPdf) {
    ElMessage.error('只能上传PDF文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('上传PDF大小不能超过 50MB!')
    return false
  }
  return true
}

const handlePdfUpload = (response, file, chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  if (response.code === 200) {
    section.pdfUrl = response.data.url
    section.pdfFileName = file.name
    ElMessage.success('PDF上传成功')
  } else {
    ElMessage.error('PDF上传失败')
  }
}

const removePdf = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  section.pdfUrl = ''
  section.pdfFileName = ''
}

const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传图片大小不能超过 10MB!')
    return false
  }
  return true
}

const handleImageUpload = (response, file, chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  if (response.code === 200) {
    section.images.push({
      id: `img_${Date.now()}`,
      url: response.data.url,
      title: file.name,
      description: '',
      alt: file.name
    })
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error('图片上传失败')
  }
}

// 章节作业相关函数
const createNewHomeworkForSection = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]

  // 创建新的作业
  const newHomework = {
    id: `homework_${Date.now()}`,
    type: 'homework',
    chapterId: courseData.chapters[chapterIndex].id,
    sectionId: section.id,
    title: section.homeworkTitle || `第${courseData.chapters[chapterIndex].number}章作业`,
    description: section.description,
    basicInfo: {
      title: section.homeworkTitle || `第${courseData.chapters[chapterIndex].number}章作业`,
      description: section.description,
      type: 'chapter_homework',
      difficulty: 'medium'
    },
    schedule: {
      releaseDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 默认一周后截止
      remindDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString() // 提前一天提醒
    },
    questions: [],
    settings: {
      allowLateSubmission: true,
      immediateGrading: true,
      showCorrectAnswers: true
    }
  }

  courseData.homeworks.push(newHomework)
  section.homeworkId = newHomework.id

  ElMessage.success('作业创建成功，可以在作业管理中编辑题目')
}

// 初始化默认章节
const initDefaultChapter = () => {
  if (courseData.chapters.length === 0) {
    courseData.chapters.push({
      id: `chapter_${Date.now()}`,
      number: 1,
      title: '',
      description: '',
      order: 1,
      sections: []
    })
  }
}

// 添加章节
const addChapter = () => {
  const newChapter = {
    id: `chapter_${Date.now()}`,
    number: courseData.chapters.length + 1,
    title: '',
    description: '',
    order: courseData.chapters.length + 1,
    sections: []
  }
  courseData.chapters.push(newChapter)
}

// 删除章节
const removeChapter = async (index) => {
  try {
    await ElMessageBox.confirm('确定要删除这个章节吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    courseData.chapters.splice(index, 1)
    // 重新编号
    courseData.chapters.forEach((chapter, idx) => {
      chapter.number = idx + 1
      chapter.order = idx + 1
    })
  } catch {
    // 用户取消
  }
}

// 添加小节
const addSection = (chapterIndex) => {
  const chapter = courseData.chapters[chapterIndex]
  const newSection = {
    id: `section_${Date.now()}`,
    number: `${chapter.number}.${chapter.sections.length + 1}`,
    title: '',
    description: '',
    order: chapter.sections.length + 1,
    // 小节类型 - 默认为普通课程
    contentType: 'normal',
    textContent: '',
    // 通用内容URL
    contentUrl: '',
    pdfUrl: '',
    duration: 0,
    // 文件名称存储
    videoFileName: '',
    pdfFileName: '',
    // 图片内容
    images: [],
    // 内容配置（用于普通课程）
    contentConfig: {
      video: { enabled: true },
      image: { enabled: true },
      pdf: { enabled: true },
      text: { enabled: true }
    },
    // 编程内容配置
    programming: {
      language: 'javascript',
      codeExample: '',
      description: '',
      enableEditor: true,
      enableExecution: true,
      enableHOJ: false,
      enableExercises: false,
      hojProblems: []
    },
    // 章节作业相关
    homeworkTitle: '',
    homeworkId: '',
    homeworkProgress: {
      submitted: false,
      score: 0,
      maxScore: 30,
      percentage: 0
    },
    // 练习题内容（非作业小节）
    hasPractice: false,
    practice: {
      practiceId: '',
      questions: 0,
      optional: false,
      questionList: []
    },
    resources: {
      materials: [],
      attachments: []
    }
  }
  chapter.sections.push(newSection)
}

// 删除小节
const removeSection = (chapterIndex, sectionIndex) => {
  const chapter = courseData.chapters[chapterIndex]
  chapter.sections.splice(sectionIndex, 1)
  // 重新编号
  chapter.sections.forEach((section, idx) => {
    section.number = `${chapter.number}.${idx + 1}`
    section.order = idx + 1
  })
}

// 添加图片
const addImage = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  section.images.push({
    id: `img_${Date.now()}`,
    url: '',
    title: '',
    description: '',
    alt: ''
  })
}

// 删除图片
const removeImage = (chapterIndex, sectionIndex, imageIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  section.images.splice(imageIndex, 1)
}

// 标签管理
const removeTag = (tag) => {
  const index = courseData.basicInfo.tags.indexOf(tag)
  if (index > -1) {
    courseData.basicInfo.tags.splice(index, 1)
  }
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    inputRef.value.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value && courseData.basicInfo.tags.indexOf(inputValue.value) === -1) {
    courseData.basicInfo.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

// 教师选择
const handleLecturerSelect = (lecturer) => {
  showLecturerSelector.value = false
  if (lecturer) {
    courseData.basicInfo.teacher = {
      id: lecturer.lecturerId,
      name: lecturer.lecturerName,
      avatar: lecturer.avatar || ''
    }
  }
}

// 构建符合rule.txt格式的JSON数据
const buildCourseJSON = () => {
  // 转换章节数据格式，严格遵循 rule.txt 格式
  const chapters = courseData.chapters.map(chapter => ({
    id: chapter.id,
    number: chapter.number,
    title: chapter.title,
    description: chapter.description,
    order: chapter.order,
    sections: chapter.sections.map(section => {
      const sectionData = {
        id: section.id,
        number: section.number,
        title: section.title,
        description: section.description,
        order: section.order,
        contentType: section.contentType,
        duration: section.duration || 0,
        resources: {
          materials: [],
          attachments: []
        }
      }

      // 根据内容类型设置相应字段
      switch (section.contentType) {
        case 'normal':
          // 普通课程类型 - 支持多种内容类型
          sectionData.contentConfig = section.contentConfig || {
            video: { enabled: true },
            image: { enabled: true },
            pdf: { enabled: true },
            text: { enabled: true }
          }

          // 视频内容
          if (section.contentConfig.video.enabled && section.contentUrl) {
            sectionData.contentUrl = section.contentUrl
            sectionData.duration = section.duration || 0
          }

          // PDF内容
          if (section.contentConfig.pdf.enabled && section.pdfUrl) {
            sectionData.pdfUrl = section.pdfUrl
          }

          // 文本内容
          if (section.contentConfig.text.enabled && section.textContent) {
            sectionData.textContent = section.textContent
          }

          // 图片内容
          if (section.contentConfig.image.enabled && section.images.length > 0) {
            sectionData.resources.materials.push({
              id: `material_${Date.now()}`,
              type: 'image',
              title: '课程相关图片',
              images: section.images.map(img => ({
                id: img.id,
                url: img.url,
                title: img.title,
                description: img.description,
                alt: img.alt
              }))
            })
          }
          break

        case 'programming':
          // 编程内容类型
          sectionData.programming = section.programming || {
            language: 'javascript',
            codeExample: '',
            description: '',
            enableEditor: true,
            enableExecution: true,
            enableExercises: false
          }
          break

        case 'homework':
          // 章节作业类型，按照rule.txt格式
          sectionData.homeworkId = section.homeworkId
          sectionData.homeworkProgress = section.homeworkProgress || {
            submitted: false,
            score: 0,
            maxScore: 30,
            percentage: 0
          }

          // 查找关联的作业数据
          const linkedHomework = courseData.homeworks.find(h => h.id === section.homeworkId)
          if (linkedHomework) {
            sectionData.homeworkData = {
              id: linkedHomework.id,
              type: 'chapter_homework',
              title: linkedHomework.basicInfo?.title || section.homeworkTitle,
              description: linkedHomework.basicInfo?.description || section.description,
              questions: linkedHomework.questions || []
            }
          }

          // 作业特殊字段
          sectionData.hasHomework = true
          sectionData.homeworkCompleted = section.homeworkProgress?.submitted || false
          sectionData.homeworkScore = section.homeworkProgress?.score || 0
          sectionData.homeworkMaxScore = section.homeworkProgress?.maxScore || 30
          break
      }

      // 练习题字段（适用于普通课程和编程类型的小节）
      if ((section.contentType === 'normal' || section.contentType === 'programming') && section.hasPractice) {
        sectionData.practice = {
          practiceId: section.practice.practiceId || `practice_${Date.now()}`,
          questions: section.practice.questions || 0,
          optional: section.practice.optional
        }
      }

      return sectionData
    })
  }))

  // 转换作业数据格式，严格遵循 rule.txt 格式
  const homeworks = courseData.homeworks.map(homework => {
    const homeworkData = {
      id: homework.id,
      type: 'homework',
      basicInfo: {
        title: homework.basicInfo?.title || homework.title,
        description: homework.basicInfo?.description || homework.description,
        type: homework.basicInfo?.type || 'exercise',
        difficulty: homework.basicInfo?.difficulty || 'medium'
      },
      schedule: homework.schedule || {
        releaseDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        remindDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      questions: homework.questions || [],
      settings: homework.settings || {
        allowLateSubmission: true,
        immediateGrading: true,
        showCorrectAnswers: true
      }
    }

    // 章节作业特殊字段
    if (homework.chapterId && homework.sectionId) {
      homeworkData.chapterId = homework.chapterId
      homeworkData.sectionId = homework.sectionId
    }

    return homeworkData
  })

  
  return {
    id: courseData.id || `course_${Date.now()}`,
    type: 'course',
    metadata: {
      version: '1.0',
      createdAt: courseData.metadata?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: courseData.metadata?.createdBy || 'current_user'
    },
    basicInfo: {
      title: courseData.basicInfo.title,
      description: courseData.basicInfo.description,
      cover: courseData.basicInfo.cover,
      duration: courseData.basicInfo.duration,
      level: courseData.basicInfo.level,
      teacher: courseData.basicInfo.teacher,
      tags: courseData.basicInfo.tags
    },
    schedule: courseData.basicInfo.schedule,
    chapters,
    homeworks
  }
}

// 保存课程
const handleSave = async () => {
  // 验证
  if (!courseData.basicInfo.title) {
    ElMessage.error('请输入课程标题')
    currentSection.value = 'basic'
    return
  }

  if (!courseData.basicInfo.description) {
    ElMessage.error('请输入课程描述')
    currentSection.value = 'basic'
    return
  }

  if (!courseData.basicInfo.teacher.id) {
    ElMessage.error('请选择授课教师')
    currentSection.value = 'basic'
    return
  }

  saving.value = true
  try {
    // 更新元数据
    courseData.metadata.updatedAt = new Date().toISOString()

    // 构建符合规范的JSON数据
    const courseJSON = buildCourseJSON()

    console.log('保存课程数据:', JSON.stringify(courseJSON, null, 2))

    // 这里调用API保存数据
    await new Promise(resolve => setTimeout(resolve, 1000))

    ElMessage.success('课程保存成功！')

    // 如果是新建课程，跳转到详情页
    if (!route.query.courseId) {
      router.push(`/course/detail/modern?courseId=${courseData.id}`)
    }
  } catch (error) {
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}

// 预览
const handlePreview = () => {
  const courseJSON = buildCourseJSON()
  console.log('预览课程数据:', courseJSON)
  ElMessage.info('预览功能开发中...')
}

// 取消
const handleCancel = () => {
  router.back()
}

// 题目管理函数
const addQuestion = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  const newQuestion = {
    id: `question_${Date.now()}`,
    type: 'single',
    questionText: '',
    score: 5,
    difficulty: 'easy',
    order: section.practice.questionList.length + 1,
    options: [],
    correctAnswer: '',
    correctAnswers: [],
    explanation: '',
    knowledgePoints: [],
    kpInputVisible: false,
    kpInputValue: '',
    referenceAnswer: '',
    // HOJ 编程题特殊字段
    problemId: '',
    input: '',
    output: '',
    timeLimit: 1000,
    memoryLimit: 128
  }
  section.practice.questionList.push(newQuestion)
  section.practice.questions = section.practice.questionList.length
}

const removeQuestion = (chapterIndex, sectionIndex, questionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  section.practice.questionList.splice(questionIndex, 1)
  // 重新编号
  section.practice.questionList.forEach((question, idx) => {
    question.order = idx + 1
  })
  section.practice.questions = section.practice.questionList.length
}

const moveQuestionUp = (chapterIndex, sectionIndex, questionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  if (questionIndex > 0) {
    const temp = section.practice.questionList[questionIndex]
    section.practice.questionList[questionIndex] = section.practice.questionList[questionIndex - 1]
    section.practice.questionList[questionIndex - 1] = temp

    // 更新排序
    section.practice.questionList.forEach((question, idx) => {
      question.order = idx + 1
    })
  }
}

const moveQuestionDown = (chapterIndex, sectionIndex, questionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  if (questionIndex < section.practice.questionList.length - 1) {
    const temp = section.practice.questionList[questionIndex]
    section.practice.questionList[questionIndex] = section.practice.questionList[questionIndex + 1]
    section.practice.questionList[questionIndex + 1] = temp

    // 更新排序
    section.practice.questionList.forEach((question, idx) => {
      question.order = idx + 1
    })
  }
}

// 选项管理
const addOption = (chapterIndex, sectionIndex, questionIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  const optionValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const nextValue = optionValues[question.options.length] || String.fromCharCode(65 + question.options.length)

  question.options.push({
    id: `opt_${nextValue.toLowerCase()}`,
    value: nextValue,
    text: ''
  })
}

const removeOption = (chapterIndex, sectionIndex, questionIndex, optionIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  question.options.splice(optionIndex, 1)

  // 重新生成选项标识
  const optionValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  question.options.forEach((option, idx) => {
    option.value = optionValues[idx] || String.fromCharCode(65 + idx)
    option.id = `opt_${option.value.toLowerCase()}`
  })

  // 清除已删除的答案
  if (question.type === 'single' && !question.options.find(opt => opt.value === question.correctAnswer)) {
    question.correctAnswer = ''
  } else if (question.type === 'multiple') {
    question.correctAnswers = question.correctAnswers.filter(answer =>
      question.options.find(opt => opt.value === answer)
    )
  }
}

// 知识点管理
const showKnowledgePointInput = (chapterIndex, sectionIndex, questionIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  question.kpInputVisible = true
  nextTick(() => {
    // Focus input if needed
  })
}

const addKnowledgePoint = (chapterIndex, sectionIndex, questionIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  if (question.kpInputValue && question.knowledgePoints.indexOf(question.kpInputValue) === -1) {
    question.knowledgePoints.push(question.kpInputValue)
  }
  question.kpInputVisible = false
  question.kpInputValue = ''
}

const removeKnowledgePoint = (chapterIndex, sectionIndex, questionIndex, kpIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  question.knowledgePoints.splice(kpIndex, 1)
}

// 填空题答案管理
const addFillAnswer = (chapterIndex, sectionIndex, questionIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  question.correctAnswers.push('')
}

const removeFillAnswer = (chapterIndex, sectionIndex, questionIndex, answerIndex) => {
  const question = courseData.chapters[chapterIndex].sections[sectionIndex].practice.questionList[questionIndex]
  if (question.correctAnswers.length > 1) {
    question.correctAnswers.splice(answerIndex, 1)
  }
}



// HOJ 编程题管理函数
const addHOJProblem = (chapterIndex, sectionIndex) => {
  const section = courseData.chapters[chapterIndex].sections[sectionIndex]
  const newProblem = {
    problemId: `HOJ-${Date.now()}`,
    title: '',
    description: '',
    input: '',
    output: '',
    examples: '',
    hint: '',
    timeLimit: 1000,
    memoryLimit: 128,
    difficulty: 1,
    tags: [],
    testCases: [
      {
        id: `case_${Date.now()}`,
        input: '',
        output: '',
        sample: true,
        order: 1
      }
    ]
  }
  section.programming.hojProblems.push(newProblem)
}

const removeHOJProblem = async (chapterIndex, sectionIndex, problemIndex) => {
  try {
    await ElMessageBox.confirm('确定要删除这道 HOJ 题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const section = courseData.chapters[chapterIndex].sections[sectionIndex]
    section.programming.hojProblems.splice(problemIndex, 1)
  } catch {
    // 用户取消
  }
}

const importHOJProblems = (chapterIndex, sectionIndex) => {
  // 这里应该打开 HOJ 题库选择器
  ElMessage.info('HOJ 题库导入功能开发中...')
  console.log('导入 HOJ 题目到章节:', chapterIndex, sectionIndex)
}

const showHomeworkQuestions = (homeworkIndex) => {
  currentHomeworkIndex.value = homeworkIndex
  showQuestionBankManager.value = true
}


// 题库管理相关函数（仅支持章节内作业）
const getCurrentQuestionBanks = () => {
  if (currentHomeworkIndex.value >= 0) {
    // 为作业创建题库结构
    const homework = courseData.homeworks[currentHomeworkIndex.value]
    if (!homework) return []

    // 如果作业还没有题库，创建一个混合题库
    if (!homework.questionBanks) {
      homework.questionBanks = [
        {
          id: `homework_bank_${homework.id}_mixed`,
          name: '作业题库',
          type: 'mixed',
          questionCount: homework.questions.length,
          scorePerQuestion: 5,
          totalQuestionsNeeded: homework.questions.length,
          questions: homework.questions
        }
      ]
    }
    return homework.questionBanks
  }
  return []
}

const handleQuestionBankConfirm = (data) => {
  if (currentHomeworkIndex.value >= 0) {
    // 更新作业的题目
    const homework = courseData.homeworks[currentHomeworkIndex.value]
    const allQuestions = []

    // 收集所有题库中的题目
    data.banks.forEach(bank => {
      allQuestions.push(...bank.questions)
    })

    homework.questions = allQuestions
    homework.statistics.totalQuestions = allQuestions.length
    homework.statistics.totalScore = allQuestions.reduce((sum, q) => sum + (q.score || 0), 0)

    ElMessage.success('作业题目更新成功')
  }

  // 重置状态
  currentHomeworkIndex.value = -1
}

// 初始化
initDefaultChapter()

// 如果有课程ID，加载课程数据
if (route.query.courseId) {
  // 这里应该调用API加载课程数据
  console.log('加载课程数据:', route.query.courseId)

  // 检查是否需要切换到章节内容页面
  if (route.query.tab === 'chapters' || route.query.chapterId || route.query.sectionId) {
    // 延迟执行，确保数据已加载
    setTimeout(() => {
      currentSection.value = 'chapters'

      // 如果有小节ID，滚动到对应的小节
      if (route.query.sectionId) {
        setTimeout(() => {
          const sectionElement = document.querySelector(`[data-section-id="${route.query.sectionId}"]`)
          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // 高亮显示
            sectionElement.classList.add('highlight-section')
          }
        }, 500)
      }
    }, 1000)
  }
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/course/update/ModernCourseUpdate.vue`);
  });

</script>

<style scoped>
.course-update-container {
  display: flex;
  height: 100vh;
  background-color: var(--color-bg-secondary);
}

/* 左侧导航 - 240px宽度 */
.sidebar {
  width: 240px;
  background-color: var(--color-bg-primary);
  border-right: 1px solid var(--color-border-base);
  display: flex;
  flex-direction: column;
}

.nav-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

.nav-menu {
  flex: 1;
  padding: var(--spacing-md) 0;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  transition: var(--transition);
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.nav-item:hover {
  background-color: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.nav-item.active {
  background-color: var(--color-primary-50);
  color: var(--color-primary-500);
  border-left: 3px solid var(--color-primary-500);
}

/* 右侧详情区 */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
}

.edit-section {
  margin-bottom: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: 18px;
  font-weight: 600;
}

/* 章节编辑 */
.chapters-container {
  max-height: 600px;
  overflow-y: auto;
}

.chapter-item {
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-lg);
  background-color: var(--color-bg-primary);
}

.chapter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.chapter-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.chapter-number {
  color: var(--color-primary-500);
  font-weight: 600;
  min-width: 80px;
}

.chapter-title-input {
  flex: 1;
}

.chapter-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.sections-list {
  padding: var(--spacing-md);
}

.section-item {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  transition: all 0.3s ease;
}

.section-item.highlight-section {
  border-color: var(--color-primary-500);
  background-color: var(--color-primary-50);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.section-number {
  color: var(--color-text-tertiary);
  min-width: 60px;
  font-size: 12px;
}

.section-title-input {
  flex: 1;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 内容资源样式 */
.content-resources {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.resource-item {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
}

.resource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.resource-icon {
  color: var(--color-primary-500);
  margin-right: var(--spacing-sm);
  font-size: 16px;
}

.resource-title {
  font-weight: 500;
  color: var(--color-text-primary);
}

.resource-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* 图片画廊 */
.image-gallery {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.image-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
}

.image-url {
  flex: 2;
}

.image-title {
  flex: 1;
}

/* 题目管理样式 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.question-item {
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-medium);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.question-number {
  font-weight: 600;
  color: var(--color-primary-500);
  font-size: 16px;
}

.question-actions {
  display: flex;
  gap: var(--spacing-xs);
}

/* 选项管理样式 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.option-value {
  width: 60px;
}

.option-text {
  flex: 1;
}

/* 填空题答案样式 */
.fill-answers {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.answer-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.answer-input {
  flex: 1;
}

/* 分割线样式 */
.divider-title {
  color: var(--color-text-primary);
  font-weight: 500;
}

/* 标签编辑 */
.tag-item {
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.tag-input {
  width: 90px;
  margin-right: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.button-new-tag {
  margin-bottom: var(--spacing-sm);
}

/* 表单 */
.lecturer-select {
  display: flex;
  gap: var(--spacing-sm);
  width: 100%;
}

.form-tip {
  margin-left: var(--spacing-sm);
  color: var(--color-text-tertiary);
  font-size: 12px;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-xl) 0;
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-medium);
  box-shadow: var(--shadow-base);
  margin-top: var(--spacing-lg);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-update-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-border-base);
  }

  .nav-menu {
    display: flex;
    padding: 0;
  }

  .nav-item {
    flex: 1;
    justify-content: center;
    padding: var(--spacing-sm);
  }

  .chapter-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: flex-start;
  }

  .section-header {
    flex-wrap: wrap;
  }

  .resource-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);
  }
}

/* 作业管理样式 */
.homeworks-container {
  max-height: 600px;
  overflow-y: auto;
}

.homework-item {
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-base);
  margin-bottom: var(--spacing-lg);
  background-color: var(--color-bg-primary);
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-border-light);
  background-color: var(--color-bg-secondary);
}

.homework-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.homework-title-input {
  flex: 2;
  min-width: 200px;
}

.homework-type-select,
.homework-difficulty-select {
  width: 120px;
}

.homework-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.homework-content {
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.schedule-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  align-items: start;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  align-items: start;
}

.homework-stats {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
  margin-top: var(--spacing-md);
}

.question-banks-overview {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.bank-overview-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
}

.bank-info {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 文件上传样式 */
.video-uploader,
.pdf-uploader,
.image-uploader {
  border: 2px dashed var(--color-border-base);
  border-radius: var(--radius-base);
  padding: var(--spacing-lg);
  text-align: center;
  background-color: var(--color-bg-secondary);
  transition: var(--transition);
  cursor: pointer;
}

.video-uploader:hover,
.pdf-uploader:hover,
.image-uploader:hover {
  border-color: var(--color-primary-300);
  background-color: var(--color-primary-50);
}

.video-upload-placeholder,
.pdf-upload-placeholder,
.image-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
}

.video-upload-icon,
.pdf-upload-icon,
.image-upload-icon {
  font-size: 24px;
  color: var(--color-primary-500);
}

.video-preview,
.pdf-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.video-info,
.pdf-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.pdf-icon {
  font-size: 32px;
  color: var(--color-danger-500);
}

.image-preview {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
}

.image-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  flex: 1;
}

/* 章节作业配置样式 */
.homework-section-config {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.homework-progress {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
}

.homework-progress h4 {
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text-primary);
  font-size: 16px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.score-info {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 作业题目管理样式 */
.homework-questions {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

/* 作业题目按钮组样式 */
.homework-question-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border-light);
}

.homework-questions .questions-list {
  margin-top: var(--spacing-md);
}

.homework-questions .question-item {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-medium);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

/* 内容类型开关样式 */
.content-toggles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
  margin-bottom: var(--spacing-md);
}

/* 编程内容样式 */
.programming-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
}

/* 内容资源调整顺序 */
.content-resources {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.content-resources .resource-item {
  order: 1;
}

/* 确保内容按指定顺序显示 */
.content-resources .resource-item:has(.resource-icon .video-play) {
  order: 1;
}

.content-resources .resource-item:has(.resource-icon .picture) {
  order: 2;
}

.content-resources .resource-item:has(.resource-icon .document) {
  order: 3;
}

.content-resources .resource-item:last-of-type:not(.resource-item:has(.resource-icon .edit-pen)) {
  order: 4;
}

/* HOJ 编程题样式 */
.hoj-problems-section {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
}

.hoj-problems-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.hoj-problems-header .section-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 16px;
}

.hoj-problems-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.hoj-problem-item {
  border: 1px solid var(--color-border-base);
  border-radius: var(--radius-medium);
  padding: var(--spacing-lg);
  background-color: var(--color-bg-primary);
  box-shadow: var(--shadow-sm);
}

.problem-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border-light);
}

.problem-id {
  color: var(--color-primary-500);
  font-weight: 600;
  min-width: 100px;
  font-family: monospace;
}

.problem-title {
  flex: 1;
  font-weight: 500;
  color: var(--color-text-primary);
}

.problem-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

/* HOJ 题目设置样式 */
.hoj-question-settings {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
}

/* 测试用例样式 */
.test-cases-section {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
  padding: var(--spacing-md);
  background-color: var(--color-bg-primary);
}

.test-cases-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-weight: 500;
  color: var(--color-text-primary);
}

.test-cases-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.test-case-item {
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-small);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
}

/* 编程作业设置样式 */
.programming-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-small);
  border: 1px solid var(--color-border-light);
}
</style>