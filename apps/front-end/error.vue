<template>
	<NuxtLayout :name="errorCode" fallback="500">
		<a-button type="primary" size="large">
			<!-- <NuxtLink to="/">홈으로</NuxtLink> -->
			<button @click="handleError">홈으로</button>
		</a-button>
	</NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app"
import { LayoutKey } from "#build/types/layouts"

const props = defineProps({
	error: Object as () => NuxtError,
})

const errorCode = computed(() => {
	const statusCode = props.error?.statusCode || 404
	return statusCode >= 500 ? "500" : (`${statusCode}` as LayoutKey)
})

const handleError = () => clearError({ redirect: "/" })
</script>

<style scoped></style>
