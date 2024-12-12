export interface RoleRequest<T> {
	id: number
	companyCode: string
	roleCode: string
	roleDesc: string
	roleName: string
	roleSelectCode: string
	roleUsers: Array<T>
	used: boolean
}

export type Role<T> = Omit<RoleRequest<T>, "roleUsers">
