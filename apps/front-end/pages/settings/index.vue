<script lang="ts" setup>
import { useRouter } from "vue-router"

definePageMeta({
	name: "시스템설정",
	layout: "main-layout",
})

const router = useRouter()

onMounted(() => {
	router.push("/settings/workplaces")
})
</script>

<template>
	<Suspense>
		<template #default>
			<div>
				<h1>시스템 설정</h1>
				<NuxtPage />
			</div>
		</template>
		<template #fallback>
			<div>로딩 중...</div>
		</template>
	</Suspense>
</template>
