/**
 * 리다이렉트 스토어 저장
 * @returns
 */
export const useRedirectFrom = () => {
	const store = useRedirectStore()

	const { getName, getParams, getPath } = storeToRefs(store)

	const setRedirect = async (data: any) => {
		store.setRedirected(data)
	}

	const name = () => {
		return getName.value
	}
	const params = () => {
		return getParams.value
	}
	const path = () => {
		return getPath.value
	}

	return {
		setRedirect,
		name,
		params,
		path,
	}
}
