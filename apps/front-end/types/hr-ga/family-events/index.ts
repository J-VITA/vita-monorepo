import dayjs, { Dayjs } from "dayjs"
import {
	createSearchParams,
	createTableColumns,
	ExSearchParams,
	ExTableColumns,
	pageSize,
	RequestParams,
} from "@/types"
import { Badge, Typography } from "ant-design-vue"

export interface IFamilyRequestSearchParams {
	companyCode: string //회사구분코드
	searchDateFrom: string //기안일 시작
	searchDateTo: string //기안일 종료
	draftEmmployeeId: number | string //기안자 식별자
	draftEmmployeeIds: (number | string)[]
	documentStatus: string
	filterDate: [Dayjs, Dayjs]
	title: string //제목
}

export type FamilyRequestSearch = ExSearchParams<
	RequestParams<IFamilyRequestSearchParams>,
	"FamilyRequestSearch"
>

export const useFamilyRequestSearch = async (
	companyCode: string,
	draftEmmployeeId: number | string
) => {
	const searchParams = ref(
		createSearchParams<RequestParams<IFamilyRequestSearchParams>, "FamilyRequestSearch">({
			pageNumber: 0,
			size: pageSize,
			first: true,
			last: false,
			sort: [],
			companyCode,
			draftEmmployeeId,
			draftEmmployeeIds: [draftEmmployeeId],
			documentStatus: "",
			title: "",
			searchDateFrom: dayjs(useMonth.from()).format("YYYY-MM-DD"),
			searchDateTo: dayjs(useMonth.to()).format("YYYY-MM-DD"),
			filterDate: [useMonth.from(), useMonth.to()],
		})
	)

	return {
		searchParams,
		updateSearchParams: (newParams: Partial<FamilyRequestSearch>) => {
			searchParams.value = { ...searchParams.value, ...newParams }
		},
	}
}

export const columns = createTableColumns<"FamilyEventList">([
	{
		title: "제목",
		dataIndex: "title",
		sorter: {
			multiple: 1,
		},
		width: -1,
		resizable: true,
	},
	{
		title: "결재상태",
		dataIndex: "documentStatusLabel",
		sorter: {
			multiple: 2,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender({ record, text }) {
			return h(Badge, {
				status: record.documentStatusName === "PROGRESS" ? "processing" : "default",
				color: record.documentStatusName === "PROGRESS" ? "green" : "red",
				text,
			})
		},
	},
	{
		title: "경조유형",
		dataIndex: "familyEventTypeLabel",
		sorter: {
			multiple: 3,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "신청금액",
		dataIndex: "familyEventAmount",
		sorter: {
			multiple: 4,
		},
		width: -1,
		resizable: true,
		align: "right",
		customRender: ({ text }) => (text ? text.toLocaleString() : ""),
	},
	{
		title: "발생일자",
		dataIndex: "eventDate",
		sorter: {
			multiple: 5,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD") : ""),
	},
	{
		title: "기안자",
		dataIndex: "draftEmployeeName",
		sorter: {
			multiple: 6,
		},
		width: -1,
		resizable: true,
		align: "center",
	},
	{
		title: "기안일",
		dataIndex: "draftDateTime",
		sorter: {
			multiple: 7,
		},
		width: -1,
		resizable: true,
		align: "center",
		customRender: ({ text }) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm") : ""),
	},
	{
		title: "지원물품",
		dataIndex: "supports",
		sorter: {
			multiple: 8,
		},
		width: 140,
		resizable: true,
		align: "left",
		customRender({ record, column }) {
			const supports = []

			if (record.mutualAidFlag) {
				supports.push("상조용품")
			}

			if (record.wreathFlag) {
				supports.push("경조화환")
			}

			if (supports.length === 0) {
				return "-"
			}

			return supports.join(", ")
		},
	},
])

export type FamilyEventListColumns = ExTableColumns<"FamilyEventList">

export const useFamilyEventListColumns = () => {
	return ref<FamilyEventListColumns>(columns)
}

export type FamilyEventTableData = {
	id: number
	title: string
	documentStatusName: string
	documentStatusLabel: string
	familyEventTypeName: string
	familyEventTypeLabel: string
	familyEventAmount: number
	eventDate: string
	draftEmployeeName: string
	draftDateTime: string
	mutualAidFlag: boolean
	wreathFlag: boolean
	approvalHeaderId: number
}
