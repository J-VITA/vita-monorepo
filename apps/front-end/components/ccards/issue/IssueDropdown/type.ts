import { Dayjs } from "dayjs"

export type FormState = {
	issueDate: Dayjs
	userId?: number
	approvedBy?: number
	cardId?: string | number
	user?: string
	startDate?: string
	endDate?: string
	cardName?: string
	cardNumber?: string
}
