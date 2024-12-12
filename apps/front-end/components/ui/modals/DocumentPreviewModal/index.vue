<script lang="ts" setup>
import { type FormData } from "@/types/approvals/document"

/**
 * props에 data 와 id 가 함께 존재할 수 없다 (data or id)
 * props.data 가 존재하면 신규 미리보기
 * props.id 가 존재하면 한번은 저장한 내역이 있는 문서이므로 문서아이디로 통신후 데이터를 넣으면 된다.
 */
const props = withDefaults(
	defineProps<{
		show: boolean
		data?: FormData
		id?: string | number
		completed?: boolean
	}>(),
	{
		show: false,
		completed: false,
	}
)

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})

const data = ref<any>({
	title: "",
	emergency: false,
	description: "",
	expenseList: [],
	documentInfo: {},
	attachedFiles: [],
	docRelevant: [],
})
/**
 * 결재선에서 내역을 받아서 보여주는 역할만 함.
 */
const line = ref<string>("")
const isShowHistory = ref<boolean>(false)

const onHistory = () => {
	isShowHistory.value = true
}

onBeforeUpdate(() => {
	if (props.show) {
		if (props.id) {
			// 통신 이후 데이터 뿌리기
			data.value = {
				title: "지출결의서 - 1월 비용 신청서 - 홍길동",
				emergency: false,
				approvalLineType: "1",
				description: "",
				expenseList: [],
				documentInfo: {},
				attachedFiles: [],
				docRelevant: [],
			}
		}

		if (props.data) {
			data.value = props.data
		}
	}
})
</script>
<template>
	<a-modal
		centered
		width="80%"
		v-model:open="open"
		title="문서미리보기"
		:destroy-on-close="true"
		:footer="false"
	>
		문서미리보기
	</a-modal>
</template>
