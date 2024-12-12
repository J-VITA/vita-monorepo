<script setup lang="ts">
import {
	CostCenterParams,
	AccountParams,
	BudgetApplyData,
	BudgetProposalFormData,
} from "@/types/budgets"
import dayjs from "dayjs"
import { Dayjs } from "dayjs"

const {
	show = false,
	type = "allocation",
	editData = {},
} = defineProps<{
	show: boolean
	type: string
	editData: BudgetApplyData
}>()

const emit = defineEmits<{
	(e: "update:value", value: any, type: string): void
	(e: "update:show", value: any): void
	(e: "close", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})

const { $dayjs } = useNuxtApp()
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const addCnt = ref<number>(1)
const authStore = useAuthStore()
const { getCompanyCode, getCostCenterId } = storeToRefs(authStore)
const totalAmount = ref<number>(0)
const saveFormData = ref<Array<BudgetProposalFormData>>([
	{
		id: undefined,
		idx: 0,
		companyCode: getCompanyCode.value,
		approvalId: 0,
		approvalNumber: "",
		budgetRequestType: "",
		budgetRequestStatus: "PENDING",
		requestAmount: 0,
		remainAmount: 0,
		fromYearMonth: "",
		fromCostCenterId: getCostCenterId.value,
		fromAccountId: undefined,
		toYearMonth: "",
		toCostCenterId: getCostCenterId.value,
		toAccountId: undefined,
	},
])

const costCenterSearchParams = ref<CostCenterParams>({
	companyCode: getCompanyCode.value,
	used: true,
})

const accountSearchParams = ref<AccountParams>({
	companyCode: getCompanyCode.value,
	used: true,
})

/**
 * 코스트센터 목록 조회
 * @param costCenterData
 */
const {
	data: costCenterData,
	status: costCenterStatus,
	refresh: costCenterRefresh,
} = await useAsyncData(`budget-proposal-costcenter-list`, () =>
	useCFetch<any>("/api/v2/master/costCenters", {
		method: "GET",
		params: {
			...costCenterSearchParams.value,
		},
	}).then((res: any) => res.data)
)

/**
 * 계정항목 목록 조회
 * @param accountData
 */
const {
	data: accountData,
	status: accountStatus,
	refresh: accountRefresh,
} = await useAsyncData(`budget-proposal-account-list`, () =>
	useCFetch<any>("/api/v2/master/accounts", {
		method: "GET",
		params: {
			...accountSearchParams.value,
		},
	}).then((res: any) => res.data)
)

/**
 * 받는 대상 (To) 추가는 예산 증액 신청만 가능
 */
const addBudgetTo = () => {
	saveFormData.value.push({
		idx: addCnt.value++,
		companyCode: getCompanyCode.value,
		approvalId: 0,
		approvalNumber: "",
		budgetRequestType: "BUDGET_INCREASE",
		budgetRequestStatus: "PENDING",
		requestAmount: 0,
		fromYearMonth: undefined,
		fromCostCenterId: undefined,
		fromAccountId: undefined,
		toYearMonth: "",
		toCostCenterId: getCostCenterId.value,
		toAccountId: 0,
	})
}

const onDeleteBudget = (idx: number | undefined) => {
	if (!idx) return

	saveFormData.value = saveFormData.value.filter((element: any) => {
		return element.idx !== idx
	})
}

