<script lang="ts" setup>
import {
	FamilyEventData,
	FamilyEventFormBrand,
	FamilyEventViewForm,
	type FormData,
} from "@/types/approvals/document"
import { EaccError, SlipFormType } from "@/types"
import type { FormInstance } from "ant-design-vue"
import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import FamilyEventForm from "@/components/approvals/document/FamilyEventForm.vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { createVNode } from "vue"

const authStore = useAuthStore()
const { getEmployeeId, getCompanyCode } = storeToRefs(authStore)

const { detail, save } = useApprovals()
const { getRouteParams, setRouteParams, clearParams } = useRouteParams()

const router = useRouter()
const formRef = useTemplateRef<FormInstance>("formRef")

const isLoading = defineModel<boolean>("loading")
const isShowApprove = defineModel<boolean>("showApprove")
const id = defineModel<string | number>("id")
const formData = defineModel<FormData>("formData", { required: true })
const familyEventFormRef = useTemplateRef<{
	loadFormData: (id: string | number) => Promise<FamilyEventData>
}>("familyEventFormRef")

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

const formValidator = () => {
	return new Promise((resolve, reject) => {
		formRef.value
			?.validate()
			.then((res: any) => {
				resolve(res)
			})
			.catch((errorInfo: any) => {
				const firstErrorField = errorInfo.errorFields[0]
				if (firstErrorField) {
					formRef.value?.scrollToField(firstErrorField.name)
				}

				reject({
					message: `${errorInfo.errorFields[0].errors[0]}`,
					type: "error",
				})
			})
	})
}

const responseResult = async (form: any) => {
	console.log("responseResult", form)
	if (form && form.draftEmployeeId === getEmployeeId.value) {
		formData.value = {
			...form,
			approvalFormType: SlipFormType.FAMILY_EVENT,
			// formIds:
			// 	form.slipSimpleDatas?.map((e: any) => {
			// 		return { id: e.id }
			// 	}) || [],
			agreementOptionType: form.agreementOptionTypeName,
			relatedDocumentIds: [],
			// familyEventForm: {
			// 	employeeId: form.employeeId ? form.employeeId : getEmployeeId.value,
			// 	employeeIds: form.employeeId ? [form.employeeId] : [getEmployeeId.value],
			// },
		}
		const familyEventData = await familyEventFormRef.value?.loadFormData(form.id)
		if (familyEventData) {
			formData.value.formIds = [{ id: familyEventData.slipHeaderId }]

			formData.value.familyEventForm = {
				id: familyEventData.id,
				slipHeaderId: familyEventData.slipHeaderId,
				approvalHeaderId: familyEventData.approvalHeaderId,
				requestEmployeeId: familyEventData.requestEmployeeId,
				requestEmployeeIds: [familyEventData.requestEmployeeId],
				eventDate: familyEventData.eventDate,
				familyEventAmount: familyEventData.familyEventAmount,
				familyEventTypeName: familyEventData.familyEventTypeName,
				mutualAidFlag: familyEventData.mutualAidFlag,
				paymentDueDate: familyEventData.paymentDueDate,
				wreathFlag: familyEventData.wreathFlag,
				accountId: familyEventData.accountId,
			} as FamilyEventViewForm & { __brand: `ExView${FamilyEventFormBrand}` }
		}
		nextTick()
	} else {
		navigateTo("/approvals/home")
	}
}

const postFamilyEvent = async (params: FamilyEventViewForm) => {
	if (!params.eventDate) {
		throw new EaccError("발생일자를 선택해주세요", "Invalid Value")
	}
	if (!params.requestEmployeeId) {
		throw new EaccError("신청자를 선택해주세요", "Invalid Value")
	}

	if (!params.familyEventTypeName) {
		throw new EaccError("경조구분을 선택해주세요", "Invalid Value")
	}

	if (!params.accountId) {
		throw new EaccError("계정항목을 선택해주세요", "Invalid Value")
	}

	if (!params.paymentDueDate) {
		throw new EaccError("지급예정일이 존재하지 않습니다.", "Invalid Value")
	}

	if (!params.familyEventAmount) {
		Modal.confirm({
			title: "신청금액이 없습니다. 계속 진행하시겠습니까?",
			icon: createVNode(ExclamationCircleOutlined),
			type: "error",
			okText: "확인",
			cancelText: "취소",
			async onOk() {
				return Promise.resolve(
					await useCFetch(
						`/api/v2/familyEvents/requests${params.id ? "/" + params.id : ""}`,
						{
							body: Object.assign({ id: params.id ? params.id : "" }, params),
							method: `${params.id ? "PATCH" : "POST"}`,
						}
					)
				)
			},
			async onCancel() {},
		})
	} else {
		return Promise.resolve(
			await useCFetch(
				`/api/v2/familyEvents/requests${params.id ? "/" + params.id : ""}`,
				{
					body: Object.assign({ id: params.id ? params.id : "" }, params),
					method: `${params.id ? "PATCH" : "POST"}`,
				}
			)
		)
	}
}

onMounted(async () => {
	formData.value.approvalFormType = SlipFormType.FAMILY_EVENT

	if (id.value) {
		detail(id.value).then(async (data: any) => await responseResult(data))
	} else {
		getRouteParams(`/approvals/write-${compCase(SlipFormType.FAMILY_EVENT)}`)
			.then((list: any) => {
				if (list && list.length > 0) {
					formData.value.formIds = list.map((e: any) => {
						return { id: e.id }
					})
					save(formData.value)
						.then(async (data: any) => await responseResult(data))
						.finally(() => {
							if (formData.value.id) {
								router.replace({
									params: {
										id: formData.value.id,
									},
								})
								emit("onDraft")
							}
						})
				} else {
					if (formData.value.familyEventForm) {
						formData.value.familyEventForm.companyCode = getCompanyCode.value
						formData.value.familyEventForm.requestEmployeeId = getEmployeeId.value
						formData.value.familyEventForm.requestEmployeeIds = [getEmployeeId.value]
					}
				}
			})
			.catch(async (data: any) => {
				console.log("전자결재홈에서 유입한 경우로 판단.", data)
			})
	}
})

defineExpose({
	postFamilyEvent,
	formValidator,
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
							<!-- 불출 신청서 -->
							<family-event-form
								v-if="formData.familyEventForm"
								ref="familyEventFormRef"
								type="write"
								v-model:form-data="formData.familyEventForm"
							/>
						</a-form-item>
						<a-form-item name="description">
							<a-flex justify="space-between" class="mb-sm">
								<a-typography-title :level="4" class="ml-none mb-none">
									내용
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
