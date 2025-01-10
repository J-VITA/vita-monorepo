<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { PerdiemAllowanceType } from "@/types/master/perdiem"

const { perdiemData, loading = false } = defineProps<{
	perdiemData: PerdiemAllowanceType[]
	loading: boolean
}>()

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)
const perdiemLoading = ref(false)
const selectedRowKeys = ref<string | number>()

const emit = defineEmits<{
	(e: "selected-row", value: any): any
}>()

const columns = ref<ColumnsType<PerdiemAllowanceType>>([
	{
		title: "출장급지구분",
		dataIndex: "locationName",
		resizable: true,
		align: "center",
		width: -1,
	},
])

const rowClick = (record: PerdiemAllowanceType, idx: number | undefined) => {
	if (idx === undefined) return
	selectedRowKeys.value = idx
	emit("selected-row", record)
}

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: PerdiemAllowanceType, index: number) => {
	return index === selectedRowKeys.value ? "active-row cursor-pointer" : "cursor-pointer"
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

watchEffect(() => {
	perdiemLoading.value = loading
})
</script>

<template>
	<a-row :gutter="30">
		<a-col flex="2">
			<a-flex gap="small" justify="space-between" align="center" class="mb-md">
				<a-typography-title :level="4" class="page-title"></a-typography-title>
				<a-space :size="5">
					<a-button :style="{ opacity: '0', cursor: 'default' }" />
				</a-space>
			</a-flex>
			<a-table
				:data-source="perdiemData"
				:columns="columns"
				:loading="perdiemLoading"
				size="small"
				empty-text="데이터가 없습니다."
				:pagination="false"
				:row-class-name="setClassName"
				:custom-row="
					(record, idx) => {
						return {
							onClick: (event) => rowClick(record, idx),
						}
					}
				"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record, value }">
					<template v-if="column.dataIndex === 'locationName'">
						{{ text }}
					</template>
				</template>
			</a-table>
		</a-col>
	</a-row>
</template>
