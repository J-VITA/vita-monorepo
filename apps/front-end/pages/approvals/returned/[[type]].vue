<script setup lang="ts">
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import {
	type Response,
	pageSizeOptions,
	pagination,
	generateSortParams,
	dateTimeFormat,
} from "@/types"
import { useReturnedListColumns, useReturnedListSearch } from "@/types/approvals/returned"
import type { ColumnType } from "ant-design-vue/lib/table/interface"

definePageMeta({
	name: "반려/회수",
})

const route = useRoute()

const searchDateFrom = computed(() => route.query.searchDateFrom as string)
const searchDateTo = computed(() => route.query.searchDateTo as string)
const documentStatus = computed(() => String(route.params.type) || "")

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole, getEmployeeId, getJobTitleId } =
	storeToRefs(authStore)

const { searchParams, updateSearchParams } = useReturnedListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)
const columns = useReturnedListColumns()

const {
	data: approval,
	status: approvalPending,
	refresh: approvalRefresh,
} = await useAsyncData(`slip-approvals-rejected`, async () =>
	useIFetch<Response<Array<any>>>("/api/v2/approvals/rejected", {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
			...searchParams.value,
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
	updateSearchParams({
		pageNumber: 0,
		searchDateFrom: dateString[0],
		searchDateTo: dateString[1],
	})
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: pagination.current - 1,
		size: pagination.pageSize,
		sort: sortParams,
	})
}

const onSelectionChange = (size: number) => {
	updateSearchParams({
		pageNumber: 0,
		size,
	})
}

const onSearch = (params: any) => {
	console.log("search params :", params)
	approvalRefresh()
}

const onPage = async (record: any) => {
	// record 받은 문서양식에 따라 링크 주소 변경
	// `/approvals/read-${documentFormType}/${record.no}?prev=returned`
	console.log("row dataSource : ", record)
	await navigateTo(
		`/approvals/read-${compCase(record.approvalFormTypeName)}/${record.id}`
	)
}

onActivated(() => {
	console.log("onActivated route.params ", route)
	if (searchDateFrom.value) {
		updateSearchParams({
			pageNumber: 0,
			searchDateFrom: searchDateFrom.value,
			searchDateTo: searchDateTo.value,
			filterDate: [dayjs(searchDateFrom.value), dayjs(searchDateTo.value)],
		})
	}

	if (documentStatus.value) {
		updateSearchParams({
			pageNumber: 0,
			documentStatus: documentStatus.value,
		})
	}
})
onMounted(() => {
	console.log("onMounted route.params ", route)
	if (searchDateFrom.value) {
		updateSearchParams({
			pageNumber: 0,
			searchDateFrom: searchDateFrom.value,
			searchDateTo: searchDateTo.value,
			filterDate: [dayjs(searchDateFrom.value), dayjs(searchDateTo.value)],
		})
	}

	if (documentStatus.value) {
		updateSearchParams({
			pageNumber: 0,
			documentStatus: documentStatus.value,
		})
	}
})
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기안일</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>분류</span>
						<a-select
							style="width: 12rem"
							v-model:value="searchParams.documentStatus"
							:options="[
								{ label: '전체', value: '' },
								{ label: '반려', value: 'REJECTED' },
								{ label: '회수', value: 'WITHDRAWN' },
							]"
							:disabled="false"
						/>
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
						@change="(page: any) => onSelectionChange(page)"
					/>
				</a-space>
			</a-flex>

			<a-table
				size="small"
				:row-key="(record: any) => record.id"
				:columns="columns"
				:data-source="approval.data"
				:loading="approvalPending === 'pending'"
				:pagination="
					Object.assign({}, pagination, {
						current: approval.pageNumber ? approval.pageNumber + 1 : 1,
						pageSize: approval.size,
						total: approval.totalElements,
					})
				"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'documentStatusName'">
						<a-tag :color="text === 'WITHDRAWN' ? 'warning' : 'error'">
							{{ record.documentStatusLabel }}
						</a-tag>
					</template>
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record)">
							{{ text }}
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
