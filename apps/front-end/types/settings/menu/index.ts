import type { DataNode } from "ant-design-vue/es/tree"

export const SelectLevelType = {
	/** 개인조회 */
	PERSONAL: "PERSONAL",
	/** 코스트센터조회 */
	COST_CENTER: "COST_CENTER",
	/** 부서조회 */
	DEPARTMENT: "DEPARTMENT",
	/** 전체조회 */
	GLOBAL: "GLOBAL",
}
/**
 * 전표 폼 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [DISBURSEMENT_FORM: 지출결의서(통합), PERSONAL_EXPENSE_FORM : 개인경비신청서, CARD_FORM : 법인카드사용내역서]
 */
export type SelectLevelType = (typeof SelectLevelType)[keyof typeof SelectLevelType]

export interface Menu {
	id: number
	companyCode: string
	menuNumber: string
	name: string
	path: string
	programFileName: string
	upperMenuNumber: string
	menuOrder: number
	menuDescription: string
	relateImagePath: string
	relateImageName: string
	orderSeq: number
	depth: number
	used: boolean
	editabled: boolean
	isCollapsed: boolean
	children: Array<Menu>
	selectLevelTypeLabel: string
	selectLevelTypeName: SelectLevelType
}

export type MenuManagement = Pick<Menu, "id">

interface IMenu {
	id: number
	companyCode: string
	name: string
	description: string
	path: string
	relateImageName: string
	relateImagePath: string
	orderSeq: number
	depth: number
	used: boolean
	selectLevelUsed: boolean
}
// children: IMenu[];

export type MenuItem = Required<IMenu> & {
	parentId?: number
	updatedBy?: string
	updatedAt?: string
}

export type MenuForm = Omit<IMenu, "id" | "relateImagePath"> & {
	id?: number
	parentId?: number
}

export const initMenuItem: MenuForm = {
	companyCode: "",
	name: "",
	description: "",
	path: "",
	relateImageName: "",
	orderSeq: 0,
	depth: 0,
	used: false,
	selectLevelUsed: false,
}
