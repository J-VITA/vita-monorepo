import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

export const textSearchOptions = [
	{ label: "공급거래처명", value: "vendorName" },
	{ label: "담당자 이메일", value: "recipientEmail" },
	{ label: "계산서 승인번호", value: "issueId" },
]

interface ITaxInvoiceList {
	id?: number
	companyCode: string
	slipTypeName: string // 전표유형구분(PERSONAL, CARD, E_TAX...)
	slipTypeLabel: string // 전표유형명(개인경비, 개인경비분할, 법인카드, 전자세금계산서....)
	slipNumber: string // 전표번호
	draftDate: string // 증빙일자
	issueId: string // 세금계산서 승인번호
	employeeName: string // 사용자명
	vendorName: string // 거래처명
	supplyAmount: number // 공급가액
	taxAmount: number // 부가세액
	totalAmount: number // 총금액
	recipientEmail1: string // 담당자 이메일
	taxDealStatusName: string // 처리상태(UNPROCESSED, IN_PROGRESS, COMPLETED)
	taxDealStatusLabel: string // 처리상태(미처리, 처리중, 처리완료)
	fileId: number
	slipStatusName: string // 전표상태(DRAFT, APPROVED, REJECTED)
	slipStatusLabel: string // 전표상태(임시저장, 승인, 반려)
	approvalHeaderId: number // 결재 헤더 식별자
	title: string // 결재제목
	divisionSlipFlag: boolean // 분할전표여부
}

export type TaxInvoiceData = Required<ITaxInvoiceList>

interface ITaxInvoiceListSearchParams {
	companyCode?: string
	employeeId?: number | string //사용자 식별자
	employeeIds?: number[] //사용자 식별자
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	slipType?: string // 전표 유형
	slipStatus?: string // 전표 상태
	taxDealStatus?: string // 세금계산서 수신 상태
	vendorName?: string // 거래처명
	recipientEmail?: string // 공급받는자 담당자 이메일
	issueId?: string // 세금계산서 승인번호
	textSearchType: string // 항목 선택
	text?: string // 검색텍스트
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
			searchDateFrom: dayjs(useMonth.lastFrom(1)).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			filterDate: [useMonth.lastFrom(1), useMonth.to()],
			textSearchType: "vendorName",
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
		title: "전표유형",
		dataIndex: "slipTypeName",
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
		title: "공급일자",
		dataIndex: "draftDate",
		width: -1,
		resizable: true,
	},
	{
		title: "세금계산서 승인번호",
		dataIndex: "issueId",
		width: -1,
		resizable: true,
	},
	{
		title: "작성자(처리자)",
		dataIndex: "employeeName",
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
		dataIndex: "supplyAmount",
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
		dataIndex: "recipientEmail1",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "전표상태",
		dataIndex: "slipStatusName",
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
