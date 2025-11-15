<template>
  <div class="json-tree-node">
    <div
      class="node-content"
      :style="{ paddingLeft: level * 20 + 'px' }"
      @click="toggleExpand"
    >
      <span v-if="hasChildren" class="expand-icon">
        <el-icon v-if="expanded"><ArrowDown /></el-icon>
        <el-icon v-else><ArrowRight /></el-icon>
      </span>
      <span v-else class="expand-placeholder"></span>

      <span v-if="isKey" class="node-key">"{{ nodeKey }}":</span>

      <span v-if="node === null" class="node-value null-value">null</span>
      <span v-else-if="typeof node === 'boolean'" class="node-value boolean-value">
        {{ node }}
      </span>
      <span v-else-if="typeof node === 'number'" class="node-value number-value">
        {{ node }}
      </span>
      <span v-else-if="typeof node === 'string'" class="node-value string-value">
        "{{ node }}"
      </span>
      <span v-else-if="Array.isArray(node)" class="node-value array-value">
        Array [{{ node.length }}]
      </span>
      <span v-else-if="typeof node === 'object'" class="node-value object-value">
        Object {{{ Object.keys(node).length }}}
      </span>
    </div>

    <div v-if="expanded && hasChildren" class="node-children">
      <json-tree-node
        v-for="(child, key) in children"
        :key="key"
        :node="child"
        :node-key="key"
        :level="level + 1"
        @update-node="$emit('update-node', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'

const props = defineProps({
  node: {
    type: [Object, Array, String, Number, Boolean],
    required: true
  },
  nodeKey: {
    type: [String, Number],
    default: ''
  },
  level: {
    type: Number,
    default: 0
  }
})

defineEmits(['update-node'])

const expanded = ref(props.level < 2) // 默认展开前两层

const hasChildren = computed(() => {
  return Array.isArray(props.node) || (typeof props.node === 'object' && props.node !== null)
})

const isKey = computed(() => {
  return props.nodeKey !== ''
})

const children = computed(() => {
  if (Array.isArray(props.node)) {
    return props.node
  } else if (typeof props.node === 'object' && props.node !== null) {
    return props.node
  }
  return {}
})

const toggleExpand = () => {
  if (hasChildren.value) {
    expanded.value = !expanded.value
  }
}

  onMounted(() => {
    console.log(`打开文件: ${location.pathname} -> views/ai/assistant/components/JsonTreeNode.vue`);
  });

</script>

<style scoped>
.json-tree-node {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.node-content {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 2px 0;
  transition: background-color 0.2s;
}

.node-content:hover {
  background-color: #f0f9ff;
}

.expand-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  color: #606266;
}

.expand-placeholder {
  width: 16px;
  margin-right: 4px;
}

.node-key {
  color: #f56c6c;
  margin-right: 8px;
}

.node-value {
  font-weight: 500;
}

.null-value {
  color: #909399;
}

.boolean-value {
  color: #e6a23c;
}

.number-value {
  color: #409eff;
}

.string-value {
  color: #67c23a;
}

.array-value {
  color: #409eff;
  font-weight: normal;
}

.object-value {
  color: #f56c6c;
  font-weight: normal;
}

.node-children {
  border-left: 1px dashed #e4e7ed;
  margin-left: 8px;
}
</style>