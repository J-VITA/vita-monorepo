import ko from "./locales/ko.json"
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import ja from "./locales/ja.json"
import es from "./locales/es.json"
import zh from "./locales/zh.json"

export default defineI18nConfig(() => {
	const messages = {
		ko,
		en,
		fr,
		ja,
		es,
		zh,
	}

	return {
		legacy: false,
		globalInjection: true,
		locale: "ko",
		fallbackLocale: "ko", // set fallback locale
		messages,
		numberFormats: {
			en: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "USD",
				},
			},
			fr: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "EUR",
				},
			},
			ja: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "JPY",
				},
			},
			ko: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "KRW",
				},
			},
			es: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "EUR",
				},
			},
			zh: {
				currency: {
					style: "currency",
					currencyDisplay: "symbol",
					currency: "CNY",
				},
			},
		},
	}
})
