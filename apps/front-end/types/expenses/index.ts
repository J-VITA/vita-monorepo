import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import type { UploadProps, UploadFile } from "ant-design-vue"

export interface IUploadFile<T> extends Omit<UploadFile<T>, "uid"> {
	id?: number
	companyCode: string
	fileType?: string
	documentedNumber?: string
	documentNumber?: string
	description?: string
	seq?: number
	downloadUrl?: string
	thumbnailUrl?: string
	uid?: string | number // UploadFile의 uid 타입을 유지
	url?: string
	thumbUrl?: string
}
// export interface IUploadFile extends UploadFile {
//   id?: number;
//   companyCode: string;
//   // name?: string;
//   fileType?: string;
//   documentedNumber?: string;
//   documentNumber?: string;
//   description?: string;
//   seq?: number;
//   downloadUrl?: string;
//   thumbnailUrl?: string;
// }
interface ISearchParams {
	companyCode: string
	searchDateFrom: string //시작일
	searchDateTo: string //종료일
	slipType: string
	slipStatus: string
	accountId: number | string //계정과목식별자
	accountName: string //계정과목명
	projectId: number | string //프로젝트 식별자
	projectName: string //프로젝트명
	costCenterId: number | string //코스트센터 식별자
	costCenterName: string //코스트센터명
	amountFrom: number | string //시작금액
	amountTo: number | string //종료금액
	employeeId: number | string //사용자 식별자
	month: "당월"
}
export type Search = Partial<ISearchParams>

export const ExpensesCodeType = {
	/** 전표유형 */
	SLIP_TYPES: "SLIP_TYPES",
	/** 전표상태 */
	SLIP_STATUSES: "SLIP_STATUSES",
	/** 신청유형 */
	SLIP_REQUEST_TYPES: "SLIP_REQUEST_TYPES",
	/** 증빙유형 */
	SLIP_EVIDENCE_TYPES: "SLIP_EVIDENCE_TYPES",
	/** 정산유형 */
	SLIP_CALCULATION_TYPES: "SLIP_CALCULATION_TYPES",
	/** 기기유형 */
	OS_TYPE: "OS_TYPE",
	/** 통화유형 */
	CURRENCY_TYPES: "CURRENCY_TYPES",
	/** 국가유형 */
	COUNTRY_TYPES: "COUNTRY_TYPES",
	/** 은행유형 */
	BANK_TYPES: "BANK_TYPES",
}

/**
 * 전표 유형 및 상태 코드 호출 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string}
 */
export type ExpensesCodeType = (typeof ExpensesCodeType)[keyof typeof ExpensesCodeType]

export const SlipStateType = {
	/** 미처리 */
	UNPROCESSED: "UNPROCESSED",
	/** 작성완료 */
	COMPLETE: "COMPLETE",
	/** 작성완료(임시저장) */
	COMPLETE_TEMP_BOX: "COMPLETE_TEMP_BOX",
	/** 결재반려 */
	APPROVAL_RETURN: "APPROVAL_RETURN",
	/** 결재중 */
	APPROVAL_ING: "APPROVAL_ING",
	/** 검인대기 */
	SEAL_STANDBY: "SEAL_STANDBY",
	/** 검인반려 */
	SEAL_RETURN: "SEAL_RETURN",
	/** 검인반려 */
	SEAL_ING: "SEAL_ING",
	/** 확정 */
	CONFIRM: "CONFIRM",
	/** 역분개 */
	REVERSE: "REVERSE",
}

export const SlipTaxType = {
	/** 공제 */
	DEDUCTION: "DEDUCTION",
	/** 불공제 */
	NON_DEDUCTION: "NON_DEDUCTION",
	/** 면세 */
	TAX_EXEMPTION: "TAX_EXEMPTION",
	/** 무관 */
	NONE: "NONE",
}

