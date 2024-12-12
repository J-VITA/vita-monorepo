<!-- <script lang="ts" setup>
import { ref, watch } from 'vue';

import { ElTree } from 'element-plus';
import type Node from 'element-plus/es/components/tree/src/model/node';
import type { DragEvents } from 'element-plus/es/components/tree/src/model/useDragNode';
import type {
  AllowDropType,
  NodeDropType,
} from 'element-plus/es/components/tree/src/tree.type';

interface Tree {
  id: number;
  label: string;
  children?: Tree[];
}

const props = withDefaults(
  defineProps<{
    dataSource: any;
    dragNoneLabel: string;
    icon?: any;
    lazy?: boolean;
    nodeKey?: string;
    itemSize?: number;
    query?: string;
    treeProps: any;
  }>(),
  {
    lazy: false,
  }
);

const emit = defineEmits<{
  (e: 'DragStart', value: any): any;
  (e: 'DragEnter', value: any): any;
  (e: 'DragLeave', value: any): any;
  (e: 'DragOver', value: any): any;
  (e: 'DragEnd', value: any): any;
  (e: 'Drop', value: any): any;
  (e: 'SelectNode', value: any): any;
}>();

const searchQuery = ref('');

const treeRef = ref<InstanceType<typeof ElTree>>();

watch(
  () => props.query,
  (value) => {
    if (value) {
      searchQuery.value = value;
    }
  }
);

/**
 * 조직도 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
  treeRef.value!.filter(query);
};

/**
 * 조직도 트리 필터링 (ElTree)
 * @param query
 * @param node
 */
const filterNodeMethod = (query: string, node: any) => {
  return node.label!.includes(query);
};

/**
 * 조직도 트리 Drag 시작
 * @param node
 * @param ev
 */
const handleDragStart = (node: Node, ev: DragEvents) => {
  emit('DragStart', { node, ev });
};

/**
 * 조직도 트리 Drag Enter
 * @param draggingNode
 * @param dropNode
 * @param ev
 */
const handleDragEnter = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  emit('DragEnter', { draggingNode, dropNode, ev });
};

/**
 * 조직도 트리 Drag 현재 노드 위치에서 벗어남
 * @param draggingNode
 * @param dropNode
 * @param ev
 */
const handleDragLeave = (
  draggingNode: Node,
  dropNode: Node,
  ev: DragEvents
) => {
  emit('DragLeave', { draggingNode, dropNode, ev });
};

/**
 * 조직도 트리 Drag 이동되어진 위치에 덮어쳤음
 * @param draggingNode
 * @param dropNode
 * @param ev
 */
const handleDragOver = (draggingNode: Node, dropNode: Node, ev: DragEvents) => {
  emit('DragOver', { draggingNode, dropNode, ev });
};

/**
 * 조직도 트리 Drag 드래그 위치 이동 되어지는 마무리 시점
 * @param draggingNode
 * @param dropNode
 * @param dropType
 * @param ev
 */
const handleDragEnd = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  emit('DragEnd', { draggingNode, dropNode, dropType, ev });
};

/**
 * 조직도 트리 Drag 드래그 이동 핸들링 끝
 * @param draggingNode
 * @param dropNode
 * @param dropType
 * @param ev
 */
const handleDrop = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  emit('Drop', { draggingNode, dropNode, dropType, ev });
};

/**
 * 조직도 트리 Drop 방지
 * @param draggingNode
 * @param dropNode
 * @param type
 */
const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
  if (dropNode.data.label === props.dragNoneLabel) {
    return type !== 'inner';
  } else {
    return true;
  }
};

/**
 * 조직도 트리 Drag 방지
 * @param draggingNode
 */
const allowDrag = (draggingNode: Node) => {
  return !draggingNode.data.label.includes(props.dragNoneLabel);
};

const selectNode = (data: Tree, node: Node, e: MouseEvent) => {
  if (node.level > 1) {
    emit('SelectNode', { data, node, e });
    // form.companyCode = data.label
  }
  return false;
};
</script>

<template>
  <div id="treeview2" class="treeview2">
    <el-input
      class="form-control-sm"
      v-model="searchQuery"
      placeholder="검색"
      @input="onQueryChanged"
    />
    <el-tree
      ref="treeRef"
      :data="props.dataSource"
      :props="props.treeProps"
      :item-size="props.itemSize"
      :node-key="props.nodeKey"
      draggable
      :default-expand-all="true"
      :filter-node-method="filterNodeMethod"
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      @node-click="selectNode"
      @node-drag-start="handleDragStart"
      @node-drag-enter="handleDragEnter"
      @node-drag-leave="handleDragLeave"
      @node-drag-over="handleDragOver"
      @node-drag-end="handleDragEnd"
      @node-drop="handleDrop"
    >
      <template #default="{ node, data }">
        <slot name="tree-item" :node="node" :item="data"></slot>
      </template>
    </el-tree>
  </div>
</template> -->
