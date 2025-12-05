<template>
  <span id="enum-value">{{ enumVal }}</span>
</template>

<script setup>
  import { onMounted, ref, toRefs, watch } from 'vue'
  import { getEnumObj } from '@/utils/base'

  const props = defineProps({
    enumName: { type: String, default: '' },
    enumValue: { type: Number, default: 0 }
  })

  let enumObj = []
  const { enumValue } = toRefs(props)
  const enumVal = ref()
  watch(enumValue, (newValue) => {
    enumVal.value = enumObj[newValue]
  })

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> components/Enum/View/index.vue`);
    getEnumObj(props.enumName).then((res) => {
      enumObj = res
      enumVal.value = enumObj[props.enumValue]
    })
  })
</script>
