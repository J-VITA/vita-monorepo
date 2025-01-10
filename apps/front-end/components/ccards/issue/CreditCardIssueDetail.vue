<script setup lang="ts">
import { pagination, pageSizeOptions, generateSortParams, Response } from "@/types"
import {
	type CardIssueManagementListData,
	useCreditCardIssueDetailSearch,
	useCreditCardIssueDetailColumns,
} from "@/types/ccards/issue"
import { CardStatusType } from "@/types/ccards"
import CardIssueAddButton from "@/components/ccards/issue/CardIssueAddButton/index.vue"
import ReturnDropdown from "@/components/ccards/issue/ReturnDropdown/index.vue"
import IssueDropdown from "@/components/ccards/issue/IssueDropdown/index.vue"

const cardId = defineModel<number | undefined>("cardId")
const cardStatus = defineModel<CardStatusType>("cardStatus")

const emit = defineEmits<{
	(e: "refresh", value: any): void
}>()

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = useCreditCardIssueDetailSearch(
	getCompanyCode.value
)

const columns = useCreditCardIssueDetailColumns()

const onSelectionchange = (size: number) => {
	updateSearchParams({
		pageNumber: 0,
		size: size,
	})
	refresh()
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const { current, pageSize } = pagination
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: current - 1,
		size: pageSize,
		sort: sortParams,
	})
	refresh()
}

/**
 * 카드 불출/반납 history
 * @param id : CardId
 */
const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"card-issues-management-list",
	() =>
		useCFetch<Response<Array<CardIssueManagementListData>>>(
			`/api/v2/cards/issues/management/${cardId.value}`,
			{
				method: "GET",
				params: {
					page: searchParams.value.pageNumber,
					...searchParams.value,
				},
			}
		),
	{
		watch: [cardId, searchParams],
		transform: (res) => res,
	}
)

const onRefresh = (data?: any) => {
	refresh()
	if (data) emit("refresh", data)
}
</script>

<template>
	<a-flex align="center" justify="flex-end" class="mb-sm" :gap="5">
		<card-issue-add-button
			:card-id="cardId"
			:disabled="cardStatus !== 'POSSIBILITY'"
			@refresh="onRefresh"
		/>
		<a-select
			v-model:value="searchParams.size"
			:options="pageSizeOptions"
			value-field="key"
			text-field="label"
			@change="(page: any) => onSelectionchange(page)"
		/>
	</a-flex>

	<a-table
		size="small"
		:loading="status === 'pending'"
		:columns="columns"
		:data-source="dataSource?.data"
		:row-key="(record: any) => record.id"
		:show-sorter-tooltip="false"
		:pagination="{
			...pagination,
			current: (searchParams.pageNumber || 0) + 1,
			pageSize: searchParams.size,
			total: dataSource?.totalElements,
		}"
		@change="cellChange"
	>
		<template #headerCell="{ title }">
			<div class="text-center">{{ title }}</div>
		</template>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'dateRange'">
				{{ $dayjs(text).format("YYYY-MM-DD HH:mm") }} ~
				{{ $dayjs(text).format("YYYY-MM-DD HH:mm") }}
			</template>
			<template v-if="column.dataIndex === 'approvalHeaderId'">
				<a-button type="text" :icon="materialIcons('mso', 'open_in_new')" />
			</template>
			<template v-if="column.dataIndex === 'actions'">
				<a-space :size="5">
					<issue-dropdown :row-id="record.id" @refresh="onRefresh" v-if="record.isPast" />
					<return-dropdown :row-id="record.id" @refresh="onRefresh" />
				</a-space>
			</template>
		</template>
	</a-table>
</template>
