import type { GridOptions, RowClassParams, ValueFormatterParams } from "@iwx/ui"
import type { Dayjs } from "dayjs"
interface IRowData {
	no?: number // 순번: number
	type: string // 유형: string
	taxCode: string // 세금코드: string
	costCenter: string // 코스트센터: string
	accountName: string // 계정비용항목명: string
	projectName: string // 프로젝트명: string
	debitAmount: number // 차변금액: number
	creditAmount: number // 대변금액: number
	note: string // 적요: string
	proof: string // 선납부가세증빙: any
}
interface ISlipHeader {
	slipNumber: number
}

interface ITaxInvoiceFormState {
	receiptFile: any[]
	files: any[]
	documents: any[]
	slipHeader: ISlipHeader
	rowData: Array<IRowData>
	accountingDate: Dayjs | string //회계일자:  Dayjs | string
	employeeId: string //작성자: string
	employeeIds: string[] //작성자ID: string[]
	proofDate: Dayjs | string //증빙일자:  Dayjs | string
	proofType: string //증빙유형: string
	taxCode: string //세금코드: string
	amount: {
		totalAmount: number // 총금액
		currency: string // 총금액 통화
	}
	settlementAmount: number // 정산금액
	taxableAmount: number //공급가액: number
	tax: number //부가세: number
	taxDirectInput: boolean //부가세직접수정: boolean
	settlementType: string //정산구분: string
	customerName: string //거래처명: string
	realPayment: {
		flag: false // 실지급처 구분
		customerName: string // 실지급처명
	}
	// realPaymentTypeFlag: boolean //실지급처구분Flag: boolean
	// realPaymentType: string //실지급처구분: string
	content: string //내용: string
	paymentCondition: string //지급조건: string
	paymentAccount: string //지급계좌: string
	paymentExpectedDate: string //지급예정일: string
	costCenter: string //코스트센터: string
	debit: {
		account: string // 대변계정
		subAccount: string
	}
	workplaceCode: string //사업장: string
}

export type TaxInvoiceFormState = ITaxInvoiceFormState

export const initFormState: TaxInvoiceFormState = {
	receiptFile: [],
	files: [],
	documents: [],
	slipHeader: {
		slipNumber: 0,
	},
	accountingDate: "",
	employeeId: "",
	employeeIds: [],
	proofDate: "",
	proofType: "전자세금계산서",
	taxCode: "일반세금계산서",
	amount: {
		totalAmount: 0,
		currency: "KRW",
	},
	settlementAmount: 0,
	taxableAmount: 0,
	tax: 0,
	taxDirectInput: false,
	settlementType: "UNSETTLEMENT",
	customerName: "",
	realPayment: {
		flag: false,
		customerName: "",
	},
	content: "",
	paymentCondition: "",
	paymentAccount: "",
	paymentExpectedDate: "",
	costCenter: "",
	debit: {
		account: "1",
		subAccount: "1-1",
	},
	workplaceCode: "",
	rowData: [
		{
			type: "대변",
			taxCode: "21",
			costCenter: "1000",
			accountName: "미지급금",
			projectName: "프로젝트1",
			debitAmount: 13200,
			creditAmount: 0,
			note: "적요1",
			proof: "증빙1",
		},
		{
			type: "차변",
			taxCode: "21",
			costCenter: "1000",
			accountName: "미지급금",
			projectName: "프로젝트1",
			debitAmount: 1200,
			creditAmount: 0,
			note: "적요1",
			proof: "증빙1",
		},
	],
}

export const calculateTotalAmount = (data: any, value: string): number => {
	return data.reduce((total: number, item: any) => total + item[value], 0)
}

export const columnDefs: GridOptions<IRowData>["columnDefs"] = [
	{
		headerName: "순번",
		type: "drag",
	},
	{
		field: "type",
		headerName: "유형",
		type: "default",
		cellEditor: "agSelectCellEditor",
		cellEditorParams: {
			values: ["대변", "차변"],
		},
	},
	{
		field: "taxCode",
		headerName: "세금코드",
		type: "default",
		cellEditor: "agSelectCellEditor",
		cellEditorParams: {
			values: ["21", "22", "23", "24", "25", "26", "27", "28", "29", "30"],
		},
	},
	{
		field: "costCenter",
		headerName: "코스트센터",
		type: "default",
	},
	{
		field: "accountName",
		headerName: "계정/비용항목명",
		type: "default",
	},
	{
		field: "projectName",
		headerName: "프로젝트명",
		type: "default",
	},
	{
		field: "debitAmount",
		headerName: "차변금액",
		type: ["default", "currency"],
	},
	{
		field: "creditAmount",
		headerName: "대변금액",
		type: ["default", "currency"],
	},
	{
		field: "note",
		headerName: "적요",
		type: "default",
	},
	{
		field: "proof",
		headerName: "선납 부가세 증빙",
		type: "default",
	},
]

export const gridOptions: GridOptions<any> = {
	suppressContextMenu: true, // 컬럼 오른쪽 메뉴 hidden
	groupDisplayType: "groupRows",
	groupRowRenderer: "agGroupCellRenderer",
	animateRows: true,
	rowDragManaged: true,
	rowSelection: {
		isRowSelectable: (params: any) => params.sourceRowIndex > 1,
		mode: "multiRow",
		checkboxes: false,
		headerCheckbox: false,
		enableSelectionWithoutKeys: true,
		enableClickSelection: true,
	},
	getRowStyle: (params: RowClassParams<any>) => {
		if (params.node.rowPinned) {
			return {
				fontWeight: 700,
				backgroundColor: "#FDFFEA",
			}
		}
	},
	columnTypes: {
		default: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-center-cell",
			suppressHeaderMenuButton: true,
			flex: 1,
			editable: true,
		},
		currency: {
			cellClass: "text-right bold",
			valueFormatter: (params: ValueFormatterParams) => {
				return (params.value = !!params.value
					? Number(params.value).toLocaleString()
					: params.value)
			},
		},
		drag: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-drag-cell",
			width: 70,
			suppressHeaderMenuButton: true,
			rowDrag: (params: any) => params.node.rowIndex > 1,
		},
		// action: {
		// 	headerClass: "ag-center-header bold",
		// 	cellClass: "ag-center-cell",
		// 	suppressHeaderMenuButton: true,
		// 	width: 90,
		// },
	},
}
