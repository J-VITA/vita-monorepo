<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import { type DocumentStatusType, DocumentStatus } from "@/types/approvals/document"

type Props = {
	type: DocumentStatusType
	data?: any
}
type CommentType = {
	approvalHeaderId: number
	approvalNumber: string
	commentEmployeeDepartmentCode: string
	commentEmployeeDepartmentName: string
	commentEmployeeId: number
	commentEmployeeName: string
	commentEmployeePositionCode: string
	commentEmployeePositionName: string
	companyCode: string
	content: string
	id: number
	updatedAt: string
}

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)
const { type, data } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:data", value: any): any
}>()

const comments = computed<CommentType[]>({
	get() {
		return data.approvalComments
	},
	set(value) {
		console.log(value)
	},
})

const modifyData = ref<any>(undefined)
const modifying = ref<boolean>(false)
const loading = ref<boolean>(false)
const newComment = ref<string>("")
const handleSubmit = async () => {
	const body = {
		companyCode: data.companyCode,
		approvalHeaderId: data.id,
		approvalNumber: data.approvalNumber,
		content: newComment.value,
		commentEmployeeId: getEmployeeId.value,
	}

	await useCFetch<Response<any>>("/api/v2/approvals/comments", {
		method: "POST",
		body: body,
	}).then(() => {
		message.success("의견이 등록되었습니다.")
		emit("update:data", true)
		newComment.value = ""
	})
}

const onEdit = async (item: CommentType) => {
	await useCFetch<Response<any>>(`/api/v2/approvals/comments/${item.id}`, {
		method: "GET",
		params: { id: item.id },
	}).then((res: Response<any>) => {
		modifyData.value = Object.assign({}, res.data)
	})
}

const onDelete = async (item: CommentType) => {
	console.log(item.id)
	await useCFetch<Response<any>>(`/api/v2/approvals/comments/${item.id}`, {
		method: "DELETE",
		params: { id: item.id },
		body: {
			id: item.id,
			companyCode: item.companyCode,
			approvalHeaderId: item.approvalHeaderId,
			approvalNumber: item.approvalNumber,
			content: item.content,
			commentEmployeeId: item.commentEmployeeId,
		},
	}).then(() => {
		message.success("의견이 삭제되었습니다.")
		emit("update:data", true)
	})
}

const onSave = async (item: CommentType) => {
	modifying.value = true
	await useCFetch<Response<any>>(`/api/v2/approvals/comments/${modifyData.value?.id}`, {
		method: "PATCH",
		params: { id: item.id },
		body: modifyData.value,
	}).then((res: Response<any>) => {
		message.success("의견이 수정되었습니다.")
		emit("update:data", true)
		modifyData.value = undefined
		modifying.value = false
	})
}
</script>
<template>
	<a-list :data-source="comments" item-layout="horizontal" :locale="{ emptyText: ' ' }">
		<template #header>
			<a-typography-title :level="4" class="ml-none mb-none">
				의견
				<a-typography-text type="secondary">
					({{ comments.length }}건)
				</a-typography-text>
			</a-typography-title>
		</template>
		<template #renderItem="{ item }">
			<a-list-item class="pl-none pr-none">
				<a-list-item-meta>
					<template #title>
						<a-flex :gap="10" align="center">
							<a-typography-title :level="5" class="mb-none">
								{{ item.commentEmployeeName }}
								{{ item.commentEmployeePositionName }} /
								{{ item.commentEmployeeDepartmentName }}
							</a-typography-title>
							<a-typography-text type="secondary">
								{{ item.updatedAt }}
							</a-typography-text>
							<template v-if="true">
								<a-button
									v-if="modifyData && modifyData.id === item.id"
									:icon="materialIcons('mso', 'save')"
									size="small"
									type="text"
									:loading="modifying"
									@click="onSave(modifyData)"
								/>
								<a-space
									:size="5"
									v-if="!modifyData && item.commentEmployeeId === getEmployeeId"
								>
									<a-button
										:icon="materialIcons('mso', 'edit')"
										size="small"
										type="text"
										@click="onEdit(item)"
									/>
									<a-button
										:icon="materialIcons('mso', 'delete')"
										size="small"
										type="text"
										@click="onDelete(item)"
									/>
								</a-space>
							</template>
						</a-flex>
					</template>
					<template #description>
						<a-input
							v-model:value="modifyData.content"
							v-if="modifyData && modifyData.id === item.id"
							:disabled="modifying"
						/>
						<a-typography-paragraph class="mb-none" v-else>
							{{ item.content }}
						</a-typography-paragraph>
					</template>
				</a-list-item-meta>
			</a-list-item>
		</template>
	</a-list>
	<a-divider class="mt-none mb-none" />
	<a-comment
		style="margin-left: -1.2rem"
		v-if="[DocumentStatus.saved, DocumentStatus.progress].includes(type)"
	>
		<template #content>
			<a-flex :gap="10">
				<a-textarea
					class="full-width"
					v-model:value="newComment"
					:rows="4"
					show-count
					:maxlength="1000"
					style="resize: none"
				/>
				<a-button
					:loading="loading"
					type="primary"
					@click="handleSubmit"
					:icon="materialIcons('mso', 'edit_note')"
				>
					등록
				</a-button>
			</a-flex>
		</template>
	</a-comment>
</template>
