/**
 * route 경로별 params 저장
 * @returns
 */
export const useRouteParams = () => {
	const routeParamsStore = useRouteParamsStore()
	const { getParams } = storeToRefs(routeParamsStore)

	const clearParams = async (path: string, all: boolean = false) => {
		routeParamsStore.clear(path, all)
	}

	const setRouteParams = async (path: string, params: any) => {
		routeParamsStore.setParams(path, params)
	}

	const getRouteParams = async (path: string) => {
		return getParams.value[path]
	}

	return {
		/**
		 * (composable)화면 경로에 따른 params 저장
		 * @param path
		 * @param params
		 */
		setRouteParams,
		/**
		 * (composable)화면 경로별 params 세팅값 가져오기
		 * @param path
		 * @returns
		 */
		getRouteParams,
		clearParams,
	}
}
