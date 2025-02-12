import { Dayjs } from "dayjs"
import { ManagementItemType, OrderedMap } from "~/types/expenses"

type IModalSlipHeader = {
	id: number | string //전표 식별자
	companyCode: string //회사구분코드
	slipNumber: string
	slipType: string //전표유형
	slipTypeName?: string
	slipStatus: string // 전표상태
	slipTypeLabel: string //전표유형
	accountingDate: Dayjs | undefined //회계일자
	evidenceDate: Dayjs | undefined //증빙일자
	slipEvidenceTypeLabel: string //증빙유형(CARD, CARD_DIVISION, PERSONAL, PERSONAL_DIVISION..)
	slipRequestType: string //신청유형(ADVANCE, FRONT_MONEY)
	slipCalculationType: string //정산유형(NOT, ADVANCE)
	divisionSlipFlag: boolean //분할전표여부
	taxName: string //세금코드
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
	paymentDueDate: Dayjs | undefined //지급예정일
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
	writer: Array<number> //작성자 - 직원 식별자(ui select-table type 객체)
	approvalFinalEmployeeId: number | undefined //최종결재자 - 직원 식별자
	employeeId: number | undefined //사용자 - 직원 식별자
	// managementItems: ManagementItemType[] | []
	slipStatusLabel: string
	slipStatusName: string
	storeName: string // 가맹점
	writerName?: string //작성자 상세보기(read only)
	accruedAccountName?: string //부채계정 상세보기(read only)
	workplaceName?: string //사업장 상세보기(read only)
	slipCalculationTypeLabel: string //선급금정산여부
	advancePaymentSettlementAmount: number //선급금정산금액
	bankTypeLabel: string //은행명
	accruedAccount: {
		id: number
		name: string
		parentId: number
		parentName: string
	} //부채계정
	deductionTypeLabel: string //공제유형
	costCenterName: string //코스트센터
	projectName: string //프로젝트
}

type IModalSlipDetail = {
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
	taxCode?: string //세금코드
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

type IModalSlipCard = {
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

type ModalSlipHeader = Partial<IModalSlipHeader>
type ModalSlipDetails = Partial<IModalSlipDetail>
type ModalSlipCard = Partial<IModalSlipCard>

export interface SlipModalDetail {
	slipHeader: ModalSlipHeader
	slipDetails: ModalSlipDetails[]
	slipCard: ModalSlipCard
	documents: any
	files: any
	receiptFile: any
	slipFuelHeaderDto: any
}

export type SlipModalDetailBrand = "SlipModalDetailBrand"
