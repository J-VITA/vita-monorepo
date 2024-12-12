<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { FormInstance } from "ant-design-vue"
import {
	type FormData,
	initFormData,
	ApprovalFromType,
	CardIssueViewForm,
	CardIssueData,
	DocumentStatus,
	CardIssueViewFormBrand,
	CardIssueRequestStatus,
	FamilyEventViewForm,
	FamilyEventFormBrand,
} from "@/types/approvals/document"
import { createViewParams, SlipFormType, SlipType, type Response } from "@/types"
import dayjs from "dayjs"

definePageMeta({
	name: "결재문서 작성",
	middleware: ["dynamic"],
})

const route = useRoute()
const router = useRouter()

const { clearParams } = useRouteParams()
const authStore = useAuthStore()
const { getCompanyCode, getUserId, getEmployeeId, getName } = storeToRefs(authStore)

const componentMap: Record<string, () => Promise<Component>> = {
	PersonalExpenseForm: () =>
		import("@/components/approvals/write/PersonalExpenseForm.vue"),
	DisbursementForm: () => import("@/components/approvals/write/DisbursementForm.vue"),
	Budget: () => import("@/components/approvals/write/Budget.vue"),
	CardForm: () => import("@/components/approvals/write/CardForm/index.vue"),
	CardIssue: () => import("@/components/approvals/write/CardIssue/index.vue"),
	TaxInvoice: () => import("@/components/approvals/write/TaxInvoice/index.vue"),
	FamilyEvent: () => import("@/components/approvals/write/FamilyEvent/index.vue"),
	ErpSlip: () => import("@/components/approvals/write/ErpSlip/index.vue"),
	// 다른 컴포넌트들도 여기에 추가하세요
}

const componentName = computed<Component>(() => {
	const type = route.params.type
	if (typeof type === "string") {
		const componentType = compCase(type)
		const asyncComponent = componentMap[type]
		console.log("type : ", type)

		if (asyncComponent) {
			return defineAsyncComponent(asyncComponent)
		} else {
			console.warn(`${componentType}은 지원되지 않는 유형입니다..`)
			return defineComponent({
				render() {
					return h("div", `${componentType}은 지원되지 않는 유형입니다..`)
				},
			})
		}
	} else {
		return defineComponent({
			render() {
				return h("div", "경로 또는 타입에 문제 발생..")
			},
		})
	}
})

const writeComponentRef = useTemplateRef<{
	postCardIssues: (params: CardIssueViewForm) => Promise<Response<CardIssueData>>
}>("writeComponentRef")

const isLoading = ref<boolean>(false)

/** 결재 */
const formState = ref<FormData>(
	Object.assign({}, initFormData, {
		companyCode: getCompanyCode.value,
		draftEmployeeId: getEmployeeId.value,
		formIds: [],
	})
)

/** 상신 */
const isShowApprove = ref<boolean>(false)
const isShowApproveModal = ref<boolean>(false)
const approveFormRef = ref<FormInstance>()
const approveData = ref<{ content: string }>({ content: "" })

/**
 * 결재양식 조회
 */
const { data: approvalFormType, refresh: approvalFormTypeRefresh } = await useAsyncData(
	`approva-form-types-title`,
	async () =>
		await useCFetch<Response<Array<ApprovalFromType>>>(
			"/api/v2/approvals/types/approvalFormTypes",
			{
				method: "GET",
			}
		).then((response: Response<Array<ApprovalFromType>>) => {
			const type: string =
				typeof route.params.type === "string" ? route.params.type : route.params.type[0]
			return response.data?.filter((element: any) => {
				return element.code.replaceAll("_", "").toLowerCase() === type.toLowerCase()
			})[0].label
		})
)
/**
 * 세금계산서 내역 불러오기
 * TODO: 결과에 맞는 값 세팅해야함
 */
