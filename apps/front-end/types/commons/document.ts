import { Dayjs } from "dayjs"

export interface Search {
	companyCode: string
	startDate: string | Dayjs
	endDate: string | Dayjs
	title: string
	searchType: string
	employeeId: number
	page: number
	size: number
}

export interface DocumentResParams {
	id: number
	companyCode: string
	approvalNumber: string
	title: string
	draftEmployeeId: number
	draftEmployeeName: string
	draftEmployeeDepartmentCode: string
	draftEmployeeDepartmentName: string
	draftDateTime: string
}
