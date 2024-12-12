import type { RouterConfig } from "@nuxt/schema"
import { createMemoryHistory, createWebHistory } from "vue-router"

export default <RouterConfig>{
	history: (base) =>
		import.meta.client ? createMemoryHistory(base) : null /* default */,
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
