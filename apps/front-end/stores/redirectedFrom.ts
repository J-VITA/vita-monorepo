interface Redirected {
	fullPath: string
	hash: string
	href: string
	matched: Array<any>
	meta: any
	name: string
	params: any
	path: string
	query: string
}
export const useRedirectStore = defineStore("redirected-from", {
	state: () => {
		return {
			redirected: {} as Redirected,
		}
	},
	getters: {
		getPath: (state): string => state.redirected.path,
		getName: (state): string => state.redirected.name,
		getParams: (state): any => state.redirected.params,
	},
	actions: {
		setRedirected(redirected: any) {
			this.redirected = redirected
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useRedirectStore, import.meta.hot))
}
