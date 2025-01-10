<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { type Response, pageSizeOptions, pagination } from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Rule } from "ant-design-vue/es/form"
import { PerdiemPosition, PerdiemGrade } from "@/types/master/perdiem"

const {
	data,
	params,
	loading = false,
} = defineProps<{
	data: PerdiemPosition[] //Response<Array<PerdiemPosition>>
	params?: PerdiemGrade[]
	loading: boolean
}>()

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)
const deleteModalOpen = ref<boolean>(false)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const perdiemPositionParams = ref<PerdiemPosition>({
	companyCode: getCompanyCode.value,
	positionName: "",
	positionCode: "",
})

const columns = ref<ColumnsType<PerdiemPosition>>([
	{
		title: "직급",
		dataIndex: "positionName",
		resizable: true,
		align: "center",
		sorter: (a: PerdiemPosition, b: PerdiemPosition) =>
			a.positionName!.length - b.positionName!.length,
		width: -1,
	},
	{
		title: "직급코드",
		dataIndex: "positionCode",
		resizable: true,
		sorter: (a: PerdiemPosition, b: PerdiemPosition) =>
			a.positionCode!.length - b.positionCode!.length,
		width: -1,
	},
	{
		title: "최근등록자",
		dataIndex: "updateBy",
		resizable: true,
		sorter: (a: PerdiemPosition, b: PerdiemPosition) =>
			a.updateBy!.length - b.updateBy!.length,
		width: -1,
	},
	{
		title: "최근등록일",
		dataIndex: "updateAt",
		resizable: true,
		sorter: (a: PerdiemPosition, b: PerdiemPosition) =>
			a.updateAt!.length - b.updateAt!.length,
		width: -1,
	},
])

const emit = defineEmits<{
	(e: "addPerdiemPositionClick", value: any): any
	(e: "deletePerdiemInfo", value: any): any
	(e: "selected-row", value: any, idx: any): any
	(e: "refresh"): void
}>()

/** 선택행 초기화 */
const initTableSelectData = () => {
	selectedRowKeys.value = []
	selectedRows.value = []
	initModalData()
}

const initModalData = () => {
	perdiemPositionParams.value = {
		positionName: undefined,
		positionCode: undefined,
		orderSeq: undefined,
	}
}

/**
 * 선택 시 class name 변경(색상)
 */
const setClassName = (record: PerdiemPosition) => {
	if (!record.id) return

	return selectedRowKeys.value.includes(record.id)
		? "active-row cursor-pointer"
		: "cursor-pointer"
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
	emit("selected-row", rows, keys)
}

/**
 * 행 삭제 이벤트
 */
const onDelete = () => {
	emit("deletePerdiemInfo", selectedRowKeys.value)
	deleteModalOpen.value = false
	selectedRowKeys.value = []
}

/**
 * 직급 추가
 */
const clickPerdiemAdd = () => {
	initModalData()
	emit(
		"addPerdiemPositionClick",
		Object.assign({
			...perdiemPositionParams.value,
			showed: true,
		})
	)
}

onMounted(() => {
	initTableSelectData()
})
</script>

<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md">
		<a-typography-title :level="4" class="page-title">
			임직원 등급정보 {{ params?.length === 1 ? "[" + params[0].gradeName + "]" : "" }}
		</a-typography-title>
		<a-space :size="5">
			<a-button
				danger
				:icon="materialIcons('mso', 'delete')"
				:disabled="selectedRowKeys.length == 0"
				@click="onDelete"
			>
				삭제
			</a-button>
			<a-button
				type="primary"
				:icon="materialIcons('mso', 'add_circle')"
				:disabled="params?.length === 0"
				@click="clickPerdiemAdd()"
				>추가</a-button
			>
		</a-space>
	</a-flex>

	<a-table
		:showSorterTooltip="false"
		:data-source="data"
		:columns="columns"
		:loading="loading"
		:pagination="false"
		size="small"
		empty-text="데이터가 없습니다."
		:row-key="(record) => record.id"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: onSelection,
		}"
		:row-class-name="setClassName"
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
</template>
