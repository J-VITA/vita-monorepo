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
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])

const emit = defineEmits<{
	(e: "addPerdiemTypeClick", value: any): any
	(e: "deletePerdiemType", value: any): any
	(e: "selected-row", value: any): any
	(e: "refresh"): void
}>()

const columns = ref<ColumnsType<PerdiemAllowanceType>>([
	{
		title: "출장급지구분",
		dataIndex: "typeName",
		resizable: true,
		align: "center",
		width: -1,
	},
])

/** 선택행 초기화 */
const initTableSelectData = () => {
	selectedRowKeys.value = []
	selectedRows.value = []
}

/**
 * 출장 급지 목록 행 선택
 */
const onSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
}

const rowClick = (record: PerdiemAllowanceType) => {
	emit("selected-row", record)
}

const clickPerdiemAdd = (record?: PerdiemAllowanceType) => {
	emit(
		"addPerdiemTypeClick",
		Object.assign({
			...record,
			workplaceId: getWorkplaceId.value,
			companyCode: getCompanyCode.value,
			showed: true,
		})
	)
}

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: PerdiemAllowanceType) => {
	if (!record.id) return

	return selectedRowKeys.value.includes(record.id)
		? "active-row cursor-pointer"
		: "cursor-pointer"
}

/**
 * 행 삭제 이벤트
 */
const onDelete = () => {
	if (selectedRowKeys.value.length === 0) return message.error("삭제할 행을 선택해주세요")
	emit("deletePerdiemType", selectedRowKeys.value)
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

onMounted(() => {
	initTableSelectData()
})

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
					<a-button danger :icon="materialIcons('mso', 'delete')" @click="onDelete">
						삭제
					</a-button>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="clickPerdiemAdd()"
					>
						출장 급지 추가
					</a-button>
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
							onClick: (event) => rowClick(record),
						}
					}
				"
				:row-key="(record: any) => record.id"
				:row-selection="{
					selectedRowKeys: selectedRowKeys,
					onChange: onSelection,
				}"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record, value }">
					<template v-if="column.dataIndex === 'typeName'">
						<a-button type="link" @click="clickPerdiemAdd(record)">{{ text }}</a-button>
					</template>
				</template>
			</a-table>
		</a-col>
	</a-row>
</template>
