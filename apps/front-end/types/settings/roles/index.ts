type Ids = number | string

interface RoleRequest {
	id: number | string
	companyCode: string
	name: string
	code: string
	description: string
	memberIds: Array<Ids>
	menuIds: any[]
}

/**
 * 권한 조회 / 추가 / 수정 등
 * */
export type Roles =
	| Partial<RoleRequest>
	| Pick<
			RoleRequest,
			"id" | "companyCode" | "memberIds" | "menuIds" | "description" | "code" | "name"
	  >

export const inquiryLevel = [
	{ label: "개인조회", value: "PERSONAL" },
	{ label: "코스트센터조회", value: "COST_CENTER" },
	{ label: "전체조회", value: "GLOBAL" },
]

export type RoleMember = {
	memberId: string | number
}

export type RoleMenuIds = {
	id: string | number
	halfChecked: boolean
	selectLevelType?: any
}
/**
 * 권한 관리 Menu Item Types
 */
export type RoleMenuItem = {
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
	isRole: boolean
	halfChecked: boolean
	parentId?: number
	selectLevelTypeName?: string
	selectLevelTypeLabel?: string
	children?: RoleMenuItem[]
}

/**
 * 선택된 메뉴 체크
 * @param data
 * @returns checked,halfChecked,rows,
 */
export function selectedData(data: Array<RoleMenuItem>) {
	const checked: (string | number)[] = []
	const halfChecked: (string | number)[] = []
	const rows: any[] = []
	function loop(items: any[]) {
		for (const item of items) {
			if (item.isRole && !item.halfChecked) {
				checked.push(item.id)
				rows.push(item)
			}
			if (item.halfChecked) {
				halfChecked.push(item.id)
				rows.push({
					...item,
					halfChecked: true,
				})
			}

			if (item.children?.length) {
				loop(item.children)
			}
		}
	}

	loop(data)

	return {
		checked,
		halfChecked,
		rows,
	}
}
