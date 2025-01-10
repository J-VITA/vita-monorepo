<script lang="ts" setup>
import {
	CardIssueData,
	CardIssueRequestStatus,
	CardIssueViewForm,
	CardIssueViewFormBrand,
	CardType,
	type FormData,
} from "@/types/approvals/document"
import { EaccError, Response, SlipFormType } from "@/types"
import type { FormInstance } from "ant-design-vue"
import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import CardIssueForm from "@/components/approvals/document/CardIssueForm.vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import dayjs from "dayjs"

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
const cardIssueformRef = useTemplateRef<{
	loadFormData: (id: string | number) => Promise<CardIssueData>
}>("cardIssueformRef")

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
	if (form && form.draftEmployeeId === getEmployeeId.value) {
		formData.value = {
			...form,
			approvalFormType: SlipFormType.CARD_ISSUE,
			agreementOptionType: form.agreementOptionTypeName,
			relatedDocumentIds: [],
		}
		const cardIssueData = await cardIssueformRef.value?.loadFormData(form.id)
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
		nextTick()
		console.log("responseResult", formData.value.cardIssueForm)
	} else {
		navigateTo("/approvals/home")
	}
}

onMounted(async () => {
	formData.value.approvalFormType = SlipFormType.CARD_ISSUE

	if (id.value) {
		await detail(id.value).then(async (data: any) => await responseResult(data))
	} else {
		getRouteParams(`/approvals/write-${compCase(SlipFormType.CARD_ISSUE)}`)
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
					if (formData.value.cardIssueForm) {
						formData.value.cardIssueForm.companyCode = getCompanyCode.value
						formData.value.cardIssueForm.requestedBy = getEmployeeId.value
						formData.value.cardIssueForm.requestedByEmployeeIds = [getEmployeeId.value]
					}
				}
			})
			.catch(async (data: any) => {
				console.log("전자결재홈에서 유입한 경우로 판단.", data)
			})
	}
})

const postCardIssues = async (params: CardIssueViewForm) => {
	if (!params.startDate) {
		throw new EaccError("사용일(시작)을 입력하세요.", "Invalid Value")
	}
	if (!params.endDate) {
		throw new EaccError("사용일(종료)을 입력하세요.", "Invalid Value")
	}

	if (params.cardType === CardType.PERSONAL && !params.cardOwnerEmployeeId) {
		throw new EaccError("카드소유자를 선택해주세요.", "Invalid Value")
	}

	if (!params.description) {
		throw new EaccError("사용목적을 입력하세요.", "Invalid Value")
	}

	return Promise.resolve(
		await useCFetch(`/api/v2/cards/issues`, {
			body: Object.assign({ id: params.id ? params.id : "" }, params),
			method: `${params.id ? "PATCH" : "POST"}`,
		})
	)
}

defineExpose({
	postCardIssues,
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
							<card-issue-form
								v-if="formData.cardIssueForm"
								ref="cardIssueformRef"
								type="write"
								v-model:form-data="formData.cardIssueForm"
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
