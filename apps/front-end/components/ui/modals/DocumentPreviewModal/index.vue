<script lang="ts" setup>
import ApprovalProgressHistoryButton from "@/components/approvals/read/ApprovalProgressHistoryButton/index.vue"

import { materialIcons } from "@/composables/icons"
import { SlipFormType, type Response } from "@/types"
import {
	type FormData,
	initFormData,
	type PostApprovalOptionType,
	ApprovalFromType,
} from "@/types/approvals/document"
import { ExpenseList } from "@/types/expenses"
import { useApprovalRules } from "@/composables/useApprovalRules"
import { ApprovalRules } from "@/types/master/approval-flows"

type Props = {
	show: boolean
	id: string | number
	slipType: SlipFormType
}

/**
 * props에 data 와 id 가 함께 존재할 수 없다 (data or id)
 * props.data 가 존재하면 신규 미리보기
 * props.id 가 존재하면 한번은 저장한 내역이 있는 문서이므로 문서아이디로 통신후 데이터를 넣으면 된다.
 */
// const { show, id, slipType } = defineProps<Props>()
const props = withDefaults(defineProps<Props>(), {
	show: false,
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { getApprovalRules } = useApprovalRules()
const approvalRules = ref<ApprovalRules>()

const documentRef = useTemplateRef<{ reload: () => void }>("documentRef")

const componentMap: Record<string, () => Promise<Component>> = {
	PersonalExpenseForm: () =>
		import("@/components/approvals/preview/PersonalExpenseForm/index.vue"),
	// DisbursementForm: () =>
	CardIssue: () => import("@/components/approvals/preview/CardIssue/index.vue"),
	CardForm: () => import("@/components/approvals/preview/CardForm/index.vue"),
	TaxInvoice: () => import("@/components/approvals/preview/TaxInvoice/index.vue"),
	FamilyEvent: () => import("@/components/approvals/preview/FamilyEvent/index.vue"),
	ErpSlip: () => import("@/components/approvals/preview/ErpSlip/index.vue"),
	// 다른 컴포넌트들도 여기에 추가하세요
}

const componentName = computed<Component>(() => {
	const type = props.slipType as string
	const componentType = compCase(type)

	const asyncComponent = componentMap[componentType]

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
			return response.data?.filter((element: any) => {
				return (
					element.code.replaceAll("_", "").toLowerCase() === props.slipType.toLowerCase()
				)
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
 * 후결자 리스트 API
 */
const { data: postApprovalOptions } = await useAsyncData(`post-approval-options`, () =>
	useCFetch<Response<PostApprovalOptionType[]>>(
		"/api/v2/approvals/changes/postApprovals",
		{
			method: "GET",
			params: {
				approvalHeaderId: props.id,
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

const initializeComponent = async () => {
	await approvalFormTypeRefresh()
	await documentReload()
}

const slipId = ref<string | number>("")
onBeforeMount(async () => {
	approvalRules.value = (await getApprovalRules()).data
	slipId.value = props.id
})

onMounted(async () => {
	await initializeComponent()
})

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "update:id", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})

watch(
	() => props.show,
	async (value) => {
		if (value) {
			await initializeComponent()
		}
	},
	{
		immediate: true,
		deep: true,
	}
)
</script>
<template>
	<a-modal
		centered
		width="60%"
		v-model:open="open"
		title="결재 문서 상세"
		:destroy-on-close="true"
		:footer="false"
	>
		<page-layout>
			<template #header>
				<a-flex align="center" justify="space-between">
					<a-typography-title :level="4" class="page-name">
						{{ approvalFormType }}
					</a-typography-title>
					<a-space :size="5">
						<a-button :icon="materialIcons('mso', 'print')"> 인쇄 </a-button>

						<!-- 결재이력상세 -->
						<approval-progress-history-button :data="formState" />
					</a-space>
				</a-flex>
			</template>

			<template #content>
				<component
					ref="documentRef"
					:is="componentName"
					v-model:id="slipId"
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
			</template>
		</page-layout>
	</a-modal>
</template>
