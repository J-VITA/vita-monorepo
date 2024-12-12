import { createTableColumns, ExTableColumns } from "@/types"
import dayjs, { Dayjs } from "dayjs"

// card-delegators
export type CardDelegatorItem = {
	id: number
	companyCode: string
	departmentName: string
	employeeName: string
	delegateStartDate: string
	delegateEndDate: string
	used: boolean
	description: string
}

export const cardDelegatorsColumns = createTableColumns<"CardDelegators">([
	{
		title: "이름",
		dataIndex: "employeeName",
	},
	{
		title: "부서",
		dataIndex: "departmentName",
	},
	{
		title: "대리작성기간",
		dataIndex: "period",
		customRender: ({ record }) => {
			return `${dayjs(record.delegateStartDate).format("YYYY-MM-DD HH:mm:ss")} ~ ${dayjs(record.delegateEndDate).format("YYYY-MM-DD HH:mm:ss")}`
		},
	},
	{
		title: "상태",
		dataIndex: "used",
	},
	{
		title: "기능",
		dataIndex: "actions",
	},
])

export type CardDelegatorsColumns = ExTableColumns<"CardDelegators">
export const useCardDelegatorsColumns = () => {
	return ref<CardDelegatorsColumns>(cardDelegatorsColumns)
}

interface IDelegatorDetail {
	id?: number
	companyCode: string
	delegateStartDate: string
	delegateEndDate: string
	used: boolean
	cardManagementId: number
	employeeId: number
}

export type DelegatorDetail = Required<IDelegatorDetail>
export type FormData = Partial<IDelegatorDetail> & {
	cardId: number // 필수
	employeeIds?: (string | number)[]
	dates?: [Dayjs, Dayjs]
	description?: string
}

export const RangePickerPresets = [
	{
		label: "3개월 동안",
		value: [dayjs(), dayjs().add(3, "M")],
	},
	{
		label: "6개월 동안",
		value: [dayjs(), dayjs().add(6, "M")],
	},
	{
		label: "1년 동안",
		value: [dayjs(), dayjs().add(1, "year")],
	},
	{
		label: "2년 동안",
		value: [dayjs(), dayjs().add(2, "year")],
	},
	{
		label: "3년 동안",
		value: [dayjs(), dayjs().add(3, "year")],
	},
	{
		label: "4년 동안",
		value: [dayjs(), dayjs().add(4, "year")],
	},
]
