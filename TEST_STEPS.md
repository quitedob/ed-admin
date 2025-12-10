# 测试步骤

## 1. 清空旧数据
在浏览器控制台执行：
```javascript
sessionStorage.removeItem('temp_courses')
```

## 2. 创建新课程
1. 访问 `/course/create`
2. 填写必填信息：
   - 课程标题：测试课程
   - 课程描述：这是一个测试课程
   - 选择讲师（点击"选择讲师"按钮）
   - 上传封面图片
   - 选择开始和结束日期
3. 点击"创建课程"

## 3. 查看控制台日志
创建成功后，应该看到：
```
保存课程数据到临时存储:
  课程ID: course_1234567890
  课程名称: 测试课程
  完整数据: {id: "course_xxx", ...}
临时课程列表已更新，总数: 1
最新课程: {id: "course_xxx", ...}
```

**关键检查点：**
- `课程ID` 不能为空
- `课程ID` 应该是 `course_` 开头的字符串

## 4. 查看课程列表
创建成功后会自动跳转到列表页，查看控制台：
```
加载课程列表，临时课程数量: 1
临时课程 1: {id: "course_xxx", courseName: "测试课程", ...}
课程列表加载完成，总数: 4
```

**关键检查点：**
- 临时课程的 `id` 不能为空
- 列表中应该显示新创建的课程

## 5. 点击详情按钮
点击新创建课程的"详情"按钮，查看控制台：
```
=== 跳转到课程详情 ===
row 对象: {id: "course_xxx", ...}
row.id: course_xxx
row.id 类型: string
row.id 长度: 16
row.id 是否为空: false
```

**如果看到：**
```
row.id: 
row.id 长度: 0
row.id 是否为空: true
课程ID为空，无法查看详情
```
说明列表中的课程 ID 是空的，需要检查创建时的数据保存。

## 6. 详情页面
如果跳转成功，详情页应该显示：
```
route.query: {courseId: "course_xxx"}
获取到的courseId: course_xxx 类型: string 长度: 16
临时课程列表: [{id: "course_xxx", ...}]
查找课程ID: course_xxx
从临时存储加载课程: course_xxx {...}
```

## 调试命令

### 查看临时课程
```javascript
JSON.parse(sessionStorage.getItem('temp_courses'))
```

### 检查课程ID
```javascript
const courses = JSON.parse(sessionStorage.getItem('temp_courses'))
courses.forEach((c, i) => {
  console.log(`课程 ${i+1}:`, {
    id: c.id,
    idType: typeof c.id,
    idLength: c.id?.length,
    isEmpty: !c.id || c.id === '',
    courseName: c.courseName
  })
})
```

### 手动修复空ID
如果发现 ID 为空，可以手动修复：
```javascript
const courses = JSON.parse(sessionStorage.getItem('temp_courses'))
courses.forEach(c => {
  if (!c.id || c.id === '') {
    c.id = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
})
sessionStorage.setItem('temp_courses', JSON.stringify(courses))
console.log('已修复课程ID')
```
