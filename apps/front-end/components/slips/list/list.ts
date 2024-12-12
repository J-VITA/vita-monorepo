import type { CheckboxOptionType } from "ant-design-vue"
import type { ValueFormatterParams, RowClassParams } from "@iwx/ui"
interface IDataType {
	group?: string
	costCenter: string // '코스트센터';
	slipNo: string // '전표번호';
	expenditureType: string // '지출유형';
	useDate: string // '사용일자';
	author: string // '작성자';
	user: string // '사용자';
	store: string // '가맹점(거래처)';
	totalAmount: number // '총금액';
	supplyValue: number // '공급가액';
	vat: number // '부가세';
	accountCostItem: string // '계정/비용과목';
	status: string // '상태';
	description: string // '내용';
	paymentDocumentNo: string // '결재문서번호';
	cardApprovalDate: string // '카드승인일시';
	cardApprovalNo: string // '카드승인번호';
	project: string // '프로젝트';
	projectCode: string // '프로젝트코드';
}
interface ISearchParams {
	startDate: string
	endDate: string
	workplaceCode: string
	costCenter: any
	accountCostItem: any
	user: string | undefined
	storeName: string
	expenditureType: (string | number)[]
	state: (string | number)[]
	size: number
	project: any[]
}

interface IOptions extends CheckboxOptionType {
	color: string
}

type Options = {
	[key in "expense" | "state"]: IOptions[]
}

function currencyFormatter(params: ValueFormatterParams) {
	if (params.value) {
		return (params.value = Number(params.value).toLocaleString())
	} else {
		return params.value
	}
}

export type DataType = Partial<IDataType>
export type SearchParams = Partial<ISearchParams>

export const options: Options = {
	expense: [
		{ label: "개인경비", value: "Expenses", color: "orange" },
		{ label: "법인카드", value: "Card", color: "blue" },
		{ label: "세금계산서", value: "Tax", color: "cyan" },
		{ label: "경조금", value: "Holyday", color: "purple" },
	],
	state: [
		{ label: "결재중", value: "Progress", color: "#6146e5" },
		{ label: "검인대기", value: "Sealing", color: "#6146e5" },
		{ label: "검인중", value: "Seal", color: "#6146e5" },
		{ label: "확정", value: "Confirm", color: "#32b96f" },
	],
}

export const columnTypes = {
	currency: {
		aggFunc: "sum",
		cellStyle: { textAlign: "right" },
		valueFormatter: currencyFormatter,
	},
}

export const getRowStyle = (params: RowClassParams) => {
	if (params.node.rowPinned) {
		return {
			fontWeight: 700,
			color: "#6146e5",
			backgroundColor: "#FDFFEA",
		}
	}
}

// API 연동 이후 삭제
export const getData: DataType[] = [
	{
		costCenter: "영업본부",
		slipNo: "2021-BD-00001",
		expenditureType: "Expenses",
		useDate: "2024-05-03",
		author: "김길동",
		user: "김길동",
		store: "다이소 마포점",
		totalAmount: 22000,
		supplyValue: 20000,
		vat: 2000,
		accountCostItem: "복리후생 > 식비",
		status: "Progress",
		description: "팀원과 점심식사",
		paymentDocumentNo: "AP-20240710-0002",
		cardApprovalDate: "2024-05-30",
		cardApprovalNo: "2334-4343-3233-3333",
		project: "해외사업 프로젝트",
		projectCode: "PROJECT-1",
	},
]
