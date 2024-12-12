interface IDataItem {
	id: number
	companyCode: string
	code: string
	name: string
	employeeAmount: number
	used: boolean
	description: string
	startYearMonth: string
	endYearMonth: string
	employeeIds: Array<{ id: number }>
}

export type Data = Omit<IDataItem, "employeeIds" | "employeeAmount">
export type FormState = Omit<IDataItem, "id" | "employeeAmount">
export type Node = Omit<IDataItem, "IDataItem">
export type Search = Partial<IDataItem> & {
	pageNumber?: number
	size?: number
	first: boolean
	last: boolean
}

export const initFormData = {
	companyCode: "",
	code: "",
	name: "",
	description: "",
	startYearMonth: "",
	endYearMonth: "",
	used: true,
	employeeIds: [],
}
