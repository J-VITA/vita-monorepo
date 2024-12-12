<script lang="ts" setup>
import type { Response } from "@/types"

/**
 * select v-model:value 값
 * @param v-model
 */
const value = defineModel<string | number>("value")

/**
 * select v-model:value 값이 변경 될 때 리턴
 * @return value 반환 (key)
 */
// const emit = defineEmits(['update:value']);
const emit = defineEmits<{
	(e: "update:value", value: string): string
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
	/** select label 명 */
	label?: string
	/** label style */
	labelStyle?: any
	/** style */
	style?: any
	/** 전체 필드 추가 옵션 */
	onAllField?: boolean
	/** 반환 타입 선택(string, number, boolean, any */
	valueType: "any" | undefined
}

const props = withDefaults(defineProps<SelectData>(), {
	label: "",
	labelStyle: { width: "30%", "margin-right": "8px" },
	style: { width: "60%" },
	onAllField: true,
})

const options = ref<Array<any>>([])

const { data, pending, error, refresh } = await useAsyncData(props.url, () =>
	useCFetch<Response<any>>(`${props.url}`, {
		method: "GET",
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			const key = props.fieldNames.value
			const label = props.fieldNames.label

			if (props.onAllField) {
				return (options.value = [{ [key]: "", [label]: "전체" }, ...res.data])
			} else {
				return (options.value = res.data.map((x: any) => {
					x[label] = `${x[label]} (${x[key]})`
					return x
				}))
			}
		} else {
			message.error(` ${res.message} `)
			return []
		}
	})
)

/**
 * ant select filter
 */
const filterOption = (input: string, option: any, key?: string) => {
	if (key) {
		return option[key].indexOf(input) >= 0
	}
	return option.name.indexOf(input) >= 0
}

const updateValue = (data: any, data2: any) => {
	emit("update:value", props.valueType === "any" ? data2 : data)
}
</script>

<template>
	<div>
		<label for="select" :style="props.label ? props.labelStyle : {}">{{
			props.label
		}}</label>
		<a-auto-complete
			name="select"
			:style="props.label ? props.style : {}"
			:loading="pending"
			:field-names="props.fieldNames"
			v-model:value="value"
			:filter-option="
				(input: string, option: any) =>
					filterOption(input, option, props.fieldNames.label)
			"
			:options="data"
			@change="updateValue"
			:default-active-first-option="false"
		>
		</a-auto-complete>
	</div>
</template>
