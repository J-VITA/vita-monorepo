<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { DocumentResParams } from "@/types/commons/document"

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const showDocumentModal = ref<boolean>(false)
const documentData = ref<DocumentResParams[]>([
	{
		id: 0,
		companyCode: getCompanyCode.value,
		approvalNumber: "",
		title: "",
		draftEmployeeId: getEmployeeId.value,
		draftEmployeeName: "",
		draftEmployeeDepartmentCode: "",
		draftEmployeeDepartmentName: "",
		draftDateTime: "",
	},
])

const emit = defineEmits<{
	(e: "update:documentIds", value: any): any
}>()

// 모달 오픈
const onOpenModal = () => {
	showDocumentModal.value = true
}

// 문서 데이터 조회
const onUpdateDocuments = (rows: any[]) => {
	documentData.value = rows
	emit(
		"update:documentIds",
		rows.map((x) => {
			return { uid: x.id }
		})
	)
}

// 문서 삭제
const onDeleteDocuments = (rows: any) => {
	if (!documentData.value) return
	documentData.value = documentData.value.filter((item: any) => {
		return item.id !== rows
	})
	emit(
		"update:documentIds",
		documentData.value.map((x) => x.id)
	)
}

// 문서 미리보기
const showDocumentPreview = (rows: any) => {}
</script>

<template>
	<a-descriptions
		:column="1"
		:colon="false"
		:labelStyle="{ width: '20%' }"
		:contentStyle="{ width: '80%' }"
	>
		<a-descriptions-item label="관련문서">
			<a-space v-show="!!item.id" v-for="(item, idx) in documentData" :key="idx">
				<component :is="materialIcons('m', 'attach_file')"></component>
				<span>
					<a-typography-paragraph
						class="mb-none"
						ellipsis
						tooltip
						:style="{ width: '24rem' }"
						href="javascript:;"
						:content="item.title"
						@click="showDocumentPreview(item)"
					></a-typography-paragraph>
				</span>
				<a href="javascript:;" @click="onDeleteDocuments(item)" style="color: red">
					<delete-outlined></delete-outlined>
				</a>
			</a-space>
			<a-button :icon="materialIcons('mso', 'add_circle')" @click="onOpenModal">
				추가
			</a-button>
		</a-descriptions-item>
	</a-descriptions>
	<RelatedDocumentFileModal
		:show="showDocumentModal"
		@update:show="(value: boolean) => (showDocumentModal = value)"
		@update:documents="onUpdateDocuments"
	/>
</template>
