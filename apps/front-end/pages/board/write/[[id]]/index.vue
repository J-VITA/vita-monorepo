<script setup lang="ts">
import type { FormInstance, UploadChangeParam } from "ant-design-vue"
import type { BoardForm, BoardDetail } from "@/types/board"
import type { Response } from "@/types"

definePageMeta({
	name: "게시판 글쓰기",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const formRef = useTemplateRef<FormInstance>("formRef")
const route = useRoute()
const router = useRouter()
const isLoading = ref<boolean>(false)
const formState = ref<BoardForm>({
	companyCode: getCompanyCode.value,
	title: "",
	content: "",
	writerId: getEmployeeId.value,
	isNotice: false,
	fileIds: [],
	fileList: [],
})

const onCancel = async () => {
	Modal.confirm({
		title: "작성을 중단하시겠습니까?",
		icon: materialIcons("mso", "error", 2.4),
		content: "작성중인 내용이 모두 삭제 됩니다.",
		okText: "확인",
		cancelText: "취소",
		onOk() {
			formRef.value?.resetFields()
			router.back()
		},
		onCancel() {},
	})
}

const onSubmit = () => {
	formRef.value
		?.validate()
		.then(async () => {
			isLoading.value = true

			const url = route.params.id ? `/api/v2/boards/${route.params.id}` : `/api/v2/boards`
			await useCFetch(url, {
				method: route.params.id ? "PATCH" : "POST",
				body: { ...formState.value },
			}).then(async (res: any) => {
				if (res.status === 0) {
					isLoading.value = false
					await navigateTo("/board")
					message.success(
						`게시글이 ${route.params.id ? "수정" : "작성"} 완료 되었습니다.`
					)
				}
			})
		})
		.catch((err) => console.error(err))
		.finally(() => (isLoading.value = false))
}

const init = async () => {
	formRef.value?.resetFields()
	if (route.params.id) {
		await useCFetch<Response<BoardDetail>>(`/api/v2/boards/${route.params.id}`, {
			method: "GET",
			params: { id: route.params.id },
		}).then((res: any) => {
			formState.value = {
				...res.data,
				fileIds: res.data.files.map((file: any) => ({ id: file.id })),
				fileList: res.data.files.map((file: any) => ({
					...file,
					uid: file.id,
				})),
			}
		})
	}
}

onMounted(async () => {
	await init()
})
onActivated(async () => {
	await init()
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-flex justify="flex-end" :gap="5">
				<a-button :icon="materialIcons('mso', 'arrow_back')" @click="onCancel">
					취소
				</a-button>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'edit')"
					@click="onSubmit"
					v-if="!route.params.id"
				>
					작성완료
				</a-button>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'edit')"
					@click="onSubmit"
					v-else
				>
					수정
				</a-button>
			</a-flex>
		</template>
		<template #content>
			<a-spin :spinning="isLoading" tip="등록중...">
				<a-form ref="formRef" label-align="left" :model="formState" :colon="false">
					<a-row :gutter="[10, 10]">
						<a-col flex="1">
							<a-form-item
								name="title"
								:rules="[{ required: true, message: '필수값입니다.' }]"
							>
								<a-input
									v-model:value="formState.title"
									placeholder="제목을 입력해주세요."
								/>
							</a-form-item>
						</a-col>
						<a-col>
							<a-form-item name="isNotice">
								<a-checkbox v-model:checked="formState.isNotice">
									<a-space :size="3" align="center">
										<span>공지로등록</span>
										<a-popover placement="topRight">
											<template #content>
												<p style="max-width: 20rem">
													게시판 관리자 권한자는 공지사항을 등록할 수 있습니다. 공지로
													등록시 목록 상단에 고정됩니다.
												</p>
											</template>
											<div class="text-secondary cursor-pointer">
												<component
													:is="materialIcons('mso', 'help')"
													style="font-size: 1.6rem"
												/>
											</div>
										</a-popover>
									</a-space>
								</a-checkbox>
							</a-form-item>
						</a-col>
					</a-row>

					<a-divider />
					<a-form-item name="fileList">
						<attachment-file-upload
							:is-read="false"
							:file-props="{
								companyCode: getCompanyCode,
								fileType: 'BOARD',
							}"
							v-model:file-list="formState.fileList"
							@update:file-list="
								(files: Array<any>) =>
									(formState.fileIds = files.map((file) => ({ id: file.id })))
							"
						/>
					</a-form-item>
					<a-form-item
						name="content"
						:rules="[{ required: true, message: '필수값입니다.' }]"
					>
						<a-textarea
							v-model:value="formState.content"
							:rows="15"
							placeholder="내용을 입력주세요."
						/>
					</a-form-item>
				</a-form>
			</a-spin>
		</template>
	</page-layout>
</template>
