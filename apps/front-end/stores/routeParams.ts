//load store
export const useRouteParamsStore = defineStore("routeParamsStore", {
	state: () => {
		return {
			params: {} as any,
		}
	},
	getters: {
		/**
		 * 저장 경로 params 스토어 가져옴
		 * @param state
		 * @returns
		 */
		getParams: (state) => {
			return state.params
		},
	},
	actions: {
		/**
		 * 경로별 params 스토어 저장
		 * @param path
		 * @param params
		 */
		setParams(path: string, params: Array<any>) {
			this.params[path] = params
		},
		/**
		 * 경로별 params 삭제, all flag 사용시 전체 params 삭제
		 * @param path
		 * @param all
		 */
		clear(path: string, all: boolean = false) {
			if (all) {
				delete this.params
			} else {
				delete this.params[path]
			}
		},
	},
	persist: true,
})

if (import.meta.hot) {
	//HMR
	import.meta.hot.accept(acceptHMRUpdate(useRouteParamsStore, import.meta.hot))
}
