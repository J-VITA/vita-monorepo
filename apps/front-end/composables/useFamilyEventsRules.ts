import { E_MONTH, E_DAYS, Response, SlipFormType } from "@/types"
import type { E_MONTH_KEYS, E_DAYS_KEYS } from "@/types"
import type { Data } from "@/types/master/config"

export const useFamilyEventsRules = () => {
	const authStore = useAuthStore()
	const { getCompanyCode } = storeToRefs(authStore)
	/**
	 * 경조금 규정 정보 전체 조회
	 * @returns
	 */
	const getRules = async () => {
		const abortCtr = new AbortController()
		return getCompanyCode.value
			? ((await Promise.resolve(
					useCFetch<Response<Data>>(
						`/api/v2/familyEvents/requests/expenseRules/${getCompanyCode.value}`,
						{
							method: "GET",
							params: {
								companyCode: getCompanyCode.value,
							},
							cache: "no-cache",
							signal: abortCtr.signal,
						}
					).then((res: Response<Data>) => (res ? res : {}))
				).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Data>)
			: ((await Promise.resolve({} as Response<Data>).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Data>)
	}

	/**
	 * 공통코드 지급 예정일
	 * TODO: 공통코드로 조회해서 지급예정일 함수에 적용해야함. 그룹코드 :PAY_TERM_CD 로 사용해야할 듯...
	 * @returns
	 */
	const getCommonCodeRule = async () => {
		const abortCtr = new AbortController()
		return getCompanyCode.value
			? ((await Promise.resolve(
					useCFetch<Response<Data>>(
						`/api/v2/settings/codes/subCodes/select/${getCompanyCode.value}`,
						{
							method: "GET",
							params: {
								companyCode: getCompanyCode.value,
							},
							cache: "no-cache",
							signal: abortCtr.signal,
						}
					).then((res: Response<Data>) => (res ? res : {}))
				).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Data>)
			: ((await Promise.resolve({} as Response<Data>).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Data>)
	}

	/**
	 * 경조금 지급 예정일 표시 여부
	 * @description 지급날짜를 설정값으로 의해 데이터 세팅 할 수 있도록 @return { day: number, month: number } 로 반환, 설정값이 없으면 null
	 * @param slipType
	 * @returns
	 */
	const checkPaymentDate = async () => {
		const getMonthValue = (key?: E_MONTH_KEYS | string): E_MONTH => {
			return E_MONTH[key as E_MONTH_KEYS]
		}

		const getDayValue = (key?: E_DAYS_KEYS | string): E_DAYS => {
			return E_DAYS[key as E_DAYS_KEYS]
		}

		try {
			const rules = await Promise.resolve(
				getRules().then((res: Response<Data>) => res.data)
			)
			if (rules) {
				if (rules.personalExpensePaymentDateFlag) {
					const month = getMonthValue(rules.familyEventPaymentTypeName)
					const day = getDayValue(rules.familyEventPaymentDayName)
					const flag = rules.familyEventPaymentDateFlag

					return {
						month,
						day,
						flag,
					}
				} else {
					return {
						month: null,
						day: null,
						flag: false,
					}
				}
			}
		} catch (e) {
			throw new Error(
				"경비규정(지급예정일) 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
			)
		}
	}

	return {
		getRules,
		checkPaymentDate,
	}
}
