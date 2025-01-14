<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { ColorTagValue, IconLink, StyleText } from "@/components/ui"
import { iwxGrid } from "@iwx/ui"
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"

import { Response, SlipType } from "@/types"
import type { Data } from "@/types/master/config"
import type { GridApi, GridOptions, ICellRendererParams, RowDragMoveEvent } from "@iwx/ui"
import { gridOptions, calculateTotalAmount } from "@/types/approvals/document"

type Props = {
	type: "write" | "read"
}

const showExpenseModal = ref<boolean>(false)
const selectedData = ref<any>(undefined)
const selectedSlipType = ref<SlipType>(SlipType.PERSONAL_EXPENSE)
const { getRules } = useExpenseRules()
const rules = ref<any>()

const rowData = defineModel<any>("rowData")
const { type } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:data", value: any): any
	(e: "onHistory", value: boolean): any
	(e: "onDetail", value: any): void
	(e: "reloadData"): void
	(e: "onDraft", value: any): any
}>()

const gridApi = shallowRef<GridApi<any>>()
const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "slipTypeName",
		headerName: "지출유형",
		hide: true,
	},
	{
		field: "accountingDate",
		headerName: "사용일",
		type: "default",
		cellClass: "ag-left-cell",
		rowDrag: (params) => type === "write" && !params.node.group,
	},
	{
		field: "slipEvidenceName",
		headerName: "전표유형",
		type: "default",
	},
	{
		field: "evidenceVendorName",
		headerName: "사용자",
		type: "default",
	},
	{
		field: "totalAmount",
		headerName: "금액",
		type: ["default", "currency"],
		cellRenderer: ColorTagValue,
		cellRendererParams: (params: ICellRendererParams) => {
			return {
				params,
				color: "red",
				text: "분할",
				disabled: params.node?.data?.divisionSlipFlag,
				value: params.valueFormatted,
			}
		},
		cellRendererSelector: (params) => {
			if (params.node.rowPinned) {
				return {
					component: StyleText,
					params: {
						style: { color: "#6146e5", fontWeight: "bold" },
						value: params.valueFormatted,
					},
				}
			}
		},
	},
	{
		field: "accountName",
		headerName: "계정과목/비용항목",
		type: "default",
	},
	{
		field: "costCenterName",
		headerName: "코스트센터",
		type: "default",
	},
	{
		field: "description",
		headerName: "내용",
		type: "default",
	},
	{
		field: "id",
		headerName: "기능",
		type: "action",
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = type === "write" ? ["edit", "delete"] : "quick_reference_all"
			return {
				params,
				icon,
				onClick: onAction,
			}
		},
	},
])

const onAction = (params: any, actionType?: string) => {
	if (type === "write") {
		console.log(type)
		console.log(params)
		if (actionType === "edit") {
			selectedData.value = params
			// 지출작성 수정모달
			console.log("지출작성 수정 모달 오픈")
			showExpenseModal.value = true
		} else {
			// row 삭제
			Modal.confirm({
				title: "해당 지출내역을 삭제하시겠습니까?",
				icon: createVNode(ExclamationCircleOutlined),
				type: "error",
				okText: "확인",
				cancelText: "취소",
				onOk() {
					nextTick(() => {
						rowData.value = rowData.value.filter((e: any) => e.id !== params.id)

						emit(
							"onDraft",
							rowData.value.filter((e: any) => e.id !== params.id)
						)
					})
				},
				onCancel() {
					console.log("Cancel")
				},
			})
		}
	} else {
		// 지출내역 상세 모달 오픈
		emit("onDetail", params)
	}
}

/**
 * onRowDragEnd
 * row drag 가 끝나는 시점에 row 위치 변경
 */
const onRowDragEnd = (event: RowDragMoveEvent) => {
	// console.log('Row drag end event:', event);

	const movingNode = event.node
	const overNode = event.overNode

	// Restrict movement between groups if necessary
	if (movingNode.data.slipType !== overNode?.data.slipType) {
		console.log("Movement between groups is not allowed.")
		return
	}

	// Ensure the rows are moved both up and down
	if (overNode) {
		const movingData = { ...movingNode.data }
		const overData = { ...overNode.data }

		// Reorder rows by swapping their positions
		const rowDataClone = [...rowData.value]
		const movingIndex = rowDataClone.findIndex((item) => item.id === movingData.id)
		const overIndex = rowDataClone.findIndex((item) => item.id === overData.id)

		if (movingIndex >= 0 && overIndex >= 0) {
			rowDataClone.splice(movingIndex, 1) // Remove the moving row
			rowDataClone.splice(overIndex, 0, movingData) // Insert it at the new position

			rowData.value = rowDataClone
			emit("update:data", rowDataClone)
		}
	}
}

const onGridReady = (params: any) => {
	gridApi.value = params.api

	if (gridApi.value) {
		// rowData.value = data;
		// rowData.value = props.data;
	}
}

const onUpdateModal = (value: boolean) => {
	showExpenseModal.value = value
	if (!value) {
		emit("reloadData")
		selectedData.value = undefined
	}
}

onMounted(() => {
	getRules().then((res: Response<Data>) => {
		rules.value = { ...res.data }
	})
})
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none">
			출장비용목록
		</a-typography-title>
		<a-button
			v-if="type === 'write'"
			:icon="materialIcons('mso', 'receipt_long')"
			@click="$emit('onHistory', true)"
		>
			지출내역 불러오기
		</a-button>
	</a-flex>

	<iwx-grid
		:grid-options="gridOptions"
		:column-defs="columnDefs"
		:row-data="rowData"
		:class="`ag-theme-quartz`"
		:style="{ width: '100%', height: '40rem' }"
		:cell-selection="false"
		:suppress-menu-hide="true"
		:stop-editing-when-cells-lose-focus="false"
		:pagination="false"
		:pinned-bottom-row-data="[
			{
				evidenceVendorName: '총 비용합계',
				totalAmount: calculateTotalAmount(rowData, 'totalAmount'),
			},
		]"
		@grid-ready="onGridReady"
		@row-drag-end="onRowDragEnd"
	/>

	<expense-modal
		:show="showExpenseModal"
		:expense-rules="rules"
		:form-slip-type="selectedSlipType"
		:slip-data="selectedData"
		:current-page-data-list="
			_orderBy(removeDuplicatesByKey((rowData ??= []), 'id'), ['id'], ['asc'])
		"
		@update:show="onUpdateModal"
	/>
</template>
