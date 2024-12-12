<script setup lang="ts">
import {
	CardIssueData,
	CardIssueViewForm,
	CardIssueViewFormBrand,
	type FormData,
} from "@/types/approvals/document"

import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import CardIssueForm from "@/components/approvals/document/CardIssueForm.vue"
import Comment from "@/components/approvals/document/Comment.vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import { Response, SlipFormType } from "@/types"
import dayjs from "dayjs"

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const { detail } = useApprovals()

const isLoading = defineModel<boolean>("loading")
const id = defineModel<string | number>("id", { required: true })
const formData = defineModel<any>("formData", { required: true })
const cardIssueformRef = useTemplateRef<{
	loadFormData: (id: string | number) => Promise<CardIssueData>
}>("cardIssueformRef")

const emit = defineEmits<{
	(e: "update:loading", value: boolean): boolean
	(e: "update:formData", value: FormData): FormData
	(e: "expenseDetailData", value: any): any
}>()

const reload = () => {
	if (id.value) {
		detail(id.value).then(async (data: any) => {
			Object.assign(formData.value, data, {
				approvalFormType: SlipFormType.CARD_FORM,
				agreementOptionType: data.agreementOptionTypeName,
				expenseList: data.slipSimpleDatas,
			})
		})
	}
}

onMounted(async () => {
	formData.value.approvalFormType = SlipFormType.CARD_FORM
	reload()

	const cardIssueData = await cardIssueformRef.value?.loadFormData(id.value)
	if (cardIssueData) {
		formData.value.formIds = [{ id: cardIssueData.id }]

		formData.value.cardIssueForm = {
			id: cardIssueData.id,
			approvalHeaderId: cardIssueData.approvalHeaderId,
			requestedBy: cardIssueData.requestedByEmployeeId,
			requestedByEmployeeIds: [cardIssueData.requestedByEmployeeId],
			startDate: dayjs(cardIssueData.startDate),
			endDate: dayjs(cardIssueData.endDate),
			usedDate: [dayjs(cardIssueData.startDate), dayjs(cardIssueData.endDate)],
			cardType: cardIssueData.cardType.code,
			cardIssueRequestStatus: cardIssueData.cardIssueRequestStatus.code,
			cardOwnerEmployeeIds: [cardIssueData.ownerEmployeeId],
			cardOwnerEmployeeId: cardIssueData.ownerEmployeeId,
			description: cardIssueData.description,
		} as CardIssueViewForm & { __brand: `ExView${CardIssueViewFormBrand}` }
	}
})

defineExpose({
	reload,
})
</script>

<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-row :gutter="[20, 15]">
			<a-col :xs="24" :xxl="18">
				<a-card>
					<a-row :gutter="[0, 50]">
						<a-col span="24">
							<a-typography-title :level="3" class="text-center">
								{{ formData?.title }}
							</a-typography-title>
						</a-col>
						<a-col span="24">
							<approval-line type="read" v-model:form-data="formData" />
						</a-col>
						<a-col span="24">
							<card-issue-form
								v-if="formData.cardIssueForm"
								ref="cardIssueformRef"
								v-model:form-data="formData.cardIssueForm"
								type="read"
								@on-detail="(params: boolean) => emit('expenseDetailData', params)"
							/>
						</a-col>
						<a-col span="24">
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
						<a-col span="24">
							<!-- 의견 -->
							<Comment
								v-if="formData.documentStatusName"
								:type="formData.documentStatusName"
								:data="formData"
								@update:data="
									(v) => {
										reload()
										console.log('Comment 업데이트 되었습니다.', v)
									}
								"
							/>
						</a-col>
					</a-row>
				</a-card>
			</a-col>
			<a-col :xs="24" :xxl="6">
				<a-row :gutter="[15, 30]">
					<a-col :span="24">
						<!-- 문서정보 -->
						<doc-info type="read" v-model:form-data="formData" />
					</a-col>
					<a-col :span="24">
						<!-- 첨부파일 -->
						<attached-file type="read" />
					</a-col>
					<a-col :span="24">
						<!-- 관련문서 -->
						<doc-relevant type="read" />
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</a-spin>
</template>
