import type { Response, KeyLabel, SlipType } from "@/types"
import type { Data } from "@/types/master/config"
import dayjs from "dayjs"

export const E_MONTH = {
	THAT_MONTH: dayjs().month() + 1,
	NEXT_MONTH: dayjs().add(1, "month").month() + 1,
}
// E_MONTH 객체의 값 타입 정의
export type E_MONTH = (typeof E_MONTH)[keyof typeof E_MONTH]
// E_MONTH 객체의 키 타입 정의
export type E_MONTH_KEYS = keyof typeof E_MONTH

export const E_DAYS = {
	ONE: 1,
	TWO: 2,
	THREE: 3,
	FOUR: 4,
	FIVE: 5,
	SIX: 6,
	SEVEN: 7,
	EIGHT: 8,
	NINE: 9,
	TEN: 10,
	ELEVEN: 11,
	TWELVE: 12,
	THIRTEEN: 13,
	FOURTEEN: 14,
	FIFTEEN: 15,
	SIXTEEN: 16,
	SEVENTTEEN: 17,
	EIGHTEEN: 18,
	NINETEEN: 19,
	TWENTY: 20,
	TWENTY_ONE: 21,
	TWENTY_TWO: 22,
	TWENTY_THREE: 23,
	TWENTY_FOUR: 24,
	TWENTY_FIVE: 25,
	TWENTY_SIX: 26,
	TWENTY_SEVEN: 27,
	TWENTY_EIGHT: 28,
	LAST: dayjs().endOf("month").date(),
}

// E_DAYS 객체의 값 타입 정의
export type E_DAYS = (typeof E_DAYS)[keyof typeof E_DAYS]
// E_DAYS 객체의 키 타입 정의
export type E_DAYS_KEYS = keyof typeof E_DAYS

