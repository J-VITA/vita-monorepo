<script setup lang="ts">
import Comment from "@/components/board/Comment.vue"
import type { BoardDetail } from "@/types/board"
import type { Response } from "@/types"

definePageMeta({
	name: "게시판 상세",
})
const route = useRoute()
const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const boardId = computed(() => route.params.id)

const { data, status, refresh } = await useAsyncData(`board-detail`, () =>
	useCFetch<Response<BoardDetail>>(`/api/v2/boards/${boardId.value}`, {
		method: "GET",
		params: { id: boardId.value },
	}).then((res) => res.data)
)

const onWrite = async () => {
	await navigateTo(`/board/write/${boardId.value}`)
}
const onList = async () => {
	await navigateTo(`/board`)
}

const downloadFile = (file: any) => {
	const link = document.createElement("a") // 링크 태그 생성
	link.href = file.downloadUrl // 파일 URL을 링크에 설정
	link.download = file.originalName // 다운로드 시 파일 이름 설정
	link.click() // 링크 클릭 이벤트 트리거
}

const onDelete = async () => {
	Modal.confirm({
		title: "게시글을 영구적으로 삭제할까요?",
		icon: materialIcons("mso", "cancel", 2.4),
		content: "",
		okText: "삭제",
		okType: "danger",
		cancelText: "취소",
		onOk() {
			useCFetch(`/api/v2/boards/${boardId.value}`, {
				method: "DELETE",
				params: { id: boardId.value },
				body: { id: boardId.value },
			}).then(async (res: any) => {
				if (res.status === 0) {
					message.success("삭제되었습니다.")
					await navigateTo("/board")
				}
			})
		},
		onCancel() {},
	})
}

onActivated(() => {
	refresh()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-flex justify="flex-end" :gap="5">
				<a-button :icon="materialIcons('mso', 'list')" @click="onList"> 목록 </a-button>
				<template v-if="getEmployeeId === data?.writerId">
					<a-button danger :icon="materialIcons('mso', 'delete')" @click="onDelete">
						삭제
					</a-button>
					<a-button type="primary" :icon="materialIcons('mso', 'edit')" @click="onWrite">
						수정
					</a-button>
				</template>
			</a-flex>
		</template>
		<template #content>
			<a-flex justify="space-between">
				<a-space :size="5" align="center">
					<a-tag color="red" v-if="data?.isNotice" class="mr-none">공지</a-tag>
					<span class="board-title">{{ data?.title }}</span>
				</a-space>

				<a-space :size="20" align="center">
					<a-typography-text class="text-secondary">
						{{ data?.writerName }} {{ data?.writerPositionName }} /
						{{ data?.writerDepartmentName }}
					</a-typography-text>
					<a-typography-text class="text-secondary">
						{{ data?.createdAt }}
					</a-typography-text>
				</a-space>
			</a-flex>
			<a-divider class="my-sm" />
			<div>
				<a-typography-title :level="5" class="mb-none">
					첨부파일
					<span class="text-secondary">({{ data?.files.length }}건)</span>
				</a-typography-title>
				<a-flex vertical class="board-file-list">
					<template v-for="file in data?.files">
						<a class="board-file-item" @click="downloadFile(file)">
							<a-space :size="5" align="center">
								<component :is="materialIcons('mso', 'attach_file')" />
								{{ file.originalName }}
								({{ (file.size / 1048576).toFixed(2) }}MB)
								<component :is="materialIcons('mso', 'download')" />
							</a-space>
						</a>
					</template>
				</a-flex>
			</div>
			<a-divider />
			<div class="board-content-box">
				{{ data?.content }}
			</div>
			<a-divider />
			<comment v-model:board-id="boardId" @update="refresh" />
		</template>
	</page-layout>
</template>
