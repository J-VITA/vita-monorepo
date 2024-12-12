<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { FormInstance } from "ant-design-vue"

type Props = {
	data: any
	options: any
}

/**
 * 후결 처리
 */
const { data: documentData, options } = defineProps<Props>()

const emit = defineEmits<{
	(e: "callback", value: any): void
}>()

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)

const isPostApproval = ref<boolean>(false)
const formRef = useTemplateRef<FormInstance>("formRef")
const formData = ref<{ ids: (string | number)[] }>({
	ids: [],
})

const onPostApproval = () => {
	// data: (string | number)[]
	// const body = {
	//   companyCode: documentData.companyCode,
	//   approvalHeaderId: documentData.id,
	//   approvalDetailIds: data.map((x) => ({ id: Number(x) })),
	//   changeEmployeeId: documentData.actualApprovalEmployeeId,
	// };

	// 후결자 api 통신
	formRef.value
		?.validate()
		.then(async (res) => {
			const body = {
				companyCode: documentData.companyCode,
				approvalHeaderId: documentData.id,
				approvalDetailIds: res.ids.map((x: number) => ({ id: x })),
				changeEmployeeId: getEmployeeId.value,
			}
			await useCFetch<Response<any>>("/api/v2/approvals/changes/postApprovals", {
				method: "PATCH",
				body,
			})
				.then((res: Response<any>) => {
					if (res.status === 0) {
						emit("callback", res.data)
						message.success("후결 처리 되었습니다.")
					}
				})
				.finally(() => {
					isPostApproval.value = false
				})
		})
		.catch((err) => console.error(err))
}
</script>
<template>
	<a-button :icon="materialIcons('mso', 'next_plan')" @click="isPostApproval = true">
		후결처리
	</a-button>

	<field-modal
		title="결재 선택"
		:showed="isPostApproval"
		:field="formData"
		@closed="isPostApproval = false"
		@submit="onPostApproval"
	>
		<template #content="{ field }">
			<a-flex align="start" class="mb-lg" :gap="10">
				<component
					:is="materialIcons('mso', 'error_outline')"
					class="text-warning"
					style="font-size: 3rem"
				/>
				<div>
					<a-typography-title :level="4" class="mb-none">
						후결처리 할 사용자를 선택하세요.
					</a-typography-title>
					<a-typography-text
						>선택된 결재자를 결재선에서 건너뛰며 후결 상태로 변경합니다.
					</a-typography-text>
				</div>
			</a-flex>

			<a-form ref="formRef" layout="vertical" :model="field">
				<a-form-item
					:wrapper-col="{ offset: 2, span: 22 }"
					name="ids"
					:rules="[{ required: true, message: '필수값 입니다.', type: 'array' }]"
				>
					<a-checkbox-group v-model:value="field.ids" :options="options" />
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
