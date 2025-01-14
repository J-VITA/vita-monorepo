import type { NitroFetchOptions } from "nitropack"
import type { Response } from "@/types"

export function useCFetch<T>(url: string, options: NitroFetchOptions<"json"> = {}) {
	const appStore = useAppsStore()
	const authStore = useAuthStore()
	const { logout } = useAuth()

	const store = storeToRefs(appStore)
	const accessToken = store.getAccessToken

	const defaults: NitroFetchOptions<"json"> = {
		baseURL: process.env.NUXT_PUBLIC_API_BASE,
		// headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {},
		headers: {
			...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
			"Accept-Encoding": "gzip, deflate, br, zstd",
		},
		cache: "force-cache",
	}

	const params = _merge({}, defaults, options)

	const fetchWithRetry = async (
		retryUrl: string,
		retryOptions: NitroFetchOptions<"json">
	): Promise<T> => {
		try {
			appStore.setLoading(true)
			// companyCode가 undefined인 경우 체크
			if (
				retryOptions.params &&
				"companyCode" in retryOptions.params &&
				retryOptions.params.companyCode === undefined
			) {
				console.warn("회사코드가 존재하지 않습니다.")
			}

			const response = await $fetch<any>(retryUrl, retryOptions)

			// companyCode가 undefined가 아닌 경우에만 에러 메시지 표시
			if (
				response?.status !== 0 &&
				response?.message &&
				!(
					retryOptions.params &&
					"companyCode" in retryOptions.params &&
					retryOptions.params.companyCode === undefined
				)
			) {
				if (response?.status === 121) {
					console.warn(`${response?.message}`)
				} else {
					message.error(response.message)
				}
			}

			return response ?? ({} as T)
		} catch (error: any) {
			if (error.response?.status === 401) {
				try {
					const newToken = await refreshToken()
					appStore.setAccessToken(newToken || "")
					authStore.setUser(appStore.getJwtPayLoad)
					const updatedOptions = _merge({}, retryOptions, {
						headers: { Authorization: `Bearer ${newToken}` },
					})
					return fetchWithRetry(retryUrl, updatedOptions)
				} catch (refreshError) {
					console.error("Component Token refresh failed:", refreshError)
					await logout()
					throw refreshError
				}
			} else if (error.response?.status === 403) {
				await logout()
				throw error
			} else if ([502, 503].includes(error.response?.status)) {
				throw createError({
					statusCode: error.response.status,
					statusMessage: "Bad Gateway",
					message: "서버가 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.",
				})
			} else {
				throw error
			}
		} finally {
			appStore.setLoading(false)
		}
	}

	return fetchWithRetry(url, params)
}

const refreshToken = async () => {
	const appStore = useAppsStore()
	const store = storeToRefs(appStore)
	const refreshToken = store.getRefreshToken

	const baseURl = process.env.NUXT_PUBLIC_API_BASE
	try {
		const response = await $fetch<{ refresh: string }>(
			`${baseURl}/api/v2/auth/token/refresh`,
			{
				method: "POST",
				body: { refresh: refreshToken.value },
			}
		)
		return response.refresh
	} catch (error) {
		console.error("Token refresh failed:", error)
		throw new Error("Token refresh failed")
	}
}
