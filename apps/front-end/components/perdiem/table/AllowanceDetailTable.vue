<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { type Response, pageSizeOptions, pagination } from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Rule } from "ant-design-vue/es/form"
import { PerdiemAllowanceInfo, PerdiemAllowanceType } from "@/types/master/perdiem"

const {
	data,
	params,
	loading = false,
} = defineProps<{
	data: PerdiemAllowanceInfo[] //Response<Array<PerdiemAllowanceInfo>>
	params?: PerdiemAllowanceType
	loading: boolean
}>()

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const perdiemInfoParams = ref<PerdiemAllowanceInfo>({
	companyCode: getCompanyCode.value,
	workplaceId: getWorkplaceId.value,
	infoName: "",
	infoCode: "",
})

const columns = ref<ColumnsType<PerdiemAllowanceInfo>>([
	{
		title: "국가/지역명",
		dataIndex: "infoName",
		resizable: true,
		align: "center",
		sorter: (a: PerdiemAllowanceInfo, b: PerdiemAllowanceInfo) =>
			a.infoName!.length - b.infoName!.length,
		width: -1,
	},
	{
		title: "국가/지역코드",
		dataIndex: "infoCode",
		resizable: true,
		sorter: (a: PerdiemAllowanceInfo, b: PerdiemAllowanceInfo) =>
			a.infoCode!.length - b.infoCode!.length,
		width: -1,
	},
	{
		title: "최근등록자",
		dataIndex: "updateBy",
		resizable: true,
		sorter: (a: PerdiemAllowanceInfo, b: PerdiemAllowanceInfo) =>
			a.updateBy!.length - b.updateBy!.length,
		width: -1,
	},
	{
		title: "최근등록일",
		dataIndex: "updateAt",
		resizable: true,
		sorter: (a: PerdiemAllowanceInfo, b: PerdiemAllowanceInfo) =>
			a.updateAt!.length - b.updateAt!.length,
		width: -1,
	},
])

const emit = defineEmits<{
	(e: "addPerdiemInfoClick", value: any): any
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
	perdiemInfoParams.value = {
		infoName: undefined,
		infoCode: undefined,
		orderSeq: undefined,
	}
}

/**
 * 선택 시 class name 변경(색상)
 */
const setClassName = (record: PerdiemAllowanceInfo) => {
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
	if (selectedRowKeys.value.length === 0) return message.error("삭제할 행을 선택해주세요")
	emit("deletePerdiemInfo", selectedRowKeys.value)
}

/**
 * 국가/지역 추가
 */
const clickPerdiemAdd = () => {
	initModalData()
	emit(
		"addPerdiemInfoClick",
		Object.assign({
			...perdiemInfoParams.value,
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
			국가/지역 정보 {{ params?.typeName ? "[" + params.typeName + "]" : "" }}
		</a-typography-title>
		<a-space :size="5">
			<a-button danger :icon="materialIcons('mso', 'delete')" @click="onDelete">
				삭제
			</a-button>
			<a-button
				type="primary"
				:icon="materialIcons('mso', 'add_circle')"
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
</template>
