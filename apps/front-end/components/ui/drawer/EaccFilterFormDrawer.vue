<script lang="ts" setup>
import { Form } from "ant-design-vue"
import type { IFormData, Response, IFormType } from "@/types"
import { materialIcons } from "@/composables/icons"
/**
 * v-model:formData
 */
const formData = defineModel("formData", {
	required: true,
	type: Array<IFormData>,
})

/**
 * drwaer 오픈/클로즈 props
 */
const open = defineModel("open", {
	required: true,
	type: Boolean,
	default: false,
})

interface FilterForm {
	title?: string
	loadings?: boolean
}

const props = withDefaults(defineProps<FilterForm>(), {
	loadings: false,
})

/**
 * v-model:formData update
 */
const emit = defineEmits(["submit", "update:formData", "update:formDataItem"])

// const modelRef = ref<any>();
const rulesRef = ref<any>()
const useForm = Form.useForm

/**
 * any 형태의 UI 정의 할 필드 초기화
 * field 의 url(검색 select) 이 있는 경우 api 호출하여 options 초기화
 */
formData.value.forEach((e: IFormData) => {
	// modelRef.value = { ...modelRef.value, [e.name]: e.defaultValue };
	rulesRef.value = { ...rulesRef.value, [e.name]: e.rules }

	if (e.url) {
		useCFetch<Response<Array<any>>>(e.url, {
			method: "GET",
		})
			.then((res) => {
				if (res?.status == 0) {
					const form = formData.value.find(
						(f: any) => f.name === e.name && f.url === e.url
					)!

					const typeInfo = form.typeInfo!
					const key = typeInfo.fieldName!.value
					const label = typeInfo.fieldName!.label

					if (key && label) {
						typeInfo.options = [
							...(res.data?.map((x: any) => {
								if (!x.value) {
									x.value = x[key]
								}
								return x
							}) as any),
						]
						if (
							!["multi-checkbox", "checkbox"].includes(typeInfo.type) &&
							!typeInfo.mode
						) {
							if (
								res.data?.filter((f: any) => !f[key]).map((x: any) => x[key])[0] !== ""
							) {
								typeInfo.options.unshift({
									[key]: "",
									[label]: "전체",
									value: "",
								})
							}
						}
					}
				} else {
					formData.value.find((f: any) => f.url === e.url)!.typeInfo!.options = []
				}
			})
			.catch(
				(_) => (formData.value.find((f: any) => f.url === e.url)!.typeInfo!.options = [])
			)
	}
})

/**
 * ant useForm 정의
 */
const { resetFields, validate, validateInfos } = useForm(formData, rulesRef)

/**
 * ant select filter
 * !위에서 GET 방식 API 호출 시에 결과의 키값이 name 필드가 반드시 있어야 하는 문제점이 있음.
 */
const filterOption = (input: string, option: any, key?: string) => {
	if (key) {
		return option[key].indexOf(input) >= 0
	}
	return option.name.indexOf(input) >= 0
}

const emailSearch = (input: string, name?: any) => {
	// let res: { value: string }[];
	// if (!input || input.indexOf('@') >= 0) {
	//   res = [];
	// } else {
	//   // res = ['gmail.com', '163.com', 'qq.com'].map(domain => ({ value: `${input}@${domain}` }));
	//   formData.map((item: IFormData) => item.typeInfo).map((typeInfo: IFormType) => typeInfo.options)).map()
	// }
	// option.value = res;
}
/**
 * submit
 */
const onSubmit = () => {
	validate()
		.then((res) => {
			// console.log(res, toRaw(modelRef));
			emit("submit", toRaw(formData).value)
		})
		.catch((err) => {
			console.log("error", err)
			message.error(
				`${formData.value.find((f) => f.name === err.errorFields[0].name)?.label} ${err.errorFields[0].errors[0]}`
			)
		})
}
/**
 * field reset
 */
const reset = () => {
	resetFields()
}

const onCheckAllChange = (item: IFormData) => {
	if (!item.typeInfo) return

	const allValues = item.typeInfo.options?.map((option) => option.value) || []
	item.defaultValue = item.typeInfo.checkAll ? [] : allValues
	item.typeInfo.checkAll = !item.typeInfo.checkAll
	item.typeInfo.indeterminate = false
	// 반응성을 위해 formData를 새 배열로 할당
	// formData.value = [...formData.value];
}

