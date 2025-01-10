<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { DocumentResParams } from "@/types/commons/document"

const { documentType = "write" } = defineProps<{
	documentType: "write" | "read"
}>()

const emit = defineEmits<{
	(e: "add", value: any): void
}>()

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const showDocumentModal = ref<boolean>(false)
const documentData = ref<DocumentResParams[] | undefined>(undefined)
// 문서 데이터 조회
const onUpdateDocuments = (rows: any[]) => {
	if (rows.every((item) => !item.id)) return (documentData.value = undefined)
	documentData.value = rows
}

// 모달 오픈
const onOpenModal = () => {
	showDocumentModal.value = true
}

// 데이터 삭제
const onDelete = (rows: any) => {
	if (!documentData.value) return
	documentData.value = documentData.value.filter((item: any) => {
		item.id !== rows.id
	})
}
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-space>
			<a-typography-title :level="4" class="ml-none mb-none">
				관련문서
			</a-typography-title>
			<a-typography-text>{{
				`(총${!!documentData ? documentData.length : 0}건)`
			}}</a-typography-text>
		</a-space>
		<a-button
			v-if="documentType === 'write'"
			:icon="materialIcons('mso', 'add_circle')"
			@click="onOpenModal"
		>
			추가
		</a-button>
	</a-flex>
	<a-table
		size="small"
		:columns="[
			{ title: '문서제목', dataIndex: 'title' },
			{ title: '문서번호', dataIndex: 'approvalNumber', width: 150 },
			{ title: '기능', dataIndex: 'operation', width: 100 },
		]"
		:data-source="documentData"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'operation' && documentType === 'write'">
				<a-space :size="5">
					<a-popconfirm
						v-if="documentData && documentData.length"
						title="삭제 하시겠습니까?"
						@confirm="onDelete(record)"
					>
						<a-button type="text" size="small" :icon="materialIcons('mso', 'delete')" />
					</a-popconfirm>
				</a-space>
			</template>
			<template v-if="column.dataIndex === 'operation' && documentType === 'read'">
				<a-space :size="5">
					<a-button
						type="text"
						size="small"
						:icon="materialIcons('mso', 'open_in_new')"
					/>
				</a-space>
			</template>
		</template>
	</a-table>
	<RelatedDocumentFileModal
		:show="showDocumentModal"
		@update:show="(value: boolean) => (showDocumentModal = value)"
		@update:documents="onUpdateDocuments"
	/>
</template>
