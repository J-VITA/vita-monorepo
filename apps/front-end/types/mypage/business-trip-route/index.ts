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

export interface IBusinessTripInfoParams {
	companyCode: string
	name?: string
	code?: string
	filterDate?: [Dayjs, Dayjs]
	searchDateFrom?: string | Dayjs
	searchDateTo?: string | Dayjs
	dateCnt?: number
	tripType?: string
	locationType?: string
	accountingDate?: string | Dayjs
	evidenceDate?: string | Dayjs
	costCenterId?: number
	costCenterName?: string
	projectId?: number[]
	projectName?: string
}

export type Search = ISearch
export type RouteTableData = IRouteTableData
export type RoutePostData = Partial<IRoutePostData>
