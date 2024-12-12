<script setup lang="ts">
definePageMeta({
	name: "누적사용현황",
})
</script>

<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
