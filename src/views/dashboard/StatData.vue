<template>
  <el-card class="info" id="data-stats-card">
    <template #header>数据统计</template>
    <el-row id="daily-stats-row">
      <el-col :span="6" id="today-orders-col">
        <router-link to="/common/order">
          <el-statistic title="今天订单数" :value="statData.todayOrder" id="today-orders-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="today-revenue-col">
        <router-link to="/common/order">
          <el-statistic title="今天收入" :precision="2" :value="statData.todayMoney" :prefix="'￥'" id="today-revenue-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="yesterday-orders-col">
        <router-link to="/common/order">
          <el-statistic title="昨天订单数" :value="statData.yesterdayOrder" id="yesterday-orders-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="yesterday-revenue-col">
        <router-link to="/common/order">
          <el-statistic title="昨天收入" :precision="2" :value="statData.yesterdayMoney" :prefix="'￥'" id="yesterday-revenue-stat" />
        </router-link>
      </el-col>
    </el-row>
    <br />
    <el-row id="total-stats-row">
      <el-col :span="6" id="total-users-col">
        <router-link to="/users/list">
          <el-statistic title="总用户数" :value="statData.userSum" id="total-users-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="total-courses-col">
        <router-link to="/course/list">
          <el-statistic title="总课程数" :value="statData.courseSum" id="total-courses-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="total-orders-col">
        <router-link to="/common/order">
          <el-statistic title="总订单数" :value="statData.orderSum" id="total-orders-stat" />
        </router-link>
      </el-col>
      <el-col :span="6" id="total-revenue-col">
        <router-link to="/common/order">
          <el-statistic title="总收入" :precision="2" :value="statData.orderMoney" :prefix="'￥'" id="total-revenue-stat" />
        </router-link>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
  import { onMounted, ref } from 'vue'
  import { statApi } from '@/api/dashboard.js'

  const statData = ref({})
  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/dashboard/StatData.vue`);
    // 移除验证：使用模拟数据
    statData.value = {
      userCount: 1250,
      courseCount: 45,
      orderCount: 320,
      studyCount: 890
    }

    // 原始逻辑（保留以备恢复）
    // statApi.data().then((res) => {
    //   statData.value = res
    // })
  })
</script>
<style lang="scss" scoped>
  .info {
    padding: 15px;
    border-radius: 5px;
    font-size: 16px;
  }
</style>
