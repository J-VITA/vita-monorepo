<script setup lang="ts">
import { AgCharts } from "ag-charts-vue3"

const props = withDefaults(
	defineProps<{
		options?: any
	}>(),
	{
		options: {},
	}
)

const emit = defineEmits<{
	// (e: "gridReady", value: any): any
}>()
</script>

<template>
	<ag-charts :options="props.options" style="width: 100%; height: 100%"> </ag-charts>
</template>

<style>
/* .cell-span {
	background-color: #f0f0f0;
	border-bottom: none !important;
	overflow: visible;
} */
</style>
