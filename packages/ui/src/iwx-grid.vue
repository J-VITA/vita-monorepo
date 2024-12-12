<script setup lang="ts">
import { AgGridVue } from "ag-grid-vue3" // AG Grid Component

const props = withDefaults(
	defineProps<{
		rowData?: any
		colDefs?: any
		options?: any
		styles?: any
		class?: string
		defaultColDef?: any
		paginationAutoPageSize?: boolean
		pagination?: boolean
		frameworkComponents?: any
		suppressMenuHide: boolean
		stopEditingWhenCellsLoseFocus: boolean
		cellSelection?: boolean
		rowModelType?: string
	}>(),
	{
		rowData: {},
		colDefs: {},
		options: {},
		defaultColDef: {},
		paginationAutoPageSize: false,
		pagination: false,
		suppressMenuHide: false,
		stopEditingWhenCellsLoseFocus: false,
		cellSelection: false,
	}
)

const emit = defineEmits<{
	// (e: 'bodyScroll', value: any): void,
	// (e: 'rowDataChanged', value: any): void
	// (e: 'columnMoved', value: any) : any,
	(e: "gridReady", value: any): any
}>()

// const onColumnMoved = (event: any) => {

//   const columnState = event.columnApi.getColumnState();

//   localStorage.setItem('userColumnStateTest', JSON.stringify(columnState));

//   emit('columnMoved', event);
// };

// const onGridReady = async (params: any) => {
//   const savedColumnState = localStorage.getItem('userColumnStateTest')

//   if(savedColumnState) {
//     params.columnApi.applyColumnState({ state: JSON.stringify(savedColumnState), applyOrder: true });
//   }

//   emit('gridReady', params);

// };
</script>

<template>
	<ag-grid-vue
		:rowData="props.rowData ? props.rowData : undefined"
		:columnDefs="props.colDefs"
		:gridOptions="props.options"
		:default-col-def="props.defaultColDef"
		:style="props.styles"
		:class="props.class"
		@grid-ready="(params: any) => emit('gridReady', params)"
		:frameworkComponents="props.frameworkComponents"
		:paginationAutoPageSize="props.paginationAutoPageSize"
		:pagination="props.pagination"
		:row-model-type="props.rowModelType"
		:suppressMenuHide="props.suppressMenuHide"
		:stopEditingWhenCellsLoseFocus="props.stopEditingWhenCellsLoseFocus"
		:cellSelection="props.cellSelection"
	/>
</template>
