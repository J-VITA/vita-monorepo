import RetiredButton from "../../settings/user/button/RetiredButton.vue"
import StopUseButton from "../../settings/user/button/StopUseButton.vue"
import ReuseButton from "../../settings/user/button/ReuseButton.vue"
import DeleteButton from "./crud/DeleteButton.vue"
import SaveButton from "./crud/SaveButton.vue"
import SearchButton from "./crud/SearchButton.vue"
import EditButton from "./crud/EditButton.vue"
import EaccFilterButton from "./EaccFilterButton/index.vue"
import EaccButton from "./EaccButton/index.vue"
import ExcelButton from "./ExcelButton/index.vue"

export {
	RetiredButton,
	StopUseButton,
	ReuseButton,
	DeleteButton,
	SaveButton,
	SearchButton,
	EditButton,
	EaccFilterButton,
	EaccButton,
	ExcelButton,
}

export interface DataProps {
	/** 선택한 데이터 (submit 이벤트 그대로 return) */
	data?: any | undefined | null | unknown
	/** 버튼 타입 (디폴트값 : primary) */
	type?: "primary" | "dashed" | "text" | "link" | undefined
	/** 버튼 텍스트 */
	label?: string
	/** 버튼 ghost option 선택 */
	ghost?: boolean
	/** 버튼 danger option 선택 */
	danger?: boolean
	/** 버튼 기본 사이트 선택  (디폴트값 : middle) */
	size?: "large" | "middle" | "small"
	/** 버튼 로딩 사용할 것인지 선택  (디폴트값 : false) */
	loading?: boolean
	/** Confirm Modal 을 띄울 것인지 선택 (디폴트값 : false) */
	modalOpen?: boolean
	/** icon */
	icon?: any
	/** disabled */
	disabled?: boolean
	/** content */
	content?: string | undefined
	/** modal header text */
	modalHeaderText?: string | undefined
	/** modal main alert text */
	deleteTitle?: string
}
