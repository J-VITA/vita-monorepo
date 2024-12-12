interface Ids {
	id: number | string
}

interface PositionsRequest {
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

interface PositionEmployeesRequest {
	id: number | string
	companyCode: string
	employeeIds: Array<Ids>
}

/**
 * 직위 목록, 상세 조회, 삭제, 직위 정보 저장 및 수정
 * */
// export type Positions = Partial<PositionsRequest> &
//   Pick<PositionsRequest, 'id' | 'companyCode' | 'code' | 'name' | 'orderSeq'>; // 저장, 수정;
export type Positions =
	| Partial<PositionsRequest>
	| Pick<
			PositionsRequest,
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
 * 직위 사용자 이동 수정 / 직위 사용자 할당 수정
 * */
export type PositionEmployees = Pick<
	PositionEmployeesRequest,
	"id" | "companyCode" | "employeeIds"
>
