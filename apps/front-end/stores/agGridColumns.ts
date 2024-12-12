//load store
export const useAgGridColumnsStore = defineStore("agGridColumnsStore", {
	state: () => {
		return {
			columns: {} as any,
		}
	},
	getters: {
		/**
		 * 저장 컬럼 스토어 가져옴
		 * @param state
		 * @returns
		 */
		getAgColumns: (state) => {
			return state.columns
		},
	},
	actions: {
		/**
		 * 화면별 컬럼 스토어 저장
		 * @param view
		 * @param columns
		 */
		setAgColumns(view: string, columns: Array<any>) {
			this.columns[view] = columns
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useAgGridColumnsStore, import.meta.hot))
}