export const SlipDivisionType = {
	/** 법인카드 */
	CARD: "CARD",
	/** 법인카드(분할) */
	CARD_DIVISION: "CARD_DIVISION",
	/** 개인경비 */
	PERSONAL: "PERSONAL",
	/** 개인경비(분할) */
	PERSONAL_DIVISION: "PERSONAL_DIVISION",
}

export const SlipOilType = {
	GASOLINE: "GASOLINE",
	DIESEL: "DIESEL",
	LPG: "LPG",
	Electric: "Electric",
}

/**
 * 전표 상태 코드 호출 타입
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string}
 */
export type SlipStateType = (typeof SlipStateType)[keyof typeof SlipStateType]

/**
 * 세금 공제, 불공제 코드 호출 타입
 */
export type SlipTaxType = (typeof SlipTaxType)[keyof typeof SlipTaxType]

/**
 * 증빙 유형 호출 타입
 */
export type SlipDivisionType = (typeof SlipDivisionType)[keyof typeof SlipDivisionType]

type ClassificationType = {
	[key: string]: { color: string; text: string }
}
type StateType = {
	[key: string]: { color: string; text: string }
}

export const classifications: ClassificationType = {
	PERSONAL: { color: "orange", text: "개인경비" },
	PERSONAL_DIVISION: { color: "orange", text: "개인경비분할" },
	CARD: { color: "blue", text: "법인카드" },
	E_TAX: { color: "cyan", text: "전자세금계산서" },
	HAND_TAX: { color: "purple", text: "수기세금계산서" },
	// TAX_INVOICE: { color: "blue", text: "수기세금계산서" },
	ADVANCE: { color: "purple", text: "선급금" },
}

export const states: StateType = {
	UNPROCESSED: { color: "orange", text: "미처리" },
	COMPLETE: { color: "#d5d5d5", text: "작성완료" },
	COMPLETE_TEMP_BOX: { color: "#d5d5d5", text: "임시저장" }, //작성완료()
	APPROVAL_RETURN: { color: "orange", text: "결재반려" },
	APPROVAL_ING: { color: "blue", text: "결재중" },
	SEAL_STANDBY: { color: "green", text: "검인대기" },
	SEAL_RETURN: { color: "purple", text: "검인반려" },
	SEAL_ING: { color: "purple", text: "검인중" },
	CONFIRM: { color: "green", text: "확정" },
	REVERSE: { color: "purple", text: "역분개" },
}

export const dateFormat = "YYYY-MM-DD"
export const monthFormat = "YYYY-MM"

export enum FormType {
	TEXT = "TEXT",
	DATE = "DATE",
	CODE = "CODE",
}
export enum AlignmentType {
	LEFT,
	RIGHT,
	CENTER,
}

export interface WriterInfo {
	id: number
	companyCode: string
	workplaceCode: string
	costCenterId: number
	accountId: number
}

export interface UpdatedWriterInfo {
	employee: number[]
	employeeId: number
	workplaceCode: string
	costCenterId: number
	accountId?: number
}

export interface ManagementItemType {
	id: number
	companyCode: string
	managementItemFieldName: string
	managementItemFieldLabel: string
	disabled: boolean
	required: boolean
	managementItemName: string
	managementItemTypeName: FormType
	managementItemTypeLabel: string
	commonCode: string
	orderSequence: number
	alignmentDirectionTypeName?: AlignmentType | undefined
	alignmentDirectionTypeLabel?: string | undefined
	accountId: number
	value: string
}

export interface Place {
	place_name: string
	road_address_name?: string
	address_name: string
	phone?: string
	x: string
	y: string
}

interface StopOver {
	orderSeq: number
	location: string
	fuelSlipHeaderId?: number
}

