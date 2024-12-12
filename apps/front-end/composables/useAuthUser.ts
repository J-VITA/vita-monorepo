import { MemberStatusCode, type User } from "@/types"

export const useAuthUser = () => {
	const appsStore = useAppsStore()
	const authStore = useAuthStore()
	const { getRole } = storeToRefs(authStore)
	console.log(`appsStore`, appsStore.getAccessToken)
	return computed(() => {
		if (!appsStore.getAccessToken) return false

		return ["ADMIN", "USER", "N_USER", "Member"].includes(getRole.value)
		// return getRoles.value?.filter(role => ['ADMIN', 'USER', 'N_USER', 'Member'].includes(role.role));
		// return authStore.getUser.memberStatus?.code === MemberStatusCode.ACTIVE;
	})
}
