<script lang="ts" setup>
import { DataProps } from ".."
import { materialIcons } from "@/composables/icons"

type ResultType<T> = Partial<T>
interface ExcepOptionsProps<T> extends DataProps {
	options?: T
	reqType: "upload" | "download"
	sampleFileKey?: string
	url?: string
}
const {
	reqType,
	options,
	label,
	type,
	ghost = false,
	danger = false,
	size = "middle",
	loading = false,
	disabled = false,
	content,
	modalHeaderText,
	sampleFileKey,
	url,
} = defineProps<ExcepOptionsProps<any>>()

const excelData = defineModel<ResultType<any>>("data", {
	required: false,
})

const uploadModalshow = ref<boolean>(false)

const emit = defineEmits<{
	/**
	 * 모달 또는 버튼 클릭 시 submit
	 * @param value (v-model data 반환)
	 */
	(e: "submit", value?: any): any
}>()

const buttonClick = () => {
	if (reqType === "upload") {
		// upload code here
		console.log("upload")
		uploadModalshow.value = true
	}
	if (reqType === "download") {
		// download code here
		console.log("download")
	}
}
</script>

<template>
	<a-button
		:url="url"
		:type="type"
		:ghost="ghost"
		:danger="danger"
		:size="size"
		:loading="loading"
		:icon="icon"
		:disabled="disabled"
		@click="buttonClick"
	>
		<template #icon>
			<slot v-if="$slots.icon" name="icon" />
			<template v-else>
				<component :is="materialIcons('mso', `file_${reqType}`)" />
			</template>
		</template>
		<slot v-if="$slots.label" name="label" />
		<span v-else>{{ label }}</span>
	</a-button>

	<excel-upload-modal
		v-if="url"
		:show="uploadModalshow"
		:sample-file-key="sampleFileKey"
		:url="url"
		@update:show="(value) => (uploadModalshow = value)"
		@callback="(value) => emit('submit', value)"
	/>
</template>
