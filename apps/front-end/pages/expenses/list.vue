<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
// import ExpenseWrite from '@/components/expenses/ExpenseWrite.vue';
import ExpenditureTable from "@/components/expenses/ExpenditureTable.vue"
import {
	IFormType,
	Response,
	RequestParams,
	CommonCode,
	SlipType,
	IFormData,
	createViewParams,
	ExViewParams,
	SortTypes,
	dateTimeFormat,
} from "@/types"
import { type OilExpensesFormData, dateFormat, ExpensesCodeType } from "@/types/expenses"

import type { Data } from "@/types/master/config"
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { type ExpenseList } from "@/types/expenses"
import { SelectLevelType } from "@/types/settings/menu"
import { useExpenseListSearch } from "@/types/expenses/commons/list"

definePageMeta({
	name: "지출작성",
	// pageTransition: {
	//     onBeforeEnter: (el) => {
	//         console.log('Before enter...!!!!', el)
	//     },
	//     onEnter: (el, done) => {},
	//     onAfterEnter: (el) => {},
	//     onAfterLeave: (el) => {
	//         console.log('onAfterLeave...!!!!', el)
	//     },
	// }
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId, getDepartmentId, getCostCenterId } =
	storeToRefs(authStore)

const { getRules } = useExpenseRules()
const { pageSelectRole } = useMenus()

const codeFieldNames = { label: "label", value: "code" }
const allItemField = { label: "전체", code: "", used: true, name: "" }
const oilData = ref<OilExpensesFormData>()
const { searchParams, updateSearchParams } = useExpenseListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)

const {
	data: pageRole,
	execute: pageRoleExecute,
	clear: pageRoleClear,
} = await useAsyncData(`expenses-page-role-name`, async () => {
	const role = await pageSelectRole().selectLevelTypeName
	await getLevelType(role)
	return role
})

// 권한 levelType 결정을 위한 비동기 함수
const getLevelType = async (role: SelectLevelType) => {
	if (role === SelectLevelType.COST_CENTER) {
		// if (role === SelectLevelType.DEPARTMENT) { //TO-DO 부서로 변경시 주석제거
		//인사부서 조회
		console.log("인사부서조회")
		updateSearchParams({
			departmentId: getDepartmentId.value,
			departmentIds: [getDepartmentId.value],
			employeeId: getEmployeeId.value,
			employeeIds: [getEmployeeId.value],
		})
		filterFormValue("departmentId").set([getDepartmentId.value])
		filterFormUrl("employeeId").set(
			`/api/v2/slips/commons/employees?departmentId=${getDepartmentId.value}`
		)
		await nextTick()
	} else if (role === SelectLevelType.PERSONAL) {
		// 개인 조회
		updateSearchParams({
			departmentId: getDepartmentId.value,
			departmentIds: [getDepartmentId.value],
			employeeId: getEmployeeId.value,
			employeeIds: [getEmployeeId.value],
		})
		filterFormValue("departmentId").set([getDepartmentId.value])
		filterFormUrl("employeeId").set(
			`/api/v2/slips/commons/employees?departmentId=${getDepartmentId.value}`
		)
		console.log("개인조회")
		await nextTick()
		// filterFormUrl('employeeId').set(`/api/v2/slips/commons/employees?costCenterId=${filterFormValue('costCenterId')}`)
	} else {
		// filterFormUrl('employeeId').set(`/api/v2/slips/commons/employees?costCenterId=${filterFormValue('costCenterId')}`)
	}
	console.log("getLevelType flag", role)
}

const searchRoleFlag = computed(() => {
	return pageRole.value !== SelectLevelType.GLOBAL
})

