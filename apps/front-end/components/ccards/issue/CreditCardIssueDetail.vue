<script setup lang="ts">
import { pagination, pageSizeOptions, generateSortParams, Response } from "@/types"
import {
	type CardIssueManagementListData,
	type CreditCardListData,
	useCreditCardIssueDetailSearch,
	useCreditCardIssueDetailColumns,
} from "@/types/ccards/issue"
import CardIssueAddButton from "@/components/ccards/issue/CardIssueAddButton/index.vue"
import ReturnDropdown from "@/components/ccards/issue/ReturnDropdown/index.vue"
import IssueDropdown from "@/components/ccards/issue/IssueDropdown/index.vue"

const cardId = defineModel<number | undefined>("cardId")

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = await useCreditCardIssueDetailSearch(
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
 * 카드 디테일 정보
 * @param id : CardId
 */
const { data: cardInfo } = await useAsyncData(
	"card-detail-info",
	() =>
		useCFetch<Response<CreditCardListData>>(`/api/v2/card/managements/${cardId.value}`, {
			method: "GET",
			params: { id: cardId.value },
		}),
	{
		immediate: false,
		watch: [cardId],
		transform: (res) => res.data,
	}
)

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"card-issues-management-list",
	() =>
		useCFetch<Response<Array<CardIssueManagementListData>>>(
			`/api/v2/card/issues/management/${cardId.value}`,
			{
				method: "GET",
				params: {
					page: searchParams.value.pageNumber,
					...searchParams.value,
				},
			}
		),
	{
		immediate: false,
		watch: [cardId, searchParams],
		transform: (res) => res,
	}
)
</script>

<template>
	<a-flex align="center" justify="flex-end" class="mb-sm" :gap="5">
		{{ cardId }}
		<issue-dropdown v-model:card-id="cardId" @refresh="refresh()" />
		<return-dropdown v-model:card-id="cardId" @refresh="refresh()" />
		<card-issue-add-button
			:card-id="cardId"
			@refresh="() => refresh()"
			:disabled="cardInfo?.cardStatusName !== 'POSSIBILITY'"
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
		<template #bodyCell="{ column, text }">
			<template v-if="column.dataIndex === 'dateRange'">
				{{ $dayjs(text).format("YYYY-MM-DD HH:mm:ss") }} ~
				{{ $dayjs(text).format("YYYY-MM-DD HH:mm:ss") }}
			</template>
			<template v-if="column.dataIndex === 'actions'">
				<a-space> </a-space>
			</template>
		</template>
	</a-table>
</template>
