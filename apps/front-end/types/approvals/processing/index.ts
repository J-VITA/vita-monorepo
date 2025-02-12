import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IProgressListSearchParams {
	companyCode?: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	title?: string
}

export type ProgressListSearch = ExSearchParams<
	RequestParams<IProgressListSearchParams>,
	"ProgressList"
>

export const useProgressListSearch = (
	companyCode: string,
	employeeId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<any>, "ProgressList">({
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
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<ProgressListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"ProgressList">([
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
		className: "bold",
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
		title: "진행상태",
		dataIndex: "documentStatusName",
		sorter: {
			multiple: 5,
		},
		align: "center",
		width: 100,
	},
	{
		title: "결재선",
		dataIndex: "approvalDetails",
		resizable: true,
		width: -1,
		sorter: {
			multiple: 6,
		},
	},
])

export type ProgressListColumns = ExTableColumns<"ProgressList">
export const useProgressListColumns = () => {
	return ref<ProgressListColumns>(columns)
}