const filterFormData = reactive<Array<IFormData>>([
	{
		name: "searchDate",
		label: "기간설정",
		typeInfo: {
			type: "range-picker",
		} as IFormType,
		defaultValue: searchParams.value.filterDate,
	},
	{
		name: "departmentId",
		label: "부서",
		url: `/api/v2/slips/commons/departments`,
		typeInfo: {
			type: "single-table",
			fieldName: { label: "name", value: "id" },
			columns: [
				{
					title: "부서",
					data: (row: any) => row.name,
				},
			],
		} as IFormType,
		defaultValue: [getDepartmentId.value],
		disabled: pageSelectRole().selectLevelTypeName !== SelectLevelType.GLOBAL,
		// 추가적 조건 필요
		// 1. 비용부서에 나 자신이 기타사용자에 포함되어 있을 때 (포함되어져 있는 부서만 조회해야함)
		// 2.
	},
	{
		name: "employeeId",
		label: "사용자",
		url: `/api/v2/slips/commons/employees`,
		typeInfo: {
			type: "single-table",
			fieldName: { label: "name", value: "id" },
			columns: [
				{
					title: "이름",
					data: (row: any) => row.name,
					width: "10rem",
				},
				{ title: "직위", data: (row: any) => row.jobName },
				{ title: "코스트센터", data: (row: any) => row.costCenterName },
				{ title: "부서", data: (row: any) => row.departmentName },
				{
					title: "사업장",
					data: (row: any) => row.workplaceName,
				},
			],
		} as IFormType,
		defaultValue: [getEmployeeId.value],
		disabled: pageSelectRole().selectLevelTypeName === SelectLevelType.PERSONAL,
		divider: true,
	},
	{
		name: "agentFlag",
		label: "대리작성조회",
		typeInfo: {
			type: "checkbox",
		} as IFormType,
		defaultValue: true,
		description: "대리 작성내역 포함",
	},
	{
		name: "agentIds",
		label: "대리작성자",
		url: `/api/v2/slips/expenses/agent`,
		typeInfo: {
			type: "multi-table",
			fieldName: { label: "name", value: "id" },
			columns: [
				{
					title: "이름",
					data: (row: any) => row.name,
					width: "10rem",
				},
				{ title: "직위", data: (row: any) => row.jobName },
				{ title: "부서", data: (row: any) => row.departmentName },
				{
					title: "사업장",
					data: (row: any) => row.workplaceName,
				},
			],
		} as IFormType,
		defaultValue: [getEmployeeId.value],
		divider: true,
		// keyword:
		// disabled: pageSelectRole().selectLevelTypeName === SelectLevelType.PERSONAL,
	},
	{
		name: "projectName",
		label: "프로젝트명",
		defaultValue: "",
	},
	{
		name: "vendorName",
		label: "거래처명",
		// url: `/api/v2/slips/commons/vendors`,
		// typeInfo: {
		// 	type: "single-table",
		// 	fieldName: { label: "name", value: "code" },
		// 	columns: [
		// 		{ title: "가맹점명", data: (row: any) => row.name },
		// 		{ title: "구분", data: (row: any) => row.vendorTypeLabel },
		// 		{
		// 			title: "사용여부",
		// 			data: (row: any) => (row.used ? "사용중" : "미사용"),
		// 		},
		// 	],
		// } as IFormType,
		defaultValue: "",
	},
	{
		name: "accountId",
		label: "계정/비용항목",
		url: `/api/v2/slips/commons/employee-account?companyCode=${getCompanyCode.value}&used=true&emplyeeId=${getEmployeeId.value}&personalExpenseFlag=true&cardFlag=true`,
		rules: [
			{
				required: false,
				type: "array",
			},
		],
		typeInfo: {
			type: "tree",
			fieldName: { label: "name", value: "id" },
		} as IFormType,
		defaultValue: [],
	},
	{
		name: "state",
		label: "상태",
		url: `/api/v2/slips/expenses/types/slipStatuses`,
		rules: [
			{
				required: false,
				type: "array",
			},
		],
		typeInfo: {
			type: "select",
			mode: "multiple",
			fieldName: { label: "label", value: "code" },
		} as IFormType,
		defaultValue: [],
	},
	{
		name: "slipType",
		label: "전표유형",
		url: `/api/v2/slips/expenses/types/slipTypes`,
		rules: [
			{
				required: false,
				type: "array",
			},
		],
		typeInfo: {
			type: "select",
			mode: "multiple",
			fieldName: { label: "label", value: "code" },
		} as IFormType,
		defaultValue: [],
	},
	// {
	//   name: 'state',
	//   label: '상태',
	//   url: '/api/v2/slips/expenses/types/slipStatuses',
	//   typeInfo: {
	//     type: 'multi-checkbox',
	//     indeterminate: false,
	//     checkAll: false,
	//     checkedList: [],
	//     fieldName: {
	//       label: 'label',
	//       value: 'code',
	//     },
	//   } as IFormType,
	//   defaultValue: [],
	// },
	// {
	//   name: 'slipType',
	//   label: '지출유형선택',
	//   url: '/api/v2/slips/expenses/types/slipTypes',
	//   typeInfo: {
	//     type: 'multi-checkbox',
	//     fieldName: {
	//       label: 'label',
	//       value: 'code',
	//     },
	//   } as IFormType,
	//   defaultValue: [],
	// },
])

