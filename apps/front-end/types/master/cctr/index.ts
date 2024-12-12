import type { DataNode } from "ant-design-vue/es/tree"
interface ICostItem {
	id: number
	companyId: number
	companyCode: string
	code: string
	name: string
	description: string
	orderSeq: number
	depth: number
	used: true
	updatedBy: string
	updatedAt: string
	parentId: number
	workplaceId?: number
	workplaceCode?: string
}

interface IEmployee {
	id: number
	companyCode: string
	costCenterCode: string
	costCenterName: string
	employeeNumber: string
	employeeName: string
	positionCode: string
	positionName: string
	jobTitleCode: string
	jobTitleName: string
}

interface ITable {
	totalElements: number
	totalPages: number
	pageNumber: number
	size: number
	first: boolean
	last: boolean
	status: number
	data: IEmployee[]
	message: string
}

interface IEmployeeDetail {
	id: number
	employeeNumber: string
	name: string
	companyCode: string
	companyName: string
	departmentCode: string
	departmentName: string
	workplaceCode: string
	workplaceName: string
	upperDepartmentCode: string
	upperDepartmentName: string
	employeeDivisionCode: string
	employeeDivisionName: string
	gradeCode: string
	gradeName: string
	jobCode: string
	jobName: string
	joinedDate: string
	email: string
	phoneNumber: string
	mobileNumber: string
	costCenterId: number
}

export type CostItem = Partial<ICostItem>
export type DataTable = Partial<ITable>
export type AddRef = {
	name: string
	users: (string | number)[]
	employeesInfo: IEmployeeDetail[]
	authorityFlag?: boolean
}
export type Employee = Partial<IEmployee>
export type CostParams = Partial<ICostItem> & {
	method?: "POST" | "PATCH"
}

export type TreeItem = DataNode &
	Partial<ICostItem> & {
		children: TreeItem[]
	}

export type AuthChangeParams = {
	type: "assign" | "clear"
	users: (string | number)[]
}

export type EmployeeDetail = Partial<IEmployeeDetail>
