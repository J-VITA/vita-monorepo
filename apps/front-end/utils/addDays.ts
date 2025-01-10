import dayjs from "dayjs"

/**
 * 현재 날짜에 월과 일 값을 더하는 함수
 * 지급예정일 계산을 위함
 *
 * @param month 월 값 (예: 2)
 * @param date 일 값 (예: 10)
 * @returns 수정된 날짜
 */
export const addMonthAndDate = (month: number, date: number): string => {
	// 현재 날짜 (Day.js)
	const currentDate = dayjs()

	// 월과 일 더하기
	const updatedDate = currentDate.month(month).date(date)
	//?? 월과 일을 왜 더하죠??
	// .add(month, "month") // 월을 더함
	// .add(date, "day") // 일을 더함

	// 수정된 날짜를 포맷하여 반환
	return updatedDate.format("YYYY-MM-DD") // 원하는 포맷으로 반환
}
