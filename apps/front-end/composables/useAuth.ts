import type { Apps, Author, Response, User } from "@/types"

export const useAuth = () => {
	// const authUser = useAuthUser();

	// const { $websocket } = useNuxtApp()
	const appsStore = useAppsStore()

	const authStore = useAuthStore()
	const menusStore = useMenusStore()

	const { clearParams } = useRouteParams()

	const { getUser } = storeToRefs(authStore)

	const config = useRuntimeConfig()

	const setAuth = (auth: Apps) => {
		appsStore.setAccessToken(auth.access_token)
		appsStore.setRefreshToken(auth.refresh_token)
		appsStore.setIsTemporal(auth.isTemporal)
	}

	const setUser = (user: User) => {
		authStore.setUser(user)
	}

	// const setCookie = (cookie: any) => {
	//   cookie.value = cookie;
	// };

	const login = async (loginId: string, password: string, rememberMe: boolean) => {
		const { status, data } = await Promise.resolve(
			useCFetch<Response<Apps>>("/api/v2/auth/signin", {
				method: "POST",
				body: {
					loginId,
					password,
				},
			}).then((res: Response<Apps>) => res)
		)

		if (status === 0 && data) {
			setAuth(data)
		}

		// console.log('appsStore.getJwtPayLoad ', appsStore.getJwtPayLoad);
		setUser(appsStore.getJwtPayLoad)

		return appsStore.getJwtPayLoad
	}

	const logout = async () => {
		await useCFetch(`/api/v2/auth/logout`, {
			method: "POST",
		}).finally(() => {
			// if ($websocket.status.value === "OPEN") {
			// 	$websocket.send(
			// 		JSON.stringify({
			// 			type: "notification",
			// 			content: `${getUser.value.name} 님이 로그아웃 하였습니다.`,
			// 		})
			// 	)
			// 	$websocket.close()
			// }
			clearStore()
		})
	}

	const me = async () => {
		if (appsStore.getRefreshToken) {
			setUser(appsStore.getJwtPayLoad)
		} else {
			clearStore()
		}

		return getUser.value
	}

	const clearStore = () => {
		setUser({} as User)
		setAuth({} as Apps)
		clearParams("", true)
		menusStore.setClear()

		// setCookie(null);
	}

	return {
		login,
		logout,
		me,
	}
}

export const useAdmin = () => {
	const appsStore = useAppsStore()
	const { getAccessToken } = storeToRefs(appsStore)
	const authStore = useAuthStore()
	const { getRole } = storeToRefs(authStore)

	return computed(() => {
		if (!getAccessToken.value) return false

		return ["ADMIN", "ROOT"].includes(getRole.value)
	})
}

export const useRoot = () => {
	const appsStore = useAppsStore()
	const { getAccessToken } = storeToRefs(appsStore)
	const authStore = useAuthStore()
	const { getRole } = storeToRefs(authStore)

	return computed(() => {
		if (!getAccessToken.value) return false

		return ["ROOT"].includes(getRole.value)
	})
}
