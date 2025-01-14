import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IDraftListSearchParams {
	companyCode?: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	title?: string
}

export type DraftListSearch = ExSearchParams<
	RequestParams<IDraftListSearchParams>,
	"DraftList"
>

export const useDraftListSearch = (companyCode: string, employeeId: number | string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<any>, "DraftList">({
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
		updateSearchParams: (newParams: Partial<DraftListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"DraftList">([
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
		title: "총금액(KRW)",
		dataIndex: "totalAmount",
		resizable: true,
		width: -1,
		sorter: {
			multiple: 1,
		},
		align: "right",
		customRender: ({ text }) => formatCurrency(text, "KRW"),
	},
	{
		title: "작성자",
		dataIndex: "draftEmployeeName",
		resizable: true,
		sorter: {
			multiple: 2,
		},
		align: "center",
		width: 100,
	},
	{
		title: "작성일",
		dataIndex: "createdAt",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 3,
		},
		width: -1,
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "결재선",
		dataIndex: "approvalDetails",
		resizable: true,
		sorter: {
			multiple: 4,
		},
		width: -1,
	},
])

export type DraftListColumns = ExTableColumns<"DraftList">
export const useDraftListColumns = () => {
	return ref<DraftListColumns>(columns)
}
