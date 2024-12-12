import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

export interface IExpenseListSearchParams {
	companyCode?: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	slipType: string
	slipStatus: string
	departmentId?: number
	departmentName?: string
	departmentIds?: (number | string)[]
	accountId?: number | string //계정과목식별자
	accountName?: string //계정과목명
	projectId?: number | string //프로젝트 식별자
	projectName?: string //프로젝트명
	costCenterId?: number | string //코스트센터 식별자
	costCenterIds?: (number | string)[] //코스트센터 식별자(조회 select table parameters)
	costCenterName?: string //코스트센터명
	amountFrom?: number | string //시작금액
	amountTo?: number | string //종료금액
	employeeId?: number | string //사용자 식별자
	employeeIds?: (number | string)[] //사용자 식별자(조회 select table parameters)
	month: "당월"
	filterDate: [Dayjs, Dayjs]
}

export type ExpenseListSearch = ExSearchParams<
	RequestParams<IExpenseListSearchParams>,
	"ExpenseList"
>

/**
 * 개인카드 사용내역 불러오기 검색 파라미터 정의
 * @param
 * @returns
 */
export const useExpenseListSearch = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<IExpenseListSearchParams>, "ExpenseList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			slipType: "",
			slipStatus: "",
			departmentId: undefined, //부서 식별자
			departmentIds: undefined, //부서 식별자
			departmentName: undefined, //부서명
			accountId: undefined, //계정과목식별자
			accountName: undefined, //계정과목명
			projectId: undefined, //프로젝트 식별자
			projectName: undefined, //프로젝트명
			costCenterId: undefined, //코스트센터 식별자
			costCenterIds: undefined, //코스트센터 식별자
			costCenterName: undefined, //코스트센터명
			amountFrom: undefined, //시작금액
			amountTo: undefined, //종료금액
			employeeId: undefined, //사용자 식별자
			employeeIds: undefined, //사용자 식별자
			month: "당월",
			filterDate: [useMonth.from(), useMonth.to()],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<ExpenseListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const expenseListColumns = createTableColumns<"ExpenseList">([
	{
		title: "지출유형",
		dataIndex: "slipTypeName",
		resizable: true,
		sorter: {
			multiple: 1,
		},
		width: 100,
		align: "center",
	},
	{
		title: "전표번호",
		dataIndex: "slipNumber",
		resizable: true,
		sorter: {
			multiple: 2,
		},
		width: -1,
		align: "center",
	},
	{
		title: "사용일자",
		dataIndex: "evidenceDate",
		resizable: true,
		sorter: {
			multiple: 3,
		},
		width: 100,
		align: "center",
	},
	{
		title: "사용자",
		dataIndex: "employeeName",
		resizable: true,
		sorter: {
			multiple: 4,
		},
		width: -1,
		align: "center",
	},
	{
		title: "가맹점",
		dataIndex: "storeName",
		resizable: true,
		sorter: {
			multiple: 5,
		},
		width: -1,
	},
	{
		title: "금액",
		dataIndex: "totalAmount",
		resizable: true,
		sorter: {
			multiple: 6,
		},
		align: "right",
		width: -1,
	},
	{
		title: "계정과목/비용항목",
		dataIndex: "accountName",
		resizable: true,
		sorter: {
			multiple: 7,
		},
		width: -1,
	},
	{
		title: "내용",
		dataIndex: "description",
		resizable: true,
		sorter: {
			multiple: 8,
		},
		width: 200,
	},
	{
		title: "영수증 첨부",
		dataIndex: "fileId",
		resizable: true,
		sorter: {
			multiple: 9,
		},
		align: "center",
		width: -1,
	},
	{
		title: "상태",
		dataIndex: "slipStatusName",
		resizable: true,
		sorter: {
			multiple: 10,
		},
		align: "left",
		width: -1,
	},
])

export type ExpenseListColumns = ExTableColumns<"ExpenseList">
export const useExpenseListColumns = () => {
	return ref<ExpenseListColumns>(expenseListColumns)
}
