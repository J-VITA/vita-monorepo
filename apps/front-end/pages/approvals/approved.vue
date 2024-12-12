<script setup lang="ts">
import type { Dayjs } from "dayjs"
import { type Response, pageSizeOptions, pagination, generateSortParams } from "@/types"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import {
	useAapprovedListColumns,
	useAapprovedListSearch,
	type AapprovedListItem,
} from "@/types/approvals/approved"

import type { SelectProps } from "ant-design-vue"

definePageMeta({
	name: "결재한 문서",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = await useAapprovedListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)
const columns = useAapprovedListColumns()

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(`approvals-approved`, async () =>
	useCFetch<Response<Array<AapprovedListItem>>>("/api/v2/approvals/approved", {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber,
			...searchParams.value,
		},
	}).then((res: Response<Array<AapprovedListItem>>) => res)
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

const onSelectionchange = (size: number) => {
	updateSearchParams({
		pageNumber: 0,
		size,
	})
}

const onSearch = (params: any) => {
	refresh()
}

const onPage = async (record: any) => {
	await navigateTo(
		`/approvals/read-${compCase(record.approvalFormTypeName)}/${record.id}`
	)
}

const documentStatusOptions = ref<SelectProps["options"]>([])
const getDocumentStatusOptions = async () => {
	const res = await useCFetch<Response<Array<any>>>(
		"/api/v2/approvals/types/documentStatuses"
	).then((res: Response<Array<any>>) => {
		const list = res.data
			?.filter((x) => ["PROGRESS", "REJECTED", "COMPLETED"].includes(x.code))
			.map((e) => ({
				label: e.label,
				value: e.code,
			}))

		return [{ label: "전체", value: "" }, ...(list || [])]
	})
	documentStatusOptions.value = res
}

onMounted(async () => {
	await getDocumentStatusOptions()
})

onActivated(async () => {
	await getDocumentStatusOptions()
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
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>문서상태</label>
						<a-select
							style="min-width: 10rem"
							v-model:value="searchParams.documentStatus"
							:options="documentStatusOptions"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<label>기안자</label>
						<eacc-select-table
							url="/api/v2/cards/commons/employees"
							v-model:value="searchParams.draftEmployeeIds"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name },
								{ title: '직위', data: (row: any) => row.gradeName },
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
							]"
							@update:value="(value) => (searchParams.draftEmployeeId = value[0])"
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
						@change="(page: any) => onSelectionchange(page)"
					/>
				</a-space>
			</a-flex>
			<a-table
				size="small"
				:columns="columns"
				:data-source="dataSource?.data"
				:loading="status === 'pending'"
				:pagination="
					Object.assign({}, pagination, {
						current: searchParams.pageNumber ? searchParams.pageNumber + 1 : 1,
						pageSize: searchParams?.size,
						total: dataSource?.totalElements,
					})
				"
				:row-key="(record: any) => record.id"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
				@change="cellChange"
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
