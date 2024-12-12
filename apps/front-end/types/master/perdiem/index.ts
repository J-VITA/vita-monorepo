interface IPerdiemAllowanceType {
	id: number
	companyCode: string
	workplaceId: number
	typeName: string
	code: string
	orderSeq: number
	used: boolean
	showed: boolean
}

interface IPerdiemAllowanceInfo {
	id: number
	companyCode: string
	workplaceId: number
	infoName: string
	infoCode: string
	orderSeq: number
	updateBy: string
	updateAt: string
	used: boolean
	showed: boolean
}

interface IPerdiemGrade {
	id: number
	companyCode: string
	workplaceId: number
	gradeName: string
	gradeCode: string
	orderSeq: number
	used: boolean
	showed: boolean
}

interface IPerdiemLevel {
	id: number
	companyCode: string
	workplaceId: number
	levelName: string
	levelCode: string
	orderSeq: number
	updateBy: string
	updateAt: string
	used: boolean
	showed: boolean
}

export type PerdiemAllowanceType = Partial<IPerdiemAllowanceType>
export type PerdiemAllowanceInfo = Partial<IPerdiemAllowanceInfo>
export type PerdiemGrade = Partial<IPerdiemGrade>
export type PerdiemLevel = Partial<IPerdiemLevel>
