<script setup lang="ts">
const { t, locale } = useLocale()
const el = ref()
const count = ref(1000)
const page = ref(1)
const appConfig = useAppConfig()
const nuxtBirtDay = useLocaleDate(new Date("2016-10-26") /* NUXT_BIRTHDAY */)

onMounted(() => {
	console.log(locale)
	// console.log("onMounted", el.value, count.value++);
	// console.log("onMounted appConfig ", appConfig.ui);
})

definePageMeta({
	middleware: ["redirect-main"],
})

const authStore = useAuthStore()
const { getName } = storeToRefs(authStore)
</script>

<template>
	<div class="container"></div>
</template>
