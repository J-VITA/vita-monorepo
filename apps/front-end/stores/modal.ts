export const useModalStore = defineStore("modal", {
	state: () => {
		return {
			modals: [] as any,
		}
	},
	getters: {
		getVisible: (state): any => state.modals,
	},
	actions: {
		setVisible(view: string, visibled: boolean) {
			this.modals[view] = visibled
		},
		clear() {
			this.modals = []
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useModalStore, import.meta.hot))
}
