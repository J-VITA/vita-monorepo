<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { UploadChangeParam, UploadProps, UploadFile } from "ant-design-vue"
import { UploadRequestOption, RcFile } from "ant-design-vue/es/vc-upload/interface"
import { Response } from "@/types"

interface CustomRequestOptions
	extends Omit<UploadRequestOption, "onError" | "onSuccess"> {
	file: RcFile
	onSuccess: (response: any, file: RcFile) => void
	onError: (error: Error) => void
}

type FileProps = {
	id?: number
	companyCode: string
	name?: string
	fileType: string
	documentedNumber?: string
	description?: string
	seq?: number
}

const { fileProps } = defineProps<{
	fileProps: FileProps
	isRead: boolean
}>()

const attachmentFileList = defineModel<Array<any>>("fileList")
const emit = defineEmits<{
	(e: "update:fileList", value: any): any
}>()

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

		await useCFetch<Response<any>>("/api/v2/files", {
			method: "POST",
			body: formData,
		})
			.then((res: Response<any>) => {
				if (res.status === 0) {
					console.log("Upload request ", res)
					const uploadedFile = res.data[0]
					const newFile: UploadFile<FileProps> = {
						id: uploadedFile.id,
						uid: uploadedFile.id,
						name: uploadedFile.name,
						status: "done",
						url: uploadedFile.downloadUrl,
						thumbUrl: uploadedFile.thumbnailUrl,
						...uploadedFile,
					}
					// onSuccess(newFile, file as RcFile);
					console.log("onSuccess called", newFile)

					// 직접 attachmentChange 호출
					attachmentChange({
						file: newFile,
						fileList: attachmentFileList.value
							? [...attachmentFileList.value, newFile]
							: [newFile],
					} as UploadChangeParam<UploadFile<FileProps>>)
				} else {
					throw new Error("업로드 실패")
				}
			})
			.catch((error) => {
				onError(error as Error)
			})
	} catch (error) {
		onError(error as Error)
		message.error("파일 업로드 실패")
	}
}

const attachmentChange = (info: UploadChangeParam<UploadFile<FileProps>>) => {
	const { file, fileList } = info
	// 파일 목록 업데이트
	// attachmentFileList.value = fileList;

	switch (file.status) {
		case "uploading":
			console.log(`${file.name} 파일 업로드 중...`)
			break

		case "done":
			console.log("attachmentChange done ", info)
			emit("update:fileList", fileList)
			message.success(`${file.name} 파일이 성공적으로 업로드되었습니다.`)
			break

		case "error":
			message.error(`${file.name} 파일 업로드에 실패했습니다.`)
			break

		case "removed":
			deleteFileFromServer(file.uid)
				.then(() => {
					message.success(`${file.name} 파일이 성공적으로 삭제되었습니다.`)
					// 삭제된 파일을 화면에서 제거
					if (attachmentFileList.value) {
						attachmentFileList.value = attachmentFileList.value.filter(
							(item) => item.uid !== file.uid
						)
						// // 업로드된 파일 목록을 상위 컴포넌트로 전달
						// emit('update:fileList', attachmentFileList.value);
					}
				})
				.catch((error) => {
					message.error(`${file.name} 파일 삭제 중 오류가 발생했습니다.`)
					console.error("파일 삭제 오류:", error)
					// 삭제 실패 시 파일 목록을 원래대로 복구
					attachmentFileList.value = attachmentFileList.value?.concat(file) || [file]
					// 업로드된 파일 목록을 상위 컴포넌트로 전달
					emit("update:fileList", attachmentFileList.value)
				})
			break

		default:
			break
	}

	// // 업로드된 파일 목록을 상위 컴포넌트로 전달
	// emit('update:fileList', attachmentFileList.value);
}

const deleteFileFromServer = async (fileUid?: number | string) => {
	if (!fileUid) throw new Error("삭제 할 대상이 아님")

	const response = await useCFetch<Response<any>>(`/api/v2/files/${fileUid}`, {
		method: "DELETE",
	}).then((res: Response<any>) => res)

	if (response.status !== 0) {
		throw new Error("파일 삭제 실패")
	}
}
</script>

<template>
	<a-descriptions
		:column="1"
		:colon="false"
		:labelStyle="{ width: '20%' }"
		:contentStyle="{ width: '80%' }"
	>
		<a-descriptions-item label="관련문서">
			<!-- action="/api/v2/files" -->
			<a-upload
				:custom-request="(request: any) => customUploadRequest(request)"
				:multiple="false"
				:show-upload-list="true"
				:file-list="attachmentFileList"
				@change="attachmentChange"
				accept="image/*,.pdf,.xls,.xlsx,.hwp,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				:disabled="isRead"
			>
				<template #itemRender="{ file, actions }">
					<a-space>
						<component :is="materialIcons('m', 'attach_file')"></component>
						<span :style="file.status === 'error' ? 'color: red' : ''">
							<a-typography-paragraph
								class="mb-none"
								ellipsis
								tooltip
								:style="{ width: '24rem' }"
								href="javascript:;"
								:content="file.originalName"
								@click="actions.download"
							></a-typography-paragraph>
						</span>
						<a href="javascript:;" @click="actions.remove" style="color: red">
							<delete-outlined></delete-outlined>
						</a>
					</a-space>
				</template>
				<!-- accept=".pdf, .xlsx" -->
				<a-button :icon="materialIcons('mso', 'add_circle')"> 추가 </a-button>
			</a-upload>
		</a-descriptions-item>
	</a-descriptions>
</template>
