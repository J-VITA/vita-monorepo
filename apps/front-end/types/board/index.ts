import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IBoardListSearchParams {
	companyCode?: string
	title?: string
	write?: string
}

export type BoardListSearch = ExSearchParams<
	RequestParams<IBoardListSearchParams>,
	"BoardList"
>

export const useBoardListSearch = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<any>, "BoardList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<BoardListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"BoardList">([
	{
		title: "제목",
		dataIndex: "title",
	},
	{
		title: "작성자",
		dataIndex: "writerName",
		width: 100,
		align: "center",
	},
	{
		title: "작성일",
		dataIndex: "createdAt",
		width: 150,
		align: "center",
	},
])

export type BoardListColumns = ExTableColumns<"BoardList">
export const useBoardListColumns = () => {
	return ref<BoardListColumns>(columns)
}

export type BoardList = {
	id: number
	companyCode: string
	title: string
	content: string
	writerId: number
	writerName: string
	isNotice: boolean
	createdAt: string
	commentCount: number
}

export type BoardForm = {
	id?: number
	companyCode: string
	title: string
	content: string
	writerId: number
	isNotice: boolean
	fileIds: { id: number }[]
	fileList: any[]
}

export type BoardDetail = {
	id: number
	companyCode: string
	title: string
	content: string
	writerId: number
	writerName: string
	writerDepartmentCode: string
	writerDepartmentName: string
	writerPositionCode: string
	writerPositionName: string
	isNotice: boolean
	createdAt: string
	files: any[]
	boardComments: any[]
}

export type BoardComment = {
	id: number
	companyCode: string
	content: string
	commentEmployeeId: number
	commentEmployeeName: string
	commentEmployeeDepartmentCode: string
	commentEmployeeDepartmentName: string
	commentEmployeePositionCode: string
	commentEmployeePositionName: string
	createdAt: string
}
