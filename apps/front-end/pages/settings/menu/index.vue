<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { FormInstance } from "ant-design-vue"
import type { Response } from "@/types"
import type { AntTreeNodeDropEvent } from "ant-design-vue/es/tree"
import { type MenuItem, type MenuForm, initMenuItem } from "@/types/settings/menu"

definePageMeta({
	name: "메뉴관리",
})

const authStore = useAuthStore()
const { getCompanyCode, getRole } = storeToRefs(authStore)

const companyCode = ref<string>("")

const isEdit = ref<boolean>(false)
const isAdd = ref<boolean>(false)
const selectedKeys = ref<(string | number)[]>([])
const detailData = ref<MenuItem | undefined>(undefined)
const previewIcon = ref<string>("")

const menuFormRef = ref<FormInstance>()
const menuForm = ref<MenuForm>({} as MenuForm)

const nuxtApp = useNuxtApp()

const onDrop = (info: AntTreeNodeDropEvent) => {
	console.log(info)
}

const {
	data: treeData,
	status,
	refresh,
	clear,
} = await useAsyncData("menu-management-list", () =>
	useCFetch<Response<any>>("/api/v2/settings/menu", {
		method: "GET",
		params: {
			companyCode: getRole.value === "ROOT" ? companyCode.value : getCompanyCode.value,
		},
	}).then((res: Response<any>) => res.data || [])
)

const onSelect = async (keys: (string | number)[]) => {
	onCancel()
	selectedKeys.value = keys
	if (keys.length === 0) {
		detailData.value = undefined
	} else {
		detailData.value = await useCFetch<Response<any>>(
			`/api/v2/settings/menu/${keys[0]}`,
			{
				method: "GET",
				params: {
					id: keys[0],
				},
			}
		).then((res: Response<any>) => res.data)
	}
}

const onEdit = () => {
	isEdit.value = true
	menuForm.value = Object.assign({}, detailData.value)
	previewIcon.value = detailData.value?.relateImageName as string
}

const getOrderSeq = (id: number): number => {
	let number = -1

	const loop = (tree: any) => {
		for (const element of tree) {
			if (element.id === id) {
				number = element.children?.length
					? element.children[element.children.length - 1].orderSeq + 1
					: 0
			}
			if (element.children) loop(element.children)
		}
	}

	loop(treeData.value)
	return number
}

const onAdd = () => {
	isAdd.value = true

	previewIcon.value = ""
	menuForm.value["companyCode"] = companyCode.value

	if (detailData.value) {
		menuForm.value["parentId"] = detailData.value.id
		menuForm.value["depth"] = detailData.value.depth + 1
		menuForm.value["orderSeq"] =
			getOrderSeq(detailData.value?.id) === 0 ? 1 : getOrderSeq(detailData.value?.id)
	} else {
		if (treeData.value.length !== 0) {
			menuForm.value["orderSeq"] = treeData.value[treeData.value.length - 1].orderSeq + 1
		}
	}
}

const onCancel = () => {
	isEdit.value = false
	isAdd.value = false
	menuForm.value = { ...initMenuItem }
}

const onSave = () => {
	menuFormRef.value
		?.validate()
		.then(async () => {
			if (isEdit.value) {
				await useCFetch<Response<any>>(`/api/v2/settings/menu/${menuForm.value.id}`, {
					method: "PATCH",
					params: { id: menuForm.value.id },
					body: { ...menuForm.value },
				})
					.then((res: Response<any>) => {
						if (res.status === 0) {
							refresh()
							message.success("메뉴가 수정되었습니다.")
							onSelect([res.data.id])
						}
					})
					.finally(() => onCancel())
			}

			if (isAdd.value) {
				await useCFetch<Response<any>>("/api/v2/settings/menu", {
					method: "POST",
					body: { ...menuForm.value },
				})
					.then((res: Response<any>) => {
						if (res.status === 0) {
							refresh()
							message.success("메뉴가 추가되었습니다.")
							onSelect([res.data.id])
						}
					})
					.finally(() => onCancel())
			}
		})
		.catch((error) => console.error(error))
}

const onDelete = async (data: any) => {
	await useCFetch<Response<any>>(`/api/v2/settings/menu/${data.id}`, {
		method: "DELETE",
		params: {
			id: data.id,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
			message.success("메뉴가 삭제되었습니다.")
			onSelect([treeData.value[0].id])
		}
	})
}

const onSearch = () => {
	refresh()
	onCancel()
	selectedKeys.value = []
	detailData.value = undefined
}

