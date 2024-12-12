import { createViewParams } from "@/types"
import dayjs, { Dayjs } from "dayjs"
import { classifications } from "@/types/expenses"
import type { GridOptions, RowClassParams, ValueFormatterParams } from "@iwx/ui"

interface IDocumentInfo {
	no: string
	id: number
	date: string
	department: string
	name: string
	gradeName: string
	history: number
}

export interface IApprovalDetail {
	id: number
	companyCode: string
	approvalNumber: string
	stage: number
	approvalStatusName: string
	approvalStatusLabel: string
	approvalTypeName: string
	approvalTypeLabel: string
	approvalEmployeeId: number
	approvalEmployeeName: string
	approvalEmployeePositionCode: string
	approvalEmployeePositionName: string
	actualEmployeeId: number
	actualEmployeeName: string
	actualEmployeePositionCode: string
	actualEmployeePositionName: string
	approvalDate: string
	approvalType: string
}

export const CardIssueRequestStatus = {
	/** 승인 */
	APPROVED: "APPROVED",
	/** 반려 */
	REJECTED: "REJECTED",
	/** 대기 */
	PENDING: "PENDING",
}
/**
 * 카드 유형
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string}
 */
export type CardIssueRequestStatus =
	(typeof CardIssueRequestStatus)[keyof typeof CardIssueRequestStatus]

export const CardType = {
	/** 공용 */
	SHARED: "SHARED",
	/** 개인 */
	PERSONAL: "PERSONAL",
}
/**
 * 카드 유형
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string}
 */
export type CardType = (typeof CardType)[keyof typeof CardType]

export type CardIssueViewForm = {
	id?: number //카드 불출 요청 Identifier
	approvalHeaderId?: number //전자결재 헤더 Identifier
	requestedBy: string | number //신청자 Identifier
	requestedByEmployeeIds: (string | number)[] //신청자명 (select table 용)
	companyCode?: string //회사코드
	startDate: Dayjs //사용기간 시작일
	endDate: Dayjs //사용기간 종료일
	usedDate: [Dayjs, Dayjs] //사용기간
	cardType: CardType // 신청카드유형
	cardIssueRequestStatus: CardIssueRequestStatus
	cardOwnerEmployeeIds: (string | number)[] // 카드소유자 (eacc-select-table 용)
	cardOwnerEmployeeId: string | number // 카드소유자
	description: string // 사용목적
}
export type CardIssueViewFormBrand = "CardIssueViewFormBrand"

export interface CardIssueData {
	id: number
	cardIssueNumber: string
	startDate: Dayjs
	endDate: Dayjs
	cardType: {
		code: CardType
		label: string
		used: boolean
		name: CardType
	}
	cardName: string
	cardNumber: string
	requestedAt: Dayjs
	cardIssueRequestStatus: {
		code: CardType
		label: string
		used: boolean
		name: CardType
	}
	department: string
	requestedByEmployeeId: string | number
	ownerEmployeeId: number
	approvalHeaderId: number
	approvedBy: number
	description: string
}

export type FamilyEventViewForm = {
	actualDate: string | Dayjs //발생일자
	employeeId: string | number //신청자 Id
	employeeIds: (string | number)[] //신청자 Id (select table 용)
	familEventType: string | number // 경조구분
	expendAmount: number // 신청금액(회사지급액)
	mutualYn: string // 상조용품
	wreathYn: string // 경조화환
	expendDate: string // 지급예정일
}
export type FamilyEventFormBrand = "FamilyEventViewFormBrand"

interface IFormData {
	id: string | number
	approvalNumber: string
	draftEmployeeId: number
	companyCode: string
	title: string
	urgent: boolean
	approvalFormType: string
	approvalFormTypeName: string
	approvalLineType: any
	description: string
	approveContent: string
	expenseList: any[]
	budgetList?: any[]
	documentInfo: Partial<IDocumentInfo>
	attachedFiles: any[]
	// docRelevant: any[];
	relatedDocumentIds: any[]
	formIds: any[]
	agreementOptionType: string
	approvalLineRefer: string
	approvalLineReferrerDtos: any[]
	referenceEmployeeIds: any[]
	approvalDetailRequests: IApprovalDetail[]
	documentStatusName?: string
	actualApprovalEmployeeId: number
	nextApprovalStage: number
	approvalDetails: IApprovalDetail[]
	delegated: boolean
	approvalReferrers: any[]
	//카드불출신청서 폼 데이터
	cardIssueForm: ReturnType<
		typeof createViewParams<CardIssueViewForm, CardIssueViewFormBrand>
	> &
		CardIssueViewForm
	//경조금 폼 데이터
	familyEventForm: ReturnType<
		typeof createViewParams<FamilyEventViewForm, FamilyEventFormBrand>
	> &
		FamilyEventViewForm
}

export type FormData = Partial<IFormData>
export type ApprovalDetail = Partial<IApprovalDetail>

