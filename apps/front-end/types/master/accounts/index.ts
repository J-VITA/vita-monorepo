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
}

interface IAccountRolesItem {
	id: number
	companyCode: string
	code: string
	name: string
	accountItemAmount: number
	costCenterAmount: number
	employeeAmount: number
	description: string
	used: boolean
}

// interface IAccountRoleDetail {
//   id: number;
//   companyCode: string;
//   code: string;
//   name: string;
//   accountItemAmount: number;
//   costCenterAmount: number;
//   employeeAmount: number;
//   description: string;
//   used: boolean;
//   // accountList: {
//   //   id: number;
//   //   companyCode: string;
//   //   code: string;
//   //   name: string;
//   // }[];
//   // accountCostCenters: {
//   //   id?: number;
//   //   companyCode: string;
//   //   code: string;
//   // }[];
//   // accountEmployees: {
//   //   id?: number;
//   //   companyCode: string;
//   //   employeeNumber: string;
//   // }[];

//   accountIds: { id: number }[];
//   costCenterIds: { id: number }[];
//   employeeIds: { id: number }[];
// }

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
	managementItems: [],
}

export type AccountRolesItem = Partial<IAccountRolesItem>

export type AccountRoleDetail = Partial<IAccountRolesItem> & {
	accountList: {
		id: number
		accountRoleId: number
		accountId: number
	}[]
	accountCostCenters: {
		id: number
		accountRoleId: number
		costCenterId: number
	}[]
	accountEmployees: {
		id: number
		accountRoleId: number
		employeeId: number
	}[]
}
export type AccountRoleForm = Partial<IAccountRolesItem> & {
	accountIds: { id: number }[]
	costCenterIds: { id: number }[]
	employeeIds: { id: number }[]
}