nuxtApp.hook("page:finish", () => {
	if (companyCode.value) {
		nextTick(() => {
			clear()
			refresh()
		})
	}
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				각 페이지 메뉴를 추가 및 삭제 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<template v-if="getRole === 'ROOT'">
				<a-flex :gap="5">
					<eacc-select
						style="width: 30rem"
						url="/api/v2/settings/companies"
						:params="{ placeType: 'COMPANY' }"
						:on-all-field="false"
						v-model:value="companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						:first="true"
						:refresh="true"
						@update:value="(value: any) => (companyCode = value)"
					/>
					<eacc-button
						componentIs="search"
						type="primary"
						:modal-open="false"
						:data="companyCode"
						@click="onSearch"
					/>
				</a-flex>
				<a-divider class="my-md" />
			</template>

			<a-row :gutter="[30, 0]">
				<a-col flex="40rem" style="max-height: 80rem; overflow-y: auto">
					<a-spin :spinning="status === 'pending'">
						<!-- 추후 작업예정: draggable @drop="onDrop" -->
						<a-tree
							block-node
							:selectedKeys="selectedKeys"
							:show-icon="true"
							:default-expand-all="true"
							:tree-data="treeData"
							:field-names="{
								children: 'children',
								title: 'name',
								key: 'id',
							}"
							@select="(keys) => onSelect(keys)"
						>
							<template #icon="{ dataRef }">
								<component :is="materialIcons('mso', dataRef.relateImageName)" />
							</template>
						</a-tree>
					</a-spin>
				</a-col>
				<a-col flex="1rem">
					<a-divider type="vertical" class="full-height mx-none" />
				</a-col>
				<a-col flex="1">
					<a-form ref="menuFormRef" autocomplete="off" :model="menuForm" :colon="false">
						<a-descriptions
							bordered
							size="small"
							:column="1"
							:labelStyle="{ width: '15%' }"
							:contentStyle="{ width: '35%' }"
						>
							<template #extra>
								<a-space :size="5">
									<a-button
										v-if="
											!(isEdit || isAdd) &&
											(detailData?.depth === undefined || detailData.depth < 2)
										"
										:icon="materialIcons('mso', 'add_circle')"
										@click="onAdd"
									>
										<template v-if="selectedKeys.length === 0"> 메뉴추가 </template>
										<template v-else>하위메뉴추가</template>
									</a-button>
									<eacc-button
										v-if="selectedKeys.length !== 0 && !(isEdit || isAdd)"
										componentIs="delete"
										:modal-open="false"
										:data="detailData"
										@click="onDelete"
									/>
									<a-button
										v-if="selectedKeys.length !== 0 && !(isEdit || isAdd)"
										type="primary"
										:icon="materialIcons('mso', 'edit')"
										@click="onEdit"
									>
										수정
									</a-button>
									<a-button v-if="isEdit || isAdd" @click="onCancel"> 취소 </a-button>
									<a-button
										v-if="isEdit || isAdd"
										type="primary"
										:icon="materialIcons('mso', 'save')"
										@click="onSave"
									>
										저장
									</a-button>
								</a-space>
							</template>

							<a-descriptions-item label="순서">
								<a-form-item v-if="isEdit || isAdd" name="orderSeq" has-feedback>
									<a-input-number v-model:value="menuForm.orderSeq" :min="0" />
								</a-form-item>
								<template v-else>
									{{ detailData?.orderSeq }}
								</template>
							</a-descriptions-item>
							<a-descriptions-item>
								<template #label>
									<span class="text-error" v-if="isEdit || isAdd">*</span>
									메뉴명
								</template>
								<a-form-item
									v-if="isEdit || isAdd"
									name="name"
									has-feedback
									:rules="[
										{
											required: true,
											message: '필수입력값 입니다.',
											trigger: 'blur',
										},
									]"
								>
									<a-input v-model:value="menuForm.name" />
								</a-form-item>

								<template v-else>
									{{ detailData?.name }}
								</template>
							</a-descriptions-item>
							<a-descriptions-item label="페이지 주소">
								<a-form-item v-if="isEdit || isAdd" name="path" has-feedback>
									<a-input v-model:value="menuForm.path" />
								</a-form-item>
								<template v-else>
									{{ detailData?.path }}
								</template>
							</a-descriptions-item>
							<a-descriptions-item label="메뉴 설명">
								<a-form-item v-if="isEdit || isAdd" name="description" has-feedback>
									<a-input v-model:value="menuForm.description" />
								</a-form-item>
								<template v-else>
									{{ detailData?.description }}
								</template>
							</a-descriptions-item>

							<a-descriptions-item label="아이콘">
								<a-form-item v-if="isEdit || isAdd" name="relateImageName" has-feedback>
									<a-flex class="mb-xs" align="center" :gap="5">
										<div class="icon-box">
											<component
												:is="materialIcons('mso', previewIcon)"
												style="font-size: 2.4rem; line-height: 1"
											/>
										</div>

										<a-input
											v-model:value="menuForm.relateImageName"
											@press-enter="() => (previewIcon = menuForm.relateImageName!)"
											@blur="() => (previewIcon = menuForm.relateImageName!)"
										/>
									</a-flex>
									<a-typography-link
										href="https://fonts.google.com/icons"
										target="_blank"
									>
										아이콘예제보기
									</a-typography-link>
								</a-form-item>
								<template v-else>
									<component
										v-if="detailData"
										style="font-size: 2.4rem"
										:is="materialIcons('mso', detailData?.relateImageName)"
									/>
								</template>
							</a-descriptions-item>
							<a-descriptions-item label="사용여부">
								<a-form-item v-if="isEdit || isAdd" name="used">
									<a-switch v-model:checked="menuForm.used" size="small" />
								</a-form-item>
								<template v-if="detailData !== undefined && !(isEdit || isAdd)">
									<a-tag :color="detailData?.used ? 'blue' : ''">
										{{ detailData?.used ? "사용중" : "사용안함" }}
									</a-tag>
								</template>
							</a-descriptions-item>
						</a-descriptions>
					</a-form>
				</a-col>
			</a-row>
		</template>
	</page-layout>
</template>
