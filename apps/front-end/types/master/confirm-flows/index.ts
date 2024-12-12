import { Badge, Typography } from "ant-design-vue"

import {
	createSearchParams,
	createTableColumns,
	createViewParams,
	ExResponseData,
	ExSearchParams,
	ExTableColumns,
	ExViewParams,
	pageSize,
	RequestParams,
	Response,
} from "@/types"

/*******************
 * About index page
 *******************/
export const FlowsActivityType = {
	/** 검인라인관리 */
	FINAL_APPROVE: "FINAL_APPROVE",
	/** 수신자관리 */
	RECIPIENT: "RECIPIENT",
}
/**
 * 검인/수신 라인 관리 화면 탭
 * @description 트리 쉐이킹 & 런타임 오버헤드 축소
 * @argument {string} [FlowsActivityType: FINAL_APPROVE, RECIPIENT]
 */
export type FlowsActivityType = (typeof FlowsActivityType)[keyof typeof FlowsActivityType]

export type ConfirmFlowsProps = {
	itemId?: string | number | undefined
}

export type ConfirmFlowsIdBrand = "ConfirmFlowsId"

export const createConfirmFlowsModalProps = (itemId: string | number | undefined) =>
	createViewParams<{ itemId: string | number | undefined }, "ConfirmFlowsId">({
		itemId,
	})

export interface IConfirmFlowsSearchParams {
	companyCode?: string
	used?: string
	tabKey?: string
}

export type TConfirmFlowsSearch = ExSearchParams<
	RequestParams<IConfirmFlowsSearchParams>,
	"IConfirmFlows"
>

/**************************************
 * About FinalApprove Component
 **************************************/
interface ApprovalFormType {
	approvalFormType: string
}
export interface LineDetailRequest {
	checkEmployeeDepartmentCode?: string
	checkEmployeeDepartmentName?: string
	checkEmployeePositionCode?: string
	checkEmployeePositionName?: string
	id?: string | number
	companyCode?: string
	sequence?: number
	startAmount?: number
	endAmount?: number
	used: boolean
	checkEmployeeId?: string | number
	checkEmployeeIds?: (string | number)[]
}
export interface VFinalApproveParams {
	companyCode?: string
	name?: string
	approvalFormTypes: string[]
	description?: string
	used: boolean
	costCenterIds?: (string | number)[]
	checkLineDetailRequests: LineDetailRequest[]
}
/**
 * 검인라인 폼 데이터 타입
 */
export type TFinalApproveParams = ExViewParams<VFinalApproveParams, "FinalApprove">

/**
 * 검인 결재양식 유형
 */
export interface RFinalApprovalFromType {
	approvalFormTypeName: string
	approvalFormTypeLabel: string
}
/**
 * 검인 결재 양식 유형 타입
 */
export type TFinalApprovalFromType = ExResponseData<
	Array<RFinalApprovalFromType>,
	"FinalApprovalFromType"
>

export interface LineApprovalFormTypeDtos {
	approvalFormTypeName: string
	approvalFormTypeLabel: string
}

export interface LineCostCenterDtos {
	id: number
	costCenterCode: string
	costCenterName: string
}
/**
 * 검인 정보
 */
export interface RFinalApproveReponse {
	id?: string | number
	name?: string
	description?: string
	used: boolean
	checkLineDetailDtos?: LineDetailRequest[]
	checkLineApprovalFormTypeDtos: LineApprovalFormTypeDtos[]
	checkLineCostCenterDtos: LineCostCenterDtos[]
}
/**
 * 검인 정보 타입
 */
export type TFinalApproveReponse = ExResponseData<
	Response<RFinalApproveReponse>,
	"FinalApprove"
>

/**
 * 검인라인 뷰 파라미터 ref 객체
 * @param companyCode
 * @returns
 */
