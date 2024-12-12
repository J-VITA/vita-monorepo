import type { MenuManagement } from "@/types/settings/menu"
import type { Response } from "@/types"

export const useMenus = () => {
	const menusStore = useMenusStore()
	const { getMenus } = storeToRefs(menusStore)

	const setMenu = (menus: Array<MenuManagement> = [], error: any, pending: boolean) => {
		menusStore.setMenus(menus, error, pending)
	}

	const menu = async (id: string, compCode: string) => {
		if (!id) {
			return
		}

		const { status, data, message } = await Promise.resolve(
			useCFetch<Response<Array<MenuManagement>>>(`/api/v2/members/menu`, {
				method: "GET",
			}).then((res: Response<any>) => res || {})
		)

		setMenu(status === 0 ? data : [], status === 0 ? null : message, false)

		return getMenus.value
	}

	const pageSelectRole = () => {
		const route = useRoute()
		const menus = transformTreeToFlatArray(getMenus.value.menus as any, "id").map(
			(x: any) => ({
				path: x.path,
				selectLevelTypeLabel: x.selectLevelTypeLabel,
				selectLevelTypeName: x.selectLevelTypeName,
			})
		)
		if (menus && menus.length > 0) {
			const currentMenu = menus.find((menu: any) => menu.path === route.path)

			if (currentMenu) {
				return currentMenu
			}
		} else {
			// 메뉴 정보가 없음.
			return undefined
		}
	}

	return {
		menu,
		pageSelectRole,
	}
}
