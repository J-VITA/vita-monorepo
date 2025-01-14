<script setup lang="ts">
import { iwxGrid } from "@iwx/ui"
import type { GridApi } from "@iwx/ui"
import { gridOptions, calculateTotalAmount, columnDefs } from "./type"
import type { TaxInvoiceFormState } from "./type"

const formState = defineModel<TaxInvoiceFormState>("formState", { required: true })

const gridApi = shallowRef<GridApi<any>>()

const onGridReady = (params: any) => {
	gridApi.value = params.api

	if (gridApi.value) {
		// rowData.value = data;
		// rowData.value = props.data;
	}
}

const onRowDragEnd = (params: any) => {
	console.log(params)
}

const addRow = () => {
	const newItems = [
		{
			type: "",
			taxCode: "",
			costCenter: "",
			accountName: "",
			projectName: "",
			debitAmount: 0,
			creditAmount: 0,
			note: "",
			proof: "",
		},
	]
	const res = gridApi.value!.applyTransaction({
		add: newItems,
		addIndex: formState.value.rowData.length + 1,
	})!
}

const onRemoveSelected = () => {
	const selectedData = gridApi.value!.getSelectedRows()
	const res = gridApi.value!.applyTransaction({ remove: selectedData })!
	console.log(res)
}
</script>
<template>
	<a-flex align="center" justify="space-between" class="mb-sm">
		<a-typography-title :level="5" class="mb-none">세부항목</a-typography-title>
		<a-space>
			<a-button :icon="materialIcons('mso', 'refresh')">초기화</a-button>
			<a-button
				ghost
				danger
				:icon="materialIcons('mso', 'delete')"
				@click="onRemoveSelected"
				>행삭제</a-button
			>
			<a-button :icon="materialIcons('mso', 'add_circle')" @click="addRow"
				>행추가</a-button
			>
		</a-space>
	</a-flex>

	<iwx-grid
		ref="gridApi"
		:grid-options="gridOptions"
		:column-defs="columnDefs"
		:row-data="formState?.rowData"
		:class="`ag-theme-quartz`"
		:style="{ width: '100%', height: '30rem' }"
		:cell-selection="false"
		:suppress-menu-hide="true"
		:stop-editing-when-cells-lose-focus="false"
		:pagination="false"
		:pinned-top-row-data="[
			{
				evidenceVendorName: '총 비용합계',
				totalAmount: calculateTotalAmount(formState?.rowData, 'totalAmount'),
			},
		]"
		@grid-ready="onGridReady"
		@row-drag-end="onRowDragEnd"
	/>
</template>
