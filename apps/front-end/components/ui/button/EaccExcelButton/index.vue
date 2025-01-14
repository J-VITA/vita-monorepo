<script lang="ts" setup>
import { DataProps } from ".."
import { materialIcons } from "@/composables/icons"
import * as XLSX from "xlsx"

type ResultType<T> = Partial<T>
interface ExcepOptionsProps<T> extends DataProps {
	options?: T
	reqType: "upload" | "download"
	sampleFileKey?: string
	url?: string
	fileName?: string
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
	fileName,
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

const downloadExcel = (data: any) => {
	// Step 1: JSON 데이터를 워크시트로 변환
	const worksheet = XLSX.utils.json_to_sheet(data)

	// Step 2: 워크북 생성 및 워크시트 추가
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

	// Step 3: 엑셀 파일 생성 및 다운로드
	XLSX.writeFile(workbook, `${fileName}.xlsx`)
}

const buttonClick = () => {
	if (reqType === "upload") {
		// upload code here
		console.log("upload")
		uploadModalshow.value = true
	}
	if (reqType === "download") {
		// download code here
		console.log("download")
		downloadExcel(excelData.value)
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
