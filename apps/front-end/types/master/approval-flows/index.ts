// Electronic Document Approval System or E-Approval System
// export enum Edas {
//   DRAFT = '기안',
//   REVIEW = '합의',
//   APPROVE = '결재',
// }
export enum Edas {
	DRAFT = "기안",
	AGREEMENT = "합의",
	APPROVAL = "결재",
}

type TId = {
	id: string | number
}
export type TApproval = {
	id?: number
	companyCode: string
	employeeNumber?: string
	stage: number
	order?: number
	approvalType: string
	approvalEmployeeId: number
	employeeId: number
	employeePositionCode: string
	employeePositionName: string
	approvalTypeName: string
	approvalTypeLabel: string
	approvalEmployeeNumber: string
	approvalEmployeeName: string
	approvalEmployeePositionCode: string
	approvalEmployeePositionName: string
}
interface IApprovalLines {
	id: number
	companyCode: string
	// employeeNumber: string,
	employeeId: number
	approvalLineName: string
	mainApprovalLineFlag: boolean
	agreementOptionType: string
	orderSeq: number
	used: boolean
	description?: string
	referenceEmployeeIds: Array<TId>
	approvalLineDetails: Array<TApproval>
}

interface IApprovalDetail {
	id: number
	companyCode: string
	employeeNumber: string
	stage: number
	approvalType: string
	approvalEmployeeId: number
}

interface IApprovalRules {
	id: number
	companyCode: string
	agreementOptionTypeName: string
	agreementOptionTypeLabel: string
	approvalPasswordFlag: boolean
	documentSearchFlag: boolean
	referenceSearchFlag: boolean
	approvalDelayFlag: boolean
	approvalDelayDay: number
	documentModificationFlag: boolean
	documentModifierTypeName: string
	documentModifierTypeLabel: string
	finalApprovalFlag: boolean // 전결여부
	finalApprovalEmployees: number[] // 전결자 Ids;
	// finalApprovalEmployee: string; // 전결자;
	postApprovalFlag: boolean //후결여부
	delegateApprovalFlag: boolean //대결여부

	agreementOptionType?: string
	documentModifierType?: string
}

export type ApprovalLines = Partial<IApprovalLines> | []
export type ApprovalDetail = Partial<IApprovalDetail>
export type ApprovalRules = Partial<IApprovalRules>
