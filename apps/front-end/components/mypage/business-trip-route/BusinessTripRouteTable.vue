<script setup lang="ts">
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { Search, RouteTableData } from "@/types/mypage/business-trip-route"
import { type Response, type RequestParams, pageSizeOptions, pagination } from "@/types"

const columns = ref<ColumnsType<any>>([
	{
		title: "출장경로명",
		dataIndex: "name",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "출발지",
		dataIndex: "departure",
		resizable: true,
		align: "left",
		width: -1,
	},
	{
		title: "도착지",
		dataIndex: "destination",
		resizable: true,
		align: "left",
		width: -1,
	},
	{
		title: "경유지",
		dataIndex: "stopoverCount",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "거리",
		dataIndex: "distance",
		resizable: true,
		width: -1,
	},
	{
		title: "왕복여부",
		dataIndex: "roundTrip",
		resizable: true,
		width: -1,
	},
	{
		title: "등록일",
		dataIndex: "createdAt",
		resizable: true,
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "active",
		resizable: true,
		width: -1,
	},
])

const selectedRowKeys = ref<(string | number)[]>([])
type Props = {
	dataSource: any
	pending: string
	searchParams: Search
}
const { dataSource, pending, searchParams } = defineProps<Props>()
const emit = defineEmits<{
	(e: "refresh"): void
	(e: "openModal", value: boolean, data?: any): any
	(e: "pagination", value: any): any
}>()

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
}

const cellChange = (pagination: any) => {
	searchParams.page = pagination.current
	emit("pagination", searchParams)
}

const onSizeChange = (pageSize: any) => {
	searchParams.size = pageSize
	emit("pagination", searchParams)
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const showModal = () => {
	emit("openModal", true)
}

const onOpenPatchModal = (record: any) => {
	emit("openModal", true, record)
}

const onDelete = (users: number[]) => {
	let num = 0
	users.forEach(async (id) => {
		await useCFetch<Response<any>>(`/api/v2/persons/my-business-trip-routes/${id}`, {
			method: "DELETE",
			params: {
				id: id,
			},
		})
			.then((res: Response<any>) => {
				if (res.status === 0) num = num + 1
			})
			.then(() => {
				if (num === users.length) {
					message.success(`${num}개의 프로젝트가 삭제 되었습니다.`)
					selectedRowKeys.value = []
					emit("refresh")
				}
			})
	})
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
					@click="onDelete"
				/>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_circle')"
					@click="showModal"
					>출장경로 추가</a-button
				>
				<a-select
					v-model:value="searchParams.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="onSizeChange"
				/>
			</a-space>
		</a-col>
	</a-row>
	<a-table
		:loading="pending === 'pending'"
		:columns="columns"
		:data-source="dataSource.data"
		:show-sorter-tooltip="false"
		:row-key="(record) => record.id"
		:row-selection="{
			selectedRowKeys,
			onChange: onRowSelection,
		}"
		:pagination="
			Object.assign({}, pagination, {
				current: searchParams?.page === 0 ? searchParams?.page + 1 : searchParams?.page,
				pageSize: searchParams?.size,
				total: dataSource?.totalElements,
			})
		"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'name'">
				<a-typography-link @click="onOpenPatchModal(record)">{{
					text
				}}</a-typography-link>
			</template>
			<template v-if="column.dataIndex === 'roundTrip'">
				{{ text ? "O" : "X" }}
			</template>
			<template v-if="column.dataIndex === 'createdAt'">
				{{ text ? text.split("T")[0] : undefined }}
			</template>
			<template v-if="column.dataIndex === 'active'">
				<a-badge :color="text ? 'green' : 'red'" :text="text ? '사용중' : '미사용'" />
			</template>
		</template>
	</a-table>
</template>
