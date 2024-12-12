import dayjs from "dayjs"

export const useMonth = {
	//오늘
	toDay() {
		return dayjs()
	},
	//이번달 말일
	to() {
		return dayjs().endOf("M")
	},
	//오늘날짜의 마지막 시간
	todayEnd() {
		return dayjs().endOf("day").subtract(1, "millisecond")
	},
	//내일
	tomorrow() {
		return dayjs().add(1, "day").startOf("day")
	},
	//이번달 초
	from() {
		return dayjs().startOf("M")
	},
	//해당월에 말일
	lastTo(month?: number) {
		return dayjs()
			.subtract(month ? month : 1, "M")
			.endOf("M")
	},
	//해당월에 초
	lastFrom(month?: number) {
		return dayjs()
			.subtract(month ? month : 1, "M")
			.startOf("M")
	},
}
