import { createTableColumns, ExTableColumns } from "@/types"
import dayjs from "dayjs"

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
	// description: string
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

export const columns = createTableColumns<"AccountPeriodList">([
	{
		title: "기준월",
		dataIndex: "standardYearMonth",
		align: "center",
		width: -1,
	},
	{
		title: "회계구분",
		dataIndex: "accountPeriodStatusLabel",
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "회사명",
		dataIndex: "companyName",
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "사업장명",
		dataIndex: "workplaceName",
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "최종수정일",
		dataIndex: "updatedAt",
		width: -1,
		align: "center",
		resizable: true,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
	},
	{
		title: "최종수정자",
		dataIndex: "updatedBy",
		align: "center",
		width: -1,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
])

export type AccountPeriodListColumns = ExTableColumns<"AccountPeriodList">
export const useAccountPeriodListColumns = () => {
	return ref<AccountPeriodListColumns>(columns)
}
