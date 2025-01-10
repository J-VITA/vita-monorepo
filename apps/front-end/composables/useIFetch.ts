import type { UseFetchOptions } from "#app"
// import { defu } from 'defu';
// import { transform, upperCase } from 'lodash';
// import { HttpMethods } from '~/types';
import type { Response } from "@/types"

export async function useIFetch<T>(url: string, options: UseFetchOptions<T> = {}) {
	const appStore = useAppsStore()
	const authStore = useAuthStore()

	const store = storeToRefs(appStore)

	appStore.setLoading(true)

	const { logout } = useAuth()

	const accessToken = store.getAccessToken
	//useCookie("accessToken");

	// Unique key for caching based on URL and parameters
	const uniqueKey = `${url}-${JSON.stringify(options.params || {})}`
	const ctr = new AbortController()

	const defaults: UseFetchOptions<T> = {
		baseURL: process.env.NUXT_PUBLIC_API_BASE,
		// key: url,
		signal: ctr.signal,
		key: uniqueKey, // Unique key to prevent data overwriting
		// headers: accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {},
		headers: {
			...(accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}),
			"Accept-Encoding": "gzip, deflate, br, zstd",
		},
		onResponse: async ({ response, options }) => {
			if (response.status === 200) {
				const responseData = response._data

				if (responseData.status !== 0) {
					if (ctr.signal.reason.name === "AbortError") {
						console.log("options ", options)
					} else {
						if (responseData.status === 121) {
							console.warn(`${responseData.message}`)
						} else {
							message.error(`${responseData.message}`)
						}
					}
				}
				return responseData
			} else if (response.status === 401) {
				try {
					const newToken = await refreshToken()
					appStore.setAccessToken(newToken || "")
					authStore.setUser(appStore.getJwtPayLoad)
					const retryOptions = _merge({}, options, {
						headers: { Authorization: `Bearer ${newToken}` },
					})
					return useFetch(url, retryOptions as UseFetchOptions<T>)
				} catch (error) {
					console.error("Token refresh failed:", error)
					await logout()
				}
			} else if (response.status === 403) {
				await logout()
			} else if ([502, 503].includes(response.status)) {
				throw createError({
					statusCode: response.status,
					statusMessage: "Bad Gateway",
					message: "서버가 일시적으로 응답할 수 없습니다. 잠시 후 다시 시도해주세요.",
				})
			}
		},
		cache: "force-cache",
		transform: (response: T) => {
			return response
		},
	}

	// const params = defu(options, defaults);
	const params = _merge({}, defaults, options)

	try {
		const fetchResponse = await useFetch(url, params)

		return fetchResponse
	} finally {
		if (ctr) {
			ctr.abort()
		}
		appStore.setLoading(false)
	}
}

const refreshToken = async () => {
	const appStore = useAppsStore()
	const store = storeToRefs(appStore)
	const refreshToken = store.getRefreshToken

	const baseURl = process.env.NUXT_PUBLIC_API_BASE
	const { data, status } = await useFetch<{ refresh: string }>(
		`${baseURl}/api/v2/auth/token/refresh`,
		{
			method: "POST",
			body: { refresh: refreshToken.value },
		}
	)
	console.log("status.value ", status)
	if (status.value === "success") {
		return data.value?.refresh
	} else {
		throw new Error("Token refresh failed")
	}
}