const filterFormValue = (key: string) => ({
	get: () => {
		const item = filterFormData.find((x: any) => x.name === key)
		return item ? item.defaultValue : undefined
	},
	set: (value: any) => {
		const index = filterFormData.findIndex((x: any) => x.name === key)
		if (index !== -1) {
			filterFormData[index] = { ...filterFormData[index], defaultValue: value }
		}
	},
})

const filterFormUrl = (key: string) => ({
	get: () => {
		const item = filterFormData.find((x: any) => x.name === key)
		return item ? item.url : undefined
	},
	set: (value: any) => {
		const item = filterFormData.find((x: any) => x.name === key)
		if (item) {
			item.url = value
			item.refresh = true
		}
	},
})

const filterFormDisabled = (key: string) => ({
	get: () => {
		const item = filterFormData.find((x: any) => x.name === key)
		return item ? item.disabled : false
	},
	set: (value: any) => {
		const item = filterFormData.find((x: any) => x.name === key)
		if (item) {
			item.disabled = value
		}
	},
})
const showExpenseModal = ref<boolean>(false)
type PropsCardHistoryType = {
	show: boolean
}
type PropsCardHistoryBrand = "PropsCardHistoryBrand"
const showCardHistoryModal = ref<boolean>(false)
const showOilExpenseModal = ref<boolean>(false)
const showReceiptModal = ref<boolean>(false)

const cardHistoryParams = computed(() =>
	createViewParams<PropsCardHistoryType, PropsCardHistoryBrand>({
		show: showCardHistoryModal.value,
	})
)

const selectedData = ref<any>(undefined)
const selectedSlipType = ref<SlipType>(SlipType.PERSONAL_EXPENSE)

const onExpenseModal = async (data: any, slipType: SlipType) => {
	if (data?.fuelSlipFlag) return onOilExpenseModal(data)
	if (expenseRules.value) {
		showExpenseModal.value = true
		selectedData.value = data
		selectedSlipType.value = slipType
	} else {
		message.error(
			`경비기준 관리 설정이 되어있지 않습니다. 직접 설정 또는 담당자에게 문의하여 주시기 바랍니다.`
		)
	}
}

const onUpdateExpenseModal = (value: boolean) => {
	showExpenseModal.value = value
	if (!value) {
		expensesRefresh()
	}
	selectedData.value = undefined
}

const onCardHistoryModal = () => {
	if (expenseRules.value) {
		showCardHistoryModal.value = true
	} else {
		message.error(
			`경비기준 관리 설정이 되어있지 않습니다. 직접 설정 또는 담당자에게 문의하여 주시기 바랍니다.`
		)
	}
}

const onOilExpenseModal = (data?: any) => {
	if (expenseRules.value) {
		showOilExpenseModal.value = true
		if (data) getOilExpenseDetail(data)
	}
}

const onReceiptModal = () => {
	if (expenseRules.value) {
		showReceiptModal.value = true
	} else {
		message.error(
			`경비기준 관리 설정이 되어있지 않습니다. 직접 설정 또는 담당자에게 문의하여 주시기 바랍니다.`
		)
	}
}

const onUpdateOilExpenseModal = () => {
	showOilExpenseModal.value = false
}

const onUpdateCardHistoryModal = (
	newParams: ExViewParams<PropsCardHistoryType, PropsCardHistoryBrand>
) => {
	showCardHistoryModal.value = newParams.show
	if (!newParams.show) {
		expensesRefresh()
	}
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		searchDateFrom: dateString[0],
		searchDateTo: dateString[1],
	})
	filterFormValue("searchDate").set(value)
}

const submit = (value: Array<IFormData>) => {
	const formData = value.reduce(
		(acc, { name, defaultValue }) => {
			acc[name] = defaultValue || undefined
			return acc
		},
		{} as Record<string, any>
	)

	const {
		searchDate,
		state,
		slipType,
		accountId,
		employeeId,
		departmentId,
		projectName,
		vendorName,
		agentFlag,
		agentIds,
	} = formData

	updateSearchParams({
		pageNumber: 0,
		filterDate: searchDate,
		searchDateFrom: dayjs(searchDate[0]).format(dateFormat),
		searchDateTo: dayjs(searchDate[1]).format(dateFormat),
		employeeId: employeeId[0],
		employeeIds: employeeId,
		departmentId: departmentId[0],
		departmentIds: departmentId,
		accountId,
		slipStatus: _isEmpty(state) ? "" : state,
		slipType: _isEmpty(slipType) ? "" : slipType,
		amountFrom: undefined,
		amountTo: undefined,
		projectName,
		vendorName: vendorName ? vendorName : "",
		agentFlag,
		agentIds,
	})

	expensesRefresh()
}

