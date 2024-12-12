import type { MenuManagement } from "@/types/settings/menu"

//load store
export const useMenusStore = defineStore("Menus", {
	state: () => {
		return {
			menus: [] as Array<MenuManagement>,
			pending: false,
			error: null,
			collapsed: false,
		}
	},
	getters: {
		getMenus: (state): any => state,
		getCollapsed: (state): any => state.collapsed,
	},
	actions: {
		setMenus(state: Array<MenuManagement>, error: any, pending: boolean) {
			this.menus = state
			this.pending = pending
			this.error = error
		},
		setClear() {
			this.menus = []
			this.pending = false
			this.error = null
		},
		setCollased(state: boolean) {
			this.collapsed = state
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useMenusStore, import.meta.hot))
}
