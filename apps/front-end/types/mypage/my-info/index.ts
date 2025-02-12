import { Dayjs } from "dayjs"

export interface UserInfo {
	id: number
	loginId?: string
	password?: number
	name?: string
	employeeNumber?: number
	companyName?: string
	workplaceName?: string
	departmentName?: string
	costCenterName?: string
	positionName?: string
	jobTitleName?: string
	role?: string
	email?: string
	phoneNumber?: number
	mobileNumber?: number
	joinedDate?: string | Dayjs
}

export const infoLableType = [
	{ label: "아이디", value: "loginId" },
	{ label: "비밀번호", value: "password" },
	{ label: "이름", value: "name" },
	{ label: "사번", value: "employeeNumber" },
	{ label: "회사", value: "companyName" },
	{ label: "사업장", value: "workplaceName" },
	{ label: "부서", value: "departmentName" },
	{ label: "코스트센터", value: "costCenterName" },
	{ label: "직위", value: "positionName" },
	{ label: "직책", value: "jobTitleName" },
	{ label: "권한", value: "role" },
	{ label: "이메일", value: "email" },
	{ label: "회사전화", value: "phoneNumber" },
	{ label: "연락처", value: "mobileNumber" },
	{ label: "입사일", value: "joinedDate" },
	{ label: "", value: "" },
] as { label: string; value: keyof UserInfo }[]

export const notifyType = [
	{ label: "결재완료", value: "COMPLETE", color: "green", icons: "check_circle" },
	{ label: "결재반려", value: "APPROVAL_RETURN", color: "red", icons: "cancel" },
]
