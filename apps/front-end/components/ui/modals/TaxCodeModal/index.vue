<script setup lang="ts">
import type { Tax } from "@/types/master/taxes"
import type { Response } from "@/types"

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const props = withDefaults(defineProps<{ show: boolean; data?: any }>(), {
	show: false,
})

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
	(e: "refresh"): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		formRef.value.resetFields()
		emit("update:show", value)
	},
})

const loading = ref<boolean>(false)
const formRef = ref()
const formState = ref<Partial<Tax>>({
	id: undefined,
	name: "",
	code: "",
	rate: 0,
	slipEvidenceTypeCode: "",
	used: true,
	attribute1: "",
	attribute2: "",
})

/**
 *
 */
const saveTaxes = (form: Partial<Tax>) => {
	const body = Object.assign({}, form, {
		companyCode: getCompanyCode.value,
		slipEvidenceType: form.slipEvidenceTypeCode,
	})

	useCFetch<Response<any>>(`/api/v2/masters/taxes${form.id ? "/" + form.id : ""}`, {
		method: form.id ? "PATCH" : "POST",
		body,
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success(`${form.id ? "수정 되었습니다." : "저장 하였습니다."}`)
			emit("refresh")
			open.value = false
		} else {
			message.error(`${res.message}`)
		}
	})
}

const onSubmit = () => {
	formRef.value
		.validate()
		.then(() => {
			saveTaxes(formState.value)
			// open.value = false;
		})
		.catch((error: any) => {
			console.log("error", error)
		})
}

onBeforeUpdate(() => {
	formState.value = props.data
})
</script>
<template>
	<a-modal
		centered
		v-model:open="open"
		:title="`세금코드 ${props?.data?.id ? '수정' : '추가'}`"
		:ok-text="`${props?.data?.id ? '수정' : '추가'}`"
		:force-render="true"
		:destroy-on-close="true"
		:mask-closable="false"
		:confirm-loading="loading"
		@ok="onSubmit"
	>
		<a-form
			ref="formRef"
			label-align="left"
			:model="formState"
			:colon="false"
			:label-col="{ span: 6 }"
		>
			<a-form-item
				name="name"
				label="과세유형"
				:rules="[{ required: true, message: '필수값 입니다.' }]"
			>
				<a-input v-model:value="formState.name" />
			</a-form-item>
			<a-form-item
				name="code"
				label="세금코드"
				:rules="[{ required: true, message: '필수값 입니다.' }]"
			>
				<a-input v-model:value="formState.code" :disabled="!!props.data.id" />
			</a-form-item>
			<a-form-item
				name="rate"
				label="세율(%)"
				:rules="[{ required: true, message: '필수값 입니다.' }]"
			>
				<a-input-number v-model:value="formState.rate" :min="0" :max="100" />
			</a-form-item>
			<a-form-item
				name="slipEvidenceTypeCode"
				label="증빙유형코드"
				:rules="[{ required: true, message: '필수값 입니다.' }]"
			>
				<eacc-select
					url="/api/v2/masters/taxes/types/slipEvidenceTypes"
					v-model:value="formState.slipEvidenceTypeCode"
					:field-names="{ label: 'label', value: 'code' }"
					:on-all-field="false"
					@update:value="(value) => (formState.slipEvidenceTypeCode = value)"
				/>
			</a-form-item>
			<a-form-item name="attribute1" label="비고1">
				<a-input v-model:value="formState.attribute1" />
			</a-form-item>
			<a-form-item name="attribute2" label="비고2">
				<a-input v-model:value="formState.attribute2" />
			</a-form-item>
			<a-form-item name="used" label="사용여부">
				<a-switch v-model:checked="formState.used" />
			</a-form-item>
		</a-form>
	</a-modal>
</template>
