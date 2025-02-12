import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

export const columns = createTableColumns<"ExcelFormList">([
	{
		title: "양식명",
		dataIndex: "name",
	},
	{
		title: "페이지위치",
		dataIndex: "menuPath",
	},
	{
		title: "설명",
		dataIndex: "description",
	},
	{
		title: "최근수정일",
		dataIndex: "date",
		customRender: ({ text }) => text && dayjs(text).format("YYYY-MM-DD"),
	},
	{
		title: "샘플양식다운로드",
		dataIndex: "files",
	},
])

export type ExcelFormListColumns = ExTableColumns<"ExcelFormList">
export const useExcelFormListColumns = () => {
	return ref<ExcelFormListColumns>(columns)
}
