<script lang="ts" setup>
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { classifications, states } from "@/types/expenses"
import { Response, RequestParams, SlipFormType, pagination, pageSize } from "@/types"
import { type ExpenseList } from "@/types/expenses"

const props = withDefaults(defineProps<{ show: boolean; userId?: number | string }>(), {
	show: false,
})

const approvalFormType = defineModel<SlipFormType>("type", {
	required: true,
})

const emit = defineEmits<{
	(e: "update:show", value: boolean): boolean
	(e: "bring", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])

const okButtonDisabled = computed(() => {
	return selectedRowKeys.value && selectedRowKeys.value.length > 0
})

// const monthType = ref<number | undefined>(undefined);
const filterDate = ref<[Dayjs, Dayjs]>([useMonth.from(), useMonth.to()])
// const searchParams = ref<any>({
//   slipType: '전체',
//   slipStatuse: 'COMPLETE',
//   companyCode: getCompanyCode.value,
//   pageNumber: 0,
//   size: 10,
// });
interface ISearchParams {
	companyCode: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	slipType: string
	slipStatus: string
	accountId: number | string //계정과목식별자
	accountName: string //계정과목명
	projectId: number | string //프로젝트 식별자
	projectName: string //프로젝트명
	costCenterId: number | string //코스트센터 식별자
	costCenterName: string //코스트센터명
	amountFrom: number | string //시작금액
	amountTo: number | string //종료금액
	employeeId: number | string //사용자 식별자
	month: number
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
	slipType: approvalFormType.value,
	slipStatus: "COMPLETE",
	accountId: undefined, //계정과목식별자
	accountName: undefined, //계정과목명
	projectId: undefined, //프로젝트 식별자
	projectName: undefined, //프로젝트명
	costCenterId: undefined, //코스트센터 식별자
	costCenterName: undefined, //코스트센터명
	amountFrom: undefined, //시작금액
	amountTo: undefined, //종료금액
	employeeId: props.userId, //사용자 식별자
	month: 0,
})
const paginationParam = ref({ pageNum: 0 })

const columns = ref<ColumnsType<any>>([
	{
		title: "지출유형",
		dataIndex: "slipTypeName",
		resizable: true,
		// sorter: true,
		width: 100,
		align: "center",
	},
	{
		title: "회계일자",
		dataIndex: "accountingDate",
		resizable: true,
		// sorter: true,
		width: 100,
		align: "center",
	},
	{
		title: "상호명(거래처)",
		dataIndex: "evidenceVendorName",
		resizable: true,
		// sorter: true,
		width: -1,
	},
	{
		title: "금액",
		dataIndex: "totalAmount",
		resizable: true,
		// sorter: true,
		align: "right",
		width: -1,
	},
	{
		title: "계정과목/비용항목",
		dataIndex: "accountName",
		resizable: true,
		// sorter: true,
		width: -1,
	},
	{
		title: "상태",
		dataIndex: "slipStatusName",
		resizable: true,
		// sorter: true,
		align: "center",
		width: -1,
	},
])

const {
	data: taxinvoiceList,
	status: taxinvoiceListStatus,
	refresh: taxinvoiceListRefresh,
} = await useAsyncData(
	`modal-slip-tax-invoice-list`,
	async () =>
		useCFetch<Response<Array<ExpenseList>>>("/api/v2/slip/expenses", {
			method: "GET",
			params: {
				page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
				...searchParams.value,
			},
		}).then((data: Response<Array<ExpenseList>>) => {
			data.data = data.data?.map((x: any, index: number) => {
				return {
					...x,
					index,
				}
			})
			return data as any
		}),
	{ watch: [paginationParam.value] }
)

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any) => {
	paginationParam.value.pageNum = pagination.current
	searchParams.value.pageNumber = pagination.current
	searchParams.value.size = pagination.pageSize
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
}

const onAction = () => {
	console.log("bring onAction")
	emit("bring", selectedRows.value)
	open.value = false
}

