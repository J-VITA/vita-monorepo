<script setup lang="ts">
import PostApprovalButton from "@/components/approvals/read/PostApprovalButton/index.vue"
import ReApprovalButton from "@/components/approvals/read/ReApprovalButton/index.vue"
import CompletedApprovalButton from "@/components/approvals/read/CompletedApprovalButton/index.vue"
import WithdrawApprovalButton from "@/components/approvals/read/WithdrawApprovalButton/index.vue"
import DelegateApprovalButton from "@/components/approvals/read/DelegateApprovalButton/index.vue"
import ApprovalProgressHistoryButton from "@/components/approvals/read/ApprovalProgressHistoryButton/index.vue"
import ApprovalLineButton from "@/components/approvals/document/ApprovalLineButton/index.vue"

import { materialIcons } from "@/composables/icons"
import { type Response } from "@/types"
import {
	type FormData,
	initFormData,
	DocumentStatus,
	type PostApprovalOptionType,
	IApprovalDetail,
	IApprovalEmployee,
	ApprovalFromType,
	DocumentStatusType,
} from "@/types/approvals/document"
import { ExpenseList } from "@/types/expenses"
import { useApprovalRules } from "@/composables/useApprovalRules"
import { ApprovalRules } from "@/types/master/approval-flows"
import Budget from "~/components/ui/svg/Budget.vue"

definePageMeta({
	name: "결재문서 조회",
	middleware: ["dynamic"],
})

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { getApprovalRules } = useApprovalRules()
const approvalRules = ref<ApprovalRules>()

const documentRef = useTemplateRef<{ reload: () => void }>("documentRef")

const componentMap: Record<string, () => Promise<Component>> = {
	PersonalExpenseForm: () =>
		import("@/components/approvals/read/PersonalExpenseForm.vue"),
	DisbursementForm: () =>
		import("@/components/approvals/read/DisbursementForm/index.vue"),
	CardIssue: () => import("@/components/approvals/read/CardIssue/index.vue"),
	CardForm: () => import("@/components/approvals/read/CardForm/index.vue"),
	TaxInvoice: () => import("@/components/approvals/read/TaxInvoice/index.vue"),
	FamilyEvent: () => import("@/components/approvals/read/FamilyEvent/index.vue"),
	ErpSlip: () => import("@/components/approvals/read/ErpSlip/index.vue"),
	Budget: () => import("@/components/approvals/read/Budget/index.vue"),
	// 다른 컴포넌트들도 여기에 추가하세요
}

