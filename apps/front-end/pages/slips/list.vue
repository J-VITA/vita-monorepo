<script lang="ts" setup>
import SlipsCostCenter from "@/components/slips/list/SlipsCostCenter.vue"
import SlipsProject from "@/components/slips/list/SlipsProject.vue"
import SlipsCard from "@/components/slips/list/SlipsCard.vue"
import type { TabPaneProps } from "ant-design-vue"
import {
	createSearchParams,
	pageSize,
	RequestParams,
	SlipFormType,
	SlipType,
} from "@/types"
import { SlipActivityType, TSlipSearch } from "@/types/slips/list"
import { dateFormat } from "@/types/expenses"

definePageMeta({
	name: "전표내역조회",
})

const authStore = useAuthStore()
const {
	getCompanyCode,
	getWorkplaceCode,
	getCostCenterId,
	getEmployeeId,
	getDepartmentId,
} = storeToRefs(authStore)

const activeKey = ref<string>(SlipActivityType.SLIPS_COST_CENTER)
const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(SlipsCostCenter),
		tabKey: SlipActivityType.SLIPS_COST_CENTER,
		id: "코스트센터",
	},
	{
		tab: shallowRef(SlipsProject),
		tabKey: SlipActivityType.SLIPS_PROJECT,
		id: "프로젝트",
	},
	{
		tab: shallowRef(SlipsCard),
		tabKey: SlipActivityType.SLIPS_CARD,
		id: "법인카드",
	},
])
const params = ref<Array<TSlipSearch>>([
	createSearchParams({
		companyCode: getCompanyCode.value,
		requestType: SlipActivityType.SLIPS_COST_CENTER,
		filterDate: [useMonth.lastFrom(), useMonth.to()],
		searchDateFrom: useMonth.lastFrom().format(dateFormat),
		searchDateTo: useMonth.to().format(dateFormat),
		workplaceCodes: [getWorkplaceCode.value],
		workplaceCode: getWorkplaceCode.value,
		costCenterId: getCostCenterId.value,
		costCenterIds: [getCostCenterId.value],
		employeeId: getEmployeeId.value,
		employeeIds: [getEmployeeId.value],
		accountIds: undefined,
		accountId: undefined,
		evidenceVendorName: undefined,
		paymentVendorName: undefined,
		cardNumber: undefined,
		slipType: [],
		slipStatus: [],
		departmentId: getDepartmentId.value,
		departmentIds: [getDepartmentId.value],
		projectIds: [],
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	}),
	createSearchParams({
		companyCode: getCompanyCode.value,
		requestType: SlipActivityType.SLIPS_PROJECT,
		filterDate: [useMonth.lastFrom(), useMonth.to()],
		searchDateFrom: useMonth.lastFrom().format(dateFormat),
		searchDateTo: useMonth.to().format(dateFormat),
		workplaceCodes: [getWorkplaceCode.value],
		workplaceCode: getWorkplaceCode.value,
		costCenterId: undefined,
		costCenterIds: undefined,
		employeeId: getEmployeeId.value,
		employeeIds: [getEmployeeId.value],
		accountIds: undefined,
		accountId: undefined,
		evidenceVendorName: undefined,
		paymentVendorName: undefined,
		cardNumber: undefined,
		slipType: [],
		slipStatus: [],
		departmentId: getDepartmentId.value,
		departmentIds: [getDepartmentId.value],
		projectIds: [],
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	}),
	createSearchParams({
		companyCode: getCompanyCode.value,
		requestType: SlipActivityType.SLIPS_CARD,
		filterDate: [useMonth.lastFrom(), useMonth.to()],
		searchDateFrom: useMonth.lastFrom().format(dateFormat),
		searchDateTo: useMonth.to().format(dateFormat),
		workplaceCodes: [getWorkplaceCode.value],
		workplaceCode: getWorkplaceCode.value,
		costCenterId: undefined,
		costCenterIds: undefined,
		employeeId: getEmployeeId.value,
		employeeIds: [getEmployeeId.value],
		accountIds: undefined,
		accountId: undefined,
		evidenceVendorName: undefined,
		paymentVendorName: undefined,
		cardNumber: undefined,
		slipType: [],
		slipStatus: [],
		departmentId: getDepartmentId.value,
		departmentIds: [getDepartmentId.value],
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	}),
])

