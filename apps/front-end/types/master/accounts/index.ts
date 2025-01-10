interface IManagementItem {
	id?: number
	companyCode: string
	disabled: boolean // 사용여부
	required: boolean // 필수여부
	managementItemName: string // 항목명
	defaultValue?: string
	commonCode?: string // 공통코드명
	orderSequence: number // 순서
	fixedLength?: number
	alignmentDirectionTypeLabel?: string // 텍스트 정렬
	alignmentDirectionTypeName: string
	managementItemFieldLabel?: string
	managementItemFieldName: string
	managementItemTypeLabel?: string
	managementItemTypeName: string
}

interface IAccountItem {
	id?: number
	companyCode?: string
	parentId?: number | undefined
	code?: string
	name?: string
	depth?: number
	accountLevelLabel?: string
	accountLevelName?: string
	description: string
	used: boolean
	expenseAccountTypeList: string[]
	taxFlag: boolean
	advancePaymentsFlag: boolean
	advanceReceivedFlag: boolean
	expenseAccountFlag: boolean
	slipInputFlag: boolean
	budgetFlag: boolean
	undecidedFlag: boolean
	debitAndCreditFlag: boolean
	customerFlag: boolean
	foreignCurrencyFlag: boolean
	managementItemFlag?: boolean
	erpAccountFlag: boolean
	managementItems: IManagementItem[]
	familyEventFlag: boolean
	accountGroupTypeLabel?: string
	accountGroupTypeName?: string
	accountGroupType?: string
	nonDeduction: boolean
	transportationFlag: boolean
	mealFlag: boolean
	dailyAllowanceFlag: boolean
	accommodationFlag: boolean
	parent?: any
}

interface IAccountRolesItem {
	id?: number
	companyCode: string
	code: string
	name: string
	accountItemAmount: number
	costCenterAmount: number
	employeeAmount: number
	description: string
	used: boolean
}

export type AccountItem = Omit<IAccountItem, "id | companyCode | parentId | depth | code">

export const initData: AccountItem = {
	name: "", // 비용항목명
	code: "",
	description: "", //설명
	accountLevelLabel: "", // 계정레벨
	used: false, // 사용여부
	expenseAccountTypeList: [], //지출유형
	slipInputFlag: false, // 전표입력계정
	expenseAccountFlag: false, //경비지출계정
	taxFlag: false, // 부가세관리
	advancePaymentsFlag: false, // 선급금
	advanceReceivedFlag: false, //선수금
	budgetFlag: false, // 예산
	undecidedFlag: false, // 미결
	debitAndCreditFlag: false, //차대변관리
	customerFlag: false, //거래처관리
	foreignCurrencyFlag: false, //외화관리
	erpAccountFlag: false, //ERP계정여부
	managementItemFlag: true,
	familyEventFlag: false, // 경조금 관리
	managementItems: [],
	nonDeduction: false, // 불공제여부
	transportationFlag: false, // 출장비-교통비 여부
	mealFlag: false, // 출장비-식비 여부
	dailyAllowanceFlag: false, // 출장비-일비 여부
	accommodationFlag: false, // 출장비-숙박비 여부
}

export type AccountRolesItem = Partial<IAccountRolesItem>

export type AccountRoleDetail = {
	id: number
	companyCode: string
	code: string
	name: string
	description: string
	used: boolean
	accountList: Array<{
		id: number
		accountRoleId: number
		accountId: number
		halfChecked: boolean
	}>
	accountCostCenters: Array<{
		id: number
		accountRoleId: number
		costCenterId: number
	}>
	accountEmployees: Array<{
		id: number
		accountRoleId: number
		employeeId: number
	}>
}
export type AccountRoleForm = {
	id?: number
	companyCode: string // 필수
	code: string // 필수
	name?: string
	description?: string
	used?: boolean
	accountIds?: Array<{ id: number; halfChecked: boolean }>
	costCenterIds?: Array<number>
	employeeIds?: Array<number>
	// costCenterIds?: Array<number> | Array<{ id: number }>
	// employeeIds?: Array<number> | Array<{ id: number }>
}
