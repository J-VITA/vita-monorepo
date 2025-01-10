<script setup lang="ts">
import * as XLSX from "xlsx"
import { materialIcons } from "@/composables/icons"
import { iwxGrid } from "@iwx/ui"
import type { GridApi, GridOptions } from "@iwx/ui"
import type { UploadChangeParam } from "ant-design-vue"
import { UploadRequestOption, RcFile } from "ant-design-vue/es/vc-upload/interface"
import { ColorTag } from "@/components/ui"

interface CustomRequestOptions
	extends Omit<UploadRequestOption, "onError" | "onSuccess"> {
	file: RcFile
	onSuccess: (response: any, file: RcFile) => void
	onError: (error: Error) => void
}

// TODO: 파일 다운로드 양식에 맞게 props 세팅해야함.
interface DataProps {
	/** 모달 show/hide */
	show: boolean
	/** 샘플양식 연동 키 : route.path */
	sampleFileKey?: string
	/** 통신 API URL */
	url: string
}

const { show = false, sampleFileKey, url } = defineProps<DataProps>()

// const authStore = useAuthStore()
// const { getCompanyCode } = storeToRefs(authStore)

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "callback", value: any): void
}>()
const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const gridApi = shallowRef<GridApi<any>>()

const loading = ref<boolean>(false)
const isPreview = ref<boolean>(false)

const fileList = ref<any[]>([])
const rowData = ref<any[]>([])
const isFailed = ref<boolean>(false)

const columnsData = ref<any[]>([])
const columnDefs = ref<GridOptions<any>["columnDefs"]>([])

const onGridReady = (params: any) => {
	gridApi.value = params.api

	if (gridApi.value) {
		// rowData.value = data;
		// rowData.value = props.data;
	}
}

const sampleDownLoad = async () => {
	if (sampleFileKey) {
		console.log("sampleFileKey", sampleFileKey)

		try {
			// API를 통해 파일 다운로드
			// const response = await useCFetch<Response<any>>(
			// 	`/api/v2/files/download/${sampleDownloadFileId}`,
			// 	{
			// 		method: "GET",
			// 		responseType: "blob",
			// 		params: {
			// 			id: sampleDownloadFileId,
			// 			companyCode: getCompanyCode.value,
			// 		},
			// 	}
			// )
			// if (response.status !== 0) {
			// 	throw new Error("파일 다운로드 실패")
			// }
			// // 파일 이름 가져오기
			// const contentDisposition = response.data.name
			// let fileName = "sample-download"
			// if (contentDisposition) {
			// 	fileName = contentDisposition
			// 	// const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
			// 	// if (fileNameMatch) {
			// 	//   fileName = fileNameMatch[1];
			// 	// }
			// }
			// 파일 다운로드
			// const blob = await response.data.blob()
			// const url = window.URL.createObjectURL(blob)
			// const link = document.createElement("a")
			// link.href = url
			// link.download = fileName
			// document.body.appendChild(link)
			// link.click()
			// document.body.removeChild(link)
			// window.URL.revokeObjectURL(url)
			// message.success(`${fileName} 파일 다운로드를 시작합니다.`)
		} catch (error) {
			console.error("다운로드 오류:", error)
			message.error("파일 다운로드 중 오류가 발생했습니다.")
		}
	} else {
		message.error("샘플 양식이 존재하지 않습니다.")
	}
}

// TODO: 업로드 request 등 보완되어져야함. URL 이 변경될 수 있음.
const customUploadRequest = async (options: CustomRequestOptions) => {
	const { file, onSuccess, onError } = options
	try {
		const reader = new FileReader()

		// 파일 읽기 완료 후 처리
		reader.onload = (event: any) => {
			try {
				const data = new Uint8Array(event.target.result)
				const workbook = XLSX.read(data, { type: "array" })

				// 첫 번째 시트 선택
				const sheetName = workbook.SheetNames[0]
				const worksheet = workbook.Sheets[sheetName]

				// 컬럼 헤더와 키 추출
				const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[] // 2차원 배열 형태로 변환

				const columnHeader = sheetData[1].filter(
					(item: any) =>
						!["id", "parentid", "parent_id", "parent id"].includes(item.toLowerCase())
				)
				// "ID", "id", "Id" 제거
				const columnKey = sheetData[2].filter(
					(item: any) =>
						!["id", "parentid", "parent_id", "parent id"].includes(item.toLowerCase())
				)

				// 컬럼 정의 생성
				columnsData.value = columnKey.map((header: string, index: number) => ({
					headerName: columnHeader[index],
					field: header,
					suppressMenu: true,
					// flex: 1,
					editable: (params: any) => params.data?.editable ?? false,
				}))

				columnDefs.value = columnsData.value

				// JSON 데이터 변환 (데이터는 3번째 행부터 시작)
				const json = XLSX.utils
					.sheet_to_json(worksheet, {
						range: 2,
						header: columnKey,
					})
					.slice(1)

				rowData.value = json
				onSuccess(json, file as RcFile)
			} catch (error) {
				onError(error as Error)
				// console.error("파일 처리 중 오류 발생:", error)
			}
		}

		// 파일 읽기
		reader.readAsArrayBuffer(file)
	} catch (error) {
		onError(error as Error)
		message.error("파일 업로드 실패")
	}
}

