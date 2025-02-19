import dayjs, { Dayjs } from "dayjs"
import {
	type Response,
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	RequestParams,
	pageSize,
} from "@/types"

export interface ICreditCardIssueDetailSearchParams {
	companyCode: string
}

export type CreditCardIssueDetailSearch = ExSearchParams<
	RequestParams<ICreditCardIssueDetailSearchParams>,
	"CreditCardIssueDetail"
>

export const useCreditCardIssueDetailSearch = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<
			RequestParams<ICreditCardIssueDetailSearchParams>,
			"CreditCardIssueDetail"
		>({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: false,
			sort: [],
			companyCode,
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<CreditCardIssueDetailSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"CreditCardIssueDetail">([
	{
		title: "사용기간",
		dataIndex: "dateRange",
		sorter: {
			multiple: 1,
		},
		width: 180,
	},
	{
		title: "불출일",
		dataIndex: "issueDate",
		sorter: {
			multiple: 2,
		},
		width: -1,
		align: "center",
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD HH:mm"),
	},
	{
		title: "사용자",
		dataIndex: "user",
		sorter: {
			multiple: 3,
		},
		width: -1,
		align: "center",
	},
	{
		title: "수령확인자",
		dataIndex: "approvedBy",
		sorter: {
			multiple: 4,
		},
		width: -1,
		align: "center",
	},
	{
		title: "반납일",
		dataIndex: "returnDate",
		sorter: {
			multiple: 5,
		},
		width: -1,
		align: "center",
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD HH:mm"),
	},
	{
		title: "반납자",
		dataIndex: "returnedBy",
		sorter: {
			multiple: 6,
		},
		width: -1,
		align: "center",
	},
	{
		title: "반납확인자",
		dataIndex: "returnConfirmedBy",
		sorter: {
			multiple: 7,
		},
		width: -1,
		align: "center",
	},
	{
		title: "결재문서",
		dataIndex: "approvalHeaderId",
		sorter: {
			multiple: 8,
		},
		width: 60,
		align: "center",
	},
	{
		title: "기능",
		dataIndex: "actions",
		width: 80,
	},
])

export type CreditCardIssueDetailColumns = ExTableColumns<"CreditCardIssueDetail">
export const useCreditCardIssueDetailColumns = () => {
	return ref<CreditCardIssueDetailColumns>(columns)
}

export type CreditCardListData = {
	id: number
	companyCode: string
	number: string
	cardCompanyTypeName: string
	cardCompanyTypeLabel: string
	name: string
	cardStatusName: string
	cardStatusLabel: string
	cardTypeName: string
	cardTypeLabel: string
	cardUseTypeName: string
	cardUseTypeLabel: string
	expirationYear: string
	expirationMonth: string
	collectionStartDate: string
	issueDate: string
	paymentDayName: string
	paymentDayLabel: string
	cancellationDate: string
	limitAmount: string
	bankTypeName: string
	bankTypeLabel: string
	accountNumber: string
	startDate: string
	endDate: string
	used: boolean
	ownerId: number
	userId: number
	vendorId: number
}
export type CardIssueManagementListData = {
	id: number
	startDate: string
	endDate: string | Dayjs
	issueDate: string | Dayjs
	user: string
	approvedBy: string
	returnDate: string | Dayjs
	returnedBy: string
	returnConfirmedBy: string
	approvalHeaderId: number
	cardId: number
	cardIssueId: number
	isPast: boolean
}

export type CardIssuesAdditional = {
	id?: number
	companyCode: string
	startDate?: string
	endDate?: string
	cardId?: number
	userId?: number
	userIds: (string | number)[]
	dates: [null, null] | [Dayjs, Dayjs]
}

export type CardIssueRequester = {
	id: number
	requestedBy: string
	employeeId: number
}

export type CardIssueInfo = {
	id: number
	startDate: string | Dayjs
	endDate: string | Dayjs
	issueDate: string | Dayjs
	user: string
	approvedBy: string
	returnDate: string | Dayjs
	returnedBy: string
	returnConfirmedBy: string
	approvalHeaderId: number
	card: CreditCardListData
	cardIssueId: number
	userEmployeeId: number
	approvedByEmployeeId: number
	cardId?: number
}

export type IssueFormState = {
	id?: number
	issueDate?: string | Dayjs
	userId?: number
	approvedBy?: number
	cardId?: number
	approvedByIds: number[]
}
export type ReturnFormState = {
	id?: number
	returnDate?: string | Dayjs
	returnedBy?: number
	approvedBy?: number
	cardId?: number
	approvedByIds: number[]
}