export const useFinalApproveParams = (companyCode: string = "") => {
	const modelRef = ref(
		createViewParams<VFinalApproveParams, "FinalApprove">({
			companyCode,
			name: "",
			description: "",
			used: true,
			approvalFormTypes: [],
			costCenterIds: [],
			checkLineDetailRequests: [
				{
					id: undefined,
					sequence: undefined,
					checkEmployeeId: undefined,
					used: false,
					checkEmployeeIds: [],
					companyCode: companyCode,
					endAmount: undefined,
					startAmount: undefined,
				},
			],
		})
	)

	return {
		modelRef,
		updateModelRef: (newParams: Partial<TFinalApproveParams>) => {
			modelRef.value = { ...modelRef.value, ...newParams }
		},
	}
}

/**
 * 검인라인 등록오류 결재문서 타입
 */
export interface LineApprovalFormError {
	approvalFormTypeName: string
	approvalFormTypeLabel: string
}

/**
 * 검인라인 등록오류 CostCenter 리스트
 */
export interface CostCenterError {
	costCenterId: number
	costCenterName: string
	checkLineApprovalFormError: LineApprovalFormError[]
}

/**
 * 검인라인 등록오류 응답 타입
 */
export interface RErrorFinalApproveReponse {
	checkLineName: string //중복 되어진 라인 타이틀
	checkLineCostCenterError: CostCenterError[] //중복 되어진 결재문서 타입 및 CostCenter 리스트
}

/**
 * 검인라인 등록오류 응답 타입(브랜드)
 */
export type TErrorFinalApproveReponse = ExResponseData<
	Response<Array<RErrorFinalApproveReponse>>,
	"ErrorFinalApprove"
>

/**
 * 검인자 라인 관리 테이블 컬럼 정의
 */
export const finalApproveManagementColumns = createTableColumns<"FinalApproveManagement">(
	[
		{
			title: "검인라인명",
			dataIndex: "name",
			resizable: true,
			sorter: {
				multiple: 1,
			},
			width: 180,
			align: "left",
		},
		{
			title: "결재문서",
			dataIndex: "checkLineApprovalFormTypeDtos",
			resizable: true,
			sorter: {
				multiple: 2,
			},
			width: 400,
			align: "left",
			customRender(opt) {
				if (
					!opt.record.checkLineApprovalFormTypeDtos ||
					opt.record.checkLineApprovalFormTypeDtos.length === 0
				) {
					return ""
				}

				const content = opt.record.checkLineApprovalFormTypeDtos
					.map((record: any) => record.approvalFormTypeLabel)
					.join(", ")

				return h(Typography.Text, {
					style: { width: `${opt.column.width}px` },
					ellipsis: { tooltip: content },
					content,
				})
			},
		},
		{
			title: "검인/수신라인",
			dataIndex: "checkLineDetailDtos",
			resizable: true,
			sorter: {
				multiple: 3,
			},
			width: 400,
			align: "left",
			customRender(opt) {
				if (
					!opt.record.checkLineDetailDtos ||
					opt.record.checkLineDetailDtos.length === 0
				) {
					return ""
				}

				const names = opt.record.checkLineDetailDtos.map(
					(record: any) => record.checkEmployeeName
				)

				const content = names.reduce((acc: any[], name: string, index: number) => {
					if (index > 0) {
						acc.push(" ")
						acc.push(h("i", { class: "ico-approval-arrow" }))
						acc.push(" ")
					}
					acc.push(name)
					return acc
				}, [])

				return h(
					Typography.Text,
					{
						style: { width: `${opt.column.width}px` },
					},
					() => content
				)
			},
		},
		{
			title: "상태",
			dataIndex: "used",
			resizable: true,
			sorter: {
				multiple: 4,
			},
			align: "center",
			width: 120,
			customRender(opt) {
				return h(Badge, {
					color: opt.record.used ? "green" : "red",
					text: opt.record.used ? "사용중" : "미사용",
				})
			},
		},
	]
)

export type FinalApproveManagementColumns = ExTableColumns<"FinalApproveManagement">
export const useFinalApproveManagementColumns = () => {
	return ref<FinalApproveManagementColumns>(finalApproveManagementColumns)
}

/**************************************
 * About Recipients Component
 **************************************/
/**
 * 수신라인 폼 데이터
 */
