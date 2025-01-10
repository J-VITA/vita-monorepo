import dayjs, { Dayjs } from "dayjs"
import { TablePaginationConfig, UploadFile } from "ant-design-vue"
import type { ColumnsType } from "ant-design-vue/lib/table/interface"

declare global {
	export interface Window {
		daum: any
		getServerSideDatasource: any
	}
}

export const dateTimeFormat = "YYYY-MM-DDTHH:mm:ss.SSS"

export class EaccError extends Error {
	status: string | number

	constructor(message: string, status: string | number) {
		super(message)
		this.name = "eAccountingError"
		this.status = status
		Object.setPrototypeOf(this, EaccError.prototype)
	}
}

export enum HttpMethods {
	CONNECT = "CONNECT",
	DELETE = "DELETE",
	GET = "GET",
	HEAD = "HEAD",
	OPTIONS = "OPTIONS",
	PATCH = "PATCH",
	POST = "POST",
	PUT = "PUT",
	TRACE = "TRACE",
}

export enum OsType {
	WEB = "WEB",
	MOBILE = "MOBILE",
}

export const E_MONTH = {
	THAT_MONTH: dayjs().month() + 1,
	NEXT_MONTH: dayjs().add(1, "month").month() + 1,
}
// E_MONTH 객체의 값 타입 정의
export type E_MONTH = (typeof E_MONTH)[keyof typeof E_MONTH]
// E_MONTH 객체의 키 타입 정의
export type E_MONTH_KEYS = keyof typeof E_MONTH

export const E_DAYS = {
	ONE: 1,
	TWO: 2,
	THREE: 3,
	FOUR: 4,
	FIVE: 5,
	SIX: 6,
	SEVEN: 7,
	EIGHT: 8,
	NINE: 9,
	TEN: 10,
	ELEVEN: 11,
	TWELVE: 12,
	THIRTEEN: 13,
	FOURTEEN: 14,
	FIFTEEN: 15,
	SIXTEEN: 16,
	SEVENTTEEN: 17,
	EIGHTEEN: 18,
	NINETEEN: 19,
	TWENTY: 20,
	TWENTY_ONE: 21,
	TWENTY_TWO: 22,
	TWENTY_THREE: 23,
	TWENTY_FOUR: 24,
	TWENTY_FIVE: 25,
	TWENTY_SIX: 26,
	TWENTY_SEVEN: 27,
	TWENTY_EIGHT: 28,
	LAST: dayjs().endOf("month").date(),
}

// E_DAYS 객체의 값 타입 정의
export type E_DAYS = (typeof E_DAYS)[keyof typeof E_DAYS]
// E_DAYS 객체의 키 타입 정의
export type E_DAYS_KEYS = keyof typeof E_DAYS

export const SlipFormType = {
	/** 지출결의서(통합) */
	DISBURSEMENT_FORM: "DISBURSEMENT_FORM",
	/** 개인경비신청서 */
	PERSONAL_EXPENSE_FORM: "PERSONAL_EXPENSE_FORM",
	/** 법인카드사용내역서 */
	CARD_FORM: "CARD_FORM",
	/** 세금계산서 작성내역서 */
	TAX_INVOICE: "TAX_INVOICE",
	/**  출장경비 신청서 */
	BUSINESS_TRIP: "BUSINESS_TRIP",
	/** 예산 신청서 */
	BUDGET: "BUDGET",
	/**  경조금 신청서 */
	FAMILY_EVENT: "FAMILY_EVENT",
	/** 법인카드 불출 신청서 */
	CARD_ISSUE: "CARD_ISSUE",
	/** ERP전표 결재 요청서 */
	ERP_SLIP: "ERP_SLIP",
}

/**
 * 전표 폼 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [DISBURSEMENT_FORM: 지출결의서(통합), PERSONAL_EXPENSE_FORM : 개인경비신청서, CARD_FORM : 법인카드사용내역서]
 */
export type SlipFormType = (typeof SlipFormType)[keyof typeof SlipFormType]

export const SlipType = {
	/** 개인경비 */
	PERSONAL_EXPENSE: "PERSONAL_EXPENSE",
	/** 분할 개인경비 */
	DIVISION_PERSONAL_EXPENSE: "DIVISION_PERSONAL_EXPENSE",
	/** 법인카드사용내역서 */
	CARD: "CARD",
	/** 전자세금계산서 */
	E_TAX_INVOICE: "E_TAX_INVOICE",
	/** 수기세금계산서 */
	TAX_INVOICE: "TAX_INVOICE",
}

/**
 * 전표 폼 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [PERSONAL_EXPENSE: 개인경비, DIVISION_PERSONAL_EXPENSE : 분할 개인경비, CARD : 법인카드사용내역서, E_TAX_INVOICE : 전자세금계산서, TAX_INVOICE : 수기세금계산서]
 */
export type SlipType = (typeof SlipType)[keyof typeof SlipType]

/**
 * Table 공통 page options
 */
