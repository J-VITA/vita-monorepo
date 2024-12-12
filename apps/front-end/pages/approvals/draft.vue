<script setup lang="ts">
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import {
	type RequestParams,
	type Response,
	SlipFormType,
	pageSizeOptions,
	pagination,
	pageSize,
} from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"

definePageMeta({
	name: "임시저장",
})

const route = useRoute()

const searchDateFrom = computed(() => route.query.searchDateFrom as string)
const searchDateTo = computed(() => route.query.searchDateTo as string)

const authStore = useAuthStore()
const { getRole, getCompanyCode, getEmployeeId } = storeToRefs(authStore)

interface ISearchParams {
	companyCode: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	employeeId: number | string // 로그인 사용자 식별자
	title: string
}
type Search = Partial<ISearchParams>

const filterDate = ref<[Dayjs, Dayjs]>([
	searchDateFrom.value ? dayjs(String(searchDateFrom.value)) : useMonth.from(),
	searchDateTo.value ? dayjs(String(searchDateTo.value)) : useMonth.to(),
])

const searchParams = ref<RequestParams<Search>>({
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	sort: [],
	companyCode: getCompanyCode.value,
	employeeId: getEmployeeId.value,
	searchDateFrom: dayjs(filterDate.value[0]).format("YYYY-MM-DD"), //시작일
	searchDateTo: dayjs(filterDate.value[1]).format("YYYY-MM-DD"), //종료일
})

const columns = ref<ColumnsType<any>>([
	{
		title: "제목",
		dataIndex: "title",
		resizable: true,
		width: -1,
	},
	{
		title: "문서양식",
		dataIndex: "approvalFormTypeLabel",
		resizable: true,
		width: -1,
	},
	{
		title: "작성자",
		dataIndex: "draftEmployeeName",
		resizable: true,
		sorter: true,
		align: "center",
		width: 100,
	},
	{
		title: "작성일",
		dataIndex: "createdAt",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "결재선",
		dataIndex: "approvalDetails",
		resizable: true,
		width: -1,
	},
])

const {
	data: approvals,
	status: approvalsStatus,
	refresh: approvalsRefresh,
	error: approvalsError,
	clear: approvalsClear,
} = await useAsyncData(`approvals-save-list`, async () =>
	useIFetch<Response<Array<any>>>("/api/v2/approvals/saved", {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
			size: searchParams.value.size,
			title: searchParams.value.title,
			employeeId: searchParams.value.employeeId,
		},
	})
		.then((res: any) => res.data.value)
		.then(
			(data: Response<Array<any>>) =>
				(data ||
					({
						data: [],
						status: -1,
						message: undefined,
						totalElements: 0,
						totalPages: 0,
						pageNumber: 0,
						size: 10,
						first: true,
						last: true,
					} as unknown as Response<Array<any>>)) as any
		)
)

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.searchDateFrom = dateString[0]
	searchParams.value.searchDateTo = dateString[1]
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any) => {
	searchParams.value.pageNumber = pagination.current
	searchParams.value.size = pagination.pageSize
}

const onSearch = (params: any) => {
	console.log("search params :", params)
	approvalsRefresh()
}

const onPage = async (record: any) => {
	await navigateTo(
		`/approvals/write-${compCase(record.approvalFormTypeName)}/${record.id}`
	)
}

onActivated(() => {
	approvalsRefresh()
})

// onDeactivated(() => {
//   console.log('deactivated');
//   approvalsClear();
// })
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기간설정</label>
						<a-range-picker v-model:value="filterDate" @change="onChangeRangePicker" />
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>제목</span>
						<a-input v-model:value="searchParams.title" />
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
					<a-select
						v-model:value="searchParams.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
					/>
				</a-space>
			</a-flex>

			<a-table
				size="small"
				:columns="columns"
				:data-source="approvals.data"
				:loading="approvalsStatus === 'pending'"
				:pagination="
					Object.assign({}, pagination, {
						current:
							searchParams?.pageNumber === 0
								? searchParams?.pageNumber + 1
								: searchParams?.pageNumber,
						pageSize: searchParams.size,
						total: approvals.totalElements,
					})
				"
				:show-sorter-tooltip="false"
				@change="cellChange"
				@resize-column="handleResizeColumn"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record)">
							{{ text ? text : "제목없음" }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'approvalDetails'">
						<approval-lines
							:data="text.sort((a: any, b: any) => a.stage - b.stage)"
							:type="record.agreementOptionTypeName"
						/>
					</template>
				</template>
			</a-table>
		</template>
	</page-layout>
</template>
