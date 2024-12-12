<script lang="ts" setup>
definePageMeta({
	name: "기타전표",
})
</script>
<template>
	<page-layout>
		{{ $router.currentRoute.value.name }}
	</page-layout>
</template>
