<script setup lang="ts">
import {
	ExViewParams,
	generateSortParams,
	OsType,
	pagination,
	Response,
	SortType,
	SortTypes,
	dateTimeFormat,
} from "@/types"
import type { Dayjs } from "dayjs"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import {
	cardUseState,
	CardUseStateType,
	ICardHistoryResponse,
	ICardHistoryResponseParams,
	useCardHistoryColumns,
	useCardHistoryResponse,
	useCardHistorySearch,
	validateCardUsageItems,
} from "@/types/expenses/commons/card-history"

const { $dayjs } = useNuxtApp()

type PropsCardHistoryType = {
	show: boolean
}
type PropsCardHistoryBrand = "PropsCardHistoryBrand"

const props = defineProps<{
	params: ExViewParams<PropsCardHistoryType, PropsCardHistoryBrand>
}>()

const authStore = useAuthStore()
const { getEmployeeId, getCompanyCode } = storeToRefs(authStore)

const open = computed({
	get() {
		return props.params.show
	},
	set(value: boolean) {
		emit("update:params", { ...props.params, show: value })
	},
})

const emit = defineEmits<{
	(
		e: "update:params",
		value: ExViewParams<PropsCardHistoryType, PropsCardHistoryBrand>
	): void
}>()

const { searchParams, updateSearchParams } = useCardHistorySearch()

const onChangeMonth = (e: any) => {
	const { value } = e.target

	const rangeDate: [Dayjs, Dayjs] =
		value === "당월"
			? [useMonth.from(), useMonth.to()]
			: [useMonth.lastFrom(), useMonth.to()]

	updateSearchParams({
		filterDate: rangeDate,
		pageNumber: 0,
		searchDateFrom: $dayjs(rangeDate[0]).format("YYYY-MM-DD"), //시작일
		searchDateTo: $dayjs(rangeDate[1]).format("YYYY-MM-DD"), //종료일
	})
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		searchDateFrom: dateString[0], //시작일
		searchDateTo: dateString[1], //종료일
	})
}

const modalCancle = async (value: any) => {
	open.value = false
}

/**
 * 법인카드 사용내역 정보 저장
 */
const postConvertToSlip = async (items: ICardHistoryResponseParams[]) => {
	try {
		validateCardUsageItems(items, [CardUseStateType.UNPROCESSED])

		const response = await useCFetch<Response<any>>(
			`/api/v2/slips/expenses/card/convert-to-slip`,
			{
				method: "POST",
				body: {
					companyCode: getCompanyCode.value,
					cardUsageIds: items.map((item) => ({ id: item.id })),
					osType: OsType.WEB,
					employeeId: getEmployeeId.value,
				},
			}
		)

		if (response.status === 0) {
			message.success(response.message)
			selectedRowKeys.value = []
			selectedRows.value = []
			open.value = false
		}
	} catch (e: any) {
		message.error(`${e.message}`)
	}
}

/**
 * 사직용도 처리
 */
const patchPrivateProcess = async (items: ICardHistoryResponseParams[]) => {
	try {
		validateCardUsageItems(items, [CardUseStateType.UNPROCESSED])

		const response = await useCFetch<Response<any>>(
			`/api/v2/slips/expenses/private/process`,
			{
				method: "PATCH",
				body: {
					companyCode: getCompanyCode.value,
					cardUsageIds: items.map((item) => ({ id: item.id })),
				},
			}
		)

		if (response.status === 0) {
			message.success(response.message)
			selectedRowKeys.value = []
			selectedRows.value = []
			usageCardRefresh()
		}
	} catch (e: any) {
		message.error(`${e.message}`)
	}
}

/**
 * 사직용도 해제
 */
const patchPrivateRelease = async (items: ICardHistoryResponseParams[]) => {
	try {
		validateCardUsageItems(items, [CardUseStateType.PERSONAL_EXPENSE_PROCESSED])

		const response = await useCFetch<Response<any>>(
			`/api/v2/slips/expenses/private/release`,
			{
				method: "PATCH",
				body: {
					companyCode: getCompanyCode.value,
					cardUsageIds: items.map((item) => ({ id: item.id })),
				},
			}
		)

		if (response.status === 0) {
			message.success(response.message)
			selectedRowKeys.value = []
			selectedRows.value = []
			usageCardRefresh()
		}
	} catch (e: any) {
		message.error(`${e.message}`)
	}
}

const columns = useCardHistoryColumns()