const handleChange = (info: UploadChangeParam) => {
	const { file, fileList } = info
	const { status } = file
	if (status !== "uploading") {
		if (fileList.length === 0) {
			rowData.value = []
		}
	}
	if (status === "done") {
		message.success(`${file.name}은 등록 가능한 파일 입니다.`)
	} else if (status === "error") {
		message.error(`${file.name}은 등록 불가한 파일 입니다.`)
	}
}

const onCancel = () => {
	open.value = false
	fileList.value = []
	rowData.value = []
	isFailed.value = false
}

const onSubmit = async () => {
	columnDefs.value = []
	await useCFetch<any>(url, {
		method: "POST",
		body: rowData.value,
	}).then((res: any) => {
		columnDefs.value = [
			{
				field: "isValid",
				headerName: " 검증결과",
				suppressMenu: true,
				width: 120,
				cellRenderer: ColorTag,
				cellRendererParams: (params: any) => {
					return {
						color: params.data.isValid ? "green" : "red",
						text: params.data.isValid ? "성공" : "실패",
						value: params.data ? true : false,
					}
				},
			},
			{
				field: "message",
				headerName: " 실패사유",
				cellClass: "text-error",
				suppressMenu: true,
			},
			...columnsData.value.map((x: any) => ({ ...x })),
		]

		const returnRowData: any[] = []
		res.data.map((e: any) => {
			returnRowData.push({
				isValid: e.isValid,
				message: e.message,
				...e.entity,
				editable: !e.isValid ? true : false,
			})
		})

		rowData.value = returnRowData

		if (res.status === 0) {
			message.success("엑셀 일괄 등록 성공")
			isPreview.value = false
			open.value = false
			rowData.value = []
			fileList.value = []
			emit("callback", res.data)
		} else {
			isFailed.value = true
		}
	})
}
</script>

<template>
	<a-modal
		centered
		v-model:open="open"
		title="엑셀 일괄 등록"
		:mask-closable="false"
		:keyboard="false"
		:destroy-on-close="true"
		@cancel="onCancel"
	>
		<a-flex :gap="5" vertical align="center" class="mb-lg">
			<a-typography-title :level="5">
				엑셀 샘플 양식을 다운받아 파일 업로드 하세요.
			</a-typography-title>
			<span>
				<a-button
					:icon="materialIcons('mso', 'download')"
					@click="sampleDownLoad"
					:disabled="!sampleFileKey"
				>
					샘플 양식 다운로드
				</a-button>
			</span>
		</a-flex>
		<div class="text-center"></div>
		<a-upload-dragger
			:custom-request="(request: any) => customUploadRequest(request)"
			v-model:fileList="fileList"
			name="file"
			accept=".xlsx, .xls, .csv"
			:multiple="false"
			:max-count="1"
			@change="handleChange"
		>
			<p class="mb-sm">
				<inbox-outlined style="font-size: 4rem" class="text-primary" />
			</p>
			<p>
				첨부할 파일을 끌어오거나
				<br />클릭해서 업로드 하세요
			</p>
		</a-upload-dragger>
		<template #footer>
			<a-button @click="onCancel">취소</a-button>
			<a-button type="primary" @click="isPreview = true" :disabled="rowData.length === 0">
				미리보기
			</a-button>
		</template>
	</a-modal>

	<a-modal
		width="90%"
		centered
		v-model:open="isPreview"
		title="엑셀 일괄 등록"
		:mask-closable="false"
		:keyboard="false"
		:destroy-on-close="true"
		:confirmLoading="loading"
	>
		<a-flex v-if="isFailed" class="mb-md">
			<a-alert
				class="full-width"
				type="error"
				message="검증이 실패한 Row는 더블클릭하면 수정할 수 있습니다."
			/>
		</a-flex>

		<iwx-grid
			:style="{ width: '100%', height: '60rem' }"
			:row-data="rowData"
			:column-defs="columnDefs"
			:suppress-menu-hide="false"
			:stop-editing-when-cells-lose-focus="false"
			:pagination="false"
			:class="`ag-theme-quartz`"
			@grid-ready="onGridReady"
		/>
		<template #footer>
			<a-button @click="isPreview = false">취소</a-button>
			<a-button type="primary" @click="onSubmit"> 등록 </a-button>
		</template>
	</a-modal>
</template>
