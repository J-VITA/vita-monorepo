interface ICommonData {
	id: number
	companyCode: string
	approvalLimitFlag: boolean // 상신마감 제한 여부
	accountInputMethodFlag: boolean // 계정/비용항목 입력방식 사용 여부
	slipAutoConfirmationFlag: boolean // 전표 자동확정 여부
	closeNotificationFlag: boolean // 마감 알림설정 여부
	manualFlag: boolean // 매뉴얼등록 여부
	personalExpenseReceiptFlag: boolean // 개인경비 영수증 필수 여부
	personalExpenseVendorFlag: boolean // 개인경비 거래처 필수 입력 여부
	businessTripNameInputFlag: boolean
	expenseFileFlag: boolean // 지출작성 첨부파일 사용 여부
	expenseDocFlag: boolean // 결재문서 여부
	personalExpensePaymentDateFlag: boolean // 개인경비 출금/지급 예정일 표시 여부
	personalExpenseWriteFlag: boolean // 개인경비 작성 허용 여부
	corporateCreditCardPaymentDateFlag: boolean // 법인카드 출금/지급 예정일 표시 여부
	billInvoicePaymentDateFlag: boolean // 세금계산서 출금/지급 예정일 표시 여부
	billInvoiceWriteFlag: boolean // 세금계산서 작성 허용 여부
	slipDivisionFlag: boolean // 전표 분할입력 사용 여부
	projectFlag: boolean // 프로젝트관리 여부
	oilFlag: boolean // 유류비관리 여부
	familyEventFlag: boolean // 경조금지급관리 여부
	erpCodeMappingFlag: boolean // ERP 코드 매핑 여부
	dailyExpensesFlag: boolean // 일비관리 여부
	businessTripFlag: boolean // 출장거리관리 여부
	attendanceFlag: boolean // 참석자관리 여부
	approvalRequiredFlag: boolean // 결재자필수포함 여부
	nonDeductionBusinessType: string // 불공제업종
	description: string
	expenseDocList: string[] // 결재 문서 사용 가능 List ["PERSONAL_EXPENSE","CARD","BILL_INVOICE"]
	expenseFileList: string[] // 사용 가능 첨부파일 List ["PERSONAL_EXPENSE","CARD","BILL_INVOICE"]
	cardManagerFlag: boolean // 카드 담당자 사용 여부
	budgetManagerFlag: boolean //예산 담당자 여부
	nonDeductionBusinessTypeFlag: boolean //불공제업종 여부
}

interface IResponseData extends ICommonData {
	approvalLimitStartDayName: string // 상신마감 시작일 타입
	approvalLimitStartDayLabel: string // 상신마감 시작일 라벨
	approvalLimitStartDayValue: number // 상신마감 시작일 값
	approvalLimitEndDayName: string // 상신마감 종료일 타입
	approvalLimitEndDayLabel: string // 상신마감 종료일 라벨
	approvalLimitEndDayValue: number // 상신마감 종료일 값
	accountInputMethodTypeName: string // 계정/비용항목 입력방식 타입
	accountInputMethodTypeLabel: string // 계정/비용항목 입력방식 라벨
	personalExpensePaymentTypeName: string // 개인경비 지급월 타입구분(THAT_MONTH, NEXT_MONTH)
	personalExpensePaymentTypeLabel: string // 개인경비 지급월 라벨(익월, 당월)
	personalExpensePaymentDayName: string // 개인경비 지급일 타입(ONE, TWO..)
	personalExpensePaymentDayLabel: string // 개인경비 지급일 라벨(1일, 2일..)
	corporateCreditCardPaymentTypeName: string // 법인카드 지급월 타입구분 (THAT_MONTH, NEXT_MONTH)
	corporateCreditCardPaymentTypeLabel: string // 법인카드 지급월 라벨 (익월, 당월)
	corporateCreditCardPaymentDayName: string // 법인카드 지급일 타입(ONE, TWO..)
	corporateCreditCardPaymentDayLabel: string // 법인카드 지급일 라벨(1일, 2일..)
	billInvoicePaymentTypeName: string // 세금계산서 출금/지급 예정일 타입
	billInvoicePaymentTypeLabel: string // 세금계산서 출금/지급 예정일 라벨
	billInvoicePaymentDayName: string // 세금계산서 출금/지급 예정일 타입(ONE, TWO..)
	billInvoicePaymentDayLabel: string // 세금계산서 출금/지급 예정일 라벨
	cardManagers: number[] // 카드 담당자 배열 [1, 2, 3]
	budgetManagers: number[] // 예산 담당자 배열 [1, 2, 3]

	foreignCurrencyDecimalPlaceLabel: string // 외화금액 소수점 자리수 라벨(1자리, 2자리..)
	foreignCurrencyDecimalPlaceName: string // 외화금액 소수점 자리수 구분(NONE, ONE, TWO, THREE, FOUR)

	familyEventFlag: boolean //경조금지급관리 여부
	familyEventPaymentDateFlag: boolean // 경조금 출금/지급 예정일 표시 여부
	familyEventPaymentDayLabel: string // 경조금 지급일 라벨(1일, 2일..)
	familyEventPaymentDayName: string // 경조금 지급일 타입(ONE, TWO..)
	familyEventPaymentTypeLabel: string // 경조금 지급월 라벨(익월, 당월)
	familyEventPaymentTypeName: string // 경조금 지급월 타입구분(THAT_MONTH, NEXT_MONTH)

	arTaxInvoiceManagerFlag: boolean // 매출 세금계산서 담당자 여부
	arTaxInvoiceManager: number // 매출 세금계산서 담당자

	apTaxInvoiceManageFlag: boolean // 매입 세금계산서 발행 담당자 사용여부
	apTaxInvoiceManageDepartments: number[] // 매입 세금계산서 발행 담당자 부서 배열 [1, 2, 3]
	apTaxInvoiceManagers: number[] // 매입 세금계산서 발행 담당 사원식별자 배열 [1, 2, 3]
}

interface IData extends ICommonData {
	approvalLimitStartDay: string // 변환: StartDayName, StartDayValue → StartDay
	approvalLimitEndDay: string // 변환: EndDayName, EndDayValue → EndDay
	accountInputMethodType: string // 변환: TypeName → Type
	personalExpensePaymentType: string // 개인경비 지급월 타입구분(THAT_MONTH, NEXT_MONTH)
	personalExpensePaymentDay: string // 개인경비 지급일 타입(ONE, TWO..)
	corporateCreditCardPaymentType: string
	corporateCreditCardPaymentDay: string
	billInvoicePaymentType: string
	billInvoicePaymentDay: string
	familyEventPaymentType: string
	familyEventPaymentDay: string // 경조금 지급일 타입(ONE, TWO..)
	cardManagers: { id: number }[] // 카드 담당자 객체 배열
	apTaxInvoiceManagers: { id: number }[] // 세금계산서 담당자 객체 배열
	budgetManagers: { id: number }[] // 예산 담당자 객체 배열
	arTaxInvoiceManagerIds: (string | number)[]
}

export type Data = Required<IResponseData> & Partial<IData>

export const spendTypeOptions = [
	{ label: "개인경비", value: "PERSONAL_EXPENSE" },
	{ label: "법인카드", value: "CARD" },
	{ label: "세금계산서", value: "BILL_INVOICE" },
]
