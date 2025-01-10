<script lang="ts" setup>
import type { Response } from "@/types"

/**
 * select v-model:value 값이 변경 될 때 리턴
 * @return value 반환 (key)
 */
// const emit = defineEmits(['update:value']);
const emit = defineEmits<{
	(e: "update:value", value?: any): string & number
	(e: "update:anyValue", value?: any): any
	(e: "onOptions", value?: Array<any>): Array<any>
}>()
/**
 * label & value(key) for Select Option Type
 */
type SelectField = {
	label: string
	value: string
}

interface SelectData {
	/** API 호출 url */
	url: string
	/**
	 * select option 라벨과 키값 세팅
	 * @param SelectField
	 * * { label: string, value: string }
	 */
	fieldNames: SelectField
	/** select label class */
	labelClass?: string
	/** select label 명 */
	label?: string
	/** label style */
	labelStyle?: any
	/** style */
	style?: any
	/** style */
	gap?: number
	/** 전체 필드 추가 옵션 */
	onAllField?: boolean
	/** refresh */
	refresh?: boolean
	/** disabled */
	disabled?: boolean
	/** 요청 파라미터 셋업 */
	params?: {}
	/** placeholder */
	placeholder?: string
	/** 반환 타입 선택(string, number, boolean, any */
	valueType?: "any" | "string" | "number" | undefined
	/** first '참' 일 경우 options 값의 첫번재 값을 default 셋업 */
	first?: boolean
	showSearch?: boolean
	showArrow?: boolean
	filterValues?: string[]
}

const props = withDefaults(defineProps<SelectData>(), {
	label: "",
	labelClass: "",
	onAllField: true,
	refresh: false,
	disabled: false,
	gap: 8,
	valueType: undefined,
	first: false,
	showSearch: false,
	showArrow: true,
})

const key = props.fieldNames.value
const label = props.fieldNames.label

const options = ref<Array<any>>([])

/**
 * select v-model:value 값
 * @param v-model
 */
const value = defineModel<string | number>("value")

/**
 * 옵션 배열에 주어진 값이 존재하는지 확인하는 헬퍼 함수
 * @param val
 */
const isValidOption = (val: string | number | undefined): boolean => {
	if (val === undefined) return false
	const isValid = options.value.some((option) => option[key] === val)

	return isValid
}

/**
 * getter에서 value.value가 유효한 옵션인지 확인하고, 유효하지 않으면 undefined를 반환
 * setter에서도 새 값이 유효한 옵션인지 확인하고, 유효하지 않으면 undefined를 설정
 */
const selectedValue = computed({
	get: () => {
		if (value.value === undefined) return undefined
		const isValid = isValidOption(value.value)
		// if (options.value.length > 0 && props.first) {
		//   return (value.value = options.value[0][key]);
		// }
		return isValid ? value.value : undefined
	},
	set: (newValue: string | number | undefined) => {
		if (newValue === undefined || isValidOption(newValue)) {
			value.value = newValue
		} else {
			console.warn(`${newValue} 값은 유효하지 않은 값으로 undefined로 설정합니다.`)
			value.value = undefined
		}
	},
})

const { refresh, url } = toRefs(props)
watch([refresh, url], (data) => {
	if (data[0]) {
		selectDataRefresh()
		emit("update:value", undefined)
	}
})

const {
	data,
	pending,
	error,
	refresh: selectDataRefresh,
} = await useAsyncData(`eacc-select-${props.url}`, () =>
	useCFetch<Response<any>>(`${props.url}`, {
		method: "GET",
		params: props.params,
	})
		.then((res: Response<any>) => {
			if (res.status == 0) {
				let filteredData = res.data
				// filters가 존재하면 데이터 필터링 적용
				if (props.filterValues && props.filterValues.length > 0) {
					filteredData = res.data.filter(
						(item: any) => !props.filterValues?.includes(item[key])
					)
				}

				if (props.onAllField) {
					options.value = [{ [key]: "", [label]: "전체" }, ...filteredData]
				} else {
					options.value = filteredData
				}
			}
		})
		.finally(() => {
			if (options.value.length > 0 && props.first) {
				value.value = options.value[0][key]
			}
			emit("onOptions", options.value)
		})
)

const handleChange = (selectedValue: any, option: any) => {
	updateValue(selectedValue, option)
}

const updateValue = (data: any, data2: any) => {
	if (props.valueType === "any") {
		emit("update:anyValue", data2)
	} else {
		emit("update:value", data)
	}
}
</script>

<template>
	<a-flex align="center" :gap="props.label ? gap : 0">
		<label for="select" :style="props.labelStyle" :class="props.labelClass">{{
			props.label
		}}</label>
		<a-select
			:name="`select-${props.label}`"
			:id="props.url"
			v-model:value="selectedValue"
			:loading="pending"
			:field-names="props.fieldNames"
			:options="options"
			:style="props.style"
			:disabled="props.disabled"
			:placeholder="props.placeholder"
			@change="handleChange"
		>
		</a-select>
	</a-flex>
</template>
