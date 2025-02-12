import type { Dayjs } from "dayjs"

interface IFamilyEvents {
	id: number | undefined
	companyCode: string
	description: string
	familyEventTypeId: number
	familyEventTypeName: string
	// familyEventTypeLabel: string
	familyEventAmount: number
	vacationDay: number
	mutualAidFlag: boolean
	wreathFlag: boolean
	updatedAt: string
	updatedBy: string
	filterDate: [Dayjs, Dayjs]
	startDate: string | Dayjs
	endDate: string | Dayjs
	attribute?: string
}

interface IFormData {
	id: number | undefined
	companyCode: string
	description: string
	familyEventTypeName: string
	familyEventTypeLabel: string
	familyEventAmount: number
	vacationDay: number
	mutualAidFlag: boolean
	wreathFlag: boolean
	searchYearMonthFrom: string | Dayjs
	searchYearMonthTo: string | Dayjs
}

export type FormData = Partial<IFormData>
export type FamilyEventsItem = Partial<IFamilyEvents>
export type Search = Partial<IFamilyEvents> & {
	pageNumber: number
	size?: number
}

export type FamilyEventsParams = Partial<IFormData> & {
	method?: "POST" | "PATCH"
}