const addBudgetFrom = () => {
	if (type === "allocation") {
		saveFormData.value.push({
			idx: addCnt.value++,
			companyCode: getCompanyCode.value,
			approvalId: 0,
			approvalNumber: "",
			budgetRequestType: "BUDGET_ALLOCATION",
			budgetRequestStatus: "PENDING",
			requestAmount: 0,
			fromYearMonth: undefined,
			fromCostCenterId: saveFormData.value[0].toCostCenterId, //to-do 수신자 추가에서 예산 신청서 담당자 ? undefined : saveFormData.value[0].toCostCenterId
			fromAccountId: undefined,
			toYearMonth: saveFormData.value[0].toYearMonth,
			toCostCenterId: saveFormData.value[0].toCostCenterId,
			toAccountId: saveFormData.value[0].toAccountId,
		})
	}
	if (type === "rollover") {
		// 예산 이월은 계정과목 변경 불가
		saveFormData.value.push({
			idx: addCnt.value++,
			companyCode: getCompanyCode.value,
			approvalId: 0,
			approvalNumber: "",
			budgetRequestType: "BUDGET_ROLLOVER",
			budgetRequestStatus: "PENDING",
			requestAmount: 0,
			fromYearMonth: undefined,
			fromCostCenterId: saveFormData.value[0].toCostCenterId, //to-do 수신자 추가에서 예산 신청서 담당자 ? undefined : saveFormData.value[0].toCostCenterId
			fromAccountId: saveFormData.value[0].toAccountId,
			toYearMonth: saveFormData.value[0].toYearMonth,
			toCostCenterId: saveFormData.value[0].toCostCenterId,
			toAccountId: saveFormData.value[0].toAccountId,
		})
	}
}

const disabledDate = (current: Date | Dayjs | null) => {
	if (!current) return false
	const cDate = dayjs(current)

	// 현재 연도와 비교하여, 현재 연도가 아닌 날짜를 비활성화
	const currentYear = dayjs().year()
	return cDate && cDate.year() !== currentYear
}

const saveData = async (data: Array<BudgetProposalFormData>) => {
	try {
		let resultData: Array<BudgetApplyData> = [{}]
		await useCFetch<any>("/api/v2/budgets/request", {
			method: "POST",
			body: [...data],
		}).then((res: any) => {
			resultData = res.data
		})
		return resultData
	} catch (e: any) {
		message.error(e.message)
		return []
	}
}

const patchData = async (data: Array<BudgetProposalFormData>) => {
	try {
		const inData: BudgetProposalFormData = data[0]
		let resultData: boolean = false

		await useCFetch<any>(`/api/v2/budgets/request/${inData.id}`, {
			method: "PATCH",
			body: inData,
		}).then((res: any) => {
			if (res.status === 0) resultData = true
		})
		return resultData
	} catch (e: any) {
		message.error(e.message)
		return false
	}
}

const onCloseModal = () => {
	open.value = false
}

const onSubmit = async (value: any) => {
	const changeSaveForm = saveFormData.value.map((element): BudgetProposalFormData => {
		return {
			...element,
			fromYearMonth: $dayjs(element.fromYearMonth, "YYYY-MM", true).isValid()
				? $dayjs(element.fromYearMonth).format("YYYY-MM")
				: undefined,
			toYearMonth: $dayjs(element.toYearMonth, "YYYY-MM", true).isValid()
				? $dayjs(element.toYearMonth).format("YYYY-MM")
				: undefined,
			idx: undefined,
			remainAmount: undefined,
			fromAccountId: element.fromAccountId ? Number(element.fromAccountId) : undefined,
			toAccountId: Number(element.toAccountId),
		}
	})
	if (!!editData.id) {
		const patchResultStatus: boolean = await patchData(changeSaveForm)
		if (patchResultStatus) {
			saveFormData.value.forEach((element, idx) => {
				emit("update:value", element.id, "patch")
				if (idx + 1 === saveFormData.value.length) open.value = false
			})
		}
	} else {
		const saveResultData: Array<BudgetApplyData> = await saveData(changeSaveForm)
		saveResultData.forEach((element, idx) => {
			emit("update:value", element.id, "post")
			if (idx + 1 === saveResultData.length) open.value = false
		})
	}
}

/**
 * 예산 이월 > 받는 대상, 주는 대상 > 계정항목 동기화
 */
watch(
	() => saveFormData.value[0].toAccountId,
	() => {
		if (type !== "rollover") return
		if (type === "rollover") {
			saveFormData.value = saveFormData.value?.map((element) => {
				return {
					id: element.id,
					companyCode: element.companyCode,
					approvalId: element.approvalId,
					approvalNumber: element.approvalNumber,
					budgetRequestType: element.budgetRequestType,
					budgetRequestStatus: element.budgetRequestStatus,
					requestAmount: 0,
					fromYearMonth: undefined,
					fromCostCenterId: element.toCostCenterId, //to-do 수신자 추가에서 예산 신청서 담당자 ? undefined : element.toCostCenterId
					fromAccountId: element.toAccountId,
					toYearMonth: element.toYearMonth,
					toCostCenterId: element.toCostCenterId,
					toAccountId: element.toAccountId,
				}
			})
		}
	}
)

