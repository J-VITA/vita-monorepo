import type { Response } from "@/types"
import { ApprovalRules } from "@/types/master/approval-flows"

export const useApprovalRules = () => {
	const authStore = useAuthStore()
	const { getCompanyCode } = storeToRefs(authStore)

	/**
	 * 결재옵션 전제조회
	 * @returns
	 */
	const getApprovalRules = async () => {
		const abortCtr = new AbortController()
		return getCompanyCode.value
			? ((await Promise.resolve(
					useCFetch<Response<ApprovalRules>>(
						`/api/v2/masters/approvalRules/${getCompanyCode.value}`,
						{
							method: "GET",
							params: {
								companyCode: getCompanyCode.value,
							},
							cache: "no-cache",
							signal: abortCtr.signal,
						}
					)
						.then((res: Response<ApprovalRules>) =>
							res
								? {
										...res,
										data: Object.assign({}, res.data, {
											agreementOptionType: res.data?.agreementOptionTypeName,
											documentModifierType: res.data?.documentModifierTypeName,
										}),
									}
								: {}
						)
						.finally(() => {
							if (abortCtr) {
								abortCtr.abort()
							}
						})
				)) as Response<ApprovalRules>)
			: ((await Promise.resolve({} as Response<ApprovalRules>).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<ApprovalRules>)
	}

	/**
	 * 합의옵션 타입
	 */
	const agreementOptions = async () => {
		return await useCFetch<Response<any>>(
			"/api/v2/masters/approvalRules/types/agreementOptionTypes",
			{
				method: "GET",
			}
		).then((res: Response<any>) => res.data.map((e: any) => ({ ...e, value: e.code })))
	}

	return {
		getApprovalRules,
		agreementOptions,
	}
}
