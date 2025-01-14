<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { UploadChangeParam, UploadProps, UploadFile } from "ant-design-vue"
import { UploadRequestOption, RcFile } from "ant-design-vue/es/vc-upload/interface"
import { EaccUploadFile, EaccFileType, Response } from "@/types"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { createVNode } from "vue"

interface CustomRequestOptions
	extends Omit<UploadRequestOption, "onError" | "onSuccess"> {
	file: RcFile
	onSuccess: (response: any, file: RcFile) => void
	onError: (error: Error) => void
}

const { fileProps } = defineProps<{
	fileProps: EaccFileType
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
			params: {
				storageType: "LOCAL",
			},
			body: formData,
		})
			.then((res: Response<any>) => {
				if (res.status === 0) {
					console.log("Upload request ", res)
					const uploadedFile = res.data[0]
					const newFile: UploadFile<EaccFileType> = {
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
					} as UploadChangeParam<EaccUploadFile<EaccFileType>>)
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

const attachmentChange = (info: UploadChangeParam<EaccUploadFile<EaccFileType>>) => {
	const { file, fileList } = info

	console.log("attachmentChange > ", info)
	// 파일 목록 업데이트
	// attachmentFileList.value = fileList;

	switch (file.status) {
		case "uploading":
			console.log(`${file.originalName} 파일 업로드 중...`)
			break

		case "done":
			console.log("attachmentChange done ", info)
			emit("update:fileList", fileList)
			message.success(`${file.originalName} 파일이 성공적으로 업로드되었습니다.`)
			break

		case "error":
			message.error(`${file.originalName} 파일 업로드에 실패했습니다.`)
			break

		case "removed":
			deleteFileFromServer(file.uid)
				.then(() => {
					message.success(`${file.originalName} 파일이 성공적으로 삭제되었습니다.`)
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
					message.error(`${file.originalName} 파일 삭제 중 오류가 발생했습니다.`)
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

const handleRemove = () => {
	// fileList.value = [];
	if (attachmentFileList.value && attachmentFileList.value.length > 0) {
		const file = attachmentFileList.value[0]
		Modal.confirm({
			title: "삭제하시겠습니까?",
			icon: createVNode(ExclamationCircleOutlined),
			okText: "확인",
			cancelText: "취소",
			onOk() {
				deleteFileFromServer(file.uid)
					.then(() => {
						message.success(`${file.originalName} 파일이 성공적으로 삭제되었습니다.`)
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
						message.error(`${file.originalName} 파일 삭제 중 오류가 발생했습니다.`)
						console.error("파일 삭제 오류:", error)
						// 삭제 실패 시 파일 목록을 원래대로 복구
						attachmentFileList.value = attachmentFileList.value?.concat(file) || [file]
						// 업로드된 파일 목록을 상위 컴포넌트로 전달
						emit("update:fileList", attachmentFileList.value)
					})
			},
			onCancel() {
				console.log("Cancel")
			},
		})
	}
}

const handleDownload = async () => {
	if (attachmentFileList.value && attachmentFileList.value.length > 0) {
		const file = attachmentFileList.value[0]

		try {
			console.log("downloaded file: ", file)
			// API를 통해 파일 다운로드
			const response = await useCFetch<Blob>(`/api/v2/files/download/${file.name}`, {
				method: "GET",
				responseType: "blob",
				params: {
					fileName: file.name,
					// id: file.uid,
					// companyCode: fileProps.companyCode,
					// name: file.name,
					// fileType: fileProps.fileType,
					// documentedNumber: fileProps.documentedNumber,
					// description: fileProps.description,
					// seq: fileProps.seq,
				},
			})

			if (!response) {
				throw new Error("파일 다운로드 실패")
			}

			// 파일 이름 세팅
			const fileName = file?.originalName || file?.name || "download"

			// 파일 다운로드
			const url = window.URL.createObjectURL(response)
			const link = document.createElement("a")
			link.href = url
			link.download = fileName
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			window.URL.revokeObjectURL(url)

			message.success(`${fileName} 파일 다운로드를 시작합니다.`)
		} catch (error) {
			console.error("다운로드 오류:", error)
			message.error("파일 다운로드 중 오류가 발생했습니다.")
		}
	} else {
		message.warning("다운로드할 파일이 없습니다.")
	}
}
</script>

<template>
	<a-upload
		v-if="fileProps.fileType === 'BOARD'"
		:custom-request="(request: any) => customUploadRequest(request)"
		:multiple="true"
		:show-upload-list="true"
		:file-list="attachmentFileList"
		@change="attachmentChange"
		accept="image/*,.pdf"
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
						:style="{ width: '24rem', cursor: 'pointer' }"
						href="javascript:;"
						:content="file.originalName"
						@click="handleDownload"
					></a-typography-paragraph>
					<!-- @click="actions.download" -->
				</span>
				<a href="javascript:;" @click="handleRemove" style="color: red">
					<!-- @click="actions.remove" -->
					<delete-outlined></delete-outlined>
				</a>
			</a-space>
		</template>
		<a-button :icon="materialIcons('mso', 'file_upload')"> 파일업로드 </a-button>
	</a-upload>
	<a-descriptions
		v-else
		:column="1"
		:colon="false"
		:labelStyle="{ width: '20%' }"
		:contentStyle="{ width: '80%' }"
	>
		<a-descriptions-item label="첨부파일">
			<!-- action="/api/v2/files" -->
			<a-upload
				:custom-request="(request: any) => customUploadRequest(request)"
				:multiple="false"
				:show-upload-list="true"
				:file-list="attachmentFileList"
				@change="attachmentChange"
				accept="image/*,.pdf"
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
								:style="{ width: '24rem', cursor: 'pointer' }"
								href="javascript:;"
								:content="file.originalName"
								@click="handleDownload"
							></a-typography-paragraph>
							<!-- @click="actions.download" -->
						</span>
						<a href="javascript:;" @click="handleRemove" style="color: red">
							<!-- @click="actions.remove" -->
							<delete-outlined></delete-outlined>
						</a>
					</a-space>
				</template>
				<a-button :icon="materialIcons('mso', 'add_circle')"> 추가 </a-button>
			</a-upload>
		</a-descriptions-item>
	</a-descriptions>
</template>
