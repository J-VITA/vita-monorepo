<script lang="ts" setup>
const props = withDefaults(
	defineProps<{
		showed?: boolean
		title?: string
		field?: any
		size?: "small" | "large" | "medium" | "auto" | "full"
		okText?: string
		cancelText?: string
		loading?: boolean
		isThirdBtn?: boolean
		thirdBtnText?: string
		isOkBtn?: boolean
		isDanger?: boolean
	}>(),
	{
		title: "",
		field: {},
		showed: false,
		size: "auto",
		okText: "확인",
		cancelText: "닫기",
		loading: false,
		isThirdBtn: false,
		thirdBtnText: "",
		isOkBtn: true,
		isDanger: false,
	}
)

const show = ref(false)

let fields: any = {}

const width = ref<string | number>(520)

const emit = defineEmits<{
	(e: "submit", value: any): any
	(e: "closed", value?: any): void
	(e: "submitAdd", value?: any): void
}>()

const { field, showed, size } = toRefs(props)
watch([field.value, showed, size], (data) => {
	fields = data[0]
	show.value = data[1]
	if (data[2] === "small") {
		width.value = "40rem"
	} else if (data[2] === "large") {
		width.value = "80rem"
	} else if (data[2] === "medium") {
		width.value = "60rem"
	} else if (data[2] === "full") {
		width.value = "100%"
	}
})

const submit = (value: any, type?: any): void => {
	fields = {}
	type === "close" ? emit("submit", value) : emit("submitAdd", value)
}
</script>

<template>
	<!-- 
	lazy 
	:size="props.size"
    :sizes-config="{
      'default-size': props.size,
      sizes: {
        small: 500,
        medium: 650,
        large: 850,
        auto: 'max-content',
      },
    }" -->
	<a-modal
		centered
		v-model:open="show"
		:mask-closable="false"
		:title="props.title"
		:width="width"
		:destroy-on-close="true"
		@cancel="$emit('closed')"
	>
		<slot name="content" :field="fields"></slot>
		<template #footer>
			<a-button @click="$emit('closed')">
				{{ cancelText }}
			</a-button>
			<a-button
				v-if="props.isThirdBtn"
				type="primary"
				ghost
				@click="submit(fields, 'stay')"
			>
				{{ thirdBtnText }}
			</a-button>
			<a-button
				v-if="isOkBtn"
				:danger="isDanger"
				type="primary"
				:loading="loading"
				@click="submit(fields, 'close')"
			>
				{{ okText }}
			</a-button>
		</template>
	</a-modal>
</template>
