import type { Response, CommonCode } from "@/types"

import type { ExpensesCodeType } from "@/types/expenses"

/**
 * 전표작성을 위해 타입유형에 따라 유형데이터 호출 API (조회성 데이터)
 * @returns
 */
export const useExpenseTypes = () => {
	const allItemField = { label: "전체", code: "", used: true, name: "" }

	/**
	 * 전표유형 리스트
	 * @returns
	 */
	const getExpenseType = async (type: ExpensesCodeType) => {
		return await Promise.resolve(
			useIFetch<Response<Array<CommonCode>>>(
				`/api/v2/slips/expenses/types/${stringToCamelCase(type)}`,
				{
					method: "GET",
				}
			)
				.then((res: any) => res.data.value)
				.then((res: Response<Array<CommonCode>>) => {
					if (res.data && res.data.length > 0) res.data.unshift(allItemField)
					return res.data || []
				}) || []
		)
	}

	return {
		getExpenseType,
	}
}
