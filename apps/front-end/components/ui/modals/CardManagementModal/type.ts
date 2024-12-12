import type { Dayjs } from "dayjs"

interface ICommon {
	companyCode: string // 필수
	number: string // 필수
	name: string // 필수
	expirationYear: string // 필수
	expirationMonth: string // 필수
	accountNumber: string // 필수
	issueDate: string | Dayjs // 필수
	used: boolean
	ownerId: string | number
	userId: string | number
	vendorId: string | number
	limitAmount: number
	collectionStartDate?: string | Dayjs
	cancellationDate?: string | Dayjs
	startDate?: string | Dayjs
	endDate?: string | Dayjs
}

interface IResponse extends ICommon {
	id: number
	cardCompanyTypeName: string
	cardCompanyTypeLabel: string
	cardStatusName: string
	cardStatusLabel: string
	cardTypeName: string
	cardTypeLabel: string
	cardUseTypeName: string
	cardUseTypeLabel: string
	paymentDayName: string
	paymentDayLabel: string
	bankTypeName: string
	bankTypeLabel: string
}

interface IFormState extends ICommon {
	cardCompanyType: string // vs cardCompanyTypeName
	cardStatus: string // vs cardStatusName
	cardType: string // vs cardTypeName
	cardUseType: string // vs cardUseTypeName
	paymentDayType: string // 필수 // vs paymentDayName
	bankType: string // 필수 // vs bankTypeName
	ownerIds?: (string | number)[]
	userIds?: (string | number)[]
	usedDate?: [Dayjs, Dayjs]
	vendorIds?: (string | number)[]
}

export type ResponseItem = IResponse
export type FormState = Partial<IResponse> & IFormState

export const initialFormState: FormState = {
	companyCode: "", // 필수
	number: "", // 필수
	name: "", // 필수
	expirationYear: "", // 필수
	expirationMonth: "", // 필수
	issueDate: "",
	accountNumber: "", // 필수
	used: true,
	cardCompanyType: "",
	cardType: "",
	cardUseType: "",
	paymentDayType: "",
	bankType: "", // 필수
	limitAmount: 0, // 필수
	ownerId: 0, // 필수
	userId: 0, // 필수
	vendorId: 0, // 필수
	cardStatus: "ISSUE_READY", // 안넣으면 등록안됨
}
