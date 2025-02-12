import { createTableColumns, ExTableColumns } from "@/types"

export const columns = createTableColumns<"ApprovalFormTypeList">([
	{
		title: "결재양식명",
		dataIndex: "approvalFormTypeLabel",
		width: 300,
		resizable: true,
	},
	{
		title: "설명",
		dataIndex: "description",
		width: 400,
		resizable: true,
		align: "left",
	},
	{
		title: "결재양식 사용여부",
		dataIndex: "used",
		width: 160,
		resizable: true,
		align: "center",
	},
])

export type ApprovalFormTypeListColumns = ExTableColumns<"ApprovalFormTypeList">

export const useApprovalFormTypeListColumns = () => {
	return ref<ApprovalFormTypeListColumns>(columns)
}