export type OilExpensesFormData = {
	id?: string
	accountingDate?: Dayjs | string
	evidenceDate?: Dayjs | string
	paymentDueDate?: Dayjs | string
	companyCode?: string
	employeeId?: number
	employeeIds?: number[]
	workplaceCode?: string
	costCenterId?: number
	writer?: number[]
	accruedAccountId?: string
	perdiemName?: string
	perdiemPath?: string
	departure?: string
	stopover?: StopOver[]
	destination?: string
	roundTripFlag?: boolean
	distance?: number
	fuelType?: string
	costStandard?: string
	cost?: number
	description?: string
	accountId?: number
	projectId?: number
	slipFileIds?: number[]
	relatedDocumentIds?: number[]
	oilPrice?: number
	oilMileage?: number
	personalPathName?: string
}

export type OrderedMap = {
	iSlipNumber: string //I/F 전표번호
	iSlipTypeCode: string //I/F 전표유형코드
	iPaymentDate: string //I/F 지급일자
	iDescription: string //I/F 설명
	iReverseSlipNumber: string //I/F 역분개 전표번호
	iReverseSlipDate: string //I/F 역분개 전표일자
	iReverseCode: string //I/F 역분개 코드
	iReverseDescription: string //I/F 역분개 사유
	iAdvanceSlipNumber: string //I/F 선급금 전표번호
	iAdvanceSlipDate: string //I/F 선급금 전표일자'
	piCode: string //I/F id
	piStatus: string //I/F 상태
	piDate: string //I/F 일자
	piTime: string //I/F 시간
	piUser: string //I/F 유저
	piMessage: string //전송메시지
	piMessageId: string //전송메시지id
}

export type SlipDetails = {
	id?: number //식별자
	companyCode?: string //회사구분코드
	slipNumber?: string //전표번호
	divisionSeq?: number //분할순번
	seq?: number //순번
	slipLineType?: string //전표라인유형구분(ITEM, TAX)
	slipLineTypeLabel?: string //전표라인유형구분코드명(항목, 세금)
	slipLineTypeName?: string //전표라인유형구분코드(ITEM, TAX)
	debitCreditType?: string //차대변유형구분(DEBIT, CREDIT)
	debitCreditTypeLabel?: string //코드명(차변, 대변)
	debitCreditTypeName?: string //코드(DEBIT, CREDIT)
	taxType?: string //세금코드
	budgetDepartmentCode?: string //예산부서코드
	totalAmount?: number //금액
	supplyAmount?: number //과세표준금액
	taxAmount?: number //부가세액
	krwTotalAmount?: number //현지금액
	krwSupplyAmount?: number //현지과세표준금액
	krwTaxAmount?: number //현지부가세액
	description?: string //디테일 설명
	reference?: { [key: string]: string } //참조정보
	slipHeaderId?: string | number | undefined //전표헤더 식별자
	accountIds?: (string | number)[]
	accountId?: string | number | undefined //계정과목 식별자
	costCenterId?: number | undefined //코스트센터 식별자
	projectId?: number //프로젝트 식별자
	projectIds?: [number] //프로젝트 식별자(화면용)
	workplaceId?: number //사업장 식별자(임시)
	workplaceCode?: string | number //사업장코드
	isDirectModify?: boolean // (화면) 직접수정
	employeeId: number | undefined //작성자 - 직원 식별자
	employee: Array<number> //작성자 - 직원 식별자(ui select-table type 객체)
	accountChangeCnt?: number // 자동 공제를 위한 카운트 변수
	managementItems: ManagementItemType[] | []
	employeeName?: string //참석자 상세보기(read only)
	taxName?: string //과세유형명 상세보기(read only)
	costCenterName?: string //코스트센터 상세보기(read only)
	account?: {
		id?: number
		name?: string
		parentId?: number
		parentName?: string
	} //계정항목 상세보기(read only)
	projectName?: string //프로젝트 상세보기(read only)
}

export interface SlipDetailsWithReferences extends SlipDetails {
	reference: { [key: string]: string }
}

