import type { RouterConfig } from "@nuxt/schema"
import { createMemoryHistory, createWebHistory } from "vue-router"

export default <RouterConfig>{
	/** 클라이언트 사이드에서는 웹 히스토리를, 서버 사이드에서는 메모리 히스토리를 사용 */
	history: (base) =>
		import.meta.client ? createWebHistory(base) : createMemoryHistory(base),
	routes: (_routes) => {
		const routeList = [..._routes]

		return routeList.concat([
			{
				name: "결재진행",
				path: "/approvals/processing",
				// props: (route) => {
				//   return {
				//     params: {
				//       ...route.params,
				//       searchDateFrom: route.params.searchDateFrom,
				//       searchDateTo: route.params.searchDateTo
				//     }
				//   }
				// },
				component: () =>
					import("@/pages/approvals/processing.vue").then((r) => r.default || r),
			},
			{
				name: "시스템설정",
				path: "/settings",
				redirect: "/settings/workplaces",
				component: () => import("@/pages/settings/index.vue").then((r) => r.default || r),
				children: [],
			},
		])
	},
	async scrollBehavior(to, from, savedPosition) {
		const nuxtApp = useNuxtApp()

		// make sure the route has changed.
		if (nuxtApp.$i18n) {
			// `$i18n` is injected in the `setup` of the nuxtjs/i18n module.
			// `scrollBehavior` is guarded against being called even when it is not completed
			await nuxtApp.$i18n.waitForPendingLocaleChange()
		}

		return savedPosition || { top: 0 }
	},
}
