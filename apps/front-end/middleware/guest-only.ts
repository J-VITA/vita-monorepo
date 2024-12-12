import type { Author } from "~/types"

export default defineNuxtRouteMiddleware(async (to, from) => {
	const authStore = useAuthStore()
	const { getRole } = storeToRefs(authStore)
	const route = useRoute()
	const { path } = useRedirectFrom()
	// console.log("to, from ", to, from)
	if (getRole.value) {
		if (process.server) return navigateTo({ path: "/" })

		const redirect = path() ? path() : "/"

		return navigateTo({ path: redirect })
		// return abortNavigation();
	}
})