const onChangeCheckboxGroup = (checkedValues: any[], item: IFormData) => {
	if (!item.typeInfo) return

	console.log("onChangeCheckboxGroup", checkedValues)

	// (item.typeInfo.checkedList as any[]) = checkedValues;
	item.typeInfo.checkAll = checkedValues.length === (item.typeInfo.options?.length || 0)
	item.typeInfo.indeterminate =
		checkedValues.length > 0 &&
		checkedValues.length < (item.typeInfo.options?.length || 0)
	if (checkedValues.includes("")) {
		item.defaultValue = item.typeInfo.options?.map((option) => option.value) || []
	} else {
		item.defaultValue = checkedValues
	}
	// 반응성을 위해 formData를 새 배열로 할당
	formData.value = [...formData.value]
}
</script>
<template>
	<a-drawer v-model:open="open" width="40rem">
		<template #title v-if="$slots.title">
			<slot name="title"></slot>
		</template>
		<template #title v-else>
			<span>{{ props.title }}</span>
		</template>
		<template #extra v-if="$slots.extra">
			<slot name="extra"></slot>
		</template>
		<template #default>
			<a-form
				:label-col="{ span: 8 }"
				:wrapper-col="{ span: 16 }"
				:colon="false"
				layout="horizontal"
				autocomplete="off"
				labelAlign="left"
			>
				<template v-for="(item, idx) in formData" :key="idx">
					<a-form-item
						:label="item.label"
						:name="item.name"
						v-bind="validateInfos[item.name]"
						:rules="item.rules"
					>
						<template v-if="item.typeInfo">
							<template v-if="item.typeInfo.type === 'checkbox'">
								<a-checkbox
									v-model:checked="item.defaultValue"
									:disabled="item.disabled"
									@change="emit('update:formDataItem', item)"
								>
									{{ item.description }}
								</a-checkbox>
							</template>
							<template v-if="item.typeInfo.type === 'multi-checkbox'">
								<a-checkbox
									:indeterminate="item.typeInfo.indeterminate"
									:checked="item.typeInfo.checkAll"
									@change="onCheckAllChange(item)"
								>
									전체
								</a-checkbox>
								<a-checkbox-group
									v-model:value="item.defaultValue"
									:options="item.typeInfo.options"
									:disabled="item.disabled"
									@change="(val: any) => onChangeCheckboxGroup(val, item)"
								/>
							</template>
							<template v-if="item.typeInfo.type === 'switch'">
								<a-switch
									v-model:checked="item.defaultValue"
									size="small"
									:disabled="item.disabled"
								/>
							</template>
							<template v-if="item.typeInfo.type === 'radio'">
								<a-radio-group
									v-model:value="item.defaultValue"
									:options="item.typeInfo.options"
									:disabled="item.disabled"
								/>
							</template>
							<template v-if="item.typeInfo.type === 'select'">
								<a-select
									:label-in-value="item.url ? false : true"
									:field-names="item.typeInfo.fieldName"
									:mode="item.typeInfo.mode"
									:max-tag-count="item.typeInfo.mode ? 2 : 1"
									v-model:value="item.defaultValue"
									:options="item.typeInfo.options"
									:placeholder="item.typeInfo.placeholder"
									:filter-option="
										(input: string, option: any) =>
											option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
									"
									:disabled="item.disabled"
								/>
								<!-- @update:value="emit('update:modelValue', modelRef)" -->
							</template>
							<template v-if="item.typeInfo.type === 'search'">
								<a-select
									:label-in-value="item.url ? false : true"
									:field-names="item.typeInfo.fieldName"
									v-model:value="item.defaultValue"
									show-search
									:show-arrow="false"
									:filter-option="
										(input: string, option: any) =>
											filterOption(input, option, item.typeInfo?.fieldName?.value)
									"
									:options="item.typeInfo.options"
									:placeholder="item.typeInfo.placeholder"
									:disabled="item.disabled"
								/>
								<!-- @update:value="emit('update:modelValue', modelRef)" -->
							</template>
							<template v-if="item.typeInfo.type === 'amount'">
								<eacc-amount-input
									v-model:value="item.defaultValue[0]"
									suffix="이상"
									class="text-right mb-xs"
									@update:value="
										(value: any) => {
											item.defaultValue[0] = value
										}
									"
									:disabled="false"
									:currency-disabled="true"
								>
								</eacc-amount-input>
								<eacc-amount-input
									v-model:value="item.defaultValue[1]"
									suffix="미만"
									class="text-right mb-xs"
									@update:value="(value: any) => (item.defaultValue[1] = value)"
									:disabled="false"
									:currency-disabled="true"
								>
								</eacc-amount-input>
								<!--                <a-input-->
								<!--                  v-model:value="item.defaultValue[0]"-->
								<!--                  suffix="이상"-->
								<!--                  class="text-right mb-xs"-->
								<!--                />-->
								<!--                <a-input-->
								<!--                  v-model:value="item.defaultValue[1]"-->
								<!--                  suffix="미만"-->
								<!--                  class="text-right"-->
								<!--                />-->
							</template>
							<template v-if="item.typeInfo.type === 'auto'">
								<a-auto-complete
									:field-names="item.typeInfo.fieldName"
									v-model:value="item.defaultValue"
									show-search
									:filter-option="
										(input: string, option: any) =>
											filterOption(input, option, item.typeInfo?.fieldName?.value)
									"
									:options="item.typeInfo.options"
									:placeholder="item.typeInfo.placeholder"
									:disabled="item.disabled"
									:default-active-first-option="false"
								>
								</a-auto-complete>
							</template>
							<template v-if="item.typeInfo.type === 'email'">
								<a-auto-complete
									v-model:value="item.defaultValue"
									:options="item.typeInfo.options"
									:placeholder="item.typeInfo.placeholder"
									:disabled="item.disabled"
									@search="(value: any) => emailSearch(value, item.name)"
								>
								</a-auto-complete>
							</template>
							<template v-if="item.typeInfo.type === 'single-table'">
								<eacc-select-table
									v-model:value="item.defaultValue"
									:key-props="item.typeInfo?.fieldName?.value || 'value'"
									:label-prop="item.typeInfo?.fieldName?.label"
									:url="item.url"
									:refresh="item.refresh"
									:columns="item.typeInfo.columns"
									:disabled="item.disabled"
									@update:value="
										(value: any) => {
											item.defaultValue = value
											emit('update:formDataItem', item)
										}
									"
									@selection-change="
										(value: any) => (item.defaultValue[`${item.name}-obj`] = value)
									"
								/>
							</template>
							<template v-if="item.typeInfo.type === 'multi-table'">
								<eacc-select-multi-table
									v-model:value="item.defaultValue"
									:key-props="item.typeInfo?.fieldName?.value || 'value'"
									:label-prop="item.typeInfo?.fieldName?.label"
									:url="item.url"
									:columns="item.typeInfo.columns"
									:disabled="false"
									@update:value="(value: any) => (item.defaultValue = value)"
									@selection-change="
										(value: any) => (item.defaultValue[`${item.name}-obj`] = value)
									"
								/>
							</template>
							<template v-if="item.typeInfo.type === 'date-picker'">
								<a-date-picker
									v-model:value="item.defaultValue"
									:picker="item.picker"
									:disabled-date="item.disabledDate"
								></a-date-picker>
							</template>
							<template v-if="item.typeInfo.type === 'range-picker'">
								<a-range-picker
									v-model:value="item.defaultValue"
									:disabled-date="item.disabledDate"
									:picker="item.picker"
								>
								</a-range-picker>
							</template>
						</template>
						<template v-else>
							<a-input v-model:value="item.defaultValue" :disabled="item.disabled" />
						</template>
					</a-form-item>
					<a-divider
						v-if="item.divider"
						type="horizontal"
						class="full-height mt-sm mb-sm"
					/>
				</template>
			</a-form>
		</template>
		<template #handle v-if="$slots.handle">
			<slot name="handle"></slot>
		</template>
		<template #closeIcon v-if="$slots.closeIcon">
			<slot name="closeIcon"></slot>
		</template>
		<template #footer>
			<a-button :icon="materialIcons('mso', 'refresh')" @click="reset">초기화</a-button>
			<a-button
				:icon="materialIcons('mso', 'search')"
				type="primary"
				style="margin-left: 10px"
				@click.prevent="onSubmit"
				:loading="props.loadings"
				>조회</a-button
			>
		</template>
	</a-drawer>
</template>
