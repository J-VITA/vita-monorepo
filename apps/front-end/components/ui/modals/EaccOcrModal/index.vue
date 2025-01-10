<script setup lang="ts">
import * as XLSX from "xlsx"
import { materialIcons } from "@/composables/icons"
import { iwxGrid } from "@iwx/ui"
import type { GridApi, GridOptions } from "@iwx/ui"
import type { UploadChangeParam, UploadFile } from "ant-design-vue"
import { UploadRequestOption, RcFile } from "ant-design-vue/es/vc-upload/interface"
import { ColorTag } from "@/components/ui"
import { EaccFileType, EaccUploadFile, Response } from "@/types"

interface CustomRequestOptions
	extends Omit<UploadRequestOption, "onError" | "onSuccess"> {
	file: RcFile
	onSuccess: (response: any, file: RcFile) => void
	onError: (error: Error) => void
}

const show = defineModel<boolean>("show")

const { fileProps } = defineProps<{ fileProps: EaccFileType }>()

// const authStore = useAuthStore()
// const { getCompanyCode } = storeToRefs(authStore)

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()

const fileList = ref<any[]>([])

const customUploadRequest = async (options: CustomRequestOptions) => {
	const { file, onSuccess, onError } = options
	try {
		const formData = new FormData()
		const request = {
			companyCode: fileProps.companyCode,
			name: file.name,
			fileType: fileProps.fileType,
			documentedNumber: fileProps.documentedNumber,
			description: fileProps.description,
			seq: fileProps.seq,
		}
		// console.log("Upload request ", JSON.stringify(request))
		formData.append("request", JSON.stringify(request))
		formData.append("files", file)

		console.log("file ", file)

		handleChange({
			file,
			fileList: fileList.value,
		} as UploadChangeParam<EaccUploadFile<EaccFileType>>)

		// await useCFetch<Response<any>>("/api/v2/files", {
		// 	method: "POST",
		// 	params: {
		// 		storageType: "LOCAL",
		// 	},
		// 	body: formData,
		// })
		// 	.then((res: Response<any>) => {
		// 		if (res.status === 0) {
		// 			console.log("Upload request ", res)
		// 			const uploadedFile = res.data[0]
		// 			const newFile: UploadFile<EaccFileType> = {
		// 				id: uploadedFile.id,
		// 				uid: uploadedFile.id,
		// 				name: uploadedFile.name,
		// 				status: "done",
		// 				url: uploadedFile.downloadUrl,
		// 				thumbUrl: uploadedFile.thumbnailUrl,
		// 				...uploadedFile,
		// 			}
		// 			// onSuccess(newFile, file as RcFile);
		// 			console.log("onSuccess called", newFile)

		// 			// 직접 attachmentChange 호출
		// 			handleChange({
		// 				file: newFile,
		// 				fileList: fileList.value
		// 					? [...fileList.value, newFile]
		// 					: [newFile],
		// 			} as UploadChangeParam<EaccUploadFile<EaccFileType>>)
		// 		} else {
		// 			throw new Error("업로드 실패")
		// 		}
		// 	})
		// 	.catch((error) => {
		// 		onError(error as Error)
		// 	})
	} catch (error) {
		onError(error as Error)
		message.error("파일 업로드 실패")
	}
}

const handleChange = (info: UploadChangeParam) => {
	const { file, fileList } = info
	const { status } = file

	if (status === "done") {
		message.success(`${file.name}은 등록 가능한 파일 입니다.`)
	} else if (status === "error") {
		message.error(`${file.name}은 등록 불가한 파일 입니다.`)
	} else {
		console.log("status ", status)
	}
}

const onCancel = () => {
	show.value = false
	fileList.value.length = 0
}

const onSubmit = async () => {
	console.log("onSubmit", fileList.value)
}
</script>

<template>
	<a-modal
		centered
		v-model:open="show"
		title="영수증 자동 인식"
		:mask-closable="false"
		:keyboard="false"
		:destroy-on-close="true"
		@cancel="onCancel"
	>
		<div class="text-center"></div>
		<a-upload-dragger
			:custom-request="(request: any) => customUploadRequest(request)"
			v-model:fileList="fileList"
			name="file"
			accept="image/*"
			:multiple="false"
			:max-count="1"
			@change="handleChange"
		>
			<component
				class="mb-sm text-primary"
				:is="materialIcons('mso', 'center_focus_strong')"
				style="font-size: 4rem"
			/>
			<a-typography-title :level="4" :content="`영수증 자동 인식`"> </a-typography-title>
			<a-typography-text>
				영수증 이미지를 끌어오거나 클릭해서 업로드하세요.
			</a-typography-text>
		</a-upload-dragger>
		<template #footer>
			<a-button @click="onCancel">취소</a-button>
			<a-button type="primary" @click="onSubmit"> 다음 </a-button>
		</template>
	</a-modal>
</template>
