<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { PerdiemGrade } from "@/types/master/perdiem"

const { perdiemData, loading = false } = defineProps<{
	perdiemData: PerdiemGrade[]
	loading: boolean
}>()

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)
const perdiemLoading = ref<boolean>(false)
const deleteModalOpen = ref<boolean>(false)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const rowKey = ref<string | number>()

const emit = defineEmits<{
	(e: "addPerdiemGradeClick", value: any): any
	(e: "deletePerdiemGrade", value: any): any
	(e: "selected-row", value: any): any
	(e: "selected-row-keys", value: any): any
	(e: "refresh"): void
}>()

const columns = ref<ColumnsType<PerdiemGrade>>([
	{
		title: "임직원등급",
		dataIndex: "gradeName",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "순번",
		dataIndex: "orderSeq",
		resizable: true,
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
const onSelection = (keys: (string | number)[], rows: PerdiemGrade[]) => {
	if (rowKey.value) rowKey.value = undefined
	selectedRowKeys.value = keys
	selectedRows.value = rows
	emit("selected-row-keys", rows)
}

const rowClick = (record: PerdiemGrade) => {
	if (selectedRowKeys.value.length > 0) return
	rowKey.value = record.id
	emit("selected-row", [record])
}

const clickPerdiemAdd = (record?: PerdiemGrade) => {
	emit(
		"addPerdiemGradeClick",
		Object.assign({
			...record,
			companyCode: getCompanyCode.value,
			showed: true,
		})
	)
}

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: PerdiemGrade) => {
	if (!record.id) return

	if (rowKey.value === record.id) {
		return "active-row cursor-pointer"
	}
	return selectedRowKeys.value.includes(record.id)
		? "active-row cursor-pointer"
		: "cursor-pointer"
}

/**
 * 행 삭제 이벤트
 */
const onDelete = () => {
	emit("deletePerdiemGrade", selectedRowKeys.value)
	deleteModalOpen.value = false
	selectedRowKeys.value = []
	rowKey.value = undefined
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
					<a-button
						danger
						:icon="materialIcons('mso', 'delete')"
						@click="deleteModalOpen = true"
						:disabled="selectedRowKeys.length === 0"
					>
						삭제
					</a-button>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="clickPerdiemAdd()"
					>
						임직원 등급 추가
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
			</a-table>

			<confirm-modal
				:showed="deleteModalOpen"
				class="modal"
				size="small"
				modalTitleText="임직원 등급 삭제"
				title="선택한 임직원 등급을 삭제하시겠습니까?"
				modal-type="삭제"
				type="error"
				btn-cancle-title="취소"
				btn-ok-title="삭제"
				:icon="() => materialIcons('mso', 'cancel')"
				@close="deleteModalOpen = false"
				@submit="onDelete"
			></confirm-modal>
		</a-col>
	</a-row>
</template>
