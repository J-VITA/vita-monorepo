<script lang="ts" setup>
definePageMeta({
	name: "시스템설정",
	middleware: [
		function (to, from) {
			return navigateTo("/settings/workplaces")
		},
	],
})
</script>

<template></template>
