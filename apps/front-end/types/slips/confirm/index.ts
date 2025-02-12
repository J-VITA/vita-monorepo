import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
	SlipType,
} from "@/types"
import { monthFormat, SlipStateType } from "@/types/expenses"
import { Badge, TypographyLink } from "ant-design-vue"
import dayjs, { Dayjs } from "dayjs"
import { options } from "../list"

interface ISearchParams {
	companyCode?: string //회사코드
	filterDate: [string, string] | [Dayjs, Dayjs]
	searchDateFrom: string | Dayjs
	searchDateTo: string | Dayjs
	employeeIds?: (string | number)[] //사용자 - 직원식별자 (화면용)
	employeeId?: string | number //사용자 - 직원식별자
	departmentIds?: (string | number)[] //부서 (화면용)
	departmentId?: string | number //부서
	checkEmployeeId?: string | number
	checkEmployeeIds?: (string | number)[] //검인자 (화면용)
	slipType?: SlipType[] //전표 유형 목록
	slipStatus?: SlipStateType[] //전표 상태 목록
}
export type TSlipConfirmSearch = ExSearchParams<
	RequestParams<ISearchParams>,
	"ISlipConfirmSearch"
>
export const useConfirmSearch = (
	companyCode: string,
	employeeId: number | string,
	departmentId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<ISearchParams>, "ISlipConfirmSearch">({
			companyCode: companyCode,
			filterDate: [useMonth.twoMonthsAgo(), useMonth.currentMonth()],
			searchDateFrom: useMonth.twoMonthsAgo().format(monthFormat),
			searchDateTo: useMonth.currentMonth().format(monthFormat),
			// employeeId: employeeId,
			employeeIds: [],
			checkEmployeeId: employeeId,
			checkEmployeeIds: [employeeId],
			// departmentId,
			departmentIds: [],
			slipType: [],
			slipStatus: [],
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: true,
			sort: [],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<RequestParams<ISearchParams>>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export type SlipConfirmColumns = ExTableColumns<"SlipConfirm">

export const useSlipConfirmColumns = (onSlipNumberClick?: (record: any) => void) => {
	const columns = createTableColumns<"SlipConfirm">([
		{
			title: "전표번호",
			dataIndex: "slipNumber",
			width: -1,
			resizable: true,
			customRender({ record, text }) {
				return h(TypographyLink, {
					text,
					onClick: () => onSlipNumberClick && onSlipNumberClick(record),
				})
			},
		},
		{
			title: "결재문서번호",
			dataIndex: "approvalNumber",
			width: -1,
			resizable: true,
		},
		{
			title: "전표유형",
			dataIndex: "slipTypeName",
			width: -1,
			resizable: true,
			align: "center",
			customRender({ record, text }) {
				const color = text
					? options.expense.filter((e) => e.value === text)?.[0].color || "red"
					: ""
				const labelText = text
					? options.expense.filter((e) => e.value === text)?.[0].label || "유형없음"
					: ""
				return h(Badge, {
					status: text ? "processing" : "default",
					color,
					text: labelText,
				})
			},
		},
		{
			title: "사용일자",
			dataIndex: "accountingDate",
			width: -1,
			resizable: true,
			align: "center",
			customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
		},
		{
			title: "코스트센터",
			dataIndex: "costCenterName",
			width: -1,
			resizable: true,
			align: "center",
		},
		{
			title: "사용자",
			dataIndex: "employeeName",
			width: -1,
			resizable: true,
			align: "center",
		},
		{
			title: "총금액",
			dataIndex: "krwTotalAmount",
			width: -1,
			resizable: true,
			align: "right",
			customRender: ({ text }) => (text ? text.toLocaleString() : ""),
		},
	])
	return ref<SlipConfirmColumns>(columns)
}
