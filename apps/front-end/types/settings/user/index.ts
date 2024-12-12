import type { CheckboxOptionType } from "ant-design-vue"

interface Employee {
	id: number
	employeeNumber?: string
	name?: string
	companyCode?: string
	companyName?: string
	departmentCode?: string
	departmentName?: string
	costCenterCode?: string
	costCenterName?: string
	workplaceCode?: string
	workplaceName?: string
	upperDepartmentCode?: string
	upperDepartmentName?: string
	employeeDivisionCode?: string
	employeeDivisionName?: string
	occupationCode?: string
	occupationName?: string
	gradeCode?: string
	gradeName?: string
	jobCode?: string
	jobName?: string
	dutyCode?: string
	dutyName?: string
	titleCode?: string
	titleName?: string
	employeeStatusCode?: string
	employeeStatusName?: string
	employeeTypeCode?: string
	employeeTypeName?: string
	joinedDate?: string
	email?: string
	phoneNumber?: string
	mobileNumber?: string
	vendorCode?: string
	liabilityDeptCode?: string
	liabilityDeptName?: string
}
export interface User {
	id: number
	companyCode: string
	loginId: string
	departmentCode: string
	name: string
	memberStatusName: string
	memberStatusLabel: string
	employee: Employee
}

interface IFromSearchParams {
	companyCode: string //회사코드(COMP_CD)
	employeeNumber: string //사원번호(사번)
	name: string //직원명
	departmentId: string //부서 식별자
	departmentName: string //부서명
	positionId: string //직위 식별자
	positionName: string //직위명
	jobTitleId: string //직책 식별자
	jobTitleName: string //직책명
	keyword: string //키워드(직원명, 직급명 등...
	roldId: string //권한 식별자
	roldName: string //권한명
	joined: string //회원여부(사용자등록 여부)
	employeeStatusCode: string // "
	page: number //Zero-based page index (0..N)
	size: number //The size of the page to be returned
	sort: Array<string> //Sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported.
}

interface IOptions extends CheckboxOptionType {
	color: string
}

type Options = {
	[key in "state"]: IOptions[]
}

export type UsersManagement = Pick<User, "id"> & Partial<User>
export type FromSearchParams = Partial<IFromSearchParams>

export const options: Options = {
	state: [
		{ label: "사용중", value: "ACTIVE", color: "#87d068" },
		{ label: "사용중지", value: "INACTIVE", color: "#f50" },
	],
}
