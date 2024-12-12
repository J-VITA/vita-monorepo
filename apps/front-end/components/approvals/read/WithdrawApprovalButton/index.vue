<script setup lang="ts">
import { materialIcons } from "~/composables/icons"
import type { Response } from "@/types"
import type { FormData } from "@/types/approvals/document"

type Props = {
	data: FormData
}

/**
 * 회수
 */
const { data: documentData } = defineProps<Props>()

const emit = defineEmits<{
	(e: "callback", value: any): void
}>()

const isWithdraw = ref<boolean>(false)
const onWithdraw = async (data: FormData) => {
	console.log(data)
	await useCFetch<Response<any>>("/api/v2/approvals/withdraw", {
		method: "PATCH",
		body: {
			companyCode: data.companyCode,
			approvalHeaderId: data.id,
			// approvalDetailId: 1,
			approvalNumber: data.approvalNumber,
			// approvalEmployeeId: 1,
			actualApprovalEmployeeId: data.actualApprovalEmployeeId,
			title: data.title,
			description: data.description,
		},
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				message.success("결재문서가 회수 되었습니다.")
				emit("callback", res)
			}
		})
		.finally(() => (isWithdraw.value = false))
}
</script>
<template>
	<a-button @click="isWithdraw = true" danger :icon="materialIcons('mso', 'undo')">
		회수
	</a-button>

	<confirm-modal
		type="error"
		modal-title-text="결재 회수"
		title="결재문서를 회수 하시겠습니까?"
		:icon="() => materialIcons('mso', 'cancel')"
		:showed="isWithdraw"
		:data="documentData"
		btn-ok-title="회수"
		@close="isWithdraw = false"
		@submit="onWithdraw"
	/>
</template>