/**
 * 모달 open > 초기화
 */
watch(
	() => open.value,
	(value) => {
		if (value && !editData.id) {
			saveFormData.value = [
				{
					id: undefined,
					idx: 0,
					companyCode: getCompanyCode.value,
					approvalId: 0,
					approvalNumber: "",
					budgetRequestType:
						type === "increase"
							? "BUDGET_INCREASE"
							: type === "allocation"
								? "BUDGET_ALLOCATION"
								: "BUDGET_ROLLOVER",
					budgetRequestStatus: "PENDING",
					requestAmount: 0,
					remainAmount: 0,
					fromYearMonth: undefined,
					fromCostCenterId: type === "increase" ? undefined : getCostCenterId.value,
					fromAccountId: undefined,
					toYearMonth: undefined,
					toCostCenterId: getCostCenterId.value,
					toAccountId: undefined,
				},
			]
		}
		if (value && !!editData.id) {
			saveFormData.value = [
				{
					id: editData.id,
					idx: 0,
					companyCode: editData.companyCode,
					approvalId: editData.approvalId,
					approvalNumber: editData.approvalNumber,
					budgetRequestType: editData.budgetRequestType?.name,
					budgetRequestStatus: editData.budgetRequestStatus?.code,
					requestAmount: editData.requestAmount,
					remainAmount: 0,
					fromYearMonth: type === "increase" ? undefined : dayjs(editData.fromYearMonth),
					fromCostCenterId: type === "increase" ? undefined : editData.fromCostCenter?.id,
					fromAccountId: type === "increase" ? undefined : editData.fromAccount?.id,
					toYearMonth: dayjs(editData.toYearMonth),
					toCostCenterId: editData.toCostCenter?.id,
					toAccountId: editData.toAccount?.id,
				},
			]
		}
	}
)

/**
 * 신청금액 합계
 */
// saveFormData 배열을 감시하고, 변경이 있을 때마다 totalAmount를 갱신
watch(
	() => saveFormData.value,
	(newData) => {
		// newData는 saveFormData가 변경된 후의 값
		totalAmount.value = newData.reduce((acc, item, idx) => {
			if (!item.requestAmount) return 0
			return acc + item.requestAmount
		}, 0)
	},
	{ deep: true } // 배열 내 객체 속성 변화도 추적하기 위해 deep 옵션 사용
)
</script>