export interface VRecipientsParams {
	companyCode?: string
	name?: string
	approvalFormType?: string
	description?: string
	used: boolean
	receiveEmployeeIds?: (string | number)[]
}
/**
 * 수신라인 폼 데이터 타입
 */
export type TRecipientsParams = ExViewParams<VRecipientsParams, "Recipients">

/**
 * 수신자 상세정보
 */
export interface ReceiverDetail {
	id: string | number
	companyCode: string
	receiveEmployeeId: number
	receiveEmployeeName: string
	receiveEmployeePositionCode: string
	receiveEmployeePositionName: string
	receiveEmployeeDepartmentCode: string
	receiveEmployeeDepartmentName: string
}

/**
 * 수신 정보
 */
export interface RRecipientsReponse {
	id?: string | number
	companyCode?: string
	name?: string
	approvalFormTypeName?: string
	approvalFormTypeLabel?: string
	description?: string
	used: boolean
	approvalReceiverDetailDtos?: ReceiverDetail[]
}
/**
 * 수신 정보 타입
 */
export type TRecipientsReponse = ExResponseData<
	Response<RRecipientsReponse>,
	"Recipients"
>

export const useRecipientsParams = (companyCode: string = "") => {
	const modelRef = ref(
		createViewParams<VRecipientsParams, "Recipients">({
			companyCode,
			name: "",
			approvalFormType: "",
			description: "",
			used: true,
			receiveEmployeeIds: [],
		})
	)

	return {
		modelRef,
		updateModelRef: (newParams: Partial<TRecipientsParams>) => {
			modelRef.value = { ...modelRef.value, ...newParams }
		},
	}
}

/**
 * 수신 결재양식 유형
 */
export interface RApprovalFromType {
	code: string
	label: string
	receivable: boolean
	used: boolean
	slip: boolean
}
/**
 * 수신 결재 양식 유형 타입
 */
export type TApprovalFromType = ExResponseData<
	Array<RApprovalFromType>,
	"ApprovalFromType"
>

/**
 * 수신자 관리 테이블 컬럼 정의
 */
export const recipientLineManagementColumns =
	createTableColumns<"RecipientLineManagement">([
		{
			title: "수신명",
			dataIndex: "name",
			resizable: true,
			sorter: {
				multiple: 1,
			},
			width: 150,
			align: "left",
		},
		{
			title: "설명",
			dataIndex: "description",
			resizable: true,
			sorter: {
				multiple: 2,
			},
			width: -1,
			align: "left",
		},
		{
			title: "결재문서",
			dataIndex: "approvalFormType",
			resizable: true,
			sorter: {
				multiple: 3,
			},
			width: 150,
			align: "center",
			customRender(opt) {
				return opt.record.approvalFormTypeLabel
			},
		},
		{
			title: "권한자",
			dataIndex: "approvalReceiverDetailDtos",
			resizable: true,
			sorter: {
				multiple: 4,
			},
			width: -1,
			align: "left",
			customRender(opt) {
				if (
					!opt.record.approvalReceiverDetailDtos ||
					opt.record.approvalReceiverDetailDtos.length === 0
				) {
					return ""
				}
				const names = opt.record.approvalReceiverDetailDtos.map(
					(record: any) => record.receiveEmployeeName
				)

				const content = names.reduce((acc: any[], name: string, index: number) => {
					if (index > 0) {
						acc.push(" ")
						acc.push(h("i", { class: "ico-approval-arrow" }))
						acc.push(" ")
					}
					acc.push(name)
					return acc
				}, [])

				return h(
					Typography.Text,
					{
						style: { width: `${opt.column.width}px` },
					},
					() => content
				)
			},
		},
		{
			title: "상태",
			dataIndex: "used",
			resizable: true,
			sorter: {
				multiple: 5,
			},
			align: "center",
			width: 120,
		},
	])

export type RecipientLineManagementColumns = ExTableColumns<"RecipientLineManagement">
export const useRecipientLineManagementColumns = () => {
	return ref<RecipientLineManagementColumns>(recipientLineManagementColumns)
}