export const useExpenseRules = () => {
	const authStore = useAuthStore()
	const { getCompanyCode } = storeToRefs(authStore)
	/**
	 * 경비규정관리 전체 조회
	 * @returns
	 */
	const getRules = async () => {
		const abortCtr = new AbortController()
		return getCompanyCode.value
			? ((await Promise.resolve(
					useCFetch<Response<Data>>(
						`/api/v2/slips/commons/expenseRules/${getCompanyCode.value}`,
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
	 * 경비규정관리 상신 날짜 체크
	 * @returns
	 */
	const checkApprovalLimit = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)

		if (rules) {
			if (!rules.approvalLimitFlag) {
				return false
			}
			//현재 일자 가져오기
			const currentDay = dayjs().get("D")
			// 시작일과 종료일 설정
			const startDay = rules.approvalLimitStartDayValue || 0
			const endDay = rules.approvalLimitEndDayValue || 0

			// 현재 월의 마지막 날 계산
			const lastDayOfMonth: number = dayjs().endOf("month").date()

			// 실제 비교에 사용할 종료일 계산 (0인 경우 마지막 날로 변경)
			const actualEndDay: number = endDay === 0 ? lastDayOfMonth : endDay

			// 실제 비교에 사용할 시작일 계산 (0인 경우 마지막 날로 변경)
			const actualStartDay: number = startDay === 0 ? lastDayOfMonth : startDay

			// 조건 확인
			if (
				// 시작일과 종료일 사이에 현재 일자가 포함되는 경우
				(actualStartDay <= actualEndDay &&
					currentDay >= actualStartDay &&
					currentDay <= actualEndDay) ||
				// 시작일이 종료일보다 큰 경우 (월을 넘어가는 경우)
				(actualStartDay > actualEndDay &&
					(currentDay >= actualStartDay || currentDay <= actualEndDay))
			) {
				return true
			} else {
				return false
			}
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 계정/비용항목 입력방식
	 * @returns
	 */
	const checkAccountInputMethod = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			if (rules.accountInputMethodFlag) {
				//계정/비용항목 입력방식 활성화
				return {
					key: rules.accountInputMethodTypeName,
					label: rules.accountInputMethodTypeLabel,
				} as KeyLabel
			} else {
				return { key: "", label: "" } as KeyLabel
			}
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 전표 자동확정 설정
	 * @description 지출유형별로 결재문서가 완료되는 시점 전표내역을 자동 확정 처리하는 Flag
	 * @returns
	 */
	const checkSlipAutoConfirmation = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			return rules.slipAutoConfirmationFlag
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 회계기간 마감 알림
	 * @description 해당월에 경비처리가 마감되면 소속된 사업장 전체사용자에게 알림이 발생 플래그
	 * @returns
	 */
	const checkCloseNotification = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			return rules.closeNotificationFlag
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 사내 규정집 등록
	 * @description 사내 규정집을 다운로드 가능 플래그
	 * @returns
	 */
	const checkManual = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			return rules.manualFlag
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 개인경비 영수증 필수 등록
	 * @description 개인경비 영수증 필수 등록 가능 플래그
	 * @returns
	 */
	const checkPersonalExpenseReceipt = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			return rules.personalExpenseReceiptFlag
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 개인경비 가맹점 필수 등록
	 * @description 개인경비 가맹점 필수 등록 가능 플래그
	 * @returns
	 */
	const checkPersonalExpenseVendor = async () => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			return rules.personalExpenseVendorFlag
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 첨부파일 업로드 사용 (지출유형)
	 * @description 지출유형별 업로드 사용하는지 결정
	 * @returns
	 */
	const checkExpenseFile = async (slipType: SlipType) => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			if (rules.expenseFileFlag) {
				return rules.expenseFileList?.includes(slipType)
			} else {
				return false
			}
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 관련문서 업로드 사용 (지출유형)
	 * @description 지출유형별 업로드 사용하는지 결정
	 * @returns
	 */
	const checkExpenseDoc = async (slipType: SlipType) => {
		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			if (rules.expenseDocFlag) {
				return rules.expenseDocList?.includes(slipType)
			} else {
				return false
			}
		}

		throw new Error(
			"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
		)
	}

	/**
	 * 출금/지급 예정일 표시 여부
	 * @description 지급날짜를 설정값으로 의해 데이터 세팅 할 수 있도록 @return { day: number, month: number } 로 반환, 설정값이 없으면 null
	 * @param slipType
	 * @returns
	 */
	const checkPaymentDate = async (slipType: SlipType) => {
		const getMonthValue = (key?: E_MONTH_KEYS | string): E_MONTH => {
			return E_MONTH[key as E_MONTH_KEYS]
		}

		const getDayValue = (key?: E_DAYS_KEYS | string): E_DAYS => {
			return E_DAYS[key as E_DAYS_KEYS]
		}

		const rules = await Promise.resolve(
			getRules().then((res: Response<Data>) => res.data)
		)
		if (rules) {
			const currentMonth: number = dayjs().month() + 1
			const nextMonth: number = dayjs().add(1, "month").month() + 1

			if (slipType === "PERSONAL_EXPENSE") {
				if (rules.personalExpensePaymentDateFlag) {
					const month = getMonthValue(rules.personalExpensePaymentTypeName)
					const day = getDayValue(rules.personalExpensePaymentDayName)
					const flag = rules.personalExpenseWriteFlag
					return {
						month,
						day,
						flag,
					}
				}
			}

			//카드
			if (slipType === "CARD") {
				if (rules.corporateCreditCardPaymentDateFlag) {
					const month = getMonthValue(rules.corporateCreditCardPaymentTypeName)
					const day = getDayValue(rules.corporateCreditCardPaymentDayName)
					// const flag = rules.corporateCreditCardPaymentWriteFlag;
					const flag = false
					return {
						month,
						day,
						flag,
					}
				}
			}

			//전자세금계산서, 수기세금계산서
			if (["E_TAX_INVOICE", "TAX_INVOICE"].includes(slipType)) {
				if (rules.billInvoicePaymentDateFlag) {
					const month = getMonthValue(rules.billInvoicePaymentTypeName)
					const day = getDayValue(rules.billInvoicePaymentDayName)
					const flag = rules.billInvoiceWriteFlag
					return {
						month,
						day,
						flag,
					}
				}
			}

			throw new Error(
				"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
			)
		}
	}

	return {
		getRules,
		checkApprovalLimit,
		checkAccountInputMethod,
		checkSlipAutoConfirmation,
		checkCloseNotification,
		checkManual,
		checkPersonalExpenseReceipt,
		checkPersonalExpenseVendor,
		checkExpenseDoc,
		checkExpenseFile,
		checkPaymentDate,
	}
}
