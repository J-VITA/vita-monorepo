import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IAapprovedListSearchParams {
	companyCode?: string
	employeeId?: number | string //사용자 식별자
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	title?: string
	documentStatus: string
	draftEmployeeId?: string | number
	draftEmployeeIds?: (string | number)[]
}

interface IAapprovedListItem {
	id: string
	companyCode: string
	approvalNumber: string
	draftEmployeeId: number | string
	draftEmployeeName: string
	documentStatusName: string // 문서상태구분(SAVED, REQUESTED)
	documentStatusLabel: string
	approvalFormTypeName: string
	approvalFormTypeLabel: string
	agreementOptionTypeName: string
	agreementOptionTypeLabel: string
	title: string
	urgent: boolean
	isBulkApproval: boolean
	createdAt: string
	draftDateTime: string
	rejectedDateTime: string
	completedDateTime: string
	approvalDetails: any[]
}

export type AapprovedListItem = Required<IAapprovedListItem>

export type AapprovedListSearch = ExSearchParams<
	RequestParams<IAapprovedListSearchParams>,
	"AapprovedList"
>

export const useAapprovedListSearch = (
	companyCode: string,
	employeeId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<IAapprovedListSearchParams>, "AapprovedList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
			employeeId,
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			filterDate: [useMonth.from(), useMonth.to()],
			documentStatus: "",
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<AapprovedListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"AapprovedList">([
	{
		title: "제목",
		dataIndex: "title",
		sorter: {
			multiple: 1,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "문서상태",
		dataIndex: "documentStatusLabel",
		align: "center",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "문서양식",
		dataIndex: "approvalFormTypeLabel",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "문서번호",
		dataIndex: "approvalNumber",
		align: "center",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "총금액(KRW)",
		dataIndex: "totalAmount",
		align: "right",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
		className: "bold",
		customRender: ({ text }) => formatCurrency(text, "KRW"),
	},
	{
		title: "기안자",
		dataIndex: "draftEmployeeName",
		align: "center",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "기안일",
		dataIndex: "draftDateTime",
		align: "center",
		sorter: {
			multiple: 7,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "완료일",
		dataIndex: "completedDateTime",
		align: "center",
		sorter: {
			multiple: 8,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "결재선",
		dataIndex: "approvalDetails",
		sorter: {
			multiple: 9,
		},
		width: -1,
		resizable: true,
	},
])

export type AapprovedListColumns = ExTableColumns<"AapprovedList">
export const useAapprovedListColumns = () => {
	return ref<AapprovedListColumns>(columns)
}
