interface Ids {
	id: number | string
}

interface TitlesRequest {
	id?: number | string
	companyCode: string
	workplaceId: number
	code: string
	name: string
	employeeCount: number
	departmentName: string
	jobName: string
	gradeName: string
	email: string
	employeeNumber: string
	description: string
	orderSeq: number
	used: boolean
}

interface TitleEmployeesRequest {
	id: number | string
	companyCode: string
	employeeIds: Array<Ids>
}

/**
 * 직책 목록, 상세 조회, 삭제, 직책 정보 저장 및 수정
 * */
export type Titles =
	| Partial<TitlesRequest>
	| Pick<
			TitlesRequest,
			| "id"
			| "workplaceId"
			| "companyCode"
			| "code"
			| "name"
			| "employeeCount"
			| "departmentName"
			| "jobName"
			| "gradeName"
			| "employeeNumber"
			| "email"
			| "orderSeq"
	  >
/**
 * 직책 사용자 이동 수정 / 직책 사용자 할당 수정
 * */
export type TitleEmployees = Pick<
	TitleEmployeesRequest,
	"id" | "companyCode" | "employeeIds"
>
