/**
 * master code 조회 parameters
 */
export interface GroupCodeRequest {
	companyCode: string
	companyId: number
	id: string
	code: string
	name: string
	used: boolean
	description: string
	page: number
	size: number
	sort: Array<any>
	totalElements: number
	totalPages: number
}

export interface Code {
	id: string | number | undefined
	companyCode: string
	code: string
	name: string
	description: string
	used: boolean
	color: string
}

export interface SubCode {
	id: string | number | undefined
	companyCode: string
	code: string
	name: string
	description: string
	used: boolean
	remark1: string
	remark2: string
	remark3: string
	remark4: string
	remark5: string
	groupCodeId: string | number
	orderSeq: number
}
export type RequestGroup = Partial<GroupCodeRequest> &
	Pick<GroupCodeRequest, "page" | "size">
export type GroupCode = Partial<Code> &
	Pick<Code, "companyCode" | "id" | "code" | "name" | "description" | "color">
export type SubGroupCode = Partial<SubCode> &
	Pick<SubCode, "id" | "code" | "name" | "description">
