export interface WorkPlaceAddress {
	roadAddr: string
	jibunAddr: string
	detailAddr: string
	engAddr1: string
	engAddr2: string
	zonecode: string
}

interface IWorkplace {
	id?: number
	code?: string //회사코드
	name?: string //회사명
	registrationNumber?: string
	workplaceCode?: string //사업장코드
	workplaceName?: string //사업장명
	placeTypeName?: string
	placeTypeLabel?: string
	placeType?: string
	representativeName?: string
	bizType?: string
	bizItem?: string
	used?: boolean
	orderSeq?: number
	address: Address
	updatedBy?: string
	updatedAt?: string
	parentId?: number
	parentName?: string
	status: "read" | "update" | "create" | "append"
}

export interface IWorkplaceTree {
	id: number
	name: string
	children?: IWorkplaceTree[]
	placeTypeName?: string
	placeTypeLabel?: string
	used?: boolean
	orderSeq?: number | 0
	parentId?: number
	parentName?: string
	companyCode?: string
	status?: "read" | "update" | "create" | "append"
	checkable?: boolean
	isLeaf?: boolean
	switcherIcon?: any
	registrationNumber?: string
	placeType?: string
}

export class WorkplaceTreeClass implements IWorkplaceTree {
	id: number = 0
	name: string = ""
	children?: IWorkplaceTree[]
	placeTypeName?: string
	placeTypeLabel?: string
	used: boolean = true
	orderSeq: number = 0
	parentId?: number
	status: "read" | "update" | "create" | "append" = "read"
	constructor() {}
}

export const initCompanyData: Workplace = {
	id: undefined,
	name: "",
	code: "",
	registrationNumber: "",
	workplaceCode: "",
	workplaceName: "",
	placeTypeName: "",
	placeTypeLabel: "",
	placeType: "COMPANY",
	representativeName: "",
	bizType: "",
	bizItem: "",
	used: true,
	orderSeq: undefined,
	address: {
		detailAddr: "",
		engAddr1: "",
		engAddr2: "",
		jibunAddr: "",
		roadAddr: "",
		zonecode: "",
	} as Address,
	updatedBy: "",
	updatedAt: "",
	parentId: undefined,
	status: "read",
}

export const initWorkPlaceData: Workplace = {
	id: undefined,
	name: "",
	code: "",
	registrationNumber: "",
	workplaceCode: "",
	workplaceName: "",
	placeTypeName: "",
	placeTypeLabel: "",
	placeType: "WORKPLACE",
	representativeName: "",
	bizType: "",
	bizItem: "",
	used: true,
	orderSeq: undefined,
	address: {
		detailAddr: "",
		engAddr1: "",
		engAddr2: "",
		jibunAddr: "",
		roadAddr: "",
		zonecode: "",
	} as Address,
	updatedBy: "",
	updatedAt: "",
	parentId: undefined,
	status: "read",
}

export type Address = Partial<WorkPlaceAddress>
export type Workplace = Partial<IWorkplace> & Pick<IWorkplace, "status" | "address">
export type WorkplaceTree = Partial<IWorkplaceTree> & Pick<IWorkplaceTree, "id" | "name">
