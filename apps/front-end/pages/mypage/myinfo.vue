<script lang="ts" setup>
definePageMeta({
	name: "내정보",
})
</script>

<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
