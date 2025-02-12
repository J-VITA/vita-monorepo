import { Dayjs } from "dayjs"

interface ISearch {
	companyCode: string
	startDate: string
	endDate: string
	page: number
	size: number
}

interface IRouteTableData {
	id: number
	companyCode: string
	name: string
	departure: string
	destination: string
	stopoverCount: string
	distance: number
	roundTrip: boolean
	active: boolean
	createdAt: string
}

interface Stopover {
	orderSeq?: number
	location?: string
}

interface IRoutePostData {
	id?: number
	companyCode: string
	name: string
	departure: string
	destination: string
	distance: number
	roundTrip: boolean
	active: boolean
	stopovers: Stopover[]
	employeeId: number
}

export type BusinessTripCalResult = {
	tripTypeName: string
	totalAmount: number
	accounts: {
		accountId: number
		accountName: string
		parentAccountId: number
		parentAccountName: string
	}[]
}

interface ExpenseItem {
	itemName: string
	calculatedAmount?: number
	accountId?: number
}

export interface IBusinessTripInfoParams {
	id?: number
	filterDate?: [Dayjs, Dayjs]
	slipHeaderId?: number
	businessTripName?: string
	companyCode?: string
	requestEmployeeId?: number
	startDate?: string | Dayjs
	endDate?: string | Dayjs
	locationType?: string
	locationCode?: string
	accountingDate?: string | Dayjs
	evidenceDate?: string | Dayjs
	costCenterId?: number
	projectId?: number
	accruedAccountId?: string
	osType?: string
	dateCal?: number
	expenseItems: ExpenseItem[]
}

export const anounceText = {
	text: `<p>*출장정보는 출장신청서에 1개이상은 필수로 있어야 합니다.</p>
	<p>*출장정보를 입력후 결과보기 버튼클릭시, 출장규정으로 등록된 금액이 자동계산됩니다.</p>
	<p>*계산결과와 계정과목을 확인합니다.`,
}

export type Search = ISearch
export type RouteTableData = IRouteTableData
export type RoutePostData = Partial<IRoutePostData>
