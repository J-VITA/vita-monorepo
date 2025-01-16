<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import LeftNav from "@/components/commons/LeftNav.vue"
import UserInfo from "@/components/commons/UserInfo.vue"
import Notification from "@/components/commons/Notification.client.vue"
import Help from "@/components/commons/Help.vue"
import type { BreadCrumbType } from "@/types"

const router = useRouter()
const route = useRoute()

const menusStore = useMenusStore()
const { getMenus, getCollapsed } = storeToRefs(menusStore)
// const collapsed = ref<boolean>(false);
const collapsed = computed({
	set(value) {
		if (value) {
			menusStore.setCollased(true)
		} else {
			menusStore.setCollased(false)
		}
	},
	get() {
		return getCollapsed.value || false
	},
})

const getBreadcrumbs = () => {
	const fullPath = route.path
	const requestPath = fullPath.startsWith("/") ? fullPath.substring(1) : fullPath
	const crumbs = requestPath.split("/")
	const breadcrumbs: Array<BreadCrumbType> = []
	let path = ""
	crumbs.forEach((crumb) => {
		if (crumb) {
			path = `${path}/${crumb}`
			const breadcrumb = router.getRoutes().find((r) => r.path === path) as BreadCrumbType
			if (breadcrumb) {
				breadcrumbs.push(breadcrumb)
			}
		}
	})
	return breadcrumbs
}
</script>
<template>
	<transition name="fade" mode="out-in">
		<a-layout>
			<a-layout-header class="header">
				<a-row align="middle">
					<a-col flex="24rem">
						<a
							:href="
								getMenus.menus && getMenus.menus.length > 0 ? getMenus.menus[0].path : '/'
							"
							class="logo"
							>vita-nuxt</a
						>
						<a-button
							type="text"
							:icon="materialIcons('mso', collapsed ? 'menu_open' : 'menu')"
							@click="() => (collapsed = !collapsed)"
							class="ico-btn"
						/>
					</a-col>
					<a-col flex="auto">
						<a-flex gap="middle" align="center" justify="space-between">
							<div></div>
							<a-space align="center">
								<a-button
									type="text"
									:icon="materialIcons('mso', 'apps')"
									class="ico-btn"
								/>
								<Notification />
								<Help />
								<UserInfo />
							</a-space>
						</a-flex>
					</a-col>
				</a-row>
			</a-layout-header>

			<a-layout-sider
				v-if="router.currentRoute.value.path !== '/dashboard'"
				v-model:collapsed="collapsed"
				collapsible
				class="sider"
				:theme="
					router.currentRoute.value.path.indexOf('settings') > -1 ? 'dark' : 'light'
				"
				:width="240"
				:trigger="null"
			>
				<LeftNav
					:theme="
						router.currentRoute.value.path.indexOf('settings') > -1 ? 'dark' : 'light'
					"
				/>
			</a-layout-sider>
			<a-layout
				class="container"
				:style="{
					marginLeft: collapsed
						? router.currentRoute.value.path === '/dashboard'
							? ''
							: '8rem'
						: router.currentRoute.value.path === '/dashboard'
							? ''
							: '24rem',
				}"
			>
				<a-typography-title v-show="route.name" :level="3" class="page-name">
					{{ route.name }}
				</a-typography-title>
				<a-breadcrumb>
					<a-breadcrumb-item href="/" v-if="route.path != '/dashboard'">
						<home-outlined />
						<!-- <span class="material-symbols-outlined notranslate">home</span> -->
					</a-breadcrumb-item>
					<a-breadcrumb-item v-for="(breadcrumb, index) in getBreadcrumbs()" :key="index">
						{{ breadcrumb.meta.name }}
					</a-breadcrumb-item>
				</a-breadcrumb>
				<slot />

				<reset-password />
			</a-layout>
		</a-layout>
	</transition>
</template>
