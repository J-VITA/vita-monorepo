<script setup lang="ts">
import TaxBillForm from "@/components/tax-invoice/TaxBillForm.vue"
const open = ref<boolean>(false)
const data = ref<any>({
	approvalNumber: "20240325410000112dkjfsjk3lk", // 승인번호
	initialApprovalNumber: "", // 당초승인번호
	managementNumber: "ddfesfq13232", // 관리번호
})
</script>
<template>
	<div class="grid-container" @click="open = true">
		<tax-bill-form :data="data" />
	</div>

	<a-modal
		centered
		width="84rem"
		v-model:open="open"
		title="세금계산서보기"
		:destroy-on-close="true"
	>
		<tax-bill-form :data="data" />
		<template #footer>
			<a-button @click="open = false">취소</a-button>
		</template>
	</a-modal>
</template>