const onSearch = (data: any) => {
	const { filterDate, employeeId, departmentId } = searchParams.value
	const slipStatus =
		typeof searchParams.value.slipStatus == "object"
			? searchParams.value.slipStatus[0]
			: searchParams.value.slipStatus
	const slipType =
		typeof searchParams.value.slipType == "object"
			? searchParams.value.slipType[0]
			: searchParams.value.slipType

	updateSearchParams({
		pageNumber: 0,
		filterDate: filterDate,
		searchDateFrom: dayjs(filterDate[0]).format(dateFormat),
		searchDateTo: dayjs(filterDate[1]).format(dateFormat),
		employeeId: employeeId,
		employeeIds: undefined,
		departmentId: departmentId,
		departmentIds: undefined,
		accountId: undefined,
		slipStatus: _isEmpty(slipStatus) ? "" : slipStatus,
		slipType: _isEmpty(slipType) ? "" : slipType,
		amountFrom: undefined,
		amountTo: undefined,
		projectName: undefined,
		vendorName: undefined,
		agentFlag: undefined,
		agentIds: undefined,
	})

	expensesExecute()
	// expensesRefresh();
}

const setPagination = async (pagination: any, sorter: any) => {
	updateSearchParams({
		sort: sorter,
		pageNumber: pagination.current,
		size: pagination.pageSize,
	})

	expensesExecute()
}

const updateUrlWithDateRange = () => {
	const filterDateFrom = searchParams.value.filterDate[0]
	const filterDateTo = searchParams.value.filterDate[1]
	const companyCode = getCompanyCode.value
	const employeeId = getEmployeeId.value

	// URL 갱신
	filterFormData.forEach((item) => {
		if (item.name === "agentIds" && item.url) {
			item.url = `/api/v2/slips/expenses/agent?companyCode=${companyCode}&employeeId=${employeeId}&searchDateFrom=${filterDateFrom ? dayjs(filterDateFrom).format("YYYY-MM-DD") : ""}&searchDateTo=${filterDateTo ? dayjs(filterDateTo).format("YYYY-MM-DD") : ""}`
		}
	})
}

const onChangeMonth = (e: any) => {
	const { value } = e.target

	const rangeDate: [Dayjs, Dayjs] =
		value === "당월"
			? [useMonth.from(), useMonth.to()]
			: [useMonth.lastFrom(), useMonth.to()]
	updateSearchParams({
		filterDate: rangeDate,
		pageNumber: 0,
		searchDateFrom: dayjs(rangeDate[0]).format("YYYY-MM-DD"), //시작일
		searchDateTo: dayjs(rangeDate[1]).format("YYYY-MM-DD"), //종료일
	})
	filterFormValue("searchDate").set(rangeDate)
}

const {
	data: expenseRules,
	status: expenseRulesStatus,
	refresh: expenseRulesRefresh,
	execute: expenseRulesExecute,
	clear: expenseRulesClear,
} = await useAsyncData(`expenses-roles-list`, async () =>
	getRules().then((res: Response<Data>) => ({
		...res.data,
		approvalLimitStartDay: res.data?.approvalLimitStartDayName || "",
		approvalLimitEndDay: res.data?.approvalLimitEndDayName || "",
	}))
)

const getOilExpenseDetail = async (data: any) => {
	await useCFetch<Response<any>>(`/api/v2/slips/expenses/${data.id}`, {
		method: "GET",
		params: { id: data.id },
	}).then((res) => {
		if (res.status === 0) oilData.value = res.data
	})
}

const { getExpenseType } = useExpenseTypes()

