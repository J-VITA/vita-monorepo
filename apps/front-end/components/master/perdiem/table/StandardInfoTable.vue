<script setup lang="ts">
import { pageSizeOptions, pagination } from "@/types"
import { PerdiemTableData, PaginationType, locations } from "@/types/master/perdiem"
import type { ColumnsType, ColumnType } from "ant-design-vue/lib/table/interface"

const { loading = false, perdiemData } = defineProps<{
	loading: boolean
	perdiemData: any
}>()

const route = useRoute()
const routePath = computed(() => route.path)

const emit = defineEmits<{
	(e: "updatePagination:value", value: any): any
	(e: "openPerdiumInfoModal", id?: any): any
	(e: "refresh"): void
}>()
const paginationData = ref<PaginationType>({
	page: 0,
	size: 10,
})
const columns = ref<ColumnsType<PerdiemTableData>>([
	{
		title: "급지유형",
		dataIndex: "locationType",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.ariaRangking!.length - b.ariaRangking!.length,
		width: -1,
	},
	{
		title: "국가/지역",
		dataIndex: "locationName",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.locationName!.length - b.locationName!.length,
		width: -1,
	},
	{
		title: "임직원 등급",
		dataIndex: "gradeName",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.gradeName!.length - b.gradeName!.length,
		width: -1,
	},
	{
		title: "출장비 유형",
		align: "center",
		dataIndex: "businessTripTypeName",
		resizable: true,
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.locationName!.length - b.locationName!.length,
		width: -1,
	},
	{
		title: "지급구분",
		align: "center",
		dataIndex: "paymentCategory",
		resizable: true,
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.paymentCategory!.length - b.paymentCategory!.length,
		width: -1,
	},
	{
		title: "지급금액",
		dataIndex: "fixedAmount",
		resizable: true,
		align: "right",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.reimbursementLimit!.length - b.reimbursementLimit!.length,
		width: -1,
	},
	{
		title: "통제금액",
		dataIndex: "reimbursementLimit",
		resizable: true,
		align: "right",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.reimbursementLimit!.length - b.reimbursementLimit!.length,
		width: -1,
	},
	{
		title: "최근 변경자",
		dataIndex: "lastModifiedBy",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.reimbursementLimit!.length - b.reimbursementLimit!.length,
		width: -1,
	},
	{
		title: "최근 변경일",
		dataIndex: "lastModifiedDate",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.reimbursementLimit!.length - b.reimbursementLimit!.length,
		width: -1,
	},
])

const selectedRowKeys = ref<any[]>([])
const selectedRows = ref<any[]>([])
const onDelete = (users: (string | number)[]) => {
	let num = 0
	users.forEach(async (id) => {
		await useCFetch<any>(`/api/v2/masters/businessTrip/${id}`, {
			method: "DELETE",
			body: {
				id: id,
			},
		})
			.then((res: any) => {
				if (res.status === 0) num = num + 1
			})
			.then(() => {
				if (num === users.length) {
					message.success(`${num}개의 출장기준정보가 삭제 되었습니다.`)
					selectedRowKeys.value = []
					emit("refresh")
				}
			})
	})
}
const showModal = (id?: number) => {
	emit("openPerdiumInfoModal", id)
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters?: any, sorter?: any, rows?: any) => {
	paginationData.value = {
		...paginationData.value,
		page: pagination.current ? pagination.current - 1 : 0,
		size: pagination.pageSize ? pagination.pageSize : 10,
	}
	emit("updatePagination:value", paginationData.value)
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
}
</script>

<template>
	<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
		<a-col></a-col>
		<a-col>
			<a-space :size="5">
				<eacc-button
					component-is="delete"
					:data="selectedRowKeys"
					:modal-open="true"
					@click="onDelete(selectedRowKeys)"
				/>

				<eacc-excel-button
					req-type="download"
					size="middle"
					label="엑셀다운로드"
					file-name="출장기준정보관리"
					:data="perdiemData.data"
					:disabled="!perdiemData.data || perdiemData.data.length === 0"
				/>
				<eacc-excel-button
					req-type="upload"
					url="/api/v2/masters/businessTrip/validate"
					:sample-file-key="routePath"
					size="middle"
					label="엑셀업로드"
					@submit="() => emit('refresh')"
				/>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_circle')"
					@click="showModal()"
					>출장기준정보 추가</a-button
				>
				<a-select
					v-model:value="paginationData.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="(value: any) => cellChange({ pageSize: value })"
				/>
			</a-space>
		</a-col>
	</a-row>
	<a-table
		size="small"
		:loading="loading"
		:columns="columns"
		:show-sorter-tooltip="false"
		:data-source="perdiemData.data"
		empty-text="데이터가 없습니다."
		:pagination="
			Object.assign({}, pagination, {
				current:
					paginationData?.page === 0 ? paginationData?.page + 1 : paginationData?.page,
				pageSize: paginationData?.size,
				total: perdiemData?.totalElements,
			})
		"
		:row-key="(record) => record.id"
		:row-selection="{
			selectedRowKeys,
			onChange: onRowSelection,
		}"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #headerCell="{ title }">
			<div class="text-center">{{ title }}</div>
		</template>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'locationName'">
				<a-typography-link @click="showModal(record.id)">
					{{ text }}
				</a-typography-link>
			</template>
			<template
				v-if="
					column.dataIndex === 'reimbursementLimit' || column.dataIndex === 'fixedAmount'
				"
			>
				{{ text ? text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-" }}
			</template>
			<template v-if="column.dataIndex === 'locationType'">
				<a-tag :color="locations[record.locationType.code].color">{{
					locations[record.locationType.code].text
				}}</a-tag>
			</template>
			<template v-if="column.dataIndex === 'paymentCategory'">
				{{ record.paymentCategory.label }}
			</template>
			<template v-if="column.dataIndex === 'lastModifiedDate'">
				{{ record.lastModifiedDate.split("T")[0] }}
				{{ record.lastModifiedDate.split("T")[1].slice(0, 5) }}
			</template>
		</template>
	</a-table>
</template>
