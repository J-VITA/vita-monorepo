<script setup lang="ts">
import type { FormInstance } from "ant-design-vue"
import TaxInvoiceViewer from "./TaxInvoiceViewer.vue"
import TaxInvoiceDetailTable from "./TaxInvoiceDetailTable.vue"
import TaxInvoiceFormItem from "./TaxInvoiceFormItem.vue"
import { initFormState, type TaxInvoiceFormState } from "./type"
const { show } = defineProps<{
	show: boolean
}>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "refresh"): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const isLoading = ref<boolean>(false)
const isRead = ref<boolean>(false)
const formState = ref<TaxInvoiceFormState>(initFormState)
const formRef = useTemplateRef<FormInstance>("formRef")

const onCancel = () => {
	open.value = false
	isLoading.value = false
	formRef.value?.resetFields()
}

const onSubmit = (status?: boolean) => {
	formRef.value
		?.validate()
		.then(() => {
			isLoading.value = true

			setTimeout(() => {
				if (!status) {
					open.value = false
				}

				emit("refresh")
				isLoading.value = false
				formRef.value?.resetFields()
			}, 5000)
		})
		.catch((error) => {
			console.log(error)
		})
}
</script>
<template>
	<a-modal
		style="width: 100rem"
		centered
		v-model:open="open"
		:destroy-on-close="false"
		:mask-closable="false"
		:keyboard="false"
	>
		<template #title>
			<a-typography-text>세금계산서 등록</a-typography-text>
		</template>
		<a-row :gutter="40">
			<a-col :span="12">
				<!-- 전자 세금계산서 뷰어 -->
				<tax-invoice-viewer v-if="formState.proofType === '전자세금계산서'" />

				<!-- 수기 세금계산서 이미지 업로드 및 뷰어 -->
				<receipt-file-upload
					v-if="formState.proofType !== '전자세금계산서'"
					:is-read="isRead"
					v-model:file-list="formState.receiptFile"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'RECEIPT',
						documentedNumber: '1',
					}"
				/>

				<!-- 첨부파일 -->
				<attachment-file-upload
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="formState.files"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						// documentedNumber: ,
					}"
					@update:file-list="(value) => console.log(value)"
				/>
				<!-- 관련문서 -->
				<documents-file-upload
					:is-read="isRead"
					class="mt-xl"
					v-model:file-list="formState.documents"
					:file-props="{
						companyCode: getCompanyCode,
						fileType: 'SLIP',
						// documentedNumber: formState.slipHeader.slipNumber,
					}"
					@update:file-list="(value) => console.log(value)"
				/>
			</a-col>
			<a-col :span="12">
				<a-form
					ref="formRef"
					name="taxInvoiceForm"
					label-align="left"
					:model="formState"
					:colon="false"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
					:disabled="isRead"
				>
					<tax-invoice-form-item v-model:form-state="formState" />
				</a-form>
			</a-col>
		</a-row>
		<a-divider />
		<tax-invoice-detail-table v-model:form-state="formState" />
		<template #footer>
			<a-flex justify="space-between">
				<a-button disabled>정기지출 등록</a-button>
				<a-space :size="5">
					<a-button @click="onCancel">취소</a-button>
					<a-button ghost type="primary" @click="onSubmit(true)" :loading="isLoading">
						저장 후 추가
					</a-button>
					<a-button type="primary" @click="onSubmit()" :loading="isLoading"
						>등록</a-button
					>
				</a-space>
			</a-flex>
		</template>
	</a-modal>
</template>
