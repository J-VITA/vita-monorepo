<script setup lang="ts">
import { DocumentStatus, type FormData } from "@/types/approvals/document"

import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import ExpenseList from "@/components/approvals/document/ExpenseList.vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import { SlipFormType } from "@/types"

const { detail } = useApprovals()

const isLoading = defineModel<boolean>("loading")
const id = defineModel<string | number>("id")
const formData = defineModel<any>("formData", { required: true })

const emit = defineEmits<{
	(e: "update:loading", value: boolean): boolean
	(e: "update:formData", value: FormData): FormData
	(e: "expenseDetailData", value: any): any
}>()

const reload = async () => {
	if (id.value) {
		await detail(id.value).then(async (data: any) => {
			formData.value = Object.assign(formData.value, data, {
				approvalFormType: SlipFormType.DISBURSEMENT_FORM,
				agreementOptionType: data.agreementOptionTypeName,
				expenseList: data.slipSimpleDatas,
			})
		})
	}
}

onMounted(async () => {
	formData.value.approvalFormType = SlipFormType.DISBURSEMENT_FORM
	await reload()
})

defineExpose({
	reload,
})
</script>

<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-card>
			<a-row :gutter="[0, 50]">
				<a-col :span="24">
					<a-typography-title :level="3" class="text-center">
						{{ formData?.title }}
					</a-typography-title>
				</a-col>
				<a-col :span="24">
					<!-- 문서정보 -->
					<doc-info type="preview" v-model:form-data="formData" />
				</a-col>
				<a-col :span="24">
					<approval-line type="read" v-model:form-data="formData" />
				</a-col>
				<a-col :span="24">
					<expense-list
						v-model:row-data="formData.expenseList"
						type="read"
						@on-detail="(params: boolean) => emit('expenseDetailData', params)"
					/>
				</a-col>
				<a-col :span="24">
					<a-typography-title :level="4" class="ml-none mb-sm">
						결재 내용
					</a-typography-title>
					<a-textarea
						disabled
						v-model:value="formData.description"
						class="fixed"
						allow-clear
					/>
				</a-col>
				<a-col :span="24">
					<!-- 첨부파일 -->
					<attached-file type="read" />
				</a-col>
				<a-col :span="24">
					<!-- 관련문서 -->
					<doc-relevant type="read" />
				</a-col>
				<a-col :span="24">
					<!-- 의견 -->
					<Comment :type="DocumentStatus.read" :data="formData" />
				</a-col>
			</a-row>
		</a-card>
	</a-spin>
</template>
