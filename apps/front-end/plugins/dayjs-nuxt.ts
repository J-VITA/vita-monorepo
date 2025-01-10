import dayjs, { Dayjs } from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"
import relativeTime from "dayjs/plugin/relativeTime"
import customParseFormat from "dayjs/plugin/customParseFormat"
import "dayjs/locale/ko"
import "dayjs/locale/en"
import "dayjs/locale/fr"
import "dayjs/locale/ja"
import "dayjs/locale/es"
import "dayjs/locale/zh"

export default defineNuxtPlugin((nuxtApp) => {
	dayjs.extend(relativeTime)
	dayjs.extend(utc)
	dayjs.extend(timezone)
	dayjs.extend(customParseFormat)
	dayjs.tz.setDefault("Asia/Seoul")

	const originalDayjs = nuxtApp.$dayjs as typeof dayjs
	const customDayjs = (date: string | number | Date | Dayjs) => {
		const d = originalDayjs(date)
		return {
			...d,
			format: (template = "YYYY-MM-DDTHH:mm:ss.SSS") => d.format(template),
			toJSON: () => d.format("YYYY-MM-DDTHH:mm:ss.SSS"),
			toString: () => d.format("YYYY-MM-DDTHH:mm:ss.SSS"),
		}
	}

	nuxtApp.provide("$dayjs", dayjs)
})
