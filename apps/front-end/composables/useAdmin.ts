// import { useAuthUser } from "./useAuthUser";

export const useAdmin = () => {
	const appsStore = useAppsStore()
	const { getAccessToken } = storeToRefs(appsStore)
	const authStore = useAuthStore()
	const { getRole } = storeToRefs(authStore)

	return computed(() => {
		if (!getAccessToken.value) return false

		return ["ADMIN", "ROOT"].includes(getRole.value)
	})
}