const isShowTaxInvoiceModal = ref<boolean>(false)
const bringTaxInvoice = async (data: any[]) => {
	data.forEach((element: any) => {
		if (!formState.value.expenseList) formState.value.expenseList = []
		if (!formState.value.formIds) formState.value.formIds = []

		formState.value.expenseList.push(element)
		formState.value.formIds.push({ id: element.id })
	})

	const result = await Promise.resolve(onDraft())
	// 임시저장 이후 결과값이 성공(0) 이 아니면 초기화
	if (result !== 0) {
		formState.value.expenseList = []
		formState.value.formIds = []
		await nextTick()
	}
}

/**
 * ERP 전표 내역 불러오기
 * TODO: 결과에 맞는 값 세팅해야함
 */
const isShowErpSlipModal = ref<boolean>(false)
const bringErpSlip = async (data: any[]) => {
	data.forEach((element: any) => {
		if (!formState.value.expenseList) formState.value.expenseList = []
		if (!formState.value.formIds) formState.value.formIds = []

		formState.value.expenseList.push(element)
		formState.value.formIds.push({ id: element.id })
	})

	const result = await Promise.resolve(onDraft())
	// 임시저장 이후 결과값이 성공(0) 이 아니면 초기화
	if (result !== 0) {
		formState.value.expenseList = []
		formState.value.formIds = []
		await nextTick()
	}
}

/**
 * 지출내역 불러오기
 */
const isShowExpenseModal = ref<boolean>(false)
const bringExpense = async (data: any[]) => {
	data.forEach((element: any) => {
		if (!formState.value.expenseList) formState.value.expenseList = []
		if (!formState.value.formIds) formState.value.formIds = []

		formState.value.expenseList.push(element)
		formState.value.formIds.push({ id: element.id })
	})

	const result = await Promise.resolve(onDraft())
	// 임시저장 이후 결과값이 성공(0) 이 아니면 초기화
	if (result !== 0) {
		formState.value.expenseList = []
		formState.value.formIds = []
		await nextTick()
	}
}

const cancelled = ref<boolean>(false)
const onCancel = () => {
	const { remove } = useApprovals()
	Modal.confirm({
		title: "입력된 내용이 모두 삭제됩니다.",
		content: "계속 진행 하시겠습니까?",
		okType: "danger",
		okText: `${formState.value.id ? "삭제" : "작성취소"}`,
		cancelText: "닫기",
		async onOk() {
			if (formState.value.id) {
				await remove(formState.value.id).then((data: Response<any>) => {
					if (data.status === 0) {
						cancelled.value = true
						router.back()
					}
				})
			} else {
				cancelled.value = true
				router.back()
			}
		},
	})
}

/**
 * 결재 상신 모달 OPEN
 * Form 체크 및 결재 상신 모달 오픈 기능 수행
 */
const onSubmit = async () => {
	await onDraft()
	isShowApprove.value = true
}

/**
 * 결재 상신 Action
 * 결재 상신 API 연동 진행
 */
const onApprove = (value: any) => {
	approveFormRef.value
		?.validate()
		.then(() => {
			isShowApprove.value = false
			isShowApproveModal.value = false
			const body = Object.assign({}, formState.value, {
				approvalHeaderId: formState.value.id,
				approvalNumber: formState.value.approvalNumber,
				approvalEmployeeId: formState.value.draftEmployeeId,
				comment: value.content,
				actualApprovalEmployeeId: getEmployeeId.value,
			})
			console.log(body)
			isLoading.value = true
			console.log("상신 데이터>>>", body)
			useCFetch<Response<any>>(`/api/v2/approvals/submit`, {
				method: "PATCH",
				body,
			})
				.then(async (res: Response<any>) => {
					if (res.status === 0) {
						message.success("결재가 상신되었습니다.")
						cancelled.value = true
						await navigateTo("/approvals/processing")
					}
				})
				.finally(() => {
					isLoading.value = false
				})
		})
		.catch((error) => {
			console.log("error", error)
		})
}

/**
 * 임시저장 Action
 * 임시저장 API 연동 진행
 */
