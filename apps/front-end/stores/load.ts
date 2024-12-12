import type { Apps, User } from "@/types"

// const authStore = useAuthStore();
// const setUser = (user?: User) => {
//   authStore.setUser(user);
// };

//load store
export const useAppsStore = defineStore("Apps", {
	state: () => {
		return {
			apps: {
				os: "",
				loading: false,
				id: "",
				access_token: "",
				refresh_token: "",
				isTemporal: false,
			} as Apps,
		}
	},
	getters: {
		loading: (state): boolean => state.apps.loading,
		getAccessToken: (state): string => state.apps.access_token,
		getRefreshToken: (state): string => state.apps.refresh_token,
		getJwtPayLoad: (state): any => {
			if (state.apps.refresh_token) {
				const base64Url = state.apps.refresh_token.split(".")[1]
				const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
				const jsonPayload = decodeURIComponent(
					atob(base64)
						.split("")
						.map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
						.join("")
				)
				return JSON.parse(jsonPayload)
			}
		},
		getIsTemporal: (state): boolean => state.apps.isTemporal,
	},
	actions: {
		setLoading(state: boolean) {
			this.apps.loading = state
		},
		setAccessToken(token: string) {
			this.apps.access_token = token
		},
		setRefreshToken(refreshToken: string) {
			this.apps.refresh_token = refreshToken
		},
		setIsTemporal(isTemporal: boolean) {
			this.apps.isTemporal = isTemporal
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useAppsStore, import.meta.hot))
}
