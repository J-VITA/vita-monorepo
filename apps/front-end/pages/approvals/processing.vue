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
import {
	useProgressListColumns,
	useProgressListSearch,
} from "@/types/approvals/processing"
import type { ColumnType } from "ant-design-vue/lib/table/interface"

definePageMeta({
	name: "결재진행",
})

const route = useRoute()

const searchDateFrom = computed(() => route.query.searchDateFrom as string)
const searchDateTo = computed(() => route.query.searchDateTo as string)

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = useProgressListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)
const columns = useProgressListColumns()

const {
	data: approval,
	status: approvalPending,
	refresh: approvalRefresh,
} = await useAsyncData(`slip-approvals-progress`, async () =>
	useIFetch<Response<Array<any>>>("/api/v2/approvals/progress", {
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
	approvalRefresh()
}

const onPage = async (record: any) => {
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
})
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기간설정</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
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
				:columns="columns"
				:data-source="approval.data"
				:loading="approvalPending === 'pending'"
				:pagination="
					Object.assign({}, pagination, {
						current: searchParams.pageNumber ? searchParams.pageNumber + 1 : 1,
						pageSize: searchParams.size,
						total: approval.totalElements,
					})
				"
				@resize-column="handleResizeColumn"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record)">
							<a-typography-text type="danger" v-if="record.urgent">
								[긴급]
							</a-typography-text>
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'documentStatusName'">
						<a-badge
							:status="text === 'PROGRESS' ? 'processing' : 'default'"
							:text="record.documentStatusLabel"
						/>
					</template>
					<template v-if="column.dataIndex === 'approvalDetails'">
						<approval-lines
							:data="text.sort((a: any, b: any) => a.stage - b.stage)"
							:type="record.agreementOptionTypeName"
							:status="true"
							:next-stage="record.nextApprovalStage"
						/>
					</template>
				</template>
			</a-table>
		</template>
	</page-layout>
</template>