export const pageSizeOptions = [
	{ key: 10, value: 10, label: "10 건" },
	{ key: 15, value: 15, label: "15 건" },
	{ key: 20, value: 20, label: "20 건" },
	{ key: 30, value: 30, label: "30 건" },
	{ key: 50, value: 50, label: "50 건" },
	{ key: 100, value: 100, label: "100 건" },
]
export const pageSize: number = 15

export const pagination: TablePaginationConfig = {
	pageSizeOptions: pageSizeOptions.map((x) => x.value),
	showTotal: (total: any) => `총 ${total} 건`,
	showLessItems: false,
	showSizeChanger: false,
	showQuickJumper: false,
	locale: { items_per_page: "건" },
	position: ["bottomRight"],
	hideOnSinglePage: false,
}

export interface SortTypes {
	descend: string
	ascend: string
	[key: string]: string // Add this line
}

export const SortType: SortTypes = {
	descend: "desc",
	ascend: "asc",
}

// 기본 RequestParams 타입 정의
type BaseRequestParams = {
	keyword?: string | unknown
	pageNumber: number
	size: number
	first: boolean
	last: boolean
	sort?: Array<any>
}

export const AccountInputMethodTypes = {
	/** 계정항목 > 비용항목 */
	ACCOUNT_SUB_ACCOUNT: "ACCOUNT_SUB_ACCOUNT",
	/** 비용항목 > 계정항목 */
	SUB_ACCOUNT_ACCOUNT: "SUB_ACCOUNT_ACCOUNT",
	/** 비용항목 */
	SUB_ACCOUNT: "SUB_ACCOUNT",
}

// export type GenericParams<K extends keyof any, T> = {
//   [key in K]: T;
// };

// RequestParams 타입 정의
export type RequestParams<T extends Record<string, any>> = BaseRequestParams & T

export interface ResponseData<T> {
	data: T | undefined
	status: number
	message: string
	totalElements: number
	totalPages: number
	pageNumber: number
	size: number
	first: boolean
	last: boolean
}

export interface Author {
	companyCode: string
	id: string
	role: string
	member: User
}

export enum MemberStatusCode {
	PENDING,
	ACTIVE,
	INACTIVE,
	SUSPENDED,
	LEFT,
}

export enum MemberStatusLabel {
	PENDING = "승인대기",
	ACTIVE = "활성",
	INACTIVE = "비활성",
	SUSPENDED = "일시정지",
	LEFT = "탈퇴",
}

export interface UserPayload {
	category: string
	loginId: string
	roleId: number
	role: "USER" | "ADMIN" | ""
	employeeId: number
	userId: number
	name: string
	companyId: number
	companyCode: string
	companyName: string
	costCenterId: number
	costCenterName: string
	workplaceId: number
	workplaceCode: string
	departmentId: number
	departmentName: string
	jobTitleId: number
	jobTitleName: string
	positionId: number
	positionName: string
	email: string
	isLeader: boolean
	iat: number
	exp: number
}

export interface Apps {
	os: string
	loading: boolean
	id: string
	isTemporal: boolean
	access_token: string
	refresh_token: string
}

export interface Meta {
	layout: string
	name: string
}
export interface BreadCrumb {
	path: string
	redirect: string
	name: string
	meta: Meta
	components: any
}

type EaccFileProps = {
	id?: number
	companyCode: string
	name?: string
	fileType: "SLIP" | "RECEIPT" | "APPROVAL" | "BOARD"
	documentedNumber?: string
	description?: string
	seq?: number
}

export type EaccFileType = Partial<Brand<`EaccFileTypeBrand`, EaccFileProps>>
export interface EaccUploadFile<T> extends UploadFile {
	id?: number
	companyCode?: string
	fileTypeName?: string
	fileTypeLabel?: string
	path?: string
	documentNumber?: string
	description?: string
	seq?: number
	originalName?: string
	downloadUrl?: string
	fileKind?: string
	thumbnailName?: string
	thumbnailUrl?: string
	thumbnailPath?: string
	response?: T
	xhr?: T
}

export interface Pageable<T> {
	page: number
	size: number
	sort: Array<T>
}
export interface Search {
	companyCode: string
	searchYearMonthFrom: string
	searchYearMonthTo: string
	pageable: Pageable<any>
}

export interface Code {
	id: string | number
	code: string
	label: string
	value: string | number
	used: boolean
	name: string
}

export interface KeyLabel {
	key: string | number
	label: string
}
export interface IAddr {
	postcode: string
	postcode1: string
	postcode2: string
	postcodeSeq: string
	zonecode: string
	address: string
	addressEnglish: string
	addressType: string
	bcode: string
	bname: string
	bnameEnglish: string
	bname1: string
	bname1English: string
	bname2: string
	bname2English: string
	sido: string
	sidoEnglish: string
	sigungu: string
	sigunguEnglish: string
	sigunguCode: string
	userLanguageType: string
	query: string
	buildingName: string
	buildingCode: string
	apartment: string
	jibunAddress: string
	jibunAddressEnglish: string
	roadAddress: string
	roadAddressEnglish: string
	autoRoadAddress: string
	autoRoadAddressEnglish: string
	autoJibunAddress: string
	autoJibunAddressEnglish: string
	userSelectedType: string
	noSelected: string
	hname: string
	roadnameCode: string
	roadname: string
	roadnameEnglish: string
}

