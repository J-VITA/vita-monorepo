import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface ITaxInvoiceListSearchParams {
	companyCode?: string
	employeeId?: number | string //사용자 식별자
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	state?: string // 상태
	taxInvoiceType?: string // 세금계산서 분류
	titleItem?: string // 항목 선택
	title?: string // 제목
	writer?: string // 작성자
	writerId?: number[] // 작성자 식별자
}

export type TaxInvoiceListSearch = ExSearchParams<
	RequestParams<ITaxInvoiceListSearchParams>,
	"TaxInvoiceList"
>

export const useTaxInvoiceListSearch = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<ITaxInvoiceListSearchParams>, "TaxInvoiceList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			filterDate: [useMonth.from(), useMonth.to()],
			state: "",
			taxInvoiceType: "",
			titleItem: "SUPPLIER_NAME",
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<TaxInvoiceListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"TaxInvoiceList">([
	{
		title: "계산서 분류",
		dataIndex: "taxInvoiceType",
		align: "center",
		sorter: {
			multiple: 1,
		},
		width: -1,
	},
	{
		title: "전표번호",
		dataIndex: "slipNumber",
		width: -1,
		resizable: true,
	},
	{
		title: "증빙일자",
		dataIndex: "searchDate",
		width: -1,
		resizable: true,
	},
	{
		title: "세금계산서 승인번호",
		dataIndex: "taxInvoiceNumber",
		width: -1,
		resizable: true,
	},
	{
		title: "작성자(처리자)",
		dataIndex: "writer",
		width: -1,
		resizable: true,
	},
	{
		title: "공급 거래처명",
		dataIndex: "supplierName",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "공급가액",
		dataIndex: "amount",
		align: "right",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "부가세액",
		dataIndex: "taxAmount",
		align: "right",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "합계금액",
		dataIndex: "totalAmount",
		align: "right",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "담당자 이메일",
		dataIndex: "email",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "상태",
		dataIndex: "state",
		sorter: {
			multiple: 7,
		},
		width: -1,
	},
])

export type TaxInvoiceListColumns = ExTableColumns<"TaxInvoiceList">
export const useTaxInvoiceListColumns = () => {
	return ref<TaxInvoiceListColumns>(columns)
}
