export enum AccountPeriodStatus {
	CLOSE = "CLOSE",
	OPEN = "OPEN",
	//DELETE = 'delete', //프론트에서만 사용함.
}

export interface IRequest {
	id: number
	companyCode: string
	standardYearMonth: string
	workplaceCode: string | number
	accountPeriodStatusName: string
	accountPeriodStatusLabel: string
	description: string
	updatedBy: string
	updatedAt: string
}

interface ICreate {
	companyId: number
	companyCode: string
	accountYear: string
	accountMonth: string
	workplaceId?: number
	workplaceCode: string | number
	accountPeriodStatus: string
	description: string
}

interface ISearchParams {
	searchYearMonthFrom: string
	searchYearMonthTo: string
	companyId: number
	companyCode: string
	accountPeriodStatus: string
	workplaceId: number
	workplaceCode: string | number
	page: number
	size: number
}

export type AccountPeriod = Pick<IRequest, "id" | "companyCode"> & Partial<IRequest>

export type ConfirmProps = {
	showed: boolean
	type: AccountPeriodStatus | undefined
	title: string
	content: string
	okTitle: string
	data: AccountPeriod[]
}

export type CreateAccountPeriod = Partial<ICreate>

export type SearchParams = Partial<ISearchParams>
