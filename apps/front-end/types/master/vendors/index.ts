import type { IAddr, Search } from "@/types"

export interface IParams {
	type: string
	keyword: string
	vendorTypeCode: string //'AP' | 'AR' | 'APAR';
	used: string
	vendorFlag: boolean //일반 거래처 여부
	employeeVendorFlag: boolean //임직원 거래처 여부
}
export type FilterParams = Partial<IParams>

export type SearchParams = Omit<Search, "searchYearMonthFrom" | "searchYearMonthTo"> &
	Partial<IParams>

export type Vendor = {
	id: number | string | undefined
	companyCode: string
	code: string
	name: string
	businessRegistrationNumber: string
	subBusinessRegistrationNumber: string
	vendorType: string
	vendorTypeName: string
	vendorTypeLabel: string
	countryType: string
	countryTypeName: string
	countryTypeLabel: string
	representativeName: string
	businessType: string
	businessCondition: string
	address: Partial<IAddr> & {
		detailAddr: string
		engAddr1: string
		engAddr2: string
		jibunAddr: string
		roadAddr: string
		zonecode: string
	}
	telNumber: string
	used: boolean
	description: string
	paymentTerms: string
	employeeVendorNumber?: string
	vendorFlag?: boolean
	employeeVendorFlag?: boolean
	apTermsOfPayment: string
	arTermsOfPayment: string
}
export type VendorType = Partial<Vendor> & Vendor
