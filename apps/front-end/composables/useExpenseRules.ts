import type { Response, KeyLabel, SlipType, E_MONTH_KEYS, E_DAYS_KEYS } from "@/types"
import { E_MONTH, E_DAYS } from "@/types"

import type { Data } from "@/types/master/config"
import dayjs from "dayjs"
import { SubCode } from "@/types/settings/codes"

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
						`/api/v2/masters/expenseRules/${getCompanyCode.value}`,
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
	 * @returns
	 */
	const getCommonCodeRule = async () => {
		const abortCtr = new AbortController()
		return getCompanyCode.value
			? ((await Promise.resolve(
					useCFetch<Response<Array<SubCode>>>(`/api/v2/settings/codes/subCodes/select`, {
						method: "GET",
						params: {
							companyCode: getCompanyCode.value,
							groupCode: "PAY_TERM_CD",
							used: true,
							remarkFlag: true,
						},
						cache: "no-cache",
						signal: abortCtr.signal,
					}).then((res: Response<Array<SubCode>>) => (res ? res : {}))
				).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Array<SubCode>>)
			: ((await Promise.resolve({} as Response<Array<SubCode>>).finally(() => {
					if (abortCtr) {
						abortCtr.abort()
					}
				})) as Response<Array<SubCode>>)
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
		const getMonthValue = (key?: E_MONTH_KEYS | string): E_MONTH =>
			E_MONTH[key as E_MONTH_KEYS]
		const getDayValue = (key?: E_DAYS_KEYS | string): E_DAYS => E_DAYS[key as E_DAYS_KEYS]

		const rules = await getRules().then((res: Response<Data>) => res.data)
		if (!rules) return

		// 공통 코드 규칙 조회 함수
		const getSubCodeConfig = async (slipType: string) => {
			const subCodeDate = await getCommonCodeRule().then(
				(res: Response<Array<SubCode>>) => res.data
			)
			if (!subCodeDate) return

			const subCode = subCodeDate.find((code: SubCode) =>
				code.remark3.split(",").includes(slipType)
			)

			if (!subCode) return

			const month =
				subCode.remark1 === "1"
					? getMonthValue("THAT_MONTH")
					: subCode.remark1 === "2"
						? getMonthValue("NEXT_MONTH")
						: Number(subCode.remark1)

			const day = subCode.remark2 === "31" ? getDayValue("LAST") : Number(subCode.remark2)

			const flag =
				subCode.remark1 === "0" && subCode.remark2 === "0" && subCode.code !== "IMM"

			return { month, day, flag }
		}

		// 전표 유형별 처리
		const paymentConfig = {
			PERSONAL_EXPENSE: () => {
				if (rules.personalExpensePaymentDateFlag) {
					return {
						month: getMonthValue(rules.personalExpensePaymentTypeName),
						day: getDayValue(rules.personalExpensePaymentDayName),
						flag: rules.personalExpenseWriteFlag,
					}
				}
				return getSubCodeConfig("PERSONAL_EXPENSE")
			},
			CARD: () => {
				if (rules.corporateCreditCardPaymentDateFlag) {
					return {
						month: getMonthValue(rules.corporateCreditCardPaymentTypeName),
						day: getDayValue(rules.corporateCreditCardPaymentDayName),
						flag: false,
					}
				}
				return getSubCodeConfig("CARD")
			},
			E_TAX_INVOICE: () => {
				if (rules.billInvoicePaymentDateFlag) {
					return {
						month: getMonthValue(rules.billInvoicePaymentTypeName),
						day: getDayValue(rules.billInvoicePaymentDayName),
						flag: rules.billInvoiceWriteFlag,
					}
				}
				return getSubCodeConfig("E_TAX_INVOICE")
			},
			TAX_INVOICE: () => {
				if (rules.billInvoicePaymentDateFlag) {
					return {
						month: getMonthValue(rules.billInvoicePaymentTypeName),
						day: getDayValue(rules.billInvoicePaymentDayName),
						flag: rules.billInvoiceWriteFlag,
					}
				}
				return getSubCodeConfig("TAX_INVOICE")
			},
		}

		const result = paymentConfig[slipType as keyof typeof paymentConfig]()
		if (!result) {
			throw new Error(
				"경비규정 설정이 되어있지 않습니다. 직접 설정하시거나, 담당자에게 문의하여주세요."
			)
		}

		return result
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