const onDraft = async () => {
	const approvalsSave = async (approvalHeaderId?: number): Promise<number> => {
		const body = Object.assign(
			{},
			formState.value,
			approvalHeaderId ? { id: approvalHeaderId } : {}
		)

		isLoading.value = true

		const { data, message, status } = await useCFetch<Response<any>>(
			`/api/v2/approvals${body.id ? "/" + body.id : "/save"}`,
			{
				method: body.id ? "PATCH" : "POST",
				body,
			}
		).finally(() => (isLoading.value = false))

		console.log("저장 응답 상태 >>>", status)
		if (status === 0) {
			formState.value.id = data.id
			if (!body.id) {
				await router.replace({
					params: {
						id: data.id,
					},
				})
			}
		}
		return status || 999
	}

	if (formState.value.approvalFormType === SlipFormType.CARD_ISSUE) {
		if (formState.value.cardIssueForm) {
			try {
				const cardIssues = await writeComponentRef.value?.postCardIssues(
					formState.value.cardIssueForm
				)
				// cardIssues 처리 로직
				if (cardIssues) {
					formState.value.formIds = [{ id: cardIssues.data?.id }]

					return await approvalsSave(cardIssues.data?.approvalHeaderId)
				}
			} catch (error) {
				console.error("카드 이슈 생성 중 오류 발생:", error)
			}
		}
	} else {
		return await approvalsSave()
	}
}

const clearInitData = () => {
	console.log("clearInitData")
	/**
	 * 모달 변수 초기화
	 */
	isShowExpenseModal.value = false
	isShowTaxInvoiceModal.value = false
	isShowApproveModal.value = false
	isShowErpSlipModal.value = false
	/**
	 * 데이터 변수 초기화
	 */
	formState.value = {
		...initFormData,
		companyCode: getCompanyCode.value,
		draftEmployeeId: getEmployeeId.value,
		approvalLineRefer: "",
		expenseList: [],
		formIds: [],
		cardIssueForm: createViewParams<CardIssueViewForm, CardIssueViewFormBrand>({
			id: undefined,
			approvalHeaderId: undefined,
			requestedBy: getEmployeeId.value,
			requestedByEmployeeIds: [getEmployeeId.value],
			companyCode: getCompanyCode.value,
			startDate: useMonth.toDay(),
			endDate: useMonth.todayEnd(),
			usedDate: [useMonth.toDay(), useMonth.todayEnd()],
			cardType: "",
			cardOwnerEmployeeIds: [],
			cardOwnerEmployeeId: "",
			description: "",
			cardIssueRequestStatus: CardIssueRequestStatus.PENDING,
		}),
		familyEventForm: createViewParams<FamilyEventViewForm, FamilyEventFormBrand>({
			actualDate: dayjs(),
			employeeId: "",
			employeeIds: [],
			familEventType: "",
			expendAmount: 0,
			mutualYn: "",
			wreathYn: "",
			expendDate: "",
		}),
	}
	nextTick()

	try {
		clearParams(`/approvals/write-${compCase(String(route.params.type))}`).catch(
			async (data: any) => {
				console.log("스토어의 값이 없는 경우 ... ")
			}
		)
	} catch (e) {
		console.log("Store key Error: ", e)
	}
}

onBeforeRouteLeave((to, from, next) => {
	if (formState.value.id) {
		if (cancelled.value) {
			cancelled.value = false
			clearInitData()
			next()
		} else {
			Modal.confirm({
				title: "작성중인 내용은 전자결재 > 임시저장에 보관됩니다.",
				content: "페이지를 나가시겠습니까?",
				okType: "danger",
				okText: "확인",
				cancelText: "취소",
				onOk() {
					console.log("ok text")
					clearInitData()
					next()
				},
				onCancel() {
					next(false)
				},
			})
		}
	} else {
		clearInitData()
		next()
	}
})

const documentPageAccess = async () => {
	const documentStatus = formState.value.documentStatusName

	if (!documentStatus) return

	//결재 처리 상태, 완료, 반려 등
	const isCurrentApproveProcess = [
		DocumentStatus.progress,
		DocumentStatus.completed,
		DocumentStatus.rejected,
	].includes(documentStatus)
	if (!isCurrentApproveProcess) {
		message.error("현재 결재 진행 문서가 아닙니다.")
		navigateTo("/approvals/home")
	}
}

onActivated(async () => {
	await approvalFormTypeRefresh()
	await documentPageAccess()
})