const {
	data: expensesTypes,
	pending: expensesTypesPending,
	refresh: expensesTypesRefresh,
	execute: expensesTypesExecute,
	clear: expensesTypesClear,
} = await useAsyncData(`expenses-types-list`, async () => {
	const [
		slipTypes, //전표유형
		slipStatuses, //전표상태
		// slipRequestTypes, //신청유형
		// slipEvidenceTypes, //증빙유형
		// slipCalculationTypes, //정산유형
		// osTypes, //기기유형
		// currencyTypes, //통화유형
		// bankTypes, //은행유형
	] = await Promise.all([
		getExpenseType(ExpensesCodeType.SLIP_TYPES),
		getExpenseType(ExpensesCodeType.SLIP_STATUSES),
		// getExpenseType(ExpensesCodeType.SLIP_REQUEST_TYPES),
		// getExpenseType(ExpensesCodeType.SLIP_EVIDENCE_TYPES),
		// getExpenseType(ExpensesCodeType.SLIP_CALCULATION_TYPES),
		// getExpenseType(ExpensesCodeType.CURRENCY_TYPES),
		// getExpenseType(ExpensesCodeType.OS_TYPE),
		// getExpenseType(ExpensesCodeType.COUNTRY_TYPES),
		// getExpenseType(ExpensesCodeType.BANK_TYPES),
	])
	return {
		slipTypes,
		slipStatuses,
		// slipRequestTypes,
		// slipEvidenceTypes,
		// slipCalculationTypes,
		// osTypes,
		// currencyTypes,
		// bankTypes,
	}
})

/**
 * 모달에서의 현 인덱싱 값을 제어하기 위해 데이터를 재가공함.
 * @param searchParams
 */
const fetchExpenses = async (searchParams: any) => {
	// console.log("searchParams ", searchParams)
	const response = await useCFetch<Response<Array<ExpenseList>>>(
		"/api/v2/slips/expenses",
		{
			method: "GET",
			params: {
				page: searchParams.pageNumber > 1 ? searchParams.pageNumber - 1 : 0,
				...searchParams,
				slipType: searchParams.slipType,
				slipStatus: searchParams.slipStatus,
				employeeId: getEmployeeId.value,
			},
		}
	).catch((error) => {
		showError(error)
	})

	if (response?.data && Array.isArray(response.data)) {
		const ids = response.data.map((item) => item.id)
		const uniqueIds = Array.from(new Set(ids)).filter(
			(id): id is number => id !== undefined
		)
		const idToIndexMap = new Map(uniqueIds.map((id, index) => [id, index + 1]))

		response.data = response.data.map((item, index) => ({
			...item,
			index,
			groupedIndices: item.id !== undefined ? idToIndexMap.get(item.id) || null : null,
		}))
	}

	return response
}

const {
	data: expenses,
	refresh: expensesRefresh,
	execute: expensesExecute,
	status: expensesStatus,
	error: expensesError,
	clear: expensesClear,
} = await useAsyncData("slip-expenses-list", async () => {
	return fetchExpenses(searchParams.value)
})

onMounted(async () => {
	await pageRoleExecute()
	await expensesTypesExecute()
	await expenseRulesExecute()
	await expensesExecute()
})

onActivated(async () => {
	await pageRoleExecute()
	await expensesTypesExecute()
	await expenseRulesExecute()
	await expensesExecute()
})