<template>
	<div>
		<field-modal
			:title="
				type === 'allocation'
					? '예산전용신청'
					: type === 'increase'
						? '예산증액신청'
						: '예산이월신청'
			"
			okText="저장"
			size="large"
			cancelText="취소"
			:showed="open"
			:field="saveFormData"
			@closed="onCloseModal"
			@submit="(data: any) => onSubmit(data)"
		>
			<template #content>
				<!-- ref="budgetProposalFormRef" -->
				<a-form label-align="left" layout="horizontal">
					<div v-if="type !== 'increase'">
						<a-descriptions
							:colon="false"
							title="받는대상(To)"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							:style="{ width: 'auto' }"
						>
							<a-descriptions-item :label="'예산년월'" :span="1.5">
								<a-date-picker
									v-model:value="saveFormData[0].toYearMonth"
									picker="month"
									:disabledDate="disabledDate"
									:style="{ width: '20rem' }"
								></a-date-picker>
							</a-descriptions-item>
							<a-descriptions-item :label="'코스트센터'" :span="1.5">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="saveFormData[0].toCostCenterId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="코스트센터를 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									:disabled="type !== 'increase'"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="costCenterData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'계정항목'" :span="1.5">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="saveFormData[0].toAccountId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="계정항목을 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="accountData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'예산잔액'" :span="1.5">
								<eacc-amount-input
									v-model:value="saveFormData[0].remainAmount"
									disabled
									:style="{ width: '20rem' }"
								/>
							</a-descriptions-item>
							<a-descriptions-item
								v-if="type !== 'increase'"
								:label="'신청금액 합계'"
								:span="1.5"
							>
								<eacc-amount-input
									v-model:value="totalAmount"
									:disabled="type !== 'increase'"
									style="width: 20rem"
								/>
							</a-descriptions-item>
							<a-descriptions-item
								v-if="type === 'increase'"
								:label="'신청금액'"
								:span="1.5"
							>
								<eacc-amount-input
									v-model:value="saveFormData[0].requestAmount"
									:disabled="type !== 'increase'"
									style="width: 20rem"
								/>
							</a-descriptions-item>
						</a-descriptions>
					</div>
					<div>
						<a-divider v-if="type !== 'increase'" />
						<a-descriptions
							:colon="false"
							:labelStyle="{ width: '100px', paddingTop: '5px' }"
							v-for="(item, idx) in saveFormData"
							:key="'proposal-' + idx"
							:style="{ width: 'auto' }"
						>
							<template #title>
								<div>
									<span v-if="type === 'increase'">
										{{ idx == 0 ? "받는대상(To)" : `받는대상 ${idx}` }}
									</span>
									<span v-if="type !== 'increase'">
										{{ idx == 0 ? "주는대상(From)" : `주는대상 ${idx}` }}
									</span>
									<a-button
										v-if="idx > 0"
										:icon="materialIcons('mso', 'do_not_disturb_on')"
										ghost
										danger
										:style="{ marginLeft: '10px' }"
										@click="onDeleteBudget(item.idx)"
									/>
								</div>
							</template>
							<a-descriptions-item :label="'예산년월'" :span="1.5">
								<a-date-picker
									v-if="type !== 'increase'"
									v-model:value="item.fromYearMonth"
									picker="month"
									:disabledDate="disabledDate"
									:style="{ width: '20rem' }"
								></a-date-picker>
								<a-date-picker
									v-if="type === 'increase'"
									v-model:value="item.toYearMonth"
									picker="month"
									:style="{ width: '20rem' }"
								></a-date-picker>
							</a-descriptions-item>
							<a-descriptions-item :label="'코스트센터'" :span="1.5">
								<a-tree-select
									v-if="type !== 'increase'"
									:style="{ width: '20rem' }"
									v-model:value="item.fromCostCenterId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="코스트센터를 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									:disabled="type !== 'increase'"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="costCenterData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
								<a-tree-select
									v-if="type === 'increase'"
									:style="{ width: '20rem' }"
									v-model:value="item.toCostCenterId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="코스트센터를 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="costCenterData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'계정항목'" :span="1.5">
								<a-tree-select
									v-if="type !== 'increase'"
									:style="{ width: '20rem' }"
									v-model:value="item.fromAccountId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="계정항목을 선택해주세요."
									:disabled="type === 'rollover'"
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="accountData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
								<a-tree-select
									v-if="type === 'increase'"
									:style="{ width: '20rem' }"
									v-model:value="item.toAccountId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="계정항목을 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="accountData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'예산잔액'" :span="1.5">
								<eacc-amount-input
									v-model:value="item.remainAmount"
									disabled
									:style="{ width: '20rem' }"
								/>
							</a-descriptions-item>
							<a-descriptions-item :label="'신청금액'" :span="1.5">
								<eacc-amount-input
									v-model:value="item.requestAmount"
									:disabled="false"
									style="width: 20rem"
								/>
							</a-descriptions-item>
						</a-descriptions>
						<a-button
							v-if="type !== 'increase' && !editData.id"
							:icon="materialIcons('mso', 'add')"
							type="primary"
							ghost
							@click="addBudgetFrom"
							>주는대상 추가</a-button
						>
						<a-button
							v-if="type === 'increase' && !editData.id"
							:icon="materialIcons('mso', 'add')"
							type="primary"
							ghost
							@click="addBudgetTo"
							>받는대상 추가</a-button
						>
					</div>
				</a-form>
			</template>
		</field-modal>
	</div>
</template>
