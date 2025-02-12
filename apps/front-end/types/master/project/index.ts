import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IDataItem {
	id: number
	companyCode: string
	code: string
	name: string
	employeeAmount: number
	used: boolean
	description: string
	startYearMonth: string
	endYearMonth: string
	employeeIds: Array<{ id: number }>
	users: (string | number)[]
	startDate?: Dayjs | string
	endDate?: Dayjs | string
	allEnabled: boolean
}

export type Data = Omit<IDataItem, "employeeIds" | "employeeAmount">
export type FormState = Omit<IDataItem, "id" | "employeeAmount">
export type Node = Omit<IDataItem, "IDataItem">

export const initFormData = {
	companyCode: "",
	code: "",
	name: "",
	description: "",
	startYearMonth: "",
	endYearMonth: "",
	used: true,
	employeeIds: [],
	users: [],
	allEnabled: false,
}

interface IProjectListSearchParams {
	companyCode?: string
	searchDateFrom?: string //시작일
	searchDateTo?: string //종료일
	filterDate?: [Dayjs, Dayjs]
	code?: string
	name?: string
	text?: string
	type?: string
}

export type ProjectListSearch = ExSearchParams<
	RequestParams<IProjectListSearchParams>,
	"ProjectList"
>

export const useProjectListSearch = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<any>, "ProjectList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
			used: "",
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			filterDate: [useMonth.from(), useMonth.to()],
			type: "name",
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<ProjectListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"ProjectList">([
	{
		title: "프로젝트명",
		dataIndex: "name",
		resizable: true,
		width: -1,
	},
	{
		title: "프로젝트 기간",
		dataIndex: "date",
		resizable: true,
		align: "center",
		width: -1,
		customRender: ({ record }) => `${record.startYearMonth} - ${record.endYearMonth}`,
	},
	{
		title: "프로젝트 코드",
		dataIndex: "code",
		align: "center",
		resizable: true,
		width: -1,
	},
	{
		title: "사용자",
		dataIndex: "employeeAmount",
		align: "center",
		resizable: true,
		width: -1,
		customRender: ({ record, text }) => (record.allEnabled ? "전직원" : text),
	},
	{
		title: "설명",
		dataIndex: "description",
		resizable: true,
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		resizable: true,
		width: -1,
	},
])

export type ProjectListColumns = ExTableColumns<"ProjectList">
export const useProjectListColumns = () => {
	return ref<ProjectListColumns>(columns)
}
