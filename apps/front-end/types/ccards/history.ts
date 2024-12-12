import dayjs, { Dayjs } from "dayjs"
import { type SelectProps } from "ant-design-vue"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	RequestParams,
	pageSize,
} from "@/types"

export interface ICardHistorySearchParams {
	companyCode: string
	startDate: string
	endDate: string
	filterDate: [Dayjs, Dayjs]
	departmentCode?: string | number
	departmentIds?: (string | number)[]
	requestedBy?: string | number
	employeeIds?: (string | number)[]
	cardIssueRequestStatus: string
}

export type CardHistorySearch = ExSearchParams<
	RequestParams<ICardHistorySearchParams>,
	"CardHistory"
>

export const useCardHistorySearch = async (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<ICardHistorySearchParams>, "CardHistory">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: false,
			sort: [],
			companyCode,
			startDate: dayjs(useMonth.from()).format("YYYY-MM-DD"),
			endDate: dayjs(useMonth.to()).format("YYYY-MM-DD"),
			filterDate: [useMonth.from(), useMonth.to()],
			cardIssueRequestStatus: "",
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<CardHistorySearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"CardHistory">([
	{
		title: "신청번호",
		dataIndex: "cardIssueNumber",
		sorter: {
			multiple: 1,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "신청일",
		dataIndex: "requestedAt",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => dayjs(text).format("YYYY-MM-DD HH:mm:ss"),
	},
	{
		title: "상태",
		dataIndex: "cardIssueRequestStatus",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "신청부서",
		dataIndex: "department",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "신청자",
		dataIndex: "requestedBy",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "카드소유자",
		dataIndex: "",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "사용기간",
		dataIndex: "date",
		sorter: {
			multiple: 7,
		},
		width: -1,
		resizable: true,
		customRender: ({ record }) => {
			return `${dayjs(record.startDate).format("YYYY-MM-DD HH:mm:ss")} ~ ${dayjs(
				record.endDate
			).format("YYYY-MM-DD HH:mm:ss")}`
		},
	},
	{
		title: "결재문서",
		dataIndex: "approvalHeaderId",
		sorter: {
			multiple: 8,
		},
		width: -1,
	},
	{
		title: "결재처리자",
		dataIndex: "approvedBy",
		sorter: {
			multiple: 9,
		},
		width: -1,
	},
	{
		title: "결재",
		dataIndex: "actions",
		width: 110,
		align: "center",
	},
])

export type CardHistoryColumns = ExTableColumns<"CardHistory">
export const useCardHistoryColumns = () => {
	return ref<CardHistoryColumns>(columns)
}

type CardIssueRequestStatus = {
	code: string
	label: string
	name: string
	used: boolean
}

export type CardHistoryItem = {
	id: number
	cardIssueNumber: string
	startDate: string
	endDate: string
	cardType: string
	requestedAt: string
	cardIssueRequestStatus: CardIssueRequestStatus
	department: string
	requestedBy: string
	owner: string
	approvalHeaderId: number
	approvedBy: number
	description: string
}

export type CardIssueApproveOrRejectRequest = {
	id?: number
	approvedBy: number
	approvedAt?: string
	cardIssueRequestStatus: string
	cardId?: string
	comment: string

	cardOptions?: SelectProps["options"]
	requestedBy?: string
	date?: [Dayjs, Dayjs]
}