const changeMonth = (e: any) => {
	const from = e.target.value === 1 ? useMonth.lastFrom() : useMonth.from()
	const to = e.target.value === 1 ? useMonth.lastTo() : useMonth.to()

	filterDate.value = [from, to]
	searchParams.value.searchDateFrom = from.format("YYYY-MM-DD")
	searchParams.value.searchDateTo = to.format("YYYY-MM-DD")
}

const onSearch = (data: any) => {
	console.log("search action", data)
	taxinvoiceListRefresh()
}

onBeforeUpdate(() => {
	if (open.value) {
	}
})

onMounted(() => {
	if (open.value) {
		selectedRowKeys.value = []
		selectedRows.value = []

		filterDate.value = [useMonth.lastFrom(), useMonth.to()]
		searchParams.value.searchDateFrom = useMonth.lastFrom().format("YYYY-MM-DD")
		searchParams.value.searchDateTo = useMonth.to().format("YYYY-MM-DD")

		taxinvoiceListRefresh()
	}
})
</script>
<template>
	<a-modal
		centered
		width="80%"
		v-model:open="open"
		title="지출 내역 불러오기"
		:destroy-on-close="true"
		:ok-button-props="{ disabled: !okButtonDisabled }"
		@ok="onAction"
	>
		<a-row :gutter="[10, 5]" wrap class="mb-sm">
			<a-col>
				<a-space>
					<label>기간설정</label>
					<a-range-picker
						v-model:value="filterDate"
						@change="
							(_, dateString) => {
								searchParams.month = undefined
								searchParams.searchDateFrom = dateString[0]
								searchParams.searchDateTo = dateString[1]
							}
						"
					/>
					<a-radio-group
						class=""
						v-model:value="searchParams.month"
						option-type="button"
						:options="[
							{ label: '당월', value: 0 },
							{ label: '전월', value: 1 },
						]"
						@change="changeMonth"
					/>
				</a-space>
			</a-col>
			<a-col>
				<eacc-select
					style="width: 12rem"
					url="/api/v2/slip/expenses/types/slipTypes"
					v-model:value="searchParams.slipType"
					:field-names="{ label: 'label', value: 'code' }"
					:on-all-field="true"
					label="전표유형"
					@update:value="(value) => (searchParams.slipType = value)"
					disabled
				/>
			</a-col>
			<a-col>
				<eacc-select
					style="width: 12rem"
					url="/api/v2/slip/expenses/types/slipStatuses"
					v-model:value="searchParams.slipStatus"
					:disabled="true"
					:field-names="{ label: 'label', value: 'code' }"
					:on-all-field="false"
					label="상태"
					@update:value="(value) => (searchParams.slipStatus = value)"
				/>
			</a-col>
			<a-col>
				<eacc-button
					component-is="search"
					:modal-open="false"
					:data="searchParams"
					@click="onSearch"
					size="middle"
				/>
			</a-col>
		</a-row>
		<a-table
			size="small"
			:loading="taxinvoiceListStatus === 'pending'"
			:columns="columns"
			:show-sorter-tooltip="false"
			:data-source="taxinvoiceList.data"
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
					pageSize: taxinvoiceList?.size,
					total: taxinvoiceList?.totalElements,
				})
			"
			@change="cellChange"
			@resizeColumn="handleResizeColumn"
		>
			<template #headerCell="{ title }">
				<div class="text-center">{{ title }}</div>
			</template>
			<template #bodyCell="{ column, text, record }">
				<template v-if="column.dataIndex === 'slipTypeName'">
					<a-tag :color="classifications[text].color">
						{{ classifications[text].text }}
					</a-tag>
				</template>
				<template v-else-if="column.dataIndex === 'totalAmount'">
					<a-tag color="red" v-if="record.divisionSlipFlag">분할</a-tag>
					<a-typography-text strong>
						{{ Number(text).toLocaleString() }}
					</a-typography-text>
				</template>
				<template v-else-if="column.dataIndex === 'slipStatusName'">
					<a-badge v-if="text" :color="states[text]?.color" :text="states[text]?.text" />
				</template>
				<template v-else>
					{{ text }}
				</template>
			</template>
		</a-table>
	</a-modal>
</template>