onMounted(async () => {
	// referenceEmployeeIds 참조자
	// approvalDetails 결재라인 관련자
	// nextApprovalStage 진행 스테이지
	await approvalFormTypeRefresh()
	await documentPageAccess()
	console.log(" 전자결재 홈 ", formState.value)
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-flex align="center" justify="space-between">
				<a-typography-title :level="4" class="page-name">
					{{ approvalFormType }}
				</a-typography-title>
				<a-space :size="5">
					<a-button danger :icon="materialIcons('mso', 'arrow_back')" @click="onCancel">
						{{ formState.id ? "삭제" : "취소" }}
					</a-button>
					<a-button :icon="materialIcons('mso', 'save')" @click="onDraft">
						임시저장
					</a-button>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'edit_square')"
						@click.prevent="onSubmit"
					>
						결재상신
					</a-button>
				</a-space>
			</a-flex>
		</template>
		<template #content>
			<component
				ref="writeComponentRef"
				:is="componentName"
				v-model:id="route.params.id"
				v-model:showApprove="isShowApprove"
				v-model:loading="isLoading"
				v-model:form-data="formState"
				@update:showApprove="(open: boolean) => (isShowApproveModal = open)"
				@history-modal-open="(open: boolean) => (isShowExpenseModal = open)"
				@tax-invoice-modal-open="(open: boolean) => (isShowTaxInvoiceModal = open)"
				@erp-slip-modal-open="(open: boolean) => (isShowErpSlipModal = open)"
				@on-draft="() => onDraft()"
			/>
		</template>
		<template #modal>
			<!-- (경지지출)지출내역 불러오기 모달 -->
			<BringExpenseHistoryModal
				v-if="
					formState.approvalFormType &&
					[
						SlipFormType.DISBURSEMENT_FORM,
						SlipFormType.PERSONAL_EXPENSE_FORM,
						SlipFormType.CARD_FORM,
					].includes(formState.approvalFormType)
				"
				v-model:type="formState.approvalFormType"
				:show="isShowExpenseModal"
				@update:show="(value: boolean) => (isShowExpenseModal = value)"
				@bring="bringExpense"
			/>
			<!-- (세금계산서)지출내역 불러오기 모달 -->
			<tax-invoice-history-modal
				v-if="
					formState.approvalFormType &&
					[SlipFormType.TAX_INVOICE].includes(formState.approvalFormType)
				"
				v-model:type="formState.approvalFormType"
				:show="isShowTaxInvoiceModal"
				@update:show="(value: boolean) => (isShowTaxInvoiceModal = value)"
				@bring="bringTaxInvoice"
			>
			</tax-invoice-history-modal>
			<!-- (ERP)ERP 전표 불러오기 모달 -->
			<erp-slip-history-modal
				v-if="
					formState.approvalFormType &&
					[SlipFormType.ERP_SLIP].includes(formState.approvalFormType)
				"
				v-model:type="formState.approvalFormType"
				:show="isShowErpSlipModal"
				@update:show="(value: boolean) => (isShowErpSlipModal = value)"
				@bring="bringErpSlip"
			>
			</erp-slip-history-modal>

			<field-modal
				title="결재 상신"
				:showed="isShowApproveModal"
				:field="approveData"
				@closed="() => [(isShowApprove = false), (isShowApproveModal = false)]"
				@submit="onApprove"
			>
				<template #content="{ field }">
					<a-flex align="center" class="mb-lg" :gap="10">
						<component
							:is="materialIcons('mso', 'error')"
							class="text-warning"
							style="font-size: 3rem"
						/>
						<a-typography-title :level="4" class="mb-none">
							결재를 상신하겠습니까?
						</a-typography-title>
					</a-flex>

					<a-form
						ref="approveFormRef"
						:model="field"
						label-align="left"
						:colon="false"
						:wrapper-col="{ offset: 2, span: 22 }"
						:label-col="{ offset: 2, span: 22 }"
					>
						<a-form-item name="content" label="상신 의견">
							<a-textarea
								class="fixed"
								placeholder="의견을 입력하세요."
								v-model:value="field.content"
								:rows="6"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
