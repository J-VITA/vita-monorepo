<script setup lang="ts">
definePageMeta({
	name: "월별 사용통계",
})
</script>

<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
