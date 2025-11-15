<template>
  <el-header>
    <logo />
    <breadcrumb />
    <user />
  </el-header>
</template>
<script setup>
import { onMounted } from 'vue';
  import Logo from './Logo.vue'
  import Breadcrumb from './Breadcrumb.vue'
  import User from './User.vue'

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> layout/components/Navbar/index.vue`);
  });

</script>

<style lang="scss" scoped>
  .el-header {
    position: fixed;
    padding: 0;
    width: 100%;
    z-index: 99;
    background-color: #fff;
    border-bottom: 1px solid #ebeef5;
  }
</style>
