<script setup lang="ts">
import { type FormData } from "@/types/approvals/document"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import ExpenseList from "@/components/approvals/document/ExpenseList.vue"
import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import { SlipFormType, type Response } from "@/types"
import type { FormInstance } from "ant-design-vue"
import { useApprovalRules } from "~/composables/useApprovalRules"

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const { detail, save } = useApprovals()
const { getRouteParams, setRouteParams, clearParams } = useRouteParams()
const { getApprovalRules } = useApprovalRules()

const formRef = useTemplateRef<FormInstance>("formRef")

const isLoading = defineModel<boolean>("loading")
const isShowApprove = defineModel<boolean>("showApprove")
const id = defineModel<string | number>("id")
const formData = defineModel<FormData>("formData", { required: true })

const emit = defineEmits<{
	(e: "update:loading", value: boolean): boolean
	(e: "update:showApprove", value: boolean): boolean
	(e: "update:formData", value: FormData): FormData
	(e: "historyModalOpen", value: boolean): boolean
	(e: "onDraft"): void
}>()

watch(isShowApprove, (flag) => {
	if (flag) {
		formRef.value
			?.validate()
			.then(() => {
				emit("update:showApprove", true)
			})
			.catch((errorInfo: any) => {
				const firstErrorField = errorInfo.errorFields[0]
				if (firstErrorField) {
					formRef.value?.scrollToField(firstErrorField.name)
				}
				emit("update:showApprove", false)
			})
	}
})

// /**
//  * 결재선 라인 지정 변수 셋업
//  * @param lines
//  */
// // const setApprovalLine = async (lines: any) => {
//   const rules = await getApprovalRules();
//   // 순차/병렬 합의 타입
//   formData.value.agreementOptionType = rules.agreementOptionType;
//   // 결재선 라인
//   formData.value.approvalDetailRequests =
//     lines.approvalLineDetails.map((e: any) => ({
//       ...e,
//       approvalEmployeeId: e.approvalEmployeeId ? e.approvalEmployeeId : e.id,
//       approvalType: e.approvalTypeName,
//     })) || [];
//   // 참조자 id list
//   formData.value.referenceEmployeeIds =
//     lines.approvalLineReferrerDtos.map((e: any) => ({ id: e.id })) || [];
// };

const responseResult = async (form: any) => {
	if (form.draftEmployeeId === getEmployeeId.value) {
		formData.value = Object.assign(formData.value, form, {
			expenseList: form.slipSimpleDatas,
			formIds:
				form.slipSimpleDatas?.map((e: any) => {
					return { id: e.id }
				}) || [],
			agreementOptionType: form.agreementOptionTypeName,
		})
	} else {
		navigateTo("/approvals/home")
	}
}

onMounted(() => {
	formData.value.approvalFormType = SlipFormType.DISBURSEMENT_FORM

	if (id.value) {
		detail(id.value).then(async (data: any) => await responseResult(data))
	} else {
		getRouteParams(`/approvals/write-${compCase(SlipFormType.DISBURSEMENT_FORM)}`)
			.then((list: any[]) => {
				if (list && list.length > 0) {
					formData.value.expenseList = list
					formData.value.formIds = list.map((e: any) => {
						return { id: e.id }
					})
					if (formData.value.id) {
						save(formData.value).then(async (data: any) => await responseResult(data))
					}
				}
			})
			.catch(async (data: any) => {
				console.log("전자결재홈에서 유입한 경우로 판단.")
			})
	}
})
</script>

<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-row :gutter="[20, 15]">
			<a-col :xs="24" :xxl="18">
				<a-card>
					<a-form
						ref="formRef"
						name="ApproveSubmitted"
						layout="vertical"
						:model="formData"
					>
						<a-form-item>
							<template #label>
								<a-typography-title :level="4" class="ml-none mb-none">
									결재 제목
								</a-typography-title>
							</template>
							<a-flex :gap="20">
								<a-form-item
									class="full-width"
									name="title"
									has-feedback
									:rules="[
										{
											required: true,
											message: '제목을 입력해주세요.',
											trigger: 'change',
										},
									]"
								>
									<a-input v-model:value="formData.title" />
								</a-form-item>
								<a-form-item>
									<a-space :size="0" style="width: 10rem; flex-shrink: 0">
										<a-checkbox v-model:checked="formData.urgent">
											<a-typography-text>긴급문서</a-typography-text>
										</a-checkbox>
										<a-popover placement="right">
											<template #content>
												<p>긴급문서 체크시 결재문서 제목 앞에</p>
												<p>'[긴급]' 문구가 추가되어 강조됩니다.</p>
											</template>
											<div style="line-height: 1; color: #666; cursor: pointer">
												<component
													:is="materialIcons('mso', 'help')"
													style="font-size: 1.6rem"
												/>
											</div>
										</a-popover>
									</a-space>
								</a-form-item>
							</a-flex>
						</a-form-item>

						<a-form-item>
							<approval-line type="write" v-model:form-data="formData" />
						</a-form-item>
						<a-form-item>
							<expense-list
								type="write"
								v-model:row-data="formData.expenseList"
								@on-history="(opend: boolean) => emit('historyModalOpen', opend)"
								@reload-data="
									() => {
										if (id) {
											detail(id).then(async (data: any) => await responseResult(data))
										}
									}
								"
								@on-draft="
									(list: any) => {
										formData.expenseList = list
										formData.approvalDetailRequests = list
										formData.formIds =
											list.map((e: any) => {
												return { id: e.id }
											}) || []
										emit('onDraft')
									}
								"
							/>
						</a-form-item>
						<a-form-item name="description">
							<a-flex justify="space-between" class="mb-sm">
								<a-typography-title :level="4" class="ml-none mb-none">
									결재 내용
								</a-typography-title>
							</a-flex>
							<a-textarea
								v-model:value="formData.description"
								class="fixed"
								placeholder="관련 내용을 입력해주세요."
								allow-clear
							/>
						</a-form-item>
					</a-form>
				</a-card>
			</a-col>
			<a-col :xs="24" :xxl="6">
				<a-row :gutter="[15, 30]">
					<a-col :span="24">
						<!-- 문서정보 -->
						<doc-info type="write" v-model:form-data="formData" />
					</a-col>
					<a-col :span="24">
						<!-- 첨부파일 -->
						<attached-file
							type="write"
							@add="(value: any) => console.log(`${value} 진행시켜`)"
						/>
					</a-col>
					<a-col :span="24">
						<!-- 관련문서 -->
						<doc-relevant
							type="write"
							@add="(value: any) => console.log(`${value} 진행시켜`)"
						/>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</a-spin>
</template>
