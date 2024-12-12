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
/**
 * select v-model:value 값
 * @param v-model
 */
const modelValue = defineModel<Array<SelectPageKey>>("value")

/**
 * select v-model:value 값이 변경 될 때 리턴
 * @return value 반환 (key)
 */
// const emit = defineEmits(['update:value']);
const emit = defineEmits<{
	(e: "update:value", value: any): any
	(e: "selection-change", value: any): any
}>()
/**
 * label & value(key) for Select Option Type
 */
// type SelectField = {
//   label: string;
//   value: string;
// };
interface SelectData {
	/** API 호출 url */
	url?: string
	/** value 로 받을 데이터 및 구분 키값 */
	keyProps: string
	/** Tag에 보여질 항목 설정 값
	 * defalut : name
	 */
	labelProp?: string
	/**
	 *select option columns
	 * @param SelectPageTableColumn
	 * { title: string, data: string | Function, width?: number | string }
	 */
	columns: SelectPageTableColumn[]
	/** 요청 파라미터 */
	params?: {}
	/** select label 명 */
	label?: string
	/** label style */
	labelStyle?: any
	/** style */
	style?: any
	/** disabled */
	disabled?: boolean
	/** placeholder */
	placeholder?: string
	/** refresh */
	refresh?: boolean
	/** open */
	open?: boolean
}

const props = withDefaults(defineProps<SelectData>(), {
	label: "",
	columns: undefined,
	labelStyle: { width: "30%", "margin-right": "8px" },
	// style: { width: '60%' },
	disabled: false,
	placeholder: "선택해주세요.",
	size: "auto",
	refresh: false,
	open: false,
})

const selectMulitPage = ref()
const showTable = ref(true)

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
			selectMulitPage.value?.removeAll()
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
	selectMulitPage.value?.removeAll()
	modelValue.value = []

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
			ref="selectMulitPage"
			multiple
			v-model="modelValue"
			:label-prop="labelProp"
			:key-prop="props.keyProps"
			:columns="props.columns"
			:style="props.style ? props.style : {}"
			:disabled="props.disabled"
			:placeholder="props.placeholder"
			@fetch-data="onFetchData"
			@fetch-selected-data="fetchSelectedData"
			@selection-change="(val: any) => selectionChange(val)"
		/>
	</a-flex>
</template>
