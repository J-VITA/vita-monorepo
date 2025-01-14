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
		title: "출장 급지 구분",
		dataIndex: "locationType",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.ariaRangking!.length - b.ariaRangking!.length,
		width: -1,
	},
	{
		title: "출장비 유형",
		dataIndex: "name",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.locationName!.length - b.locationName!.length,
		width: -1,
	},
	{
		title: "출장유형코드",
		dataIndex: "code",
		resizable: true,
		align: "center",
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) =>
		// 	a.gradeName!.length - b.gradeName!.length,
		width: -1,
	},
	{
		title: "계정비용항목",
		align: "center",
		dataIndex: "businessTripTypeAccountDtos",
		resizable: true,
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.locationName!.length - b.locationName!.length,
		width: -1,
	},
	{
		title: "사용여부",
		align: "center",
		dataIndex: "used",
		resizable: true,
		// sorter: (a: PerdiemTableData, b: PerdiemTableData) => a.paymentCategory!.length - b.paymentCategory!.length,
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
		await useCFetch<any>(`/api/v2/masters/businessTripType/${id}`, {
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
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_circle')"
					@click="showModal()"
					>출장비 유형 추가</a-button
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
			<template v-if="column.dataIndex === 'locationType'">
				<a-tag :color="locations[record.locationType.code].color">{{
					locations[record.locationType.code].text
				}}</a-tag>
			</template>
			<template v-if="column.dataIndex === 'name'">
				<a-typography-link @click="showModal(record.id)">
					{{ text }}
				</a-typography-link>
			</template>
			<template v-if="column.dataIndex === 'businessTripTypeAccountDtos'">
				<template v-for="(list, idx) in record.businessTripTypeAccountDtos" :key="idx">
					{{ list.parentAccountName }} <
					{{
						record.businessTripTypeAccountDtos.length > 1 &&
						idx !== record.businessTripTypeAccountDtos.length - 1
							? list.accountName + ", "
							: list.accountName
					}}
				</template>
			</template>
			<template v-if="column.dataIndex === 'used'">
				<a-badge :color="text ? 'green' : 'red'" :text="text ? '사용중' : '미사용'" />
			</template>
			<template v-if="column.dataIndex === 'lastModifiedDate' && record.lastModifiedDate">
				{{ record.lastModifiedDate.split("T")[0] }}
				{{ record.lastModifiedDate.split("T")[1].slice(0, 5) }}
			</template>
		</template>
	</a-table>
</template>