type IExpenses = {
	id: number
	companyCode: string
	slipNumber: string
	slipTypeName: string
	slipTypeLabel: string
	slipStatusName: string
	slipStatusLabel: string
	// accountingYearMonth: string
	accountingDate: string
	evidenceDate: string
	slipEvidenceTypeName: string
	slipEvidenceTypeLabel: string
	divisionSlipFlag: boolean
	evidenceVendorCode: string
	evidenceVendorName: string
	paymentVendorCode: string
	paymentVendorName: string
	totalAmount: number
	currencyTypeName: string
	currencyTypeLabel: string
	exchangeRate: number
	exchangeRateDate: string
	foreignCurrencyAmount: number
	description: string
	employeeId: number
	fuelSlipFlag: boolean
}

type ISlip = {
	documents: Array<IUploadFile<any>> //참고 문서 파일 리스트
	slipHeader: ISlipHeader
	slipCard: ISlipCard
	files: Array<IUploadFile<any>> //첨부파일 리스트
	receiptFile: Array<IUploadFile<any>> //영수증 파일
	slipDetails: Array<SlipDetails> //개인경비/법인카드 디테일 리스트
}

type ISlipHeader = {
	id: number | string //전표 식별자
	companyCode: string //회사구분코드 * 필수
	slipNumber: string
	slipType: string //전표유형 * 필수
	slipTypeName?: string
	slipStatus: string // 전표상태 * 필수
	deductionTypeName?: string // 과세유형
	// accountingYearMonth: Dayjs | undefined //회계년월 * 필수
	accountingDate: Dayjs | string | undefined //회계일자 * 필수
	evidenceDate: Dayjs | string | undefined //증빙일자 * 필수
	slipEvidenceType: string //증빙유형(CARD, CARD_DIVISION, PERSONAL, PERSONAL_DIVISION..) * 필수
	slipRequestType: string //신청유형(ADVANCE, FRONT_MONEY)
	slipCalculationType: string //정산유형(NOT, ADVANCE) * 필수
	divisionSlipFlag: boolean //분할전표여부
	taxType: string //세금코드
	workplaceId: number | undefined //사업장 식별자
	workplaceCode: string | number | undefined //사업장코드
	workplaceCodes?: (string | number)[] //사업장코드 (화면용)
	evidenceVendorCode: string //증빙거래처코드
	evidenceVendorName: string //증빙거래처명
	evidenceVendorRegistrationNumber: string //증빙거래처 사업자등록번호
	paymentVendorCode: string //지급거래처코드
	paymentVendorName: string //지급거래처명
	paymentVendorRegistrationNumber: string //지급거래처 사업자등록번호
	vendorAccountNumber: string //거래처 계좌번호
	bankType: string //은행유형(TEST1, TEST2)
	totalAmount: number //총금액
	supplyAmount: number //공급가액
	taxAmount: number //부가세액
	otherAmount: number //기타금액
	krwTotalAmount: number //(원화)총금액
	krwSupplyAmount: number //(원화)공급가액
	krwTaxAmount: number //(원화)부가세액
	krwOtherAmount: number //(원화)기타금액
	currencyType: string //통화유형(USD, KRW..)
	currencyTypeLabel?: string
	currencyTypeName?: string
	exchangeRate: number //환율
	exchangeRateDate: Dayjs | undefined //환율일자
	slipInterfaceInfo: Partial<OrderedMap> | undefined
	cashReceiptNumber: string //현금영수증번호
	cashReceiptRegistrationNumber: string //현금영수증 사업자등록번호
	cashReceiptCompanyName: string //현금영수증 상호명
	countryType: string //국가유형(KOR, USA..)
	foreignCurrencyAmount: number //외화금액
	osType: string //기기유형(WEB, IOS..)
	taxInvoiceNumber: string //세금계산서번호
	termsOfPaymentCode: string //지급조건코드
	termsOfPaymentName: string //지급조건명
	paymentDueDate: Dayjs | string | undefined //지급예정일
	wroteAt: Dayjs | undefined //작성일시
	accruedAccountId: string //미지급계정코드
	accruedSubAccountCode: string //미지급보조계정코드
	representativeAccountCode: string //대표계정코드
	fixedAssetFlag: boolean //고정자산여부 example: false
	approvalNumber: string //결재번호
	approvalDraftDate: Dayjs | undefined //결재기안일시
	approvalFinalDate: Dayjs | undefined //결재최종일시
	description: string //헤더 설명
	reference: { [key: string]: string }
	writerId: number | undefined //작성자 - 직원 식별자
	// writer: Array<number> //작성자 - 직원 식별자(ui select-table type 객체)
	approvalFinalEmployeeId: number | undefined //최종결재자 - 직원 식별자
	employeeId: number | undefined //사용자 - 직원 식별자
	employeeIds: Array<number> //사용자 - 직원 식별자(ui select-table type 객체)
	// managementItems: ManagementItemType[] | []
	slipStatusLabel: string
	slipStatusName: string
	storeName: string // 가맹점
	writerName?: string //작성자 상세보기(read only)
	accruedAccountName?: string //부채계정 상세보기(read only)
	workplaceName?: string //사업장 상세보기(read only)
}

