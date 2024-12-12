<script lang="ts" setup>
import type { Response } from "@/types"
import { SelectPageTable } from "v-selectpage"
import type {
	PageParameters,
	FetchDataCallback,
	SelectPageTableColumn,
	SelectPageKey,
	FetchSelectedDataCallback,
} from "v-selectpage"

interface SelectData {
	url?: string
	keyProps: string
	labelProp?: string
	columns: SelectPageTableColumn[]
	params?: {}
	label?: string
	labelStyle?: any
	style?: any
	open?: boolean
	disabled?: boolean
	placeholder?: string
	refresh?: boolean
}

const props = withDefaults(defineProps<SelectData>(), {
	label: "",
	labelStyle: { flexShrink: 0 },
	columns: undefined,
	disabled: false,
	placeholder: "선택해주세요.",
	size: "auto",
	open: false,
	refresh: false,
})

const selectPage = ref()
const showTable = ref(true)

const modelValue = defineModel<Array<SelectPageKey>>("value")

const emit = defineEmits<{
	(e: "selection-change", value: any): any
	(e: "update:value", value: any): any
	(e: "remove", value: any): any
}>()

const search = async (params?: PageParameters) => {
	return await useCFetch<Response<any>>(`${props.url}`, {
		method: "GET",
		query: params
			? {
					...props.params,
					keyword: params?.search,
					page: params?.search ? 0 : params?.pageNumber > 0 ? params?.pageNumber - 1 : 0,
					size: params?.search ? 10 : params?.pageSize,
				}
			: { ...props.params },
	})
}

watch(
	() => props.open,
	(newOpen) => {
		if (newOpen) {
			refreshData()
		} else {
			selectPage.value?.removeAll()
		}
	}
)

watch(
	[() => props.refresh, () => props.url],
	([newRefresh, newUrl], [oldRefresh, oldUrl]) => {
		if (newRefresh || newUrl !== oldUrl) {
			refreshData()
		}
	}
)

const refreshData = () => {
	selectPage.value?.removeAll()
	// modelValue.value = [];

	showTable.value = false
	setTimeout(() => {
		showTable.value = true
	}, 0)
}

const onFetchData = (params: PageParameters, callback: FetchDataCallback) => {
	search(params).then((data) => {
		if (data) {
			callback(data.data, data?.totalElements || 0)
		}
	})
}

const fetchSelectedData = (
	keys: SelectPageKey[],
	callback: FetchSelectedDataCallback
) => {
	search().then((data) => {
		if (data && data.data) {
			const filteredData = data.data.filter((val: any) =>
				keys.includes(val[props.keyProps])
			)
			if (!filteredData || filteredData.length === 0) {
				modelValue.value = []
			}
			callback(filteredData)
		}
	})
}

const selectionChange = (data: any) => {
	emit("selection-change", data)
}
</script>

<template>
	<a-flex :gap="props.label ? 8 : 0" align="center">
		<label v-if="props.label" :for="props.label" :style="props.labelStyle">
			{{ props.label }}
		</label>

		<select-page-table
			v-if="showTable"
			ref="selectPage"
			v-model="modelValue"
			:label-prop="props.labelProp"
			:key-prop="props.keyProps"
			:columns="props.columns"
			:style="props.style"
			:placeholder="props.placeholder"
			@fetch-data="onFetchData"
			@selection-change="selectionChange"
			@remove="(val: any) => emit('remove', val)"
			@fetch-selected-data="fetchSelectedData"
			:disabled="props.disabled"
		>
		</select-page-table>
	</a-flex>
</template>
