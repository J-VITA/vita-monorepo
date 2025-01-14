<script setup lang="ts">
import {
	type FormData,
	gridOptions,
	calculateTotalAmount,
} from "@/types/approvals/document"
import type { GridApi, GridOptions, ICellRendererParams, RowDragMoveEvent } from "@iwx/ui"
import { IconLink, ColorTag } from "@/components/ui"
import { BudgetApplyData, options } from "@/types/budgets"
import { iwxGrid } from "@iwx/ui"

type Props = {
	approvalId: string | number
}
const { approvalId } = defineProps<Props>()
const { getColumns } = useAgGridColumn()

const cacheBlockSize = ref(10)
const gridKey = ref(0)
const rowModelType = ref("serverSide")
const gridApi = ref<any>(null)
let columnApi: any = null
const defaultColDef = ref({
	filter: false,
	sortable: false,
})

const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "applyInfo",
		headerName: "신청정보",
		children: [
			{
				field: "budgetRequestType.code",
				headerName: "유형",
				type: "default",
				cellClass: "ag-left-cell",
				// rowDrag: (params) => !params.node.group,
				cellRenderer: ColorTag,
				cellRendererParams: (params: ICellRendererParams) => {
					const color = params.value
						? options.budget.filter((e) => e.value === params.value)[0].color
						: ""
					const text = params.value
						? options.budget.filter((e) => e.value === params.value)[0].label
						: ""
					return {
						params,
						color,
						text,
					}
				},
			},
			{
				field: "requestAmount",
				headerName: "신청금액",
				type: "default",
				valueFormatter: (params: any) => {
					const value = params.value
					if (value == null || value === "") return ""
					// 숫자 값을 3자리마다 콤마로 구분
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
				},
			},
		],
	},
	{
		field: "fromInfo",
		headerName: "주는대상",
		children: [
			{
				field: "fromYearMonth",
				headerName: "예산년월",
				type: "default",
			},
			{
				field: "fromCostCenter.name",
				headerName: "코스트센터",
				type: "default",
			},
			{
				field: "fromAccount.name",
				headerName: "계정비용/항목",
				type: "default",
			},
		],
	},
	{
		field: "ToInfo",
		headerName: "받는대상",
		children: [
			{
				field: "toYearMonth",
				headerName: "예산년월",
				type: "default",
			},
			{
				field: "toCostCenter.name",
				headerName: "코스트센터",
				type: "default",
			},
			{
				field: "toAccount.name",
				headerName: "계정비용/항목",
				type: "default",
			},
		],
	},
])
/**
 * 예산 요청 목록 조회
 * @param budgetApplyData
 */
const {
	data: budgetApplyData,
	status: budgetApplyStatus,
	refresh: budgetApplyRefresh,
} = await useAsyncData(`budget-request-approvals-list`, () =>
	useCFetch<any>(`/api/v2/budgets/request/approvals/${approvalId}`, {
		method: "GET",
		params: { approvalId: approvalId },
	}).then((res: any) => res.data)
)

const onGridReady = async (params: any) => {
	gridApi.value = params.api
	columnApi = params.columnApi

	const datasource = {
		getRows: async (params: any) => {
			const rowData = budgetApplyData.value
			params.success({
				rowData,
			})
		},
	}
	gridApi.value.setGridOption("serverSideDatasource", datasource)

	const savedColumnState = await Promise.race([getColumns("userColumnState")])

	if (savedColumnState) {
		gridApi.value.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

const onGridDestroyed = () => {
	gridKey.value++
}

const pinnedBottomRowData = computed(() => {
	return [
		{
			requestAmount: "신청금액 합계",
			fromYearMonth: calculateTotalAmount(budgetApplyData.value, "requestAmount")
				.toString()
				.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
		},
	]
})

onMounted(() => {
	onGridDestroyed()
})
</script>

<template>
	<a-typography-title :level="4" class="ml-none mb-none">
		예산신청목록
	</a-typography-title>
	<iwx-grid
		:key="gridKey"
		:grid-options="gridOptions"
		:column-defs="columnDefs"
		:default-col-def="defaultColDef"
		:class="`ag-theme-quartz`"
		:style="{ width: '100%', height: '40rem' }"
		:cell-selection="false"
		:suppress-menu-hide="true"
		:stop-editing-when-cells-lose-focus="false"
		:row-model-type="rowModelType"
		:cacheBlockSize="cacheBlockSize"
		:pagination="false"
		:pinned-bottom-row-data="pinnedBottomRowData"
		@grid-ready="onGridReady"
	/>
</template>
