<script setup lang="ts">
definePageMeta({
	name: "대시보드 보고서",
})
</script>

<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
