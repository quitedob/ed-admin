<template>
  <el-card class="title-info">
    <template #header>最近14天人数统计</template>
    <div id="axis" class="axis" />
  </el-card>
</template>

<script setup>
  import * as echarts from 'echarts'
  import { onMounted } from 'vue'
  import { statApi } from '@/api/dashboard'

  let axisRef

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/dashboard/StatLogin.vue`);
    if (!axisRef) {
      axisRef = echarts.init(document.getElementById('axis'))
    }
    init()
  })

  const init = async () => {
    // 移除验证：使用模拟数据
    const data = {
      dateList: ['2025-10-15', '2025-10-16', '2025-10-17', '2025-10-18', '2025-10-19', '2025-10-20', '2025-10-21',
                 '2025-10-22', '2025-10-23', '2025-10-24', '2025-10-25', '2025-10-26', '2025-10-27', '2025-10-28'],
      loginList: [120, 135, 148, 156, 142, 158, 167, 145, 152, 139, 168, 175, 182, 189],
      registerList: [12, 15, 18, 14, 16, 19, 22, 17, 13, 11, 25, 28, 21, 23]
    }

    // 原始逻辑（保留以备恢复）
    // const data = await statApi.login()

    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['活跃人数', '新增人数']
      },
      xAxis: {
        type: 'category',
        data: data.dateList
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '活跃人数',
          type: 'line',
          data: data.loginList
        },
        {
          name: '新增人数',
          type: 'line',
          data: data.registerList
        }
      ]
    }
    axisRef?.setOption(option)
  }
</script>
<style lang="scss" scoped>
  .axis {
    height: 400px;
    margin: 0 auto;
    text-align: center;
  }
  .title-info {
    margin-top: 20px;
  }
</style>
