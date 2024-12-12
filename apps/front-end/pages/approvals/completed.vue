<script setup lang="ts">
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import {
	type Response,
	type RequestParams,
	pageSizeOptions,
	pagination,
	pageSize,
} from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"

definePageMeta({
	name: "완료",
})

const route = useRoute()

const searchDateFrom = computed(() => route.query.searchDateFrom as string)
const searchDateTo = computed(() => route.query.searchDateTo as string)

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole, getEmployeeId, getJobTitleId } =
	storeToRefs(authStore)

const filterDate = ref<[Dayjs, Dayjs]>([
	searchDateFrom.value ? dayjs(String(searchDateFrom.value)) : useMonth.from(),
	searchDateTo.value ? dayjs(String(searchDateTo.value)) : useMonth.to(),
])

interface ISearchParams {
	companyCode: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	employeeId: number | string //사용자 식별자
	documentStatus: "SAVED" | "REQUESTED" | undefined
	title: string
}
type Search = Partial<ISearchParams>
const searchParams = ref<RequestParams<Search>>({
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	sort: [],
	companyCode: getCompanyCode.value,
	searchDateFrom: dayjs(filterDate.value[0]).format("YYYY-MM-DD"), //시작일
	searchDateTo: dayjs(filterDate.value[1]).format("YYYY-MM-DD"), //종료일
	documentStatus: undefined,
	employeeId: getEmployeeId.value, //사용자 식별자
	title: "",
})

const columns = ref<ColumnsType<any>>([
	{
		title: "제목",
		dataIndex: "title",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "문서양식",
		dataIndex: "approvalFormTypeLabel",
		resizable: true,
		width: -1,
	},
	{
		title: "문서번호",
		dataIndex: "approvalNumber",
		resizable: true,
		width: -1,
	},
	{
		title: "기안자",
		dataIndex: "draftEmployeeName",
		resizable: true,
		sorter: true,
		align: "center",
		width: -1,
	},
	{
		title: "기안일",
		dataIndex: "startDate",
		resizable: true,
		sorter: true,
		align: "center",
		width: -1,
	},
	{
		title: "완료일",
		dataIndex: "endDate",
		resizable: true,
		sorter: true,
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
	data: approval,
	pending: approvalPending,
	refresh: approvalRefresh,
} = await useAsyncData(`slip-approvals-completed`, async () =>
	useIFetch<Response<Array<any>>>("/api/v2/approvals/completed", {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
			...searchParams.value,
		},
	})
		.then((res: any) => res.data.value)
		.then((data: Response<Array<any>>) => (data || {}) as any)
)

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	console.log("onChangeRangePicker", value, dateString)
	searchParams.value.searchDateFrom = dateString[0]
	searchParams.value.searchDateTo = dateString[1]
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onSearch = (params: any) => {
	console.log("search params :", params)
	approvalRefresh()
}

const onPage = async (record: any) => {
	console.log("row dataSource : ", record)
	await navigateTo(
		`/approvals/read-${compCase(record.approvalFormTypeName)}/${record.id}`
	)
}
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
				:data-source="approval.data"
				:loading="approvalPending"
				:pagination="
					Object.assign({}, pagination, {
						current: approval.pageNumber ? approval.pageNumber + 1 : 1,
						pageSize: approval.size,
						total: approval.totalElements,
					})
				"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-else-if="column.dataIndex === 'approvalDetails'">
						<approval-lines
							:data="text.sort((a: any, b: any) => a.stage - b.stage)"
							:type="record.agreementOptionTypeName"
						/>
					</template>
					<template v-else>
						{{ text }}
					</template>
				</template>
			</a-table>
		</template>
	</page-layout>
</template>