const searchParams = computed({
	get() {
		return params.value.find(
			(item: RequestParams<TSlipSearch>) => item.requestType === activeKey.value
		)
	},
	set(value: RequestParams<TSlipSearch>) {
		const index = params.value.findIndex(
			(item: RequestParams<TSlipSearch>) => item.requestType === activeKey.value
		)
		if (index !== -1) {
			params.value[index] = value
		}
	},
}) as ComputedRef<TSlipSearch>

const { list, slipsManagementTypes, slipsManagementStatus, slipsManagementProjects } =
	useSlips()

const {
	data: slipsData,
	error: slipsError,
	status: slipsStatus,
	execute: slipsExecute,
	refresh: slipsRefresh,
} = await list(activeKey, searchParams)

const { data: slipsTypesData } = await slipsManagementTypes()
const { data: slipsStatusData } = await slipsManagementStatus()
const { data: slipsProjectData } = await slipsManagementProjects()

const showDetail = ref<boolean>(false)
const showDocument = ref<boolean>(false)

const expenseFormId = ref<string | number | undefined>(undefined)
const slipFormId = ref<string | number | undefined>(undefined)
const slipFormType = ref<SlipFormType | undefined>(undefined)
const onDetail = (value: { row: any; total: number }) => {
	expenseFormId.value = value.row.id
	showDetail.value = true
}
const onDocument = async (value: any) => {
	showDocument.value = true

	slipFormId.value = value.approvalHeaderId as string | number

	if (value.slipTypeName === SlipType.PERSONAL_EXPENSE) {
		slipFormType.value = SlipFormType.PERSONAL_EXPENSE_FORM
	} else if (value.slipTypeName === SlipType.CARD) {
		slipFormType.value = SlipFormType.CARD_FORM
	} else {
		slipFormType.value = value.slipTypeName
	}
}

const formId = computed({
	get() {
		return slipFormId.value
	},
	set(value: string | number) {
		slipFormId.value = value
	},
})
const expenseId = computed({
	get() {
		return expenseFormId.value
	},
	set(value: string | number) {
		expenseFormId.value = value
	},
})
const onUpdate = (value: boolean) => {
	showDetail.value = value
}

const paramsReset = () => {
	if (activeKey.value === SlipActivityType.SLIPS_COST_CENTER) {
		params.value[0].companyCode = getCompanyCode.value
		params.value[0].requestType = SlipActivityType.SLIPS_COST_CENTER
		params.value[0].filterDate = [useMonth.lastFrom(), useMonth.to()]
		params.value[0].searchDateFrom = useMonth.lastFrom().format(dateFormat)
		params.value[0].searchDateTo = useMonth.to().format(dateFormat)
		params.value[0].workplaceCodes = [getWorkplaceCode.value]
		params.value[0].workplaceCode = getWorkplaceCode.value
		params.value[0].costCenterId = getCostCenterId.value
		params.value[0].costCenterIds = [getCostCenterId.value]
		params.value[0].employeeId = getEmployeeId.value
		params.value[0].employeeIds = [getEmployeeId.value]
		params.value[0].accountIds = undefined
		params.value[0].accountId = undefined
		params.value[0].evidenceVendorName = undefined
		params.value[0].paymentVendorName = undefined
		params.value[0].cardNumber = undefined
		params.value[0].slipType = []
		params.value[0].slipStatus = []
		params.value[0].departmentId = getDepartmentId.value
		params.value[0].departmentIds = [getDepartmentId.value]
		params.value[0].projectIds = []
		params.value[0].pageNumber = 0
		params.value[0].size = pageSize
		params.value[0].first = true
		params.value[0].last = true
		params.value[0].sort = []
	} else if (activeKey.value === SlipActivityType.SLIPS_PROJECT) {
		params.value[1].companyCode = getCompanyCode.value
		params.value[1].requestType = SlipActivityType.SLIPS_PROJECT
		params.value[1].filterDate = [useMonth.lastFrom(), useMonth.to()]
		params.value[1].searchDateFrom = useMonth.lastFrom().format(dateFormat)
		params.value[1].searchDateTo = useMonth.to().format(dateFormat)
		params.value[1].workplaceCodes = [getWorkplaceCode.value]
		params.value[1].workplaceCode = getWorkplaceCode.value
		params.value[1].costCenterId = undefined
		params.value[1].costCenterIds = undefined
		params.value[1].employeeId = getEmployeeId.value
		params.value[1].employeeIds = [getEmployeeId.value]
		params.value[1].accountIds = undefined
		params.value[1].accountId = undefined
		params.value[1].evidenceVendorName = undefined
		params.value[1].paymentVendorName = undefined
		params.value[1].cardNumber = undefined
		params.value[1].slipType = []
		params.value[1].slipStatus = []
		params.value[1].departmentId = getDepartmentId.value
		params.value[1].departmentIds = [getDepartmentId.value]
		params.value[1].projectIds = []
		params.value[1].pageNumber = 0
		params.value[1].size = pageSize
		params.value[1].first = true
		params.value[1].last = true
		params.value[1].sort = []
	} else if (activeKey.value === SlipActivityType.SLIPS_CARD) {
		params.value[2].companyCode = getCompanyCode.value
		params.value[2].requestType = SlipActivityType.SLIPS_CARD
		params.value[2].filterDate = [useMonth.lastFrom(), useMonth.to()]
		params.value[2].searchDateFrom = useMonth.lastFrom().format(dateFormat)
		params.value[2].searchDateTo = useMonth.to().format(dateFormat)
		params.value[2].workplaceCodes = [getWorkplaceCode.value]
		params.value[2].workplaceCode = getWorkplaceCode.value
		params.value[2].costCenterId = undefined
		params.value[2].costCenterIds = undefined
		params.value[2].employeeId = getEmployeeId.value
		params.value[2].employeeIds = [getEmployeeId.value]
		params.value[2].accountIds = undefined
		params.value[2].accountId = undefined
		params.value[2].evidenceVendorName = undefined
		params.value[2].paymentVendorName = undefined
		params.value[2].cardNumber = undefined
		params.value[2].slipType = []
		params.value[2].slipStatus = []
		params.value[2].departmentId = getDepartmentId.value
		params.value[2].departmentIds = [getDepartmentId.value]
		params.value[2].pageNumber = 0
		params.value[2].size = pageSize
		params.value[2].first = true
		params.value[2].last = true
		params.value[2].sort = []
	}
}

