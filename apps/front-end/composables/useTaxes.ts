import type { RequestParams, Response } from "@/types"

export const useTaxes = () => {
	type TaxRequestPrams = {
		companyCode: string
		keyword: string
	}

	const tax = async (params: RequestParams<TaxRequestPrams>) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/master/taxes`, {
				method: "GET",
				params,
			}).then((res: Response<any>) => res)
		)
	}

	return {
		tax,
	}
}
