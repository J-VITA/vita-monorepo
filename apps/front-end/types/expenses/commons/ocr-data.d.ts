import { EaccFileType, EaccUploadFile } from "@/types"

export type IConstantsType = {
	keyText: string
	text: string
}
export type Price = {
	price: IConstantsType
}
type Addresses = {
	addresses: IConstantsType[]
}

type StoreInfo = {
	addresses: Addresses
	subName: IConstantsType
	name: IConstantsType
	bizNum: IConstantsType
	tel: IConstantsType[]
}

type SubTotal = {
	taxPrice: IConstantsType[]
}
type SubResultItem = {
	name: IConstantsType
	count: IConstantsType
}
type SubResults = {
	items: SubResultItem
}
type CardInfo = {
	number: IConstantsType
	company: IConstantsType
}

type PaymentInfo = {
	date: IConstantsType
	cardInfo: CardInfo
	confiemNum: IConstantsType
}

export interface ReceiptInfo {
	totalPrice: Price
	storeInfo: StoreInfo
	subTotal: SubTotal
	subResults: SubResultItem
	paymentInfo: PaymentInfo
	traceId?: string //traceId
	path?: string //path
	code?: string //오류 코드
	message?: string //오류 메세지
	timestamp?: number //오류 시간
}

export interface OcrData extends EaccUploadFile<EaccFileType> {
	fileDtos: EaccUploadFile<EaccFileType>[]
	receiptInfo: ReceiptInfo
}