const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<ICardHistoryResponseParams[]>([])

const onSelectChange = async (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows as ICardHistoryResponse
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const { current, pageSize } = pagination
	const sortParams = generateSortParams(sorter)

	updateSearchParams({
		sort: sortParams,
		pageNumber: current,
		size: pageSize,
	})
}

const onFinish = (values: any) => {
	usageCardRefresh()
}

const onFinishFailed = (errorInfo: any) => {}

const { data: myCards, refresh: myCardsRefresh } = await useAsyncData(
	`slips-commons-my-cards-${getEmployeeId.value}`,
	async () => {
		const response = await useCFetch<Response<Array<any>>>(
			`/api/v2/slips/expenses/my-cards`,
			{
				method: "GET",
				params: {
					companyCode: getCompanyCode.value,
					employeeId: getEmployeeId.value,
					startDate: searchParams.value.searchDateFrom,
					endDate: searchParams.value.searchDateTo,
				},
			}
		)
		if (response.status !== 0) {
			throw new Error(response.message)
		}
		if (response.data && response.data.length > 0) {
			updateSearchParams({
				companyCode: response.data[0].companyCode,
				cardNumber: response.data[0].number,
				ownerId: response.data[0].ownerId,
			})
		}
		return response || []
	},
	{
		transform: (response: Response<Array<any>>) => ({
			...response,
			data: response.data?.map((card: any) => {
				card.customLabel = `${formatCardNumber(card.number)}(${card.cardCompanyTypeLabel})`
				return card
			}),
		}),
	}
)

const { data: cardOptions } = await useAsyncData(
	`card-usages-types-card-use-state-type-modal`,
	async () => {
		const response = await useCFetch<Response<Array<any>>>(
			`/api/v2/cards/usages/types/CardUseStateType`,
			{ method: "GET" }
		)
		if (response.status !== 0) {
			throw new Error(response.message)
		}
		if (response.data && response.data.length > 0) {
			updateSearchParams({
				cardUseStateType: response.data[0].code,
			})
		}
		return response || []
	},
	{
		transform: (response: Response<Array<any>>) => response,
	}
)

const {
	responseData: usageCardData,
	updateResponseData: updateUsageCardData,
	clearResponseData: clearUsageCardData,
} = useCardHistoryResponse()

