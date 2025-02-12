import type { Dayjs } from "dayjs"
import { classifications } from "@/types/expenses"
import type { GridOptions, Part, RowClassParams, ValueFormatterParams } from "@iwx/ui"
import type { CheckboxOptionType } from "ant-design-vue"

interface IOptions extends CheckboxOptionType {
	color: string
}

type Options = {
	[key in "budget" | "slipType" | "slipStatus"]: IOptions[]
}

interface IBudgetRequestParams {
	id?: number
	companyCode: string
	code?: string
	companyName?: string
	placeType?: string
	accountId?: string | number | undefined
	year?: string | Dayjs | undefined
	costCenterCode?: string | number | undefined
	costCenterName?: string | undefined
	costCenterId?: string | number | undefined
	workplaceCode?: string | number | undefined
	workplaceName?: string | undefined
	accountCostItem?: string[] | undefined
	employeeId?: string | number | undefined
	used?: boolean
	page?: number
	size?: number
	sort?: Array<any>
}

interface IFormData {
	id?: number
	companyCode: string
	companyName?: string
	workplaceCode?: string | number | undefined
	costCenterId?: string | number | undefined
	accountId: string | number | undefined
	year?: string | Dayjs | undefined
	totalAmount: number
	januaryBudget: number
	februaryBudget: number
	marchBudget: number
	aprilBudget: number
	mayBudget: number
	juneBudget: number
	julyBudget: number
	augustBudget: number
	septemberBudget: number
	octoberBudget: number
	novemberBudget: number
	decemberBudget: number
	closingStatus: boolean
	[key: string]: any
}

interface IBudgetInitRequestParams {
	id?: number
	companyCode?: string
	workplaceCode?: string
	costCenterId?: number
	accountId?: number
	year?: string
	month?: string
	amount?: number
	closingStatus?: false
}

interface IBudgetProposalParams {
	companyCode: string
	companyName?: string
	searchDateFrom?: string
	searchDateTo?: string
	departmentCode?: number
	departmentName?: string
	workplaceCode?: string
	workplaceName?: string
	fromCostCenterId?: number
	budgetRequestType?: string
	budgetRequestName?: string
	budgetRequestStatus?: string
	budgetRequestStatusName?: string
	page: number
	size: number
	sort?: Array<any>
}

interface IBudgetActualParams {
	companyCode: string
	companyName?: string
	searchMonthFrom?: string
	searchMonthTo?: string
	workplaceCode?: string
	workplaceName?: string
	costCenterId?: string
	costCenterName?: string
	accountId?: string
	accountName?: string
	accountParentId?: string
	accountParentName?: string
	page: number
	size: number
	sort?: Array<any>
}

interface IBudgetDepartmentParams {
	id?: string
	name?: string
	code?: string
	companyCode?: string
	parentId?: string
	used?: boolean
}

interface IBudgetConfirmParams {
	companyCode: string
	opinion: string
}

interface ICostCenterParams {
	companyCode: string
	used: boolean
	keyword?: string
	parentIt?: string
	personalExpenseFlag?: boolean
}

interface IApplyBudgetRequest {
	code: string
	label: string
	used: boolean
	name: string
}

interface IApplyCostCenter {
	id?: number
	code?: string
	companyCode?: string
	workplaceCode?: string
	name?: string
}

interface IApplyAccount {
	id?: number
	name?: string
	parentId?: number
	parentName?: string
}

interface IWorkplaceParams {
	id: string
	code: string
	placeType: string
}

interface IBudgetApplyData {
	id?: number
	companyCode: string
	approvalId: number
	approvalNumber: string
	requestNumber: string
	budgetRequestNumber?: string
	budgetRequestStatus: IApplyBudgetRequest
	budgetRequestType: IApplyBudgetRequest
	requestAmount: number
	fromYearMonth: string | Dayjs
	fromCostCenter: IApplyCostCenter
	fromAccount: IApplyAccount
	toYearMonth: string | Dayjs
	toCostCenter: IApplyCostCenter
	toAccount: IApplyAccount
	createdAt: string
	createdBy: string
}

export interface IBudgetList {
	id: number
	applyNo: string
	applyTypeName: string
	applyTypeCode: string
	applyStatusName: string
	applyStatusCode: string
	applyDate: string
	departmentName: string
	applyBy: string
	applyCost: string
	paperNo: string
	paperId: string
	budgetMonthFrom: string
	costCenterNameFrom: string
	accountNameFrom: string
	accountParentNameFrom: string
	budgetMonthTo: string
	costCenterNameTo: string
	accountNameTo: string
	accountParentNameTo: string
	statusBy: string
	statusDate: string
}

