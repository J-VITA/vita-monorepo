<script setup lang="ts">
import {
	FamilyEventData,
	FamilyEventFormBrand,
	FamilyEventViewForm,
	type FormData,
} from "@/types/approvals/document"

import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import FamilyEventForm from "@/components/approvals/document/FamilyEventForm.vue"
import Comment from "@/components/approvals/document/Comment.vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import { SlipFormType } from "@/types"
import dayjs from "dayjs"

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const { detail } = useApprovals()

const isLoading = defineModel<boolean>("loading")
const id = defineModel<string | number>("id", { required: true })
const formData = defineModel<any>("formData", { required: true })
const familyEventFormRef = useTemplateRef<{
	loadFormData: (id: string | number) => Promise<FamilyEventData>
}>("familyEventFormRef")

const emit = defineEmits<{
	(e: "update:loading", value: boolean): boolean
	(e: "update:formData", value: FormData): FormData
}>()

const reload = () => {
	if (id.value) {
		detail(id.value).then(async (data: any) => {
			Object.assign(formData.value, data, {
				approvalFormType: SlipFormType.FAMILY_EVENT,
				agreementOptionType: data.agreementOptionTypeName,
			})
		})
	}
}

onMounted(async () => {
	formData.value.approvalFormType = SlipFormType.FAMILY_EVENT
	reload()

	const familyEventData = await familyEventFormRef.value?.loadFormData(id.value)
	if (familyEventData) {
		formData.value.formIds = [{ id: familyEventData.slipHeaderId }]

		formData.value.familyEventForm = {
			id: familyEventData.id,
			slipHeaderId: familyEventData.slipHeaderId,
			approvalHeaderId: familyEventData.approvalHeaderId,
			requestEmployeeId: familyEventData.requestEmployeeId,
			requestEmployeeIds: [familyEventData.requestEmployeeId],
			eventDate: dayjs(familyEventData.eventDate),
			familyEventAmount: familyEventData.familyEventAmount,
			familyEventTypeName: familyEventData.familyEventTypeName,
			mutualAidFlag: familyEventData.mutualAidFlag,
			paymentDueDate: familyEventData.paymentDueDate,
			wreathFlag: familyEventData.wreathFlag,
			accountId: familyEventData.accountId,
		} as FamilyEventViewForm & { __brand: `ExView${FamilyEventFormBrand}` }
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
							<family-event-form
								v-if="formData.familyEventForm"
								ref="familyEventFormRef"
								v-model:form-data="formData.familyEventForm"
								type="read"
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
