<script setup lang="ts">
definePageMeta({
	name: "개인별 사용통계",
})
</script>

<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
