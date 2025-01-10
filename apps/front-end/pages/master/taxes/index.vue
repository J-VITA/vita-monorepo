<script lang="ts" setup>
import {
	type Response,
	type RequestParams,
	pageSizeOptions,
	pagination,
	pageSize,
} from "@/types"
import type { Tax } from "@/types/master/taxes"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
definePageMeta({
	name: "세금코드관리",
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const route = useRoute()
const routePath = computed(() => route.path)

const searchParams = ref<RequestParams<any>>({
	companyCode: getCompanyCode.value,
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	keyword: "",
})

const {
	data: taxesData,
	status,
	refresh: taxesRefresh,
} = await useAsyncData(
	`master-taxes-list`,
	async () =>
		await useCFetch<Response<Array<Tax>>>("/api/v2/masters/taxes", {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
				size: searchParams.value.size,
				keyword: searchParams.value.keyword,
			},
		}).then((res: Response<Array<Tax>>) => res)
	// { watch: [searchParams.value] }
)

const selectedRowKeys = ref<(string | number)[]>([])

const columns = ref<ColumnsType<any>>([
	{
		title: "과세유형",
		dataIndex: "name",
		resizable: true,
		sorter: true,
		width: -1,
	},
	{
		title: "세금코드",
		dataIndex: "code",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "세율(%)",
		dataIndex: "rate",
		resizable: true,
		align: "center",
		sorter: true,
		width: -1,
	},
	{
		title: "증빙유형코드",
		dataIndex: "slipEvidenceTypeLabel",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		align: "center",
		resizable: true,
		width: -1,
	},
	{
		title: "비고1",
		dataIndex: "attribute1",
		resizable: true,
		width: -1,
	},
	{
		title: "비고2",
		dataIndex: "attribute2",
		resizable: true,
		width: -1,
	},
])

const isShowTaxModal = ref<boolean>(false)
const taxRowData = ref<any>()

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any) => {
	searchParams.value.pageNumber = pagination.current
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
}

const onSearch = (value: any) => {
	taxesRefresh()
}

const onDelete = async (ids: any[]) => {
	// const lastId = ids.at(-1);
	await Promise.all(
		ids.map((id) =>
			useCFetch<Response<any>>(`/api/v2/masters/taxes/${id}`, {
				method: "DELETE",
				body: { id },
			})
		)
	)

	message.success("삭제하였습니다.")
	selectedRowKeys.value = []
	taxesRefresh()
}

const showTaxModal = (data?: any) => {
	if (data) {
		taxRowData.value = data
	} else {
		taxRowData.value = {
			id: undefined,
			name: "",
			code: "",
			rate: 0,
			slipEvidenceTypeCode: "",
			used: true,
			attribute1: "",
			attribute2: "",
		}
	}

	isShowTaxModal.value = true
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				세금코드를 등록/관리할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>세금코드/과세유형</label>
						<a-input v-model:value="searchParams.keyword" />
					</a-space>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						@click="onSearch"
					/>
				</a-col>
			</a-row>
			<a-divider class="my-md" />
			<a-flex justify="flex-end" class="mb-sm">
				<a-space :size="5">
					<eacc-excel-button
						ghost
						type="primary"
						url="/api/v2/masters/taxes/validate"
						req-type="upload"
						label="엑셀일괄등록"
						:sample-file-key="routePath"
						@submit="() => taxesRefresh()"
					/>
					<eacc-button
						component-is="delete"
						:data="selectedRowKeys"
						:modal-open="true"
						:disabled="selectedRowKeys.length === 0"
						@click="onDelete"
					/>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_box')"
						@click="showTaxModal()"
					>
						세금코드 추가
					</a-button>
					<a-select
						v-model:value="searchParams.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
						@change="
							(page: any) =>
								cellChange({
									current: 0,
									pageSize: page,
								})
						"
					/>
				</a-space>
			</a-flex>
			<a-table
				size="small"
				:loading="status === 'pending'"
				:columns="columns"
				:show-sorter-tooltip="false"
				:data-source="taxesData?.data"
				:row-key="(record) => record.id"
				:row-selection="{
					selectedRowKeys,
					onChange: onRowSelection,
				}"
				:pagination="
					Object.assign({}, pagination, {
						current:
							searchParams?.pageNumber === 0
								? searchParams?.pageNumber + 1
								: searchParams?.pageNumber,
						pageSize: searchParams?.size,
						total: taxesData?.totalElements,
					})
				"
				@change="cellChange"
				@resizeColumn="handleResizeColumn"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'name'">
						<a-typography-link @click="showTaxModal(record)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'used'">
						<a-badge
							:color="record.used ? 'green' : 'red'"
							:text="record.used ? '사용중' : '미사용'"
						/>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<tax-code-modal
				:show="isShowTaxModal"
				:data="taxRowData"
				@update:show="(value) => (isShowTaxModal = value)"
				@refresh="taxesRefresh"
			/>
		</template>
	</page-layout>
</template>
