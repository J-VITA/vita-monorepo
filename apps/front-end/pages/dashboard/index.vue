<script lang="ts" setup>
import DefaultHeaders from "@/components/commons/DefaultHeaders.vue"

definePageMeta({
	name: "대시보드",
})

const route = useRouter()

const menus = route
	.getRoutes()
	.filter((f) => !f.path.startsWith("/test"))
	.map((x) => {
		return {
			name: x.name,
			path: x.path,
			layout: x.meta.layout || "default",
		}
	})
	.sort((a, b) => {
		return a.path < b.path ? -1 : a.path > b.path ? 1 : 0
	})
	.sort((a, b) => {
		return a.layout < b.layout ? -1 : a.layout > b.layout ? 1 : 0
	})

const authStore = useAuthStore()
const { getUser, getLoginId, getCompanyCode } = storeToRefs(authStore)

const appStore = useAppsStore()
onBeforeMount(() => {
	// appStore.setLoading(true);
	// fetch('https://www.ag-grid.com/example-assets/row-data.json', {
	//     method: 'GET',
	// })
	// .then(res => res.json())
	// .then(data => {
	// })
	// .finally(() => appStore.setLoading(false))
})
const { t, n, locale } = useI18n({
	inheritLocale: true,
})
const count = ref(1000000)
</script>

<template>
	<page-layout>
		<template #header>
			<default-headers />
		</template>
		<template #content>
			<div class="card-body">
				<div class="div-contents-border-padding">
					<a-table
						:columns="[
							{ title: '경로', dataIndex: 'path', sorter: true },
							{ title: '타이틀', dataIndex: 'name', sorter: true },
							{ title: '레이아웃', dataIndex: 'layout', sorter: true },
						]"
						:data-source="menus"
						stripe
						style="width: 100%"
					>
						<template #bodyCell="{ column, text }">
							<template v-if="column.dataIndex === 'path'">
								<a :href="text">{{ text }}</a>
							</template>
							<template v-else>{{ text }}</template>
						</template>
					</a-table>
				</div>
			</div>
		</template>
	</page-layout>
</template>

<style scoped></style>