const {
	data: usageCard,
	execute: usageCardExcute,
	refresh: usageCardRefresh,
	status: usageCardStatus,
} = await useAsyncData(
	`slips-commons-expenses-card-usages-list-modal`,
	async () => {
		const response = await useCFetch<Response<ICardHistoryResponse>>(
			`/api/v2/slips/expenses/card-usages/list`,
			{
				method: "GET",
				params: {
					companyCode: searchParams.value.companyCode,
					cardNumber: searchParams.value.cardNumber,
					// cardOwnerId: 124,//searchParams.value.ownerId,
					cardUseStateType: searchParams.value.cardUseStateType,
					approvalDateFrom: searchParams.value.searchDateFrom,
					approvalDateTo: searchParams.value.searchDateTo,
					page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
					size: searchParams.value.size,
					sort: searchParams.value.sort,
				},
			}
		)
		if (response.status !== 0) {
			throw new Error(response.message)
		}

		if (response) {
			updateUsageCardData(response.data as ICardHistoryResponse)
		}
		return response || []
	},
	{
		transform: (response: Response<ICardHistoryResponse>) => ({
			...response,
			data: response.data?.map((data: any) => {
				data.merchantAddress = `${data.merchantAddress1} ${data.merchantAddress2}`
				return data
			}),
		}),
		watch: [searchParams],
		immediate: true,
		deep: true,
	}
)
</script>
<template>
	<a-modal
		width="120rem"
		centered
		v-model:open="open"
		:destroy-on-close="false"
		:mask-closable="false"
		:keyboard="false"
		ok-text="불러오기"
		@cancel="modalCancle"
	>
		<template #title>
			<a-flex justify="space-between" align="center">
				<a-typography-title :level="4" class="page-title"
					>개인카드 사용내역 불러오기</a-typography-title
				>
			</a-flex>
		</template>
		<a-form
			ref="formRef"
			name="cardForm"
			label-align="left"
			:model="searchParams"
			:colon="false"
			:disabled="false"
			@finish="onFinish"
			@finishFailed="onFinishFailed"
		>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-form-item
						label="기간설정"
						name="filterDate"
						:rules="[
							{
								required: true,
								message: '필수 입력값 입니다.',
								type: 'array',
								trigger: 'change',
							},
						]"
					>
						<a-space>
							<a-range-picker
								v-model:value="searchParams.filterDate"
								:value-format="dateTimeFormat"
								@change="onChangeRangePicker"
							/>
						</a-space>
					</a-form-item>
				</a-col>
				<a-col>
					<a-radio-group
						option-type="button"
						v-model:value="searchParams.month"
						:options="[
							{ label: '당월', value: '당월' },
							{ label: '전월', value: '전월' },
						]"
						@change="onChangeMonth"
					/>
				</a-col>
				<a-col>
					<a-form-item label="카드선택" name="cardNumber" :rules="[{ required: false }]">
						<a-select
							style="width: 24rem"
							v-model:value="searchParams.cardNumber"
							:options="myCards?.data"
							:field-names="{
								label: 'customLabel',
								value: 'number',
							}"
						/>
					</a-form-item>
				</a-col>
				<a-col>
					<a-form-item
						label="상태"
						name="cardUseStateType"
						:rules="[{ required: false }]"
					>
						<a-select
							style="width: 12rem"
							v-model:value="searchParams.cardUseStateType"
							:options="cardOptions?.data"
							:field-names="{
								label: 'label',
								value: 'code',
							}"
						/>
					</a-form-item>
				</a-col>
				<a-col>
					<a-form-item>
						<eacc-button
							component-is="search"
							size="middle"
							:modal-open="false"
							:data="searchParams"
							html-type="submit"
						/>
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
		<a-divider class="my-md" />

		<a-table
			size="small"
			:columns="columns"
			:show-sorter-tooltip="false"
			:pagination="
				Object.assign({}, pagination, {
					current:
						searchParams.pageNumber === 0
							? searchParams.pageNumber + 1
							: searchParams.pageNumber,
					pageSize: searchParams.size,
					total: usageCard?.totalElements,
				})
			"
			:loading="usageCardStatus === 'pending'"
			:data-source="usageCardData"
			:scroll="{ x: '200rem', y: '40rem' }"
			:row-key="(record: any) => record.id"
			:row-selection="{
				selectedRowKeys: selectedRowKeys,
				onChange: onSelectChange,
				getCheckboxProps: (record: any) => ({
					disabled: ['COMPLETED', 'IN_PROGRESS'].includes(record.cardUseStateTypeName),
				}),
			}"
			@resize-column="handleResizeColumn"
			@change="cellChange"
		>
			<template #bodyCell="{ column, text, record }">
				<template v-if="column.dataIndex === 'cardUseStateTypeName'">
					<a-tag :color="cardUseState[text].color">
						{{ cardUseState[text].text }}
					</a-tag>
				</template>
				<template v-if="column.dataIndex === 'purchaseDate'">
					<span>{{ record.purchaseDate }} {{ record.purchaseTime.slice(0, 5) }}</span>
				</template>
				<template v-if="column.dataIndex === 'merchantName'">
					<a-typography-text
						:ellipsis="{
							tooltip: text,
						}"
						:content="text"
					>
					</a-typography-text>
				</template>
				<template v-if="column.dataIndex === 'merchantAddress'">
					<a-typography-text
						:ellipsis="{
							tooltip: text,
						}"
						:content="text"
					>
					</a-typography-text>
				</template>
			</template>
		</a-table>

		<template #footer>
			<a-flex align="center" justify="space-between" :gap="10">
				<a-flex align="center" justify="flex-start">
					<a-button
						type="primary"
						ghost
						@click.prevent="patchPrivateRelease(selectedRows)"
					>
						<template #icon>
							<component :is="materialIcons('mso', 'restart_alt')"></component>
						</template>
						사적비용해제
					</a-button>
					<a-button
						type="primary"
						danger
						@click.prevent="patchPrivateProcess(selectedRows)"
					>
						<template #icon>
							<component :is="materialIcons('mso', 'edit')"></component>
						</template>
						사적비용처리
					</a-button>
				</a-flex>
				<a-flex align="center" justify="flex-end">
					<a-button type="primary" ghost @click.prevent="modalCancle">취소</a-button>
					<a-button type="primary" @click.prevent="postConvertToSlip(selectedRows)">
						불러오기
					</a-button>
				</a-flex>
			</a-flex>
		</template>
	</a-modal>
</template>
