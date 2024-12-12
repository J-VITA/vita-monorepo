import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/ko"
import "dayjs/locale/en"
import "dayjs/locale/fr"
import "dayjs/locale/ja"
import "dayjs/locale/es"
import "dayjs/locale/zh"

export default defineNuxtPlugin((nuxtApp) => {
	dayjs.extend(relativeTime)
	nuxtApp.provide("$dayjs", dayjs)
})
