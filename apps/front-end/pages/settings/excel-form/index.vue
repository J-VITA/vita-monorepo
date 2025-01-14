<script lang="ts" setup>
import type { FormInstance, UploadChangeParam } from "ant-design-vue"
import { useExcelFormListColumns } from "@/types/settings/excel-form"

definePageMeta({
	name: "엑셀양식관리",
})

const columns = useExcelFormListColumns()

const isDetailModal = ref<boolean>(false)
const selectedRowKeys = ref<any[]>([])
const formState = ref<any>({
	title: "",
	position: "",
	description: "",
	fileList: [],
})
const formRef = useTemplateRef<FormInstance>("formRef")

const onSelectChange = (keys: any) => {}
const onShowDetail = () => {
	isDetailModal.value = true
}
const closeDetailModal = () => {
	formRef.value?.resetFields()
	isDetailModal.value = false
}

const onDetailSubmit = (data: any) => {
	console.log("onDetailSubmit", data)
	formRef.value
		?.validate()
		.then(() => {
			console.log("bbb")
		})
		.catch((err) => console.error(err))
}

const handleChange = (info: UploadChangeParam) => {
	console.log(info)

	// let resFileList = [...info.fileList]

	// // 1. Limit the number of uploaded files
	// //    Only to show two recent uploaded files, and old ones will be replaced by the new
	// resFileList = resFileList.slice(-2)

	// // 2. read from response and show file link
	// resFileList = resFileList.map((file) => {
	// 	if (file.response) {
	// 		// Component will show file.url as link
	// 		file.url = file.response.url
	// 	}
	// 	return file
	// })

	// formState.value.fileList = resFileList
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				엑셀업로드를 사용하는 엑셀양식들을 통합하여 관리할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-flex justify="flex-end" :gap="5" class="mb-sm">
				<eacc-button component-is="delete" :data="selectedRowKeys" :modal-open="true" />
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'add_circle')"
					@click="onShowDetail"
				>
					신규등록
				</a-button>
			</a-flex>
			<a-table
				size="small"
				:columns="columns"
				:data-source="[]"
				:loading="false"
				:pagination="false"
				:show-sorter-tooltip="false"
				:row-key="(record: any) => record.id"
				:row-selection="{
					selectedRowKeys: selectedRowKeys,
					onChange: onSelectChange,
				}"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onShowDetail">
							{{ text }}
						</a-typography-link>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<field-modal
				title="엑셀양식등록/상세"
				okText="저장"
				cancelText="취소"
				:showed="isDetailModal"
				:field="formState"
				@closed="closeDetailModal"
				@submit="onDetailSubmit"
			>
				<template #content="{ field }">
					<a-form
						class="pa-sm"
						label-align="left"
						ref="formRef"
						:model="field"
						:colon="false"
						:label-col="{ span: 6 }"
						:wrapper-col="{ span: 18 }"
					>
						<a-form-item
							label="양식명"
							name="title"
							:rules="[{ required: true, message: '필수값입니다.' }]"
						>
							<a-input v-model:value="field.title" />
						</a-form-item>
						<a-form-item
							label="페이지위치"
							name="position"
							:rules="[{ required: true, message: '필수값입니다.' }]"
						>
							<a-select v-model:value="field.position" :options="[]" />
						</a-form-item>
						<a-form-item
							label="설명"
							name="description"
							:rules="[{ required: true, message: '필수값입니다.' }]"
						>
							<a-textarea
								v-model:value="field.description"
								:auto-size="{ minRows: 2, maxRows: 5 }"
							/>
						</a-form-item>
						<a-form-item
							label="엑셀샘플양식"
							name="files"
							:rules="[{ required: true, message: '필수값입니다.' }]"
						>
							<a-upload
								v-model:file-list="field.fileList"
								:multiple="true"
								@change="handleChange"
							>
								<a-button :icon="materialIcons('mso', 'add_circle')"> 추가 </a-button>
							</a-upload>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
