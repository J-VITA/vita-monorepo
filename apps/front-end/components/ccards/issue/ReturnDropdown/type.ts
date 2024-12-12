import { Dayjs } from "dayjs"

export type FormState = {
	returnDate: Dayjs
	returnedBy?: number
	approvedBy?: number
	cardId?: string | number
	user?: string
	startDate?: string
	endDate?: string
	cardName?: string
	cardNumber?: string
}
