import type { CheckboxOptionType } from "ant-design-vue"
import type { ValueFormatterParams, RowClassParams } from "@iwx/ui"
import { ExSearchParams, RequestParams, SlipType } from "@/types"
import dayjs, { Dayjs } from "dayjs"
import { dateFormat, SlipStateType } from "@/types/expenses"

/*******************
 * About index page
 *******************/
export const SlipActivityType = {
	/** 코스트센터 */
	SLIPS_COST_CENTER: "COST_CENTER",
	/** 프로젝트 */
	SLIPS_PROJECT: "PROJECT",
	/** 법인카드 */
	SLIPS_CARD: "CARD",
}
/**
 * 전표내역 관리 화면 탭
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [SlipActivityType: SLIPS_COST_CENTER, SLIPS_PROJECT, SLIPS_CARD]
 */
export type SlipActivityType = (typeof SlipActivityType)[keyof typeof SlipActivityType]

export interface ISlipsDataType {
	group?: string
	id: number | string
	companyCode: string
	costCenterId: number | string
	costCenterName: string
	slipNumber: string
	slipTypeName: string
	slipTypeLabel: string
	slipStatusName: string
	slipStatusLabel: string
	slipEvidenceTypeName: string
	slipEvidenceTypeLabel: string
	approvalNumber: string
	accountingDate: string
	evidenceDate: string
	employeeId: number | string
	employeeName: string
	supplyAmount: number
	krwTotalAmount: number
	krwSupplyAmount: number
	krwTaxAmount: number
	divisionSlipFlag: false
	evidenceVendorCode: string
	evidenceVendorName: string
	evidenceVendorRegistrationNumber: string
	paymentVendorCode: string
	paymentVendorName: string
	paymentVendorRegistrationNumber: string
	currencyTypeName: string
	currencyTypeLabel: string
	description: string
	slipDetailId: number | string
	divisionSeq: number | string
	seq: number | string
	projectName: string
	account: {
		id: number | string
		name: string
		parentId: number | string
		parentName: string
	}
	approvalHeaderId: number | string
	documentStatusName: string
	documentStatusLabel: string
	paymentDueDate: string
	writerName: string
	wroteAt: string
	cardApprovalNumber: string
	cardApprovalDateTime: string
	cardNumber: string
	cardName: string
	workplaceName: string
	checkEmployeeId: string | number
	checkEmployeeName: string
	rowSpan?: number
	rowSpanStartIndex?: number
}
interface ISearchParams {
	companyCode?: string //회사코드
	requestType?: SlipActivityType
	filterDate: [string, string] | [Dayjs, Dayjs]
	searchDateFrom: string | Dayjs
	searchDateTo: string | Dayjs
	workplaceCodes?: string[] //사업장코드 (화면용)
	workplaceCode?: string //사업장코드
	costCenterIds?: (string | number)[] //코스트센터 식별자 (화면용)
	costCenterId?: string | number //코스트센터 식별자
	employeeIds?: (string | number)[] //사용자 - 직원식별자 (화면용)
	employeeId?: string | number //사용자 - 직원식별자
	accountIds?: (string | number)[] //계정과목 식별자 (화면용)
	accountId?: string | number //계정과목 식별자
	evidenceVendorCode?: string //증빙거래처코드
	evidenceVendorName?: string //증빙거래처코드명
	paymentVendorCode?: string //지급거래처코드
	paymentVendorName?: string //지급거래처코드명
	cardNumber?: string //카드번호
	slipType?: SlipType[] //전표 유형 목록
	slipStatus?: SlipStateType[] //전표 상태 목록
	//코스트센터, 프로젝트 파라미터 에서만 사용 s
	departmentIds?: (string | number)[] //부서 (화면용)
	departmentId?: string | number //부서
	projectIds?: (string | number)[] //프로젝트 식별자 목록(프로젝트별)
	//코스트센터, 프로젝트 파라미터 에서만 사용 e
	sort?: []
	checkEmployeeId?: string | number
	checkEmployeeIds?: (string | number)[] //검인자 (화면용)
}

export type TSlipSearch = ExSearchParams<RequestParams<ISearchParams>, "ISlipSearch">

interface IOptions extends CheckboxOptionType {
	color: string
}

type Options = {
	[key in "expense" | "state"]: IOptions[]
}

function currencyFormatter(params: ValueFormatterParams) {
	if (params.value) {
		return (params.value = Number(params.value).toLocaleString())
	} else {
		return params.value
	}
}

const dateFormatter = (params: ValueFormatterParams) => {
	return dayjs(params.value).format(dateFormat)
}

export type DataType = Partial<ISlipsDataType>
// export type SearchParams = Partial<ISearchParams>

export const options: Options = {
	expense: [
		{ label: "개인경비", value: "PERSONAL_EXPENSE", color: "orange" },
		{ label: "법인카드", value: "CARD", color: "blue" },
		{ label: "전자세금계산서", value: "E_TAX_INVOICE", color: "cyan" },
		{ label: "세금계산서", value: "TAX_INVOICE", color: "cyan" },
		{ label: "경조금", value: "FAMILY_EVENT", color: "default" },
		{ label: "선급금", value: "ADVANCE_PAYMENTS", color: "green" },
	],
	state: [
		{ label: "미처리", value: "UNPROCESSED", color: "purple" },
		{ label: "작성완료", value: "COMPLETE", color: "green" },
		{ label: "결재중", value: "APPROVAL_ING", color: "#6146e5" },
		{ label: "검인대기", value: "SEAL_STANDBY", color: "#6146e5" },
		{ label: "검인반려", value: "SEAL_RETURN", color: "#6146e5" },
		{ label: "검인중", value: "SEAL_ING", color: "#6146e5" },
		{ label: "확정", value: "CONFIRM", color: "#32b96f" },
	],
}

export const columnTypes = {
	currency: {
		aggFunc: "sum",
		cellStyle: { textAlign: "right" },
		valueFormatter: currencyFormatter,
	},
	date: {
		cellStyle: { textAlign: "center" },
		valueFormatter: dateFormatter,
	},
}

export const getRowStyle = (params: RowClassParams) => {
	if (params.node.rowPinned) {
		return {
			fontWeight: 700,
			color: "#6146e5",
			backgroundColor: "#FDFFEA",
		}
	}
}

// API 연동 이후 삭제
// export const getData: DataType[] = [
// 	{
// 		costCenter: "영업본부",
// 		slipNo: "2021-BD-00001",
// 		expenditureType: "Expenses",
// 		useDate: "2024-05-03",
// 		author: "김길동",
// 		user: "김길동",
// 		store: "다이소 마포점",
// 		totalAmount: 22000,
// 		supplyValue: 20000,
// 		vat: 2000,
// 		accountCostItem: "복리후생 > 식비",
// 		status: "Progress",
// 		description: "팀원과 점심식사",
// 		paymentDocumentNo: "AP-20240710-0002",
// 		cardApprovalDate: "2024-05-30",
// 		cardApprovalNo: "2334-4343-3233-3333",
// 		project: "해외사업 프로젝트",
// 		projectCode: "PROJECT-1",
// 	},
// ]