const componentName = computed<Component>(() => {
	const type = route.params.type

	if (typeof type === "string") {
		const componentType = compCase(type)
		const asyncComponent = componentMap[type]

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

/**
 * 결재양식 조회
 */
const { data: approvalFormType, refresh: approvalFormTypeRefresh } = await useAsyncData(
	`approval-read-form-types-title`,
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

const isLoading = ref<boolean>(false)
const formState = ref<FormData>({
	...initFormData,
	companyCode: getCompanyCode.value,
	actualApprovalEmployeeId: getEmployeeId.value,
})

/**
 * 지출내역 디테일
 * ExpenseList
 */
// * ExpenseDetailsRequest
const isShowExpenseDetail = ref<boolean>(false)
const expenseId = ref<number | undefined>(undefined)
const onExpenseDetail = (data: ExpenseList) => {
	expenseId.value = data.id
	isShowExpenseDetail.value = true
}

/**
 * 세금계산서 내역 상세
 * TODO: 타입 변경하고, 플래그 연결 모달에 해줄것...
 */
const isShowTaxInvoiceDetail = ref<boolean>(false)
const taxInvoiceId = ref<number | undefined>(undefined)
const onTaxInvoiceDetail = (data: ExpenseList) => {
	taxInvoiceId.value = data.id
	isShowTaxInvoiceDetail.value = true
}

/**
 * ERP 전표 내역 상세
 * TODO: 타입 변경하고, 플래그 연결 모달에 해줄것...
 */
const isShowErpSlipDetail = ref<boolean>(false)
const erpSlipId = ref<number | undefined>(undefined)
const onErpSlipDetail = (data: ExpenseList) => {
	erpSlipId.value = data.id
	isShowErpSlipDetail.value = true
}

/**
 * 삭제
 */
const onDelete = async (data: FormData) => {
	console.log(data)
	const { remove } = useApprovals()
	if (data.id) {
		await remove(data.id).then((res: Response<any>) => {
			if (res.status === 0) {
				router.back()
			} else {
				message.error(`${res.message}`)
			}
		})
	}
}

/**
 * 후결자 리스트 API
 */
const { data: postApprovalOptions } = await useAsyncData(`post-approval-options`, () =>
	useCFetch<Response<PostApprovalOptionType[]>>(
		"/api/v2/approvals/changes/postApprovals",
		{
			method: "GET",
			params: {
				approvalHeaderId: route.params.id,
				changeEmployeeId: getEmployeeId.value,
				isPostApproval: true,
			},
		}
	).then(
		(res: Response<PostApprovalOptionType[]>) =>
			res.data?.map((x: PostApprovalOptionType) => ({
				label: x.postApprovalEmployeeName,
				value: x.approvalDetailId,
			})) || []
	)
)

/**
 * 문서 Reload 처리
 * # (필수)문서 타입에 맞는 컴포넌트 작성 시에 반드시 문서의 상세조회 할 수 있는 reload 함수를 만들어 expose 시켜줘야 함. 그래야 이 함수가 성립함.
 */
const documentReload = async () => {
	await documentRef.value?.reload()
}

/**
 * 해당 문서에 접근 권한이 있는지 체크 함수
 * * 각 문서별 컴포넌트에서의 상세정보를 조회할 때 본 페이지 (read-[type]/[id]/index.vue)의 주기를 맞춰줘서 formState 데이터가 완벽히 싱크되도록 해줘야함.
 * @description
 * - 결재라인에 내가 있으면 패스
 * - 결재라인과 참조자에서 나를 찾아 참조자에 포함되어 있다면 패스
 * - 문서 상태(documentStatusName)가 결재처리(PROGRESS) 내 차례이라면 패스
 * - 대결자라면 패스
 * - 후결자라면 패스
 * - 그 외 경우라면 접근권한이 없는 사람이라고 간주하여 전자결재 홈으로 이동시킴
 */
const documentPageAccess = async () => {
	await documentReload()

	const approvalDetails = formState.value.approvalDetails || []
	const approvalReferrers = formState.value.approvalReferrers || []
	const documentStatus = formState.value.documentStatusName

	if (!documentStatus) return

	const containEmployees: IApprovalEmployee[] = [
		...approvalDetails.map((x: IApprovalDetail) => ({
			id: x.approvalEmployeeId,
			stage: x.stage,
			referer: false,
			actualEmployeeId: x.actualEmployeeId,
		})),
		...approvalReferrers.map((x: IApprovalDetail) => ({
			id: x.approvalEmployeeId,
			stage: 0,
			referer: true,
			actualEmployeeId: -1,
		})),
	]

	if (containEmployees.length === 0) return

	const currentEmployeeId = getEmployeeId.value
	const stageFilterData = containEmployees.filter((x) => !x.referer)
	const refererFilterData = containEmployees.filter((x) => x.referer).map((x) => x.id)
	const approvalLineIds = containEmployees.map((x) => x.id)

	const nextApprovalStage = formState.value.nextApprovalStage || 1
	const isCurrentApprover = stageFilterData.some(
		(x) => x.stage === nextApprovalStage && x.id === currentEmployeeId
	)

	if (
		approvalLineIds.includes(currentEmployeeId) ||
		refererFilterData.includes(currentEmployeeId) ||
		formState.value.delegated
	) {
		// 결재라인에 내가 있거나 참조자 또는 대결자인 경우: 아무 작업 없음
		return
	}

	const currentEmployeeData = stageFilterData.find((x) => x.id === currentEmployeeId)
	if (!currentEmployeeData) {
		message.error("접근 권한이 없는 문서입니다.")
		navigateTo("/approvals/home")
		return
	}

	//결재완료 및 반려인 경우 : 아무 작업 없음.
	if (
		[DocumentStatus.completed, DocumentStatus.rejected].includes(
			documentStatus as DocumentStatusType
		)
	) {
		return
	}

	//결재 처리 상태
	const isCurrentApproveProcess =
		formState.value.documentStatusName === DocumentStatus.progress && isCurrentApprover
	if (currentEmployeeData.actualEmployeeId) {
		if (formState.value.documentStatusName === DocumentStatus.progress) {
			//결재 진행 상태 인 경우 : 아무 작업 없움.
			return
		}
		if (!isCurrentApproveProcess) {
			message.error("현재 결재 진행 문서가 아닙니다.")
			navigateTo("/approvals/home")
		}
	} else {
		// 후결자인 경우: 아무 작업 없음
	}
}

const initializeComponent = async () => {
	await approvalFormTypeRefresh()
	await documentPageAccess()
}

onBeforeMount(async () => {
	approvalRules.value = (await getApprovalRules()).data
})

onActivated(async () => {
	approvalRules.value = (await getApprovalRules()).data

	await initializeComponent()
})

onMounted(async () => {
	await initializeComponent()
})

const showDocument = ref(false)
</script>

<template>
	<page-layout>
		<template #header>
			<a-flex align="center" justify="space-between">
				<a-typography-title :level="4" class="page-name">
					{{ approvalFormType }}
				</a-typography-title>
				<a-space :size="5">
					<a-button :icon="materialIcons('mso', 'list')" @click="router.back()">
						목록
					</a-button>
					<a-button :icon="materialIcons('mso', 'print')"> 인쇄 </a-button>
					<!-- <a-button @click="showDocument = true">미리보기</a-button> -->
					<!-- 결재이력상세 -->
					<approval-progress-history-button :data="formState" />

					<template v-if="formState.documentStatusName === DocumentStatus.progress">
						<!-- 후결처리 -->
						<post-approval-button
							v-if="
								approvalRules?.postApprovalFlag &&
								postApprovalOptions &&
								postApprovalOptions?.length > 0
							"
							:data="formState"
							:options="postApprovalOptions"
							@callback="() => documentReload()"
						/>

						<!-- 결재선 변경 : ALL: 기안자&결재자 , DRAFTER : 기안자, APPROVER : 결재자-->
						<approval-line-button
							v-if="
								approvalRules?.documentModifierTypeName === 'ALL' ||
								(approvalRules?.documentModifierTypeName === 'DRAFTER' &&
									formState.draftEmployeeId === getEmployeeId) ||
								(approvalRules?.documentModifierTypeName === 'APPROVER' &&
									formState.draftEmployeeId !== getEmployeeId)
							"
							name="결재선 변경"
							:isDispatch="true"
							v-model:form-data="formState"
							@callback="() => documentReload()"
						/>

						<!-- 대결 -->
						<delegate-approval-button
							v-if="
								formState.delegated &&
								approvalRules?.delegateApprovalFlag &&
								formState.draftEmployeeId !== getEmployeeId
							"
							:data="formState"
							:pending="isLoading"
							@update:pending="(value) => (isLoading = value)"
							@callback="() => router.push('/approvals/wait')"
						/>
						<!-- 결재 -->
						<completed-approval-button
							v-if="
								approvalRules !== undefined &&
								formState.draftEmployeeId !== getEmployeeId &&
								formState.approvalDetails?.some(
									(x) =>
										x.approvalEmployeeId === getEmployeeId &&
										x.stage === formState.nextApprovalStage
								)
							"
							:data="formState"
							:pending="isLoading"
							:rules="approvalRules"
							@update:pending="(value) => (isLoading = value)"
							@callback="() => router.push('/approvals/wait')"
						/>
						<!--  회수 -->
						<withdraw-approval-button
							v-if="formState.draftEmployeeId === getEmployeeId"
							:data="formState"
							@callback="() => router.back()"
						/>
					</template>
					<template
						v-if="
							formState.documentStatusName &&
							[DocumentStatus.rejected, DocumentStatus.withdrawn].includes(
								formState.documentStatusName as DocumentStatusType
							)
						"
					>
						<!-- 삭제 -->
						<eacc-button
							v-if="formState.draftEmployeeId === getEmployeeId"
							component-is="delete"
							:data="formState"
							:modal-open="true"
							@click="onDelete"
						/>
						<!-- 재기안 -->
						<re-approval-button
							:data="formState"
							@callback="
								async (data) => {
									await navigateTo(
										`/approvals/write-${compCase(data.approvalFormTypeName)}/${data.id}`
									)
								}
							"
						/>
					</template>
				</a-space>
			</a-flex>
		</template>

		<template #content>
			<component
				ref="documentRef"
				:is="componentName"
				v-model:id="route.params.id"
				v-model:loading="isLoading"
				v-model:form-data="formState"
				@expense-detail-data="onExpenseDetail"
				@tax-invoice-detail-data="onTaxInvoiceDetail"
				@erp-slip-detail-data="onErpSlipDetail"
			/>
		</template>
		<template #modal>
			<!--  지출 상세 모달-->
			<eacc-slip-detail-modal
				:show="isShowExpenseDetail"
				:expense-id="expenseId"
				@update:show="
					(value: boolean) => {
						isShowExpenseDetail = value
						expenseId = undefined
					}
				"
			/>
			<!-- TODO : 세금계산서 상세 모달 생성해서 호출할 것 -->
			<tax-invoice-detail-modal
				v-if="taxInvoiceId"
				:show="isShowTaxInvoiceDetail"
				:tax-invoice-id="taxInvoiceId"
				@update:show="
					(value: boolean) => {
						isShowTaxInvoiceDetail = value
						taxInvoiceId = undefined
					}
				"
			/>

			<!-- TODO : 전표내역 상세모달 생성해서 호출 할 것 -->
			<erp-slip-detail-modal
				v-if="erpSlipId"
				:show="isShowErpSlipDetail"
				:erp-slip-id="erpSlipId"
				@update:show="
					(value: boolean) => {
						isShowErpSlipDetail = value
						erpSlipId = undefined
					}
				"
			/>

			<!-- <document-preview-modal
				v-if="formState.id"
				:show="showDocument"
				:id="formState.id"
				:slip-type="compCase(route.params.type as string)"
				:completed="true"
				@update:show="(value) => (showDocument = value)"
			/> -->
		</template>
	</page-layout>
</template>
