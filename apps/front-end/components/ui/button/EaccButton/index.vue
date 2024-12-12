<script lang="ts" setup>
import {
	RetiredButton,
	DeleteButton,
	EditButton,
	SaveButton,
	SearchButton,
	StopUseButton,
	ReuseButton,
} from "../index"

interface DataProps {
	componentIs: "delete" | "edit" | "save" | "search" | "stopUse" | "reuse" | "retire"
	/** 선택한 데이터 (submit 이벤트 그대로 return) */
	data?: any | undefined | null | unknown
	/** 버튼 타입 (디폴트값 : primary) */
	type?: "primary" | "dashed" | "text" | "link"
	/** 버튼 텍스트 (디폴트값 : 삭제) */
	label?: string
	/** 버튼 ghost option 선택 (디폴트값 : false) */
	ghost?: boolean
	/** 버튼 danger option 선택 (디폴트값 : false) */
	danger?: boolean
	/** 버튼 기본 사이트 선택  (디폴트값 : middle) */
	size?: "large" | "middle" | "small" | undefined
	/** 버튼 로딩 사용할 것인지 선택  (디폴트값 : false) */
	loading?: boolean
	/** Confirm Modal 을 띄울 것인지 선택 (디폴트값 : false) */
	modalOpen: boolean
	/** icon */
	icon?: any
	/** disabled */
	disabled?: boolean
}

const props = withDefaults(defineProps<DataProps>(), {
	componentIs: "search",
	type: "primary",
	ghost: false,
	danger: false,
	size: "middle",
	modalOpen: false,
})

const params = ref({
	type: "primary",
	ghost: false,
	danger: false,
	size: "middle",
	modalOpen: false,
})

const componentName = computed(() => {
	if (props.componentIs == "delete") {
		params.value.danger = true
		params.value.ghost = true
		return DeleteButton
	} else if (props.componentIs == "edit") {
		params.value.danger = false
		params.value.ghost = false
		return EditButton
	} else if (props.componentIs == "save") {
		params.value.danger = false
		params.value.ghost = false
		return SaveButton
	} else if (props.componentIs == "stopUse") {
		params.value.danger = true
		params.value.ghost = true
		return StopUseButton
	} else if (props.componentIs == "reuse") {
		params.value.danger = false
		params.value.ghost = true
		return ReuseButton
	} else if (props.componentIs == "retire") {
		params.value.danger = true
		params.value.ghost = true
		return RetiredButton
	} else {
		params.value.danger = false
		params.value.ghost = false
		return SearchButton
	}
})

const emit = defineEmits<{
	(e: "click", value: any): void
}>()

const dataProcessing = (items: Array<string> | undefined) => {
	if (props.componentIs === "retire") return emit("click", items)
	return emit("click", props.data)
}
</script>

<template>
	<component
		:is="componentName"
		:data="props.data"
		:label="props.label"
		:type="props.type"
		:ghost="params.ghost"
		:danger="params.danger"
		:disabled="props.disabled"
		:size="props.size"
		:loading="props.loading"
		:modal-open="props.modalOpen"
		:icon="props.icon"
		@click="dataProcessing"
	></component>
</template>