type ISlipCard = {
	id: number | string
	companyCode: string
	cardApprovalNumber: string //카드승인번호
	cardBusinessTypeCode: string //카드업종코드
	cardBusinessTypeName: string //카드업종명
	cardCompanyCode: string //카드회사코드
	cardMerchantName: string //카드가맹점명
	cardMerchantRegistrationNumber: string //카드가맹점 사업자등록번호
	cardMerchantRepresentativeName: string //카드가맹점 대표자명
	cardMerchantTelNumber: string //카드가맹점 전화번호
	cardNumber: string //카드번호
	cardUsageNumber: string //카드이용내역번호
	cardWorkplaceAddress: string //카드사업장주소
	cardDeductionType: string //카드공제유형
}

export const SlipField: ISlip = {
	slipHeader: {
		id: "", //전표 식별자
		companyCode: "", //회사구분코드
		slipType: "", //전표유형
		slipStatus: "", // 전표상태
		slipNumber: "", //전표번호
		// accountingYearMonth: undefined, //회계년월
		accountingDate: undefined, //회계일자
		evidenceDate: undefined, //증빙일자
		slipEvidenceType: "", //증빙유형(CARD, CARD_DIVISION, PERSONAL, PERSONAL_DIVISION..)
		slipRequestType: "", //신청유형(ADVANCE, FRONT_MONEY)
		slipCalculationType: "", //정산유형(NOT, ADVANCE)
		divisionSlipFlag: false, //분할전표여부
		taxType: "", //세금코드
		workplaceId: undefined, //사업장 식별자
		workplaceCode: "", //사업장코드
		evidenceVendorCode: "", //증빙거래처코드
		evidenceVendorName: "", //증빙거래처명
		evidenceVendorRegistrationNumber: "", //증빙거래처 사업자등록번호
		paymentVendorCode: "", //지급거래처코드
		paymentVendorName: "", //지급거래처명
		paymentVendorRegistrationNumber: "", //지급거래처 사업자등록번호
		vendorAccountNumber: "", //거래처 계좌번호
		bankType: "", //은행유형(TEST1, TEST2)
		totalAmount: 0, //총금액
		supplyAmount: 0, //공급가액
		taxAmount: 0, //부가세액
		otherAmount: 0, //기타금액
		krwTotalAmount: 0, //(원화)총금액
		krwSupplyAmount: 0, //(원화)공급가액
		krwTaxAmount: 0, //(원화)부가세액
		krwOtherAmount: 0, //(원화)기타금액
		currencyType: "", //통화유형(USD, KRW..)
		exchangeRate: 0, //환율
		exchangeRateDate: undefined, //환율일자
		slipInterfaceInfo: undefined,
		cashReceiptNumber: "", //현금영수증번호
		cashReceiptRegistrationNumber: "", //현금영수증 사업자등록번호
		cashReceiptCompanyName: "", //현금영수증 상호명
		countryType: "", //국가유형(KOR, USA..)
		foreignCurrencyAmount: 0, //외화금액
		osType: "", //기기유형(WEB, IOS..)
		taxInvoiceNumber: "", //세금계산서번호
		termsOfPaymentCode: "", //지급조건코드
		termsOfPaymentName: "", //지급조건명
		paymentDueDate: undefined, //지급예정일
		wroteAt: undefined, //작성일시
		accruedAccountId: "", //미지급계정코드
		accruedSubAccountCode: "", //미지급보조계정코드
		representativeAccountCode: "", //대표계정코드
		fixedAssetFlag: false, //고정자산여부 example: false
		approvalNumber: "", //결재번호
		approvalDraftDate: undefined, //결재기안일시
		approvalFinalDate: undefined, //결재최종일시
		description: "", //헤더 설명
		reference: {},
		writerId: undefined, //작성자 - 직원 식별자
		// writer: [], //작성자 - 직원 식별자(ui select-table type 객체)
		approvalFinalEmployeeId: undefined, //최종결재자 - 직원 식별자
		employeeId: undefined, //사용자 - 직원 식별자
		employeeIds: [],
		// managementItems: [],
		slipStatusLabel: "",
		slipStatusName: "",
		storeName: "",
		writerName: "",
		accruedAccountName: "",
		workplaceName: "",
	},
	slipCard: {
		id: "", //전표 식별자
		companyCode: "", //회사구분코드
		cardCompanyCode: "", //카드회사코드
		cardNumber: "", //카드번호
		cardApprovalNumber: "", //카드승인번호
		cardUsageNumber: "", //카드이용내역번호
		cardMerchantRegistrationNumber: "", //카드가맹점 사업자등록번호
		cardMerchantName: "", //카드가맹점명
		cardDeductionType: "", //카드공제유형
		cardBusinessTypeCode: "", //카드업종코드
		cardBusinessTypeName: "", //카드업종명
		cardWorkplaceAddress: "", //카드사업장주소
		cardMerchantRepresentativeName: "", //카드가맹점 대표자명
		cardMerchantTelNumber: "", //카드가맹점 전화번호
	},
	slipDetails: [], //개인경비/법인카드 디테일 리스트
	documents: [], //참고 문서 파일 리스트
	files: [], //첨부파일 리스트
	receiptFile: [], //영수증 파일
}
//전표내역 조회 데이터 타입
export type ExpenseList = Partial<IExpenses>

