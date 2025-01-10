<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { BoardComment } from "@/types/board"

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const boardId = defineModel<string | string[]>("boardId")

const emit = defineEmits<{
	(e: "update"): any
}>()

const modifyData = ref<any>(undefined)
const modifying = ref<boolean>(false)
const loading = ref<boolean>(false)
const newComment = ref<string>("")

const {
	data: comments,
	status,
	refresh,
} = await useAsyncData(
	`boards-comments-list`,
	() =>
		useCFetch<Response<Array<BoardComment>>>(
			`/api/v2/boards/comments/list/${boardId.value}`,
			{
				method: "GET",
				params: { boardId: boardId.value },
			}
		),
	{
		watch: [boardId],
		transform: (res: Response<Array<BoardComment>>) => res.data,
	}
)

const handleSubmit = async () => {
	loading.value = true
	const body = {
		companyCode: getCompanyCode.value,
		content: newComment.value,
		commentEmployeeId: getEmployeeId.value,
		boardId: boardId.value,
	}
	await useCFetch<Response<any>>("/api/v2/boards/comments", {
		method: "POST",
		body: body,
	}).then(() => {
		message.success("댓글이 등록되었습니다.")
		refresh()
		newComment.value = ""
		loading.value = false
		emit("update")
	})
}

const onEdit = async (item: any) => {
	await useCFetch<Response<BoardComment>>(`/api/v2/boards/comments/${item.id}`, {
		method: "GET",
		params: { id: item.id },
	}).then((res) => {
		modifyData.value = Object.assign({}, res.data)
	})
}

const onDelete = async (id: number) => {
	await useCFetch<Response<any>>(`/api/v2/boards/comments/${id}`, {
		method: "DELETE",
		params: { id },
		body: { id },
	}).then(() => {
		message.success("의견이 삭제되었습니다.")
		refresh()
		emit("update")
	})
}

const onSave = async (item: any) => {
	modifying.value = true
	await useCFetch<Response<any>>(`/api/v2/boards/comments/${modifyData.value?.id}`, {
		method: "PATCH",
		params: { id: item.id },
		body: modifyData.value,
	}).then(() => {
		message.success("의견이 수정되었습니다.")
		refresh()
		emit("update")
		modifyData.value = undefined
		modifying.value = false
	})
}

onActivated(() => {
	refresh()
})
</script>
<template>
	<a-list
		:data-source="comments || []"
		item-layout="horizontal"
		:locale="{ emptyText: ' ' }"
	>
		<template #header>
			<a-typography-title :level="4" class="ml-none mb-none">
				댓글
				<a-typography-text type="secondary">
					({{ comments?.length || 0 }}건)
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
								{{ item.createdAt }}
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
										@click="onDelete(item.id)"
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
	<a-divider class="mt-none mb-none" v-if="comments && comments?.length > 0" />
	<a-comment style="margin-left: -1.2rem">
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
