import type { Ref } from "vue"

import koKR from "ant-design-vue/es/locale/ko_KR"
import enUS from "ant-design-vue/es/locale/en_US"
import frFR from "ant-design-vue/es/locale/fr_FR"
import jaJP from "ant-design-vue/es/locale/ja_JP"
import esES from "ant-design-vue/es/locale/es_ES"
import zhCN from "ant-design-vue/es/locale/zh_CN"
import { _formatNumberCommas } from "@iwx/ui"

/**
 * useI18n is used to provide translations for the language
 * @returns
 */
export const useLocale = () => {
	return useI18n()
}

/**
 * default locale
 * meta server 의 경우 요청 헤더에서 가져옴
 * meta client 의 경우 window navigator 에서 가져옴
 * @param fallback
 * @returns
 */
export const useDefaultLocale = (fallback = "ko") => {
	const locale = ref(fallback)
	if (import.meta.server) {
		const reqLocale = useRequestHeaders()["accept-language"]?.split(",")[0]
		if (reqLocale) {
			locale.value = reqLocale
			// setLocale(reqLocale)
		}
	} else if (import.meta.client) {
		const navLang = navigator.language
		if (navLang) {
			locale.value = navLang
			// setLocale(navLang)
		}
	}
	return locale
}

/**
 * 다국어 처리를 위한 국가별 리스트
 * 국가별 코드 : http://www.lingoes.net/en/translator/langcode.htm
 * @returns
 */
export const useLocales = () => {
	const locales = ref([
		{ key: "ko", value: "대한민국", locale: koKR, currency: "KRW" },
		{ key: "en", value: "미국", locale: enUS, currency: "USD" },
		{ key: "fr", value: "프랑스", locale: frFR, currency: "EUR" },
		{ key: "ja", value: "일본", locale: jaJP, currency: "JPY" },
		{ key: "es", value: "스페인", locale: esES, currency: "EUR" },
		{ key: "zh", value: "중국", locale: zhCN, currency: "CNY" },
	])

	return locales
}

/**
 * 현재 현지화 언어에 대한 ant locale 반환
 * ant localization language : https://antdv.com/components/date-picker#localization
 * @param {string} loc
 * @returns
 */
export const useAntLocale = (loc: string) => {
	return useLocales()
		.value.filter((locale) => locale.key === loc)
		.map((locale) => locale.locale)[0]
}

export const useLocaleDate = (date: Ref<Date> | Date, t = useI18n()) => {
	return computed(() =>
		new Intl.DateTimeFormat(t.locale.value, { dateStyle: "full" }).format(unref(date))
	)
}

/**
 * 통화 포맷팅 함수
 * 주어진 금액을 지정된 통화와 로케일에 맞게 포맷팅
 *
 * @param amount 포맷팅할 금액
 * @param currency 사용할 통화 코드 (예: 'USD', 'EUR', 'KRW'). 지정하지 않으면 로케일의 기본 통화를 사용
 * @param localeKey 사용할 로케일 키 (예: 'en', 'ko', 'ja'). 지정하지 않으면 기본 로케일을 사용
 * @returns 포맷팅된 통화 문자열
 *
 * @example
 * formatCurrency(1000); // 기본 로케일과 통화 사용
 * formatCurrency(1000, 'USD'); // 기본 로케일에 USD 통화 사용
 * formatCurrency(1000, undefined, 'en'); // 영어 로케일과 해당 로케일의 기본 통화 사용
 * formatCurrency(1000, 'EUR', 'fr'); // 프랑스어 로케일에 EUR 통화 사용
 */
export const formatCurrency = (
	amount: number,
	currency?: string,
	localeKey?: string
): string => {
	const locales = useLocales()
	const defaultLocale = locales.value[0] // 기본값으로 첫 번째 로케일 사용

	const selectedLocale = localeKey
		? locales.value.find((l) => l.key === localeKey)
		: defaultLocale

	if (!selectedLocale) {
		console.error(`Locale not found for key: ${localeKey}`)
		// 로케일을 찾지 못한 경우 기본 로케일 사용
		return new Intl.NumberFormat(defaultLocale.key, {
			style: "currency",
			currency: currency || defaultLocale.currency,
		}).format(amount)
	}

	if (currency === "KRW") {
		return _formatNumberCommas(amount, ",", "")
	}

	return new Intl.NumberFormat(selectedLocale.key, {
		style: "currency",
		currency: currency || selectedLocale.currency,
	}).format(amount)
}