export type SlipHeader = Partial<ISlipHeader>
//전표 상세 전체 데이터 타입
// export type Slip = Partial<ISlip>;
export interface Slip {
	slipHeader: SlipHeader
	slipDetails: SlipDetails[]
	slipCard: ISlipCard
	documents: any
	files: any
	receiptFile: any
	slipFuelHeaderDto: any
}
export class ExpenseBuilder {
	private expense: Slip

	constructor() {
		this.expense = {
			slipHeader: { ...SlipField.slipHeader },
			slipDetails: [],
			slipCard: { ...SlipField.slipCard },
			documents: [],
			files: [],
			receiptFile: [],
			slipFuelHeaderDto: {},
		}
	}

	setId(id: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.id = id
		}
		return this
	}

	setSlipType(slipType: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.slipType = slipType
			this.expense.slipHeader.slipEvidenceType = slipType
		}
		return this
	}

	setWorkplace(workplaceCode?: string, workplaceId?: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.workplaceCode = workplaceCode
			if (workplaceId) {
				this.expense.slipHeader.workplaceId = workplaceId
			}
		}
		return this
	}

	setDivisionSlipFlag(flag: boolean): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.divisionSlipFlag = flag
		}
		return this
	}

	setCompanyCode(companyCode: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.companyCode = companyCode
		}
		return this
	}

	setWriter(writer: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.writerId = writer
			// this.expense.slipHeader.writer = [writer]
		}
		return this
	}
	setEmployee(employeeId: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.employeeId = employeeId
			this.expense.slipHeader.employeeIds = [employeeId]
		}
		return this
	}

	// setAccountingYearMonth(accountingYearMonth?: string): ExpenseBuilder {
	// 	if (this.expense.slipHeader) {
	// 		this.expense.slipHeader.accountingYearMonth = accountingYearMonth
	// 			? dayjs(accountingYearMonth, dateFormat)
	// 			: undefined
	// 	}
	// 	return this
	// }

	setAccountingDate(accountingDate?: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.accountingDate = accountingDate
				? dayjs(accountingDate, dateFormat)
				: undefined
		}
		return this
	}

	setEvidenceDate(evidenceDate?: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.evidenceDate = evidenceDate
				? dayjs(evidenceDate, dateFormat)
				: undefined
		}
		return this
	}

	setPaymentDueDate(paymentDueDate: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.paymentDueDate = dayjs(paymentDueDate, dateFormat)
		}
		return this
	}

	setCurrencyType(currencyType: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.currencyType = currencyType
		}
		return this
	}

	setAccruedAccountCode(accruedAccountId: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.accruedAccountId = accruedAccountId
		}
		return this
	}

	setSupplyAmount(supplyAmount: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.supplyAmount = supplyAmount
		}
		return this
	}

	setKrwSupplyAmount(krwSupplyAmount: number): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.krwSupplyAmount = krwSupplyAmount
		}
		return this
	}

	setStoreName(storeName: string): ExpenseBuilder {
		if (this.expense.slipHeader) {
			this.expense.slipHeader.storeName = storeName
		}
		return this
	}

	setFiles(files: Array<IUploadFile<any>>): ExpenseBuilder {
		this.expense.files = files.map(
			(file: IUploadFile<any>) =>
				({
					...file,
					uid: file.id,
					url: file.downloadUrl,
					thumbUrl: file.thumbnailUrl,
				}) as IUploadFile<any>
		)
		return this
	}

	setReceiptFile(files: Array<IUploadFile<any>>): ExpenseBuilder {
		this.expense.receiptFile = files.map(
			(file: IUploadFile<any>) =>
				({
					...file,
					uid: file.id,
					url: file.downloadUrl,
					thumbUrl: file.thumbnailUrl,
				}) as IUploadFile<any>
		)
		return this
	}

	setSlipDetails(slipDetails: Array<SlipDetails>): ExpenseBuilder {
		this.expense.slipDetails =
			slipDetails.length > 0
				? slipDetails
				: [getDefaultSlipDetail(this.expense.slipHeader?.id)]

		if (this.expense.slipDetails) {
			const supplyAmount = this.expense.slipDetails.map((x) => x.supplyAmount || 0)
			const taxAmount = this.expense.slipDetails.map((x) => x.taxAmount || 0)
			if (this.expense.slipHeader) {
				this.expense.slipHeader.krwSupplyAmount = supplyAmount.reduce(
					(acc, amount) => acc + amount,
					0
				)
				this.expense.slipHeader.krwTaxAmount = taxAmount.reduce(
					(acc, amount) => acc + amount,
					0
				)
				this.expense.slipHeader.krwTotalAmount =
					this.expense.slipHeader.krwSupplyAmount + this.expense.slipHeader.krwTaxAmount
				this.expense.slipHeader.totalAmount = this.expense.slipHeader.krwTotalAmount
			}
		}

		return this
	}

	build(): Slip {
		return this.expense
	}
}

const getDefaultSlipDetail = (headerId?: number | string): SlipDetails => {
	return {
		seq: 1,
		totalAmount: 0,
		taxAmount: 0,
		slipLineType: "ITEM",
		debitCreditType: "DEBIT",
		costCenterId: undefined,
		slipHeaderId: headerId ? Number(headerId) : undefined,
		employeeId: undefined,
		employee: [],
		managementItems: [],
	}
}
