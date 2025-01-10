import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

export interface IApprovalWaitListSearchParams {
	companyCode?: string
	employeeId?: number | string //사용자 식별자
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	title: string
}

export type ApprovalWaitListSearch = ExSearchParams<
	RequestParams<IApprovalWaitListSearchParams>,
	"ApprovalWaitList"
>

export const useApprovalWaitListSearch = (
	companyCode: string,
	employeeId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<IApprovalWaitListSearchParams>, "ApprovalWaitList">({
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
			title: "",
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<ApprovalWaitListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

/**
 * 결재처리 목록 컬럼
 */
export const columns = createTableColumns<"ApprovalWaitList">([
	{
		title: "제목",
		dataIndex: "title",
		resizable: true,
		width: -1,
	},
	{
		title: "문서양식",
		dataIndex: "approvalFormTypeLabel",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "문서번호",
		dataIndex: "approvalNumber",
		resizable: true,
		align: "center",
		width: -1,
		sorter: {
			multiple: 1,
		},
	},
	{
		title: "총금액(KRW)",
		dataIndex: "totalAmount",
		resizable: true,
		width: -1,
		sorter: {
			multiple: 2,
		},
		align: "right",
		customRender: ({ text }) => formatCurrency(text, "KRW"),
	},
	{
		title: "기안자",
		dataIndex: "draftEmployeeName",
		resizable: true,
		sorter: {
			multiple: 3,
		},
		align: "center",
		width: 100,
	},

	{
		title: "기안일",
		dataIndex: "draftDateTime",
		resizable: true,
		sorter: {
			multiple: 4,
		},
		align: "center",
		width: -1,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "결재선",
		dataIndex: "approvalDetails",
		resizable: true,
		sorter: {
			multiple: 5,
		},
		width: -1,
	},
])
export type ApprovalWaitListColumns = ExTableColumns<"ApprovalWaitList">
export const useApprovalWaitListColumns = () => {
	return ref<ApprovalWaitListColumns>(columns)
}
