<script setup lang="ts">
import ApprovalForms from "@/components/approvals/main/ApprovalForms.vue"
import ApprovalProgress from "@/components/approvals/main/ApprovalProgress.vue"

definePageMeta({
	name: "전자결재홈",
})
</script>

<template>
	<page-layout class="empty">
		<!-- 결재양식 -->
		<approval-forms class="mb-xl" />
		<!-- 결재진행 현황 -->
		<approval-progress />
	</page-layout>
</template>
