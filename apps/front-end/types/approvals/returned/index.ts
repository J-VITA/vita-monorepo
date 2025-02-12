import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IReturnedListSearchParams {
	companyCode?: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	title?: string
	documentStatus: string
}

export type ReturnedListSearch = ExSearchParams<
	RequestParams<IReturnedListSearchParams>,
	"ReturnedList"
>

export const useReturnedListSearch = (
	companyCode: string,
	employeeId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<any>, "ReturnedList">({
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
		updateSearchParams: (newParams: Partial<ReturnedListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"ReturnedList">([
	{
		title: "분류",
		dataIndex: "documentStatusName",
		align: "center",
		width: 80,
		sorter: {
			multiple: 1,
		},
	},
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
			multiple: 2,
		},
	},
	{
		title: "총금액(KRW)",
		dataIndex: "totalAmount",
		resizable: true,
		width: -1,
		sorter: {
			multiple: 3,
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
			multiple: 4,
		},
		align: "center",
		width: 100,
	},
	{
		title: "기안일",
		dataIndex: "draftDateTime",
		resizable: true,
		sorter: {
			multiple: 5,
		},
		align: "center",
		width: -1,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "반려일",
		dataIndex: "rejectedDateTime",
		resizable: true,
		sorter: {
			multiple: 6,
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
			multiple: 7,
		},
		width: -1,
	},
])

export type ReturnedListColumns = ExTableColumns<"ReturnedList">
export const useReturnedListColumns = () => {
	return ref<ReturnedListColumns>(columns)
}
