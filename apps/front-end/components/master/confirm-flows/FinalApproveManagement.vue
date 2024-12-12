<script lang="ts" setup>
import {
	createSearchParams,
	generateSortParams,
	pageSizeOptions,
	pagination,
	RequestParams,
	Response,
} from "@/types"
import {
	RFinalApproveReponse,
	TConfirmFlowsSearch,
	useFinalApproveManagementColumns,
} from "@/types/master/confirm-flows"
import type { ColumnType } from "ant-design-vue/lib/table/interface"

const searchParams = defineModel<
	ReturnType<
		typeof createSearchParams<RequestParams<TConfirmFlowsSearch>, "IConfirmFlows">
	>
>("searchParams", { required: true })

type PropsDataType = {
	data: Response<Array<RFinalApproveReponse>>
	pending: boolean
}
const { data: lineData, pending } = defineProps<PropsDataType>()

const columns = useFinalApproveManagementColumns()

const emit = defineEmits<{
	(
		e: "update:searchParams",
		value: RequestParams<TConfirmFlowsSearch>
	): RequestParams<TConfirmFlowsSearch>
	(e: "pagination", value: any): any
	(e: "open-modal", id?: string | number): void
	(e: "refresh"): void
}>()
const selectedRowKeys = ref<(string | number)[]>([])

const onDelete = (ids: any[]) => {
	const lastId = ids.map((id: number) => id).at(-1)
	ids.forEach(async (id: number) => {
		await useCFetch<Response<any>>(`/api/v2/master/checkLines/${id}`, {
			method: "DELETE",
			body: { id },
		}).then((res: Response<any>) => {
			console.log(">>> ", lastId, id, res)
			if (res.status === 0) {
				if (lastId === id) {
					message.success(`삭제하였습니다.`)
					emit("refresh")
				}
			}
		})
	})
}

const useYnOptions = [
	{ key: "", label: "전체" },
	{ key: true, label: "사용" },
	{ key: false, label: "미사용" },
]

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const { current, pageSize } = pagination
	const sortParams = generateSortParams(sorter)

	searchParams.value.sort = sortParams
	searchParams.value.pageNumber = current
	// searchParams.value.size = pageSize;
}

const onSelectChange = async (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
}

const onDetail = (id?: string | number) => {
	if (id) {
		// 수신자 수정
		emit("open-modal", id)
	} else {
		// 수신자 추가 신규
		emit("open-modal")
	}
}
</script>

<template>
	<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
		<a-col>
			<a-flex :gap="10">
				<a-space>
					<span>사용여부</span>
				</a-space>
				<a-select
					style="width: 10rem"
					:field-names="{
						label: 'label',
						value: 'key',
					}"
					v-model:value="searchParams.used"
					:options="useYnOptions"
				>
				</a-select>
			</a-flex>
		</a-col>
		<a-col>
			<a-space :size="5">
				<eacc-button
					component-is="delete"
					size="middle"
					:modal-open="true"
					:data="selectedRowKeys"
					@click="onDelete"
					:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
				/>
				<excel-button req-type="upload" size="middle" label="엑셀업로드" />
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_circle')"
					@click="onDetail()"
				>
					검인라인 추가
				</a-button>
				<a-select
					v-model:value="searchParams.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="
						(page: any) =>
							emit('pagination', {
								current: 0,
								pageSize: page,
							})
					"
				/>
			</a-space>
		</a-col>
	</a-row>
	<a-table
		:loading="pending"
		:data-source="lineData.data"
		:row-key="(record) => record.id"
		size="small"
		:columns="columns"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: onSelectChange,
		}"
		:pagination="
			Object.assign({}, pagination, {
				current: lineData.pageNumber! + 1,
				pageSize: lineData.size,
				total: lineData.totalElements,
			})
		"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'name'">
				<a-typography-link @click="onDetail(record.id)">
					{{ record.name }}
				</a-typography-link>
			</template>
		</template>
	</a-table>
</template>
