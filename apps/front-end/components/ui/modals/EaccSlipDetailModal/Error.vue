<script setup lang="ts">
// error와 retry는 defineAsyncComponent에서 자동으로 제공됨.
defineProps<{
	error: Error | null
	retry: () => void
}>()
</script>

<template>
	<div class="error-component">
		<a-alert
			message="오류 발생"
			:description="error ? error.message : '컴포넌트 로딩 중 오류가 발생했습니다.'"
			type="error"
			show-icon
		/>
		<a-button class="retry-button" type="primary" @click="retry"> 재시도 </a-button>
	</div>
</template>
