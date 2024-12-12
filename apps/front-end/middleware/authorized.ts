export default defineNuxtRouteMiddleware((to, from) => {
	const menusStore = useMenusStore()
	const { getMenus } = storeToRefs(menusStore)

	const menus = transformTreeToFlatArray(getMenus.value.menus as any, "id").map(
		(x: any) => ({
			path: x.path,
			isRole: x.isRole,
		})
	)

	if (menus && menus.length > 0) {
		const currentMenu = menus.find((menu: any) => menu.path === to.path)

		if (currentMenu) {
			if (currentMenu.isRole) {
				// 현재 페이지가 isRole이면 접근 허용
				return
			} else {
				// 현재 페이지가 isRole이 아니면 /expenses로 리다이렉트
				message.error("접근 권한이 없습니다.")
				return navigateTo("/")
			}
		} else {
			// 현재 경로가 메뉴에 없으면 /expenses로 리다이렉트
			// 결재 메뉴와 대시보드(홈)은 예외로 둔다.
			if (to.path.indexOf("/approvals") > -1 || to.path.indexOf("/dashboard") > -1) {
				return
			} else {
				if (to.name) {
					message.error(`현재 ${String(to.name)}(은)는 접근 권한이 없습니다.`)
				} else {
					message.error(`현재 ${to.path}(은)는 존재하지 않는 페이지 입니다.`)
				}
				return navigateTo("/")
			}
		}
	} else {
		// 메뉴가 비어있으면 로그인 정보 & 메뉴 정보가 없는 것으로 판단
		return navigateTo("/login")
	}
})
