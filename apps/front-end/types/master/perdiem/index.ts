interface IPositionList {
	id: number
	companyCode: string
	positionCode: string
	positionName: string
}

interface IPerdiemAllowanceType {
	id: number
	companyCode: string
	locationName: string
	locationType: string
	code: string
	orderSeq: number
	showed: boolean
}

interface IPerdiemAllowanceInfo {
	id: number
	companyCode: string
	locationType: string
	name: string
	code: string
	updatedBy: string
	updatedAt: string
	orderSeq: number
	showed: boolean
}

interface IPerdiemGrade {
	id: number
	companyCode: string
	gradeName: string
	code: string
	orderSeq: number
	used: boolean
	showed: boolean
}

interface IPerdiemLevel {
	id: number
	employeeGradeId: number
	companyCode: string
	positionName: string
	positionCode: string
	orderSeq: number
	updateBy: string
	updateAt: string
	used: boolean
	showed: boolean
}

interface ISearchParams {
	companyCode: string
	infoName: string
	businessTripTypeName: string
	paymentCategory: string
	paymentCategoryName: string
	locationName: string
	locationCode: string
	locationType: string
	name?: string
}

interface IPerdiemTableData {
	id: number
	locationType: string
	locationName: string
	locationCode: string
	gradeName: string
	gradeCode: string
	accountCode: string
	accountId: string
	paymentCategory: string
	paymentCategoryName: string
	fixedAmount: number
	reimbursementLimit: number
	lastModifiedBy: string
	lastModifiedDate: string
}

interface IPerdiumStandardInfoParams {
	id?: number
	companyCode: string
	locationType: string
	locationName: string
	locationCode: string
	gradeName: string
	gradeCode: string
	employeeGrade: string
	employeeGradeName: string
	accountName: string
	businessTripTypeName: string
	businessTripTypeCode: string
	paymentCategory: string
	paymentCategoryName: string
	isReimbursement: boolean
	fixedAmount: number
	reimbursementLimit: number
}

interface ITravelExpenseParams {
	id?: number
	companyCode: string
	locationType: string
	name: string
	code: string
	businessTripTypeAccountDtos: number[]
	businessTripTypeAccountRequests: { accountId: number; halfChecked: boolean }[]
	used: boolean
}
export const anounceText = {
	text: `*정액지급은 설정한 고정된 금액을 사용자에게 지급합니다. <br>
			출장경비신청서에 출장정보 추가시 ‘정액지급액 * 출장일수’ 만큼 자동으로 전표가 생성됩니다. <br>
			*실비지급은 증빙된 영수증이나 법인카드사용내역 만큼의 금액을 지급합니다. <br>
			* 실비지급은 통제금액을 설정할 수 있습니다. <br>
			통제금액 초과시, 출장경비신청서 하단에 통제금액과 계정과목을 노출시킵니다.<br>
			ex) 규정위반: 출장비-숙박비 (1일 규정 한도금액 150,000원)<br>`,
}

export type LocationTypeOptions = {
	code: string
	label: string
	name?: string
}

type LocationTypes = {
	[key: string]: { color: string; text: string }
}

export const locations: LocationTypes = {
	DOMESTIC: { color: "orange", text: "국내" },
	ABROAD: { color: "cyan", text: "해외" },
}
export type PositionList = Pick<
	IPositionList,
	"id" | "companyCode" | "positionName" | "positionCode"
>
export type PerdiemAllowanceType = Partial<IPerdiemAllowanceType>
export type PerdiemAllowanceInfo = Partial<IPerdiemAllowanceInfo>
export type PerdiemGrade = Partial<IPerdiemGrade>
export type PerdiemPosition = Partial<IPerdiemLevel>
export type Search = Partial<ISearchParams> & {
	page: number
	size: number
}
export type PerdiemTableData = Partial<IPerdiemTableData>
export type PerdiumStandardInfoParams = Partial<IPerdiumStandardInfoParams>
export type TravelExpenseParams = Partial<ITravelExpenseParams>

export type PaginationType = {
	page: number
	size: number
}
