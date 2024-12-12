<script setup lang="ts">
import type { Dayjs } from "dayjs"
import type { SelectProps } from "ant-design-vue"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import { pagination, generateSortParams, pageSizeOptions, type Response } from "@/types"
import { CardTypeColor, CardUseStateColor, myCardOptions } from "@/types/ccards"
import {
	useCardUsageListSearch,
	useCardUsageListColumns,
	type CardUsageItem,
	type UsePrivate,
} from "@/types/ccards/usages"

definePageMeta({
	name: "법인카드사용현황",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const columns = useCardUsageListColumns()
const { searchParams, updateSearchParams } = await useCardUsageListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)
const selectedRowKeys = ref<(string | number)[]>([])
const cardOwnerOptions = ref<SelectProps["options"]>([])

const isConfirmModal = ref<boolean>(false)
const usePrivate = ref<UsePrivate>({
	type: "",
	companyCode: getCompanyCode.value,
	cardUsageIds: [],
})

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const onSelectionchange = (size: number) => {
	updateSearchParams({ size })
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

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		approvalDateFrom: dateString[0],
		approvalDateTo: dateString[1],
	})
}

const onSearch = () => {
	updateSearchParams({ pageNumber: 0 })
	refresh()
}

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	"card-usages-list",
	() =>
		useCFetch<Response<Array<CardUsageItem>>>("/api/v2/card/usages", {
			method: "GET",
			params: {
				...searchParams.value,
				page: searchParams.value.pageNumber,
				size: searchParams.value.size,
				cardNumber: searchParams.value.cardNumber || undefined,
			},
		}),
	{
		transform: (res: Response<Array<CardUsageItem>>) => {
			const totalAmounts = res.data?.reduce(
				(acc, curr) => {
					acc.amount += curr.principalAmount
					acc.supply += curr.supplyAmount || 0
					acc.vat += curr.vatAmount || 0
					acc.tip += curr.tipAmount || 0
					return acc
				},
				{ amount: 0, supply: 0, vat: 0, tip: 0 }
			)
			return { ...res, totalAmounts }
		},
	}
)

const getCardOwnerOptions = async (cardOwnerId: string | number) => {
	cardOwnerOptions.value = await myCardOptions(getCompanyCode.value, cardOwnerId, true)

	searchParams.value.cardNumber = ""
}

const showConfirmModal = (type: "release" | "process") => {
	usePrivate.value.type = type
	usePrivate.value.cardUsageIds = selectedRowKeys.value.map((x: any) => ({
		id: x,
	}))
	isConfirmModal.value = true
}

const onPrivate = async (data: UsePrivate) => {
	await useCFetch<Response<any>>(`/api/v2/card/usages/private/${data.type}`, {
		method: "PATCH",
		body: data,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success(res.message)
			selectedRowKeys.value = []
			refresh()
			isConfirmModal.value = false
		}
	})
}

watch(searchParams.value, async (value) => {
	if (value.cardOwnerId) {
		await getCardOwnerOptions(value.cardOwnerId)
	}
})