export const initFormData = {
	title: "",
	urgent: false,
	approvalLineType: undefined,
	description: "",
	expenseList: [],
	documentInfo: {},
	attachedFiles: [],
	approvalDetails: [],
	approvalReferrers: [],
	agreementOptionType: "",
	relatedDocumentIds: [],
	cardIssueForm: createViewParams<CardIssueViewForm, CardIssueViewFormBrand>({
		id: undefined,
		requestedBy: "",
		requestedByEmployeeIds: [],
		companyCode: "",
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

interface IApprovalLineDetails {
	id: number
	companyCode: string
	employeeId: number
	employeeNumber: string
	employeePositionCode: string
	employeePositionName: string
	stage: number
	approvalTypeName: string
	approvalTypeLabel: string
	approvalEmployeeId: number
	approvalEmployeeNumber: string
	approvalEmployeeName: string
	approvalEmployeePositionCode: string
	approvalEmployeePositionName: string
	approvalEmployeeDepartmentCode: string
	approvalEmployeeDepartmentName: string
	actualEmployeeId: number
	actualEmployeeName: string
	actualEmployeePositionCode: string
	actualEmployeePositionName: string
}
export interface IApprovalLineReferrerDtos {
	id: number
	companyCode: string
	referEmployeeId: number
	referEmployeeName: string
	referEmployeePositionCode: string
	referEmployeePositionName: string
	referEmployeeDepartmentCode: string
	referEmployeeDepartmentName: string
}

interface IApprovalLineDataType {
	stage: number
	id: number
	companyCode: string
	approvalEmployeeId: number
	approvalEmployeeName: string
	approvalEmployeeNumber: string
	approvalEmployeePositionCode: string
	approvalEmployeePositionName: string
	approvalLineName: string
	approvalTypeName: string
	approvalStatusName: string
	mainApprovalLineFlag: boolean
	agreementOptionTypeName: string
	agreementOptionTypeLabel: string
	agreementOptionType: string
	orderSeq: number
	used: boolean
	approvalLineDetails: Array<Partial<IApprovalLineDetails>>
	approvalLineReferrerDtos: Array<Partial<IApprovalLineReferrerDtos>>
}

interface IAppropvalFormType {
	code: string
	label: string
	receivable: boolean
	used: boolean
	slip: boolean
	name: string
}

export type ApprovalLineDataType = Partial<IApprovalLineDataType>
export type ApprovalFromType = Partial<IAppropvalFormType>
export const drawArrow = (arr: any[], optionType: string): string => {
	return arr
		.map((e) => {
			const separator =
				optionType === "PARALLEL" && e.approvalTypeName === "AGREEMENT"
					? arr.length !== e.stage
						? ", "
						: ""
					: arr.length !== e.stage
						? " ▶️ "
						: ""

			return e.approvalEmployeeName + separator
		})
		.join("")
}

export function approvalLineOptions(arr: any): {
	label: string
	value: number | string
} {
	return arr.flatMap((e: any) => e.data.map((j: any) => ({ label: j.name, value: j.id })))
}

export const calculateTotalAmount = (data: any, value: string): number => {
	return data.reduce((total: number, item: any) => total + item[value], 0)
}

export const gridOptions: GridOptions<any> = {
	suppressContextMenu: true, // 컬럼 오른쪽 메뉴 hidden
	groupDisplayType: "groupRows",
	groupRowRenderer: "agGroupCellRenderer",
	groupDefaultExpanded: 1,
	groupRowRendererParams: {
		innerRenderer: (params: any) => {
			return params.value ? classifications[params.value].text : ""
		},
	},
	getRowStyle: (params: RowClassParams<any>) => {
		if (params.node.rowPinned) {
			return {
				fontWeight: 700,
				backgroundColor: "#FDFFEA",
			}
		}
	},
	columnTypes: {
		currency: {
			cellStyle: { textAlign: "right", fontWeight: "bold" },
			valueFormatter: (params: ValueFormatterParams) => {
				return (params.value = !!params.value
					? Number(params.value).toLocaleString()
					: params.value)
			},
		},
		default: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-center-cell",
			suppressHeaderMenuButton: true,
			flex: 1,
		},
		action: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-center-cell",
			suppressHeaderMenuButton: true,
			width: 90,
		},
	},
}
/**
 * 전자결재 문서 타입
 * SAVED : 임시저장,
 * PROGRESS: 결재진행중,
 * COMPLETED : 결재완료,
 * REJECTED: 반려
 * WITHDRAWN : 회수
 */
export type DocumentStatusType =
	| "SAVED"
	| "PROGRESS"
	| "COMPLETED"
	| "REJECTED"
	| "WITHDRAWN"
export const DocumentStatus = {
	saved: "SAVED",
	progress: "PROGRESS",
	completed: "COMPLETED",
	rejected: "REJECTED",
	withdrawn: "WITHDRAWN",
}

/**
 * 후결자 리스트 Options
 */
export type PostApprovalOptionType = {
	approvalDetailId: number
	postApprovalEmployeeName: string
}

/**
 *
 */
export interface IApprovalEmployee {
	id: number
	stage: number
	referer: boolean
	actualEmployeeId: number
}