/**
 * (UI) 검색 필터의 데이터 폼 인터페이스 정의
 */
type Children = {
	label?: string
	value?: string
}

type SelectField = {
	label?: string
	value?: string
	children?: Children
}

type FormType = {
	type:
		| "radio"
		| "checkbox"
		| "multi-checkbox"
		| "switch"
		| "select"
		| "search"
		| "auto"
		| "email"
		| "amount"
		| "single-table"
		| "multi-table"
		| "date-picker"
		| "range-picker"
		| "tree"
	options?: Array<any | unknown> | undefined
	placeholder?: string
	fieldName?: SelectField
	columns?: any
	indeterminate?: boolean
	checkAll?: boolean
	checkedList?: []
	mode?: "multiple" | "tags" | undefined
}

export type IFormBrand<K, T> = Omit<K & { __brand: T }, "IFormBrand">
export type IFormType = IFormBrand<FormType, "IFromType">

export interface FormData {
	name: string
	label: string
	value: any
	defaultValue: any
	disabled?: boolean
	rules?: Array<any>
	typeInfo?: IFormType
	url?: string
	refresh?: boolean
	picker?: Exclude<
		"time" | "date" | "week" | "month" | "quarter" | "year" | "decade",
		"datetime" | "decade" | "input"
	>
	disabledDate?: (date: Dayjs) => boolean
	description?: string
	divider?: boolean
}

export type User = Partial<UserPayload> &
	Pick<
		UserPayload,
		| "loginId"
		| "category"
		| "email"
		| "companyId"
		| "companyCode"
		| "costCenterId"
		| "employeeId"
		| "userId"
		| "roleId"
		| "role"
		| "name"
		| "positionName"
		| "workplaceId"
		| "workplaceCode"
		| "departmentId"
		| "departmentName"
		| "jobTitleId"
	>

export type AppsType = Pick<Apps, "id" | "access_token">

export type BreadCrumbType = Omit<BreadCrumb, "redirect" | "components">

// export type MenusType = Omit<Menus, "Menus">;

export type Response<T> = ResponseData<T>

export type SearchParams = Omit<Search, "pageable">

export type CommonCode = Pick<Code, "code"> & Partial<Code>

export type IFormData = Pick<FormData, "name" | "label"> & Partial<FormData>

export type Brand<K, T> = T & { __brand: K }

/**
 * 화면 파라미터를 위한 브랜드 타입
 */
export type ExViewParams<T, B extends string> = Brand<`ExView${B}`, T>

/**
 * 검색 파라미터를 위한 브랜드 타입
 */
export type ExSearchParams<T, B extends string> = Brand<`ExSearch${B}`, T>

/**
 * 응답을 위한 브랜드 타입
 */
export type ExResponseData<T, B extends string> = Brand<`ExResponse${B}`, T>

/**
 * ant design 테이블 컬럼을 위한 브랜드 타입
 */
export type ExTableColumns<B extends string> = Brand<`ExColumns${B}`, ColumnsType<any>>

/**
 * 화면 파라미터 생성 함수
 */
export const createViewParams = <T, B extends string>(params: T): ExViewParams<T, B> =>
	params as ExViewParams<T, B>

/**
 * 검색 파라미터 생성 함수
 */
export const createSearchParams = <T, B extends string>(
	params: T
): ExSearchParams<T, B> => params as ExSearchParams<T, B>

/**
 * 응답 데이터 생성 함수
 */
export const createResponseData = <T, B extends string>(data: T): ExResponseData<T, B> =>
	data as ExResponseData<T, B>

/**
 * ant design table 컬럼 생성 함수
 */
export const createTableColumns = <B extends string>(
	columns: ColumnsType<any>
): ExTableColumns<B> => columns as ExTableColumns<B>

/**
 * 파라미터를 위한 유틸리티 타입
 */
export type AgGridParams<T, B extends string> = {
	searchParams: ExSearchParams<T, B>
	responseData: ExResponseData<T, B>
}

/**
 * 정렬 파라미터를 생성하는 공통 함수
 * @param sorter - 정렬 정보 (배열, 객체, 또는 undefined)
 * @returns 정렬 파라미터 배열 또는 undefined
 */
export const generateSortParams = (sorter: any): string[] | undefined => {
	if (Array.isArray(sorter)) {
		// 배열인 경우
		return sorter
			.map((x) => {
				if (x.field && x.order) {
					const sortOrder = x.order as keyof SortTypes
					return sortOrder ? `${x.field},${SortType[sortOrder]}` : undefined
				}
				return undefined
			})
			.filter(Boolean) as string[] // undefined 값 제거
	} else if (typeof sorter === "object" && sorter !== null) {
		// 객체인 경우
		const { field, order } = sorter as {
			field?: string
			order?: keyof SortTypes
		}
		if (field && order) {
			return [`${field},${SortType[order]}`]
		}
	}
	// 그 외의 경우 (정렬 없음)
	return undefined
}
