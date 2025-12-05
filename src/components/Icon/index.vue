<template>
  <svg id="icon-svg" :class="svgClass">
    <use :href="iconName"></use>
  </svg>
</template>

<script setup>
  import { computed, onMounted } from 'vue'

  const props = defineProps({
    name: {
      type: String,
      required: true,
      default: ''
    }
  })

  const svgClass = computed(() => {
    if (props.name) {
      return `svg-icon icon-${props.name}`
    }
    return 'svg-icon'
  })

  const iconName = computed(() => {
    return `#icon-${props.name}`
  })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Icon/index.vue`);
  });

</script>

<style lang="scss" scoped>
  .svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
    cursor: pointer;
  }
</style>