interface IBudgetProposalFormData {
	id?: number
	idx: number
	companyCode: string
	approvalId: number
	approvalNumber: string
	budgetRequestType: string
	budgetRequestStatus: string
	requestAmount: number
	remainAmount: number
	fromYearMonth: string | Dayjs
	fromCostCenterId: number
	fromAccountId: number
	toYearMonth: string | Dayjs
	toCostCenterId: number
	toAccountId: number
}

interface IBudgetActualFormData {
	id?: number
	yearMonth: string
	companyCode: string
	companyName: string
	workplaceCode: string
	workplaceName: string
	costCenterId: string
	costCenterName: string
	accountId: string
	accountName: string
	accountParentId: string
	accountParentName: string
	initialBudget: number
	adjustmentAmount: string
	finalBudget: number
	actualUsage: number
	remainingBudget: number
	progressRate: string
}

interface IBudgetActualDetailData {
	id?: number
	type: string
	approvalId: number
	usedAt: string
	name: string
	costCenterId: string
	costCenterName: string
	accountAmount: number
	tax: number
	totalAmount: number
	workspaceId: string
	workspaceName: string
	accountId: string
	accountName: string
	accountParentId: string
	accountParentName: string
	projectId: string
	projectName: string
	status: string
	description: string
	writeAt: string
}

export type BudgetParams = Partial<IBudgetRequestParams>
export type FormData = Omit<IFormData, "companyName">
export type BudgetInitRequestParams = Omit<IBudgetInitRequestParams, "companyName">
export type BudgetEventParams = Partial<IFormData> & {
	method?: "POST" | "PATCH"
}
export type Search = Partial<IBudgetProposalParams> & Partial<IBudgetActualParams>
export type departmentParams = Partial<IBudgetDepartmentParams>
export type ConfirmParams = Partial<IBudgetConfirmParams>
export type BudgetList = Partial<IBudgetList>
export interface BudgetLists extends IBudgetList {
	budgetRequestStatus: IApplyBudgetRequest
	budgetRequestType: IApplyBudgetRequest
	fromCostCenter: IApplyCostCenter
	fromAccount: IApplyAccount
	toCostCenter: IApplyCostCenter
	toAccount: IApplyAccount
	createdAt: string
	[key: string]: number | string | undefined | object
}
export type CostCenterParams = Partial<ICostCenterParams>
export type AccountParams = Partial<ICostCenterParams>
export type BudgetApplyData = Partial<IBudgetApplyData>
export type BudgetProposalFormData = Partial<IBudgetProposalFormData>
export type BudgetActualFormData = Partial<IBudgetActualFormData>
export type BudgetActualDetailData = Partial<IBudgetActualDetailData>

export const options: Options = {
	budget: [
		{ label: "예산이월", value: "ROLLOVER", color: "orange" },
		{ label: "예산전용", value: "ALLOCATION", color: "blue" },
		{ label: "예산증액", value: "INCREASE", color: "cyan" },
	],
	slipType: [
		{ label: "개인경비", value: "PERSONAL", color: "#FFD591" },
		{ label: "법인카드", value: "CARD", color: "#91CAFF" },
		{ label: "전자세금계산서", value: "E_TAX", color: "#87E8DE" },
		{ label: "세금계산서", value: "TAX_INVOICE", color: "#87E8DE" },
	],
	slipStatus: [
		{ label: "미처리", value: "UNPROCESSED", color: "#DC3545" },
		{ label: "작성완료", value: "COMPLETE", color: "#C4C4C4" },
		{
			label: "작성완료(임시저장함)",
			value: "COMPLETE_TEMP_BOX",
			color: "#2196F3",
		},
		{ label: "결제반려", value: "APPROVAL_RETURN", color: "#C4C4C4" },
		{ label: "결제중", value: "APPROVAL_ING", color: "#6146E5" },
		{ label: "검인대기", value: "SEAL_STANDBY", color: "#C4C4C4" },
		{ label: "검인반려", value: "SEAL_RETURN", color: "#C4C4C4" },
		{ label: "검인중", value: "SEAL_ING", color: "#6146E5" },
		{ label: "확정", value: "CONFIRM", color: "#389E0D" },
		{ label: "역분개", value: "REVERSE", color: "#389E0D" },
	],
}
