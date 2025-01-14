import { ExResponseData } from "./../../index"
import {
	ExSearchParams,
	pageSize,
	RequestParams,
	createSearchParams,
	createTableColumns,
	ExTableColumns,
} from "@/types"
import dayjs, { Dayjs } from "dayjs"

type StateType = {
	[key: string]: { color: string; text: string }
}

export const cardUseState: StateType = {
	UNPROCESSED: { color: "orange", text: "미처리" },
	IN_PROGRESS: { color: "blue", text: "처리중" },
	COMPLETED: { color: "#d5d5d5", text: "처리완료" },
	PERSONAL_EXPENSE_PROCESSED: { color: "#d5d5d5", text: "사적비용처리" },
}

export const CardUseStateType = {
	/** 미처리 */
	UNPROCESSED: "UNPROCESSED",
	/** 처리중 */
	IN_PROGRESS: "IN_PROGRESS",
	/** 처리완료 */
	COMPLETED: "COMPLETED",
	/** 사적비용처리 */
	PERSONAL_EXPENSE_PROCESSED: "PERSONAL_EXPENSE_PROCESSED",
}

/**
 * 카드사용 상태 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [UNPROCESSED: 미처리, IN_PROGRESS : 처리중, COMPLETED : 처리완료, PERSONAL_EXPENSE_PROCESSED: 사적비용처리]
 */
export type CardUseStateType = (typeof CardUseStateType)[keyof typeof CardUseStateType]

/**
 * 소유하고 있는 카드 정보
 */
export interface IMyCardResponseParams {
	id: number
	companyCode: string
	number: string
	cardCompanyTypeName: string
	cardCompanyTypeLabel: string
	name: string
	cardStatusName: string
	cardStatusLabel: string
	cardTypeName: string
	cardTypeLabel: string
	cardUseTypeName: string
	cardUseTypeLabel: string
	expirationYear: string
	expirationMonth: string
	collectionStartDate: string
	issueDate: string
	paymentDayName: string
	paymentDayLabel: string
	limitAmount: number
	bankTypeName: string
	bankTypeLabel: string
	accountNumber: string
	used: boolean
	ownerId: number
	userId: number
	vendorId: number
}

export type IMyCardResponse = ExResponseData<Array<IMyCardResponseParams>, "MyCard">

export const useMyCardResponse = () => {
	const responseData = ref<Array<IMyCardResponse> | []>([])

	const updateResponseData = (newData: Array<IMyCardResponse>) => {
		responseData.value = newData
	}

	const clearResponseData = () => {
		responseData.value = []
	}

	return {
		responseData,
		updateResponseData,
		clearResponseData,
	}
}

/**
 * 개인카드 사용내역
 */
export interface ICardHistoryResponseParams {
	id: number
	companyCode: string
	approvalDate: string
	approvalTime: string
	approvalDateTime: string
	purchaseDate: string
	purchaseTime: string
	cardUseStateTypeName: string
	cardUseStateTypeLabel: string
	merchantName: string
	merchantIndustryCode: string
	merchantIndustryName: string
	merchantBusinessNumber: string
	merchantAddress1: string
	merchantAddress2: string
	currencyTypeName: string
	currencyTypeLabel: string
	principalAmount: number
	vatAmount: number
	totalPrincipalInKrwAmount: number
	cardNumber: string
	approvalNumber: string
	purchaseFlag: boolean
	merchantTaxTypeInfo: string
}

export type ICardHistoryResponse = ExResponseData<
	Array<ICardHistoryResponseParams>,
	"CardHistory"
>

export const useCardHistoryResponse = () => {
	const responseData = ref<ICardHistoryResponse | []>([])

	const updateResponseData = (newData: ICardHistoryResponse) => {
		responseData.value = newData
	}

	const clearResponseData = () => {
		responseData.value = []
	}

	return {
		responseData,
		updateResponseData,
		clearResponseData,
	}
}

export interface ICardHistorySearchParams {
	companyCode?: string
	searchDateFrom?: string //시작일
	searchDateTo?: string //종료일
	cardUseStateType?: string //상태
	cardNumber?: number | string //카드정보
	ownerId?: number //카드소유자
	userId?: number //카드사용자
	vendorId?: number //거래처
	month?: "당월" | "전월"
	filterDate: [Dayjs, Dayjs]
}

export type CardHistorySearch = ExSearchParams<
	RequestParams<ICardHistorySearchParams>,
	"CardHistory"
>

/**
 * 개인카드 사용내역 불러오기 검색 파라미터 정의
 * @param
 * @returns
 */