onBeforeRouteLeave(() => {
	pageRoleClear()
	expensesClear()
	// expensesTypesClear();
	expenseRulesClear()

	if (showExpenseModal.value) {
		showExpenseModal.value = false
	}
})
watch(
	() => searchParams.value.filterDate,
	() => {
		updateUrlWithDateRange()
	},
	{ immediate: true }
)
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				개인경비, 법인카드 유형의 지출을 작성할 수 있습니다. 작성된 지출내역을 선택해
				지출결의서를 기안 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기간설정</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>

				<a-col>
					<a-radio-group
						v-model:value="searchParams.month"
						option-type="button"
						:options="[
							{ label: '당월', value: '당월' },
							{ label: '전월', value: '전월' },
						]"
						@change="onChangeMonth"
					/>
				</a-col>
				<a-col>
					<a-space>
						<span>분류</span>
						<!-- 
            mode="multiple"
              :max-tag-count="1"
              optionLabelProp="label"
              :tag-render="(props: any) => props.label"
               -->
						<a-select
							style="width: 12rem"
							v-model:value="searchParams.slipType"
							:field-names="codeFieldNames"
							:options="expensesTypes!.slipTypes"
							@change="
								(value: any) => {
									searchParams.pageNumber = 0
									// if (value.length > 1) {
									//   // 하나의 값만 유지하도록 설정
									//   searchParams.slipType = [value[value.length - 1]];
									// } else {
									//   searchParams.slipType = value;
									// }
								}
							"
						>
							<template v-if="expensesTypesPending" #notFoundContent>
								<a-spin size="small" />
							</template>
						</a-select>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>상태</span>
						<!-- 
            mode="multiple"
              :max-tag-count="1"
              optionLabelProp="label"
              :tag-render="(props: any) => props.label"
               -->
						<a-select
							style="width: 12rem"
							:field-names="codeFieldNames"
							v-model:value="searchParams.slipStatus"
							:options="expensesTypes!.slipStatuses"
							@change="
								(value: any) => {
									searchParams.pageNumber = 0
									// if (value.length > 1) {
									//   // 하나의 값만 유지하도록 설정
									//   searchParams.slipStatus = [value[value.length - 1]];
									// } else {
									//   searchParams.slipStatus = value;
									// }
									filterFormValue('state').set([value])
								}
							"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>부서</span>
						<eacc-select-table
							:url="`/api/v2/slips/commons/departments`"
							v-model:value="searchParams.departmentIds"
							refresh
							key-props="id"
							label-prop="name"
							:columns="[
								{
									title: '부서',
									data: (row: any) => row.name,
								},
							]"
							@update:value="
								(value: any) => {
									searchParams.departmentId = value[0]
									filterFormValue('departmentId').set(value)
								}
							"
							:disabled="pageSelectRole().selectLevelTypeName !== SelectLevelType.GLOBAL"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>사용자</span>
						<eacc-select-table
							v-if="searchParams.departmentId"
							:url="`/api/v2/slips/commons/employees${searchParams.departmentId ? '?departmentId=' + searchParams.departmentId : ''}`"
							v-model:value="searchParams.employeeIds"
							key-props="id"
							refresh
							label-prop="name"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '코스트센터', data: (row: any) => row.costCenterName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="
								(value: any) => {
									searchParams.employeeId = value[0]
									filterFormValue('employeeId').set(value)
								}
							"
							:disabled="pageRole === SelectLevelType.PERSONAL"
						/>
						<eacc-select-table
							v-else
							:url="`/api/v2/slips/commons/employees`"
							v-model:value="searchParams.employeeIds"
							key-props="id"
							refresh
							label-prop="name"
							:columns="[
								{
									title: '이름',
									data: (row: any) => row.name,
									width: '10rem',
								},
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '코스트센터', data: (row: any) => row.costCenterName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="
								(value: any) => {
									searchParams.employeeId = value[0]
									filterFormValue('employeeId').set(value)
								}
							"
							:disabled="pageRole === SelectLevelType.PERSONAL"
						/>
					</a-space>
				</a-col>
				<a-col>
					<eacc-filter-button
						v-model:form-data="filterFormData"
						:loading="expensesStatus === 'pending'"
						:icon="materialIcons('mso', 'filter_alt')"
						@update:form-data="(params: Array<IFormData>) => {}"
						@update:form-data-item="
							(params: IFormData) => {
								if (params.name === 'agentFlag') {
									filterFormDisabled('agentIds').set(!params.defaultValue)
								}
								if (params.name === 'searchDate') {
									searchParams.filterDate = params.defaultValue
								}
							}
						"
						@submit="submit"
					>
						상세검색
					</eacc-filter-button>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						size="middle"
						:modal-open="false"
						:data="searchParams"
						@click="onSearch"
					/>
				</a-col>
			</a-row>
			<a-divider class="my-md" />
			<a-spin :spinning="expensesStatus === 'pending' ? true : false">
				<expenditure-table
					v-if="expenses"
					:expense-data="expenses"
					@expense-modal="onExpenseModal"
					@card-history-modal="onCardHistoryModal"
					@oil-expense-modal="onOilExpenseModal"
					@receipt-modal="onReceiptModal"
					@pagination="setPagination"
					@refresh="expensesRefresh"
				/>
			</a-spin>
		</template>
		<template #modal>
			<expense-modal
				v-if="expenses && showExpenseModal"
				:show="showExpenseModal"
				:slip-data="selectedData"
				:form-slip-type="selectedSlipType"
				:current-page-data-list="
					_orderBy(removeDuplicatesByKey((expenses.data ??= []), 'id'), ['id'], ['asc'])
				"
				@update:show="onUpdateExpenseModal"
			/>
			<eacc-ocr-modal
				:file-props="{
					companyCode: getCompanyCode,
					fileType: 'RECEIPT',
				}"
				v-model:show="showReceiptModal"
			>
			</eacc-ocr-modal>
			<card-history-modal
				v-if="expenses && cardHistoryParams.show"
				:params="cardHistoryParams"
				@update:params="onUpdateCardHistoryModal"
			>
			</card-history-modal>
			<oil-expenses-modal
				:show="showOilExpenseModal"
				:oilFormData="oilData || {}"
				@update:show="onUpdateOilExpenseModal"
				@refresh="expensesRefresh"
			></oil-expenses-modal>
		</template>
	</page-layout>
</template>
