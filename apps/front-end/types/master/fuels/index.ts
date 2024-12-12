import type { Dayjs } from "dayjs"

interface IFuelRequestParams {
	id: number
	companyCode: string
	searchYearMonthFrom?: string | Dayjs
	searchYearMonthTo: string | Dayjs
	searchYearMonth: string | Dayjs
	gasolinePrice: number
	gasolineMileage: number
	dieselPrice: number
	dieselMileage: number
	lpgPrice: number
	lpgMileage: number
	electricPrice: number
	electricMileage: number
}

interface IFuelResponseData {
	id: number
	standardYearMonth: string
	companyCode: string
	gasolinePrice?: number
	gasolineMileage?: number
	dieselPrice?: number
	dieselMileage?: number
	lpgPrice?: number
	lpgMileage?: number
	electricPrice?: number
	electricMileage?: number
	description?: string
	updatedAt?: string
	updatedBy?: string
}
export type FormData = Partial<IFuelRequestParams>
export type FuelInfoData = Partial<IFuelResponseData>
export type Search = Partial<IFuelRequestParams> & {
	page?: number
	size?: number
}
export type FuelEventParams = Partial<IFuelRequestParams> & {
	method?: "PATCH" | "POST"
}
