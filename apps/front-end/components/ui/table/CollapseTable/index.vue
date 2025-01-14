<script lang="ts" setup>
import type { ColumnsType } from "ant-design-vue/lib/table/interface"
interface CollapseTableProps {
	rowData: Array<any>
	columns: ColumnsType<any>
	title?: string
}
const isCollapsed = defineModel<boolean>("value")

const { rowData, title = "목록" } = defineProps<CollapseTableProps>()

defineEmits<{
	(e: "update:value", value: any): any
}>()
</script>
<template>
	<div>
		<a-flex justify="space-between">
			<a-space>
				<a-button
					:icon="
						materialIcons(
							'mso',
							isCollapsed ? 'keyboard_arrow_right' : 'keyboard_arrow_down'
						)
					"
					type="text"
					@click="isCollapsed = !isCollapsed"
				/>
				<a-typography-title :level="5" class="ml-none mb-none">
					{{ title }}({{ rowData.length }}건)
				</a-typography-title>
			</a-space>
		</a-flex>
		<div class="approval-line-wrap" :class="{ hide: isCollapsed }">
			<a-table
				size="small"
				:columns="columns"
				:data-source="rowData"
				:row-key="(record) => record.id"
				:pagination="false"
			>
			</a-table>
		</div>
	</div>
</template>