onBeforeRouteLeave(() => {
	showDocument.value = false
	slipFormId.value = undefined
	slipFormType.value = undefined

	showDetail.value = false
})
</script>

<template>
	<page-layout>
		<!-- <template #header>
      <a-space :size="5">
        <question-circle-outlined />
        프로젝트, 코스트센터 기준별로 전표내역조회가 가능합니다. 상세필터를 통해
        다양한 데이터 조회가 가능하고 인쇄/보고서 기능을 지원합니다.
      </a-space>
    </template> -->
		<template #content>
			<a-tabs v-model:activeKey="activeKey" size="small">
				<a-tab-pane :key="item.tabKey" :tab="item.id" v-for="item in componentTabs">
					<component
						v-model:search-params="searchParams"
						:is="item.tab"
						:data="slipsData"
						:pending="slipsStatus === 'pending'"
						:slip-type-options="slipsTypesData?.data"
						:slip-status-options="slipsStatusData?.data"
						:slip-project="slipsProjectData?.data"
						:active-key="activeKey"
						@on-detail="onDetail"
						@on-document="onDocument"
						@refresh="() => slipsRefresh()"
						@reset="() => paramsReset()"
					></component>
				</a-tab-pane>
			</a-tabs>
		</template>
		<template #modal>
			<eacc-slip-detail-modal
				:show="showDetail"
				:expense-id="expenseId"
				:total="
					_orderBy(
						removeDuplicatesByKey(slipsData?.data || [], 'id'),
						['id'],
						[activeKey === SlipActivityType.SLIPS_CARD ? 'desc' : 'asc']
					).length ?? 0
				"
				:slip-data="
					_orderBy(
						removeDuplicatesByKey(slipsData?.data || [], 'id'),
						['id'],
						[activeKey === SlipActivityType.SLIPS_CARD ? 'desc' : 'asc']
					)
				"
				@update:show="onUpdate"
			/>

			<document-preview-modal
				v-if="formId && slipFormType"
				:show="showDocument"
				:id="formId"
				:slip-type="compCase(slipFormType)"
				:completed="true"
				@update:show="
					(value) => {
						showDocument = value
						if (!value) {
							slipFormId = undefined
							slipFormType = undefined
						}
					}
				"
			/>
		</template>
	</page-layout>
</template>