onMounted(async () => {
	await getCardOwnerOptions(getEmployeeId.value)
})
onActivated(async () => {
	await getCardOwnerOptions(getEmployeeId.value)
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				법인카드 사용내역을 조회합니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 15]" wrap>
				<a-col>
					<a-space>
						<label>사용일자</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<eacc-select-table
						label="카드소유자"
						url="/api/v2/cards/commons/employees"
						v-model:value="searchParams.cardOwnerIds"
						key-props="id"
						label-prop="name"
						:columns="[
							{ title: 'ID', data: (row: any) => row.id },
							{ title: '이름', data: (row: any) => row.name },
							{ title: '직위', data: (row: any) => row.gradeName },
							{
								title: '코스트센터',
								data: (row: any) => row.costCenterName,
							},
							{ title: '사업장', data: (row: any) => row.workplaceName },
						]"
						@update:value="(value) => (searchParams.cardOwnerId = value[0])"
					/>
				</a-col>
				<a-col>
					<a-space>
						<label>카드선택</label>
						<a-select
							style="min-width: 22rem"
							v-model:value="searchParams.cardNumber"
							:options="cardOwnerOptions"
						/>
					</a-space>
				</a-col>
				<a-col>
					<eacc-select
						style="min-width: 10rem"
						label="처리상태"
						url="/api/v2/card/usages/types/CardUseStateType"
						v-model:value="searchParams.cardUseStateType"
						first
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="false"
						@update:value="(value) => console.log(value)"
					/>
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

			<a-divider />

			<a-flex justify="space-between" class="mb-sm">
				<a-space :size="5">
					<a-button
						:disabled="selectedRowKeys.length === 0"
						:icon="materialIcons('mso', 'restart_alt')"
						@click="showConfirmModal('release')"
					>
						사적용도 해제
					</a-button>
					<a-button
						danger
						:disabled="selectedRowKeys.length === 0"
						:icon="materialIcons('mso', 'border_color')"
						@click="showConfirmModal('process')"
					>
						사적용도 처리
					</a-button>
				</a-space>

				<a-space :size="5">
					<a-button :icon="materialIcons('mso', 'download')"> 엑셀다운로드 </a-button>

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
				:scroll="{ x: 2400 }"
				:loading="status === 'pending'"
				:columns="columns"
				:data-source="dataSource?.data"
				:row-key="(record) => record.id"
				:row-selection="{
					selectedRowKeys: selectedRowKeys,
					onChange: (keys) => (selectedRowKeys = keys),
				}"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
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
					<template v-if="column.dataIndex === 'cardTypeName'">
						<a-tag :color="CardTypeColor[text]">
							{{ record.cardTypeLabel }}
						</a-tag>
					</template>
					<template v-if="column.dataIndex === 'cardUseStateTypeName'">
						<a-badge
							:color="CardUseStateColor[text]"
							:text="record.cardUseStateTypeLabel"
						/>
					</template>
				</template>

				<template #summary>
					<a-table-summary-row class="bg-summary">
						<a-table-summary-cell></a-table-summary-cell>
						<a-table-summary-cell class="bold text-primary" colspan="3">
							Total
						</a-table-summary-cell>
						<a-table-summary-cell></a-table-summary-cell>
						<a-table-summary-cell></a-table-summary-cell>
						<a-table-summary-cell></a-table-summary-cell>
						<a-table-summary-cell></a-table-summary-cell>
						<a-table-summary-cell class="text-right bold text-primary">
							{{ dataSource?.totalAmounts?.amount.toLocaleString() }}
						</a-table-summary-cell>
						<a-table-summary-cell class="text-right bold text-primary">
							{{ dataSource?.totalAmounts?.supply.toLocaleString() }}
						</a-table-summary-cell>
						<a-table-summary-cell class="text-right bold text-primary">
							{{ dataSource?.totalAmounts?.vat.toLocaleString() }}
						</a-table-summary-cell>
						<a-table-summary-cell class="text-right bold text-primary">
							{{ dataSource?.totalAmounts?.tip.toLocaleString() }}
						</a-table-summary-cell>
						<a-table-summary-cell col-span="8"></a-table-summary-cell>
					</a-table-summary-row>
				</template>
			</a-table>
		</template>
		<template #modal>
			<confirm-modal
				:type="usePrivate.type === 'release' ? 'warning' : 'error'"
				:modal-title-text="
					usePrivate.type === 'release' ? '사적용도 해제' : '사적용도 처리'
				"
				:title="
					usePrivate.type === 'release'
						? '사적용도처리를 해제하시겠습니까?'
						: '사용내역을 사적용도로 처리할까요?'
				"
				:icon="
					() =>
						materialIcons(
							'mso',
							usePrivate.type === 'release' ? 'error_outline' : 'cancel'
						)
				"
				:showed="isConfirmModal"
				:data="usePrivate"
				@close="isConfirmModal = false"
				@submit="onPrivate"
			>
				<template #content>
					{{
						usePrivate.type === "release"
							? "사적비용처리해제시 다시 법인카드 미처리건으로 분류됩니다."
							: "사적비용처리시 법인카드 미처리건이 처리완료 됩니다."
					}}
				</template>
			</confirm-modal>
		</template>
	</page-layout>
</template>
