import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	RequestParams,
	pageSize,
} from "@/types"

export interface ICardManagementListSearchParams {
	companyCode?: string
	issueDateFrom: string
	issueDateTo: string
	number: string
	name: string
	ownerId: string | number
	cardType: string
	cardStatus: string
	used: string
	filterDate: [Dayjs, Dayjs]
	ownerIds: (string | number)[]
}

export type CardManagementListSearch = ExSearchParams<
	RequestParams<ICardManagementListSearchParams>,
	"CardManagementList"
>

export const useCardManagementListSearch = (
	companyCode: string,
	ownerId: string | number
) => {
	const searchParams = ref(
		createSearchParams<
			RequestParams<ICardManagementListSearchParams>,
			"CardManagementList"
		>({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: false,
			sort: [],
			companyCode,
			number: "",
			name: "",
			ownerId,
			ownerIds: [ownerId],
			cardType: "",
			cardStatus: "",
			used: "",
			issueDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"),
			issueDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"),
			filterDate: [useMonth.from(), useMonth.to()],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<CardManagementListSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"CardManagementList">([
	{
		title: "카드별칭",
		dataIndex: "name",
		sorter: {
			multiple: 1,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "카드번호",
		dataIndex: "number",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ text }) => formatCardNumber(text),
	},
	{
		title: "카드구분",
		dataIndex: "cardTypeName",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "카드소유자",
		dataIndex: "ownerName",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "카드상태",
		dataIndex: "used",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "불출상태",
		dataIndex: "cardStatusName",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "카드사",
		dataIndex: "cardCompanyTypeName",
		sorter: {
			multiple: 7,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ record }) => record.cardCompanyTypeLabel,
	},
	{
		title: "발급일자",
		dataIndex: "issueDate",
		sorter: {
			multiple: 8,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "유효기간",
		dataIndex: "expirationYearMonth",
		sorter: {
			multiple: 9,
		},
		width: -1,
		align: "center",
		resizable: true,
	},
	{
		title: "한도금액(KRW)",
		dataIndex: "limitAmount",
		sorter: {
			multiple: 10,
		},
		width: -1,
		align: "right",
		resizable: true,
		customRender: ({ text }) => formatCurrency(text, "KRW"),
	},
])

export type CardManagementListColumns = ExTableColumns<"CardManagementList">
export const useCardManagementListColumns = () => {
	return ref<CardManagementListColumns>(columns)
}

export type CardManagementListTableData = {
	name: string // 카드명t
	number: string // 카드번호
	cardTypeName: string // 카드구분(SHARED, PERSONAL)
	cardTypeLabel: string // 카드구분명(공용, 개인)
	ownerId: number //카드소유자 - 임직원 식별자(FK)
	ownerName: string //카드소유자명
	used: boolean // 사용여부
	cardStatusName: string // 카드상태구분(ISSUE_READY, POSSIBILITY, ING, RETURN_READY, STOP)
	cardStatusLabel: string // 카드상태명(불출대기, 불출가능, 불출중, 반납대기, 사용중지)
	cardCompanyTypeName: string // 카드회사구분(BC, KB..)
	cardCompanyTypeLabel: string // 카드회사명(비씨, KB국민..)
	issueDate: string // 발급일자
	expirationYearMonth: string // 카드유효년월
	limitAmount: number //한도금액
}
