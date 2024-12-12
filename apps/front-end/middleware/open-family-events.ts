import { Response } from "@/types"
import type { Data } from "@/types/master/config"

export default defineNuxtRouteMiddleware(async () => {
	const { getRules } = useExpenseRules()

	const rules = await getRules().then((res: Response<Data>) => res.data)

	if (!rules?.familyEventFlag) return navigateTo({ path: "/master" })
})
