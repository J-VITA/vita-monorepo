import type { Response } from "@/types"

export const useUsers = () => {
	const user = async (params: any) => {
		return await Promise.resolve(
			await useCFetch<Response<any>>(`/api/v2/settings/employees/members`, {
				method: "GET",
				params,
			}).then((res: Response<any>) => res)
		)
	}

	return {
		user,
	}
}
