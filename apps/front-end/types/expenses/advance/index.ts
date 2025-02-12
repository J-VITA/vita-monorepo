import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"

interface IAdvanceListSearchParams {
	companyCode?: string
	employeeId?: number | string //사용자 식별자
	employeeIds?: (number | string)[] //사용자 식별자
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	filterDate: [Dayjs, Dayjs]
	slipType?: string
	slipStatus?: string
	advancePaymentCalculationType?: string
	vendorName?: string
	departmentId?: number | string
	departmentIds?: (number | string)[]
}

interface IAdvanceListData {
	id: number
	companyCode: string
	slipTypeName: string // 전표유형구분(PERSONAL, CARD, E_TAX...
	slipTypeLabel: string // 전표유형명(개인경비, 개인경비분할, 법인카드, 전자세금계산서....)
	slipNumber: string // 전표번호
	accountingDate: string //회계일자
	vendorName: string // 거래처명
	employeeName: string // 사용자명
	supplyAmount: number // 공급가액
	advancePaymentBalanceAmount: number // 선급금잔액
	advancePaymentCalculationTypeLabel: string // 선급금 정산명(e.g.,미정산, 일부정산, 정산완료)
	slipStatusName: string // 전표상태구분(UNPROCESSED, COMPLETE, APPROVAL_RETURN, APPROVAL_ING, CONFIRM..)
	slipStatusLabel: string // 전표상태명(미처리, 작성완료, 결재반려, 결재중, 확정..)
	approvalHeaderId: number // 결재 헤더 식별자
	title: string // 결재제목
	divisionSlipFlag: boolean // 분할전표여부
}

export type AdvanceListData = IAdvanceListData

export type AdvanceListSearch = ExSearchParams<
	RequestParams<IAdvanceListSearchParams>,
	"AdvanceList"
>

export const useAdvanceList = (companyCode: string) => {
	const searchParams = ref(
		createSearchParams<RequestParams<IAdvanceListSearchParams>, "AdvanceList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			companyCode,
			searchDateFrom: dayjs(useMonth.lastFrom(1)).format("YYYY-MM-DD"), //시작일
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"), //종료일
			filterDate: [useMonth.lastFrom(1), useMonth.to()],
		})
	)
	return {
		searchParams,
		updateSearchParams: (newParams: Partial<AdvanceListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"AdvanceList">([
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
		title: "회계일자",
		dataIndex: "accountingDate",
		width: -1,
		resizable: true,
	},
	{
		title: "거래처명",
		dataIndex: "vendorName",
		width: -1,
		resizable: true,
	},
	{
		title: "작성자",
		dataIndex: "employeeName",
		width: -1,
		resizable: true,
	},
	{
		title: "신청금액",
		dataIndex: "supplyAmount",
		align: "right",
		sorter: {
			multiple: 2,
		},
		width: -1,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "선급금잔액",
		dataIndex: "advancePaymentBalanceAmount",
		align: "right",
		sorter: {
			multiple: 3,
		},
		width: -1,
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "정산여부",
		dataIndex: "advancePaymentCalculationTypeLabel",
		align: "center",
		sorter: {
			multiple: 4,
		},
		width: -1,
	},
	{
		title: "상태",
		dataIndex: "slipStatusName",
		sorter: {
			multiple: 5,
		},
		width: -1,
		customRender: ({ record }) => record.slipStatusLabel,
	},
])

export type AdvanceListColumns = ExTableColumns<"AdvanceList">
export const useAdvanceListColumns = () => {
	return ref<AdvanceListColumns>(columns)
}
