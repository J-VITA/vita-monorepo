<template>
	<NuxtLayout :name="errorCode">
		<a-button type="primary" size="large">
			<NuxtLink to="/">홈으로</NuxtLink>
		</a-button>
	</NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app"
import { LayoutKey } from "#build/types/layouts"

const props = defineProps({
	error: Object as () => NuxtError,
})

const errorCode = computed(() => `${props.error?.statusCode || "404"}` as LayoutKey)
</script>

<style scoped></style>