export const useCardHistorySearch = () => {
	const searchParams = ref(
		createSearchParams<RequestParams<ICardHistorySearchParams>, "CardHistory">({
			companyCode: undefined,
			keyword: undefined,
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"),
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"),
			cardUseStateType: "",
			cardNumber: "",
			month: "당월",
			filterDate: [useMonth.from(), useMonth.to()],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<CardHistorySearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

/**
 * 카드내역 테이블 컬럼 정의
 */
export const cardHistoryColumns = createTableColumns<"CardHistory">([
	{
		title: "상태",
		dataIndex: "cardUseStateTypeName",
		resizable: true,
		sorter: false,
		width: 120,
		align: "center",
	},
	{
		title: "사용일",
		dataIndex: "approvalDate",
		resizable: true,
		sorter: {
			multiple: 2,
		},
		width: 120,
		align: "center",
		customRender(opt) {
			return `${dayjs(opt.value).format("YYYY-MM-DD")} ${dayjs(opt.record.approvalDateTime).format("HH:mm")}`
		},
	},
	{
		title: "매입일",
		dataIndex: "purchaseDate",
		resizable: true,
		sorter: {
			multiple: 3,
		},
		width: 120,
		align: "center",
		customRender(opt) {
			return `${dayjs(opt.value).format("YYYY-MM-DD")} ${dayjs(opt.record.purchaseTime).format("HH:mm")}`
		},
	},
	{
		title: "상호/가맹점",
		dataIndex: "merchantName",
		resizable: true,
		sorter: {
			multiple: 4,
		},
		width: 150,
		align: "left",
	},
	{
		title: "업종",
		dataIndex: "merchantIndustryName",
		resizable: true,
		sorter: {
			multiple: 5,
		},
		width: 110,
		align: "center",
	},
	{
		title: "주소",
		dataIndex: "merchantAddress",
		resizable: true,
		sorter: false,
		width: 280,
		align: "left",
	},
	{
		title: "통화",
		dataIndex: "currencyTypeName",
		resizable: true,
		sorter: false,
		width: 100,
		align: "center",
	},
	{
		title: "매입금액",
		dataIndex: "totalPrincipalInKrwAmount",
		resizable: true,
		sorter: {
			multiple: 8,
		},
		width: 160,
		align: "right",
		customRender(opt) {
			return formatCurrency(opt.value, opt.record.currencyTypeName)
		},
	},
	{
		title: "공급가액",
		dataIndex: "supplyAmount",
		resizable: true,
		sorter: {
			multiple: 9,
		},
		width: 160,
		align: "right",
		customRender(opt) {
			return formatCurrency(opt.value, opt.record.currencyTypeName)
		},
	},
	{
		title: "부가세",
		dataIndex: "vatAmount",
		resizable: true,
		sorter: {
			multiple: 9,
		},
		width: 160,
		align: "right",
		customRender(opt) {
			return formatCurrency(opt.value, opt.record.currencyTypeName)
		},
	},
	{
		title: "봉사료",
		dataIndex: "tipAmount",
		resizable: true,
		sorter: {
			multiple: 9,
		},
		width: 160,
		align: "right",
		customRender(opt) {
			return formatCurrency(opt.value, opt.record.currencyTypeName)
		},
	},
	{
		title: "과세유형",
		dataIndex: "merchantTaxTypeInfo",
		resizable: true,
		sorter: {
			multiple: 10,
		},
		width: 110,
		align: "center",
	},
	{
		title: "카드번호",
		dataIndex: "cardNumber",
		resizable: true,
		sorter: {
			multiple: 11,
		},
		width: 200,
		align: "center",
		customRender({ text }) {
			return formatCardNumber(text)
		},
	},
	{
		title: "승인번호",
		dataIndex: "approvalNumber",
		resizable: true,
		sorter: {
			multiple: 12,
		},
		width: 200,
		align: "center",
	},
])

export type CardHistoryColumns = ExTableColumns<"CardHistory">
export const useCardHistoryColumns = () => {
	return ref<CardHistoryColumns>(cardHistoryColumns)
}

export const validateCardUsageItems = (
	items: ICardHistoryResponseParams[],
	types: CardUseStateType[]
): void => {
	if (!items || _isEmpty(items)) {
		throw new Error(`법인카드 사용내역을 선택해주세요.`)
	}

	if (_isEmpty(items.map((item) => item.id))) {
		throw new Error(`유효한 법인카드 사용내역을 선택해주세요.`)
	}

	if (!_isArray(items.map((item) => item.id))) {
		throw new Error("유효하지 않은 입력 형식입니다.")
	}

	if (
		!_every(
			items.map((item) => item.id),
			(id) => Number.isInteger(id) && id > 0
		)
	) {
		throw new Error("유효하지 않은 대상이 포함되어 있습니다.")
	}

	const invalidItems = items.filter(
		(item) => !types.includes(item.cardUseStateTypeName as CardUseStateType)
	)

	if (invalidItems.length > 0) {
		const validStates = types
			.map((type) => {
				switch (type) {
					case "UNPROCESSED":
						return "미처리"
					case "IN_PROGRESS":
						return "처리중"
					case "COMPLETED":
						return "처리완료"
					case "PERSONAL_EXPENSE_PROCESSED":
						return "사적비용처리"
					default:
						return type // 타입 안전성을 위해
				}
			})
			.join(", ")
		throw new Error(`${validStates} 상태가 아닌 항목이 포함되어 있습니다.`)
	}
}
