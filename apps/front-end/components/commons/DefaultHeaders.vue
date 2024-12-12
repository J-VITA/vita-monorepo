<script lang="ts" setup>
import UserInfo from "@/components/commons/UserInfo.vue"
import Notification from "@/components/commons/Notification.client.vue"
import Help from "@/components/commons/Help.vue"

const router = useRouter()

// useHead({
//   meta: [{ property: 'og:title', content: `WX - ${route.meta.name}` }],
// });

const menusStore = useMenusStore()
const { getMenus } = storeToRefs(menusStore)

const handleNavigation = async (path: string) => {
	try {
		await new Promise((resolve) => setTimeout(resolve, 100))

		await navigateTo(path)
		// window.location.href = path;
		// router.replace({path});
	} catch (error) {
		console.error("Navigation error:", error)
	}
}
</script>

<template>
	<a-layout-header class="header height-auto">
		<a-row align="middle">
			<a-col flex="auto">
				<a-flex gap="middle" align="center" justify="flex-end">
					<a-space align="center">
						<Notification />
						<Help />
						<UserInfo />
					</a-space>
				</a-flex>
			</a-col>
		</a-row>
		<a-row align="middle" style="margin-top: 1.5rem">
			<a-col flex="24rem">
				<a
					:href="
						getMenus.menus && getMenus.menus.length > 0 ? getMenus.menus[0].path : '/'
					"
					class="logo"
					>wiseXpense</a
				>
			</a-col>
			<a-col flex="auto">
				<span v-for="(item, idx) in getMenus.menus" :key="idx">
					<span v-for="(child, cIdx) in item.children" :key="cIdx">
						<a-button type="link" @click="handleNavigation(child.path)"
							>{{ child.name }}
						</a-button>
					</span>
				</span>
			</a-col>
		</a-row>
	</a-layout-header>
</template>
