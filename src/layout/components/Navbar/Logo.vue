<template>
  <div class="logo">
    <img src="@/assets/images/logo.png" alt="芝麻编程管理系统" />
  </div>
</template>
<script setup>
import { onMounted } from 'vue';

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> layout/components/Navbar/Logo.vue`);
  });

</script>

<style lang="scss" scoped>
  .logo {
    padding: 5px 10px;
    display: inline-block;
    background-color: var(--color-primary-900);
    width: 80px;
    height: 50px;
    vertical-align: top;
    z-index: 99;
    text-align: center;

    img {
      height: 40px;
      width: auto;
    }
  }
</style>
