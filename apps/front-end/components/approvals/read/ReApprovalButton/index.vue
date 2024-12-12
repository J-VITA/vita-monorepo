<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { FormData } from "~/types/approvals/document"

type Props = {
	data: FormData
}

/**
 * 재기안
 */
const { data: documentData } = defineProps<Props>()

const emit = defineEmits<{
	(e: "callback", value: any): void
}>()

const isReApproval = ref<boolean>(false)

const onReApproval = async (data: FormData) => {
	console.log(data)
	await useCFetch<Response<FormData>>("/api/v2/approvals/resubmit", {
		method: "PATCH",
		body: {
			companyCode: data.companyCode,
			approvalHeaderId: data.id,
			approvalNumber: data.approvalNumber,
			approvalEmployeeId: data.draftEmployeeId,
			actualApprovalEmployeeId: data.actualApprovalEmployeeId,
			title: data.title,
			description: data.description,
		},
	}).then(async (res: Response<any>) => {
		if (res.status === 0) {
			isReApproval.value = false
			emit("callback", res.data)
		}
	})
}
</script>
<template>
	<a-button
		type="primary"
		:icon="materialIcons('mso', 'edit_square')"
		@click="isReApproval = true"
	>
		재기안
	</a-button>

	<confirm-modal
		type="warning"
		modal-title-text="재기안"
		title="재기안 하시겠습니까?"
		:icon="() => materialIcons('mso', 'error_outline')"
		:showed="isReApproval"
		:data="documentData"
		@close="isReApproval = false"
		@submit="onReApproval"
	>
		<template #content> 확인 클릭시 결재문서 내용을 수정 할 수 있습니다. </template>
	</confirm-modal>
</template>
