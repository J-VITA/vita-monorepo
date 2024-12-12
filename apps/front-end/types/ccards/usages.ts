import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	RequestParams,
	pageSize,
} from "@/types"

interface ICardUsageListSearchParams {
	companyCode: string
	approvalDateFrom: string
	approvalDateTo: string
	cardNumber?: string
	cardType?: string
	cardUseStateType?: string
	cardOwnerId?: string | number
	cardOwnerIds?: (string | number)[]
	filterDate?: [Dayjs, Dayjs]
}

export type CardUsageListSearch = ExSearchParams<
	RequestParams<ICardUsageListSearchParams>,
	"CardUsageList"
>

export const useCardUsageListSearch = async (
	companyCode: string,
	getEmployeeId: string | number
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<ICardUsageListSearchParams>, "CardUsageList">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: false,
			sort: [],
			companyCode,
			cardOwnerId: getEmployeeId,
			cardOwnerIds: [getEmployeeId],
			approvalDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"),
			approvalDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"),
			filterDate: [useMonth.from(), useMonth.to()],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<CardUsageListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"CardUsageList">([
	{
		title: "카드번호",
		dataIndex: "cardNumber",
		sorter: {
			multiple: 1,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ text }) => formatCardNumber(text),
	},
	{
		title: "카드별칭",
		dataIndex: "cardName",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "사용일",
		dataIndex: "approvalDate",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
		customRender: ({ text, record }) => `${text} ${record.approvalTime}`,
	},
	{
		title: "카드소유자",
		dataIndex: "cardOwner",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "카드구분",
		dataIndex: "cardTypeName",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "카드사",
		dataIndex: "cardCompanyTypeName",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ record }) => record.cardCompanyTypeLabel,
	},
	{
		title: "상태",
		dataIndex: "cardUseStateTypeName",
		sorter: {
			multiple: 7,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ record }) => record.cardUseStateTypeLabel,
	},
	{
		title: "사용금액",
		dataIndex: "principalAmount",
		sorter: {
			multiple: 8,
		},
		width: -1,
		align: "right",
		customRender: ({ text }) => (text ? text.toLocaleString() : 0),
		// customRender: ({ text, record }) =>
		//   formatCurrency(text, record.currencyTypeName),
	},
	// supplyAmount
	{
		title: "공급가액",
		dataIndex: "supplyAmount",
		sorter: {
			multiple: 9,
		},
		width: -1,
		align: "right",
		customRender: ({ text }) => (text ? text.toLocaleString() : 0),
	},
	{
		title: "부가세",
		dataIndex: "vatAmount",
		sorter: {
			multiple: 10,
		},
		width: -1,
		align: "right",
		customRender: ({ text }) => (text ? text.toLocaleString() : 0),
	},
	{
		title: "봉사료",
		dataIndex: "tipAmount",
		sorter: {
			multiple: 11,
		},
		width: -1,
		align: "right",
		customRender: ({ text }) => (text ? text.toLocaleString() : 0),
	},
	{
		title: "가맹점명",
		dataIndex: "merchantName",
		sorter: {
			multiple: 12,
		},
		width: -1,
	},
	{
		title: "가맹점주소",
		dataIndex: "merchantAddress",
		width: -1,
		customRender: ({ record }) => `${record.merchantAddress1} ${record.merchantAddress2}`,
	},
	{
		title: "회사",
		dataIndex: "companyName",
		sorter: {
			multiple: 13,
		},
		width: -1,
	},
	{
		title: "코스트센터",
		dataIndex: "costCenterName",
		sorter: {
			multiple: 14,
		},
		width: -1,
	},
	{
		title: "승인번호",
		dataIndex: "approvalNumber",
		sorter: {
			multiple: 15,
		},
		width: -1,
	},
	{
		title: "매입구분",
		dataIndex: "purchaseFlag",
		sorter: {
			multiple: 16,
		},
		width: -1,
		align: "center",
		customRender: ({ text }) => text || "-",
	},
	{
		title: "업종",
		dataIndex: "merchantIndustryName",
		sorter: {
			multiple: 17,
		},
		width: -1,
	},
	{
		title: "과세",
		dataIndex: "merchantTaxTypeInfo",
		sorter: {
			multiple: 18,
		},
		width: -1,
	},
])

export type CardUsageListColumns = ExTableColumns<"CardUsageList">
export const useCardUsageListColumns = () => {
	return ref<CardUsageListColumns>(columns)
}

export type CardUsageItem = {
	id: string
	cardNumber: string // 카드번호
	cardName: string // 카드명
	approvalDate: string // 승인일자
	approvalTime: string // 승인시각
	cardOwner: string // 카드소유자
	cardTypeName: string // 카드구분(SHARED, PERSONAL)
	cardTypeLabel: string // 카드구분명(공용, 개인)
	cardCompanyTypeName: string // 카드회사구분(BC, KB..)
	cardCompanyTypeLabel: string // 카드회사명(비씨, KB국민..)
	cardUseStateTypeName: string // 카드사용상태구분 (UNPROCESSED, IN_PROGRESS, COMPLETED, PERSONAL_EXPENSE_PROCESSED)
	cardUseStateTypeLabel: string // 카드사용상태명 (미처리, 처리중, 처리완료, 사적비용처리)
	currencyTypeName: string // 통화유형구분 (KRW, CHF, USD)
	currencyTypeLabel: string // 통화유형명 (한국, 스위스, 미국)
	principalAmount: number // 매입/취소 원금
	supplyAmount: number // 공급가액
	vatAmount: number // 부가세
	tipAmount: number // 봉사료
	merchantName: string // 가맹점명
	merchantAddress1: string // 가맹점 주소1
	merchantAddress2: string // 가맹점 주소2
	merchantBusinessNumber: string // 가맹점 사업자번호
	companyName: string // 회사구분명
	costCenterName: string // 코스트센터명
	approvalNumber: string // 승인번호
	purchaseFlag: boolean // 매입여부
	merchantIndustryName: string // 가맹점 업종명
	merchantTaxTypeInfo: string // 가맹점 과세유형정보
}

export type UsePrivate = {
	type: "release" | "process" | ""
	companyCode: string
	cardUsageIds: Array<{ id: number }>
}
