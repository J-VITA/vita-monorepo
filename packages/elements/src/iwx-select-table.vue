<!-- iwx-select-table.vue -->
<script setup lang="ts">
import { ref } from "vue"
import SelectPageTable from "./SelectPageTable"

const iwxSelectTableRef = ref()

defineExpose({
	removeAll: () => iwxSelectTableRef.value?.removeAll(),
	removeItem: (item: Record<string, unknown>) =>
		iwxSelectTableRef.value?.removeItem(item),
})
</script>
<template>
	<SelectPageTable ref="iwxSelectTableRef"></SelectPageTable>
</template>
