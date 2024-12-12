import type { Response } from "@/types"

export const useApprovals = () => {
	const authStore = useAuthStore()
	const { getEmployeeId } = storeToRefs(authStore)

	const detail = async (id: string | number) => {
		const { data: apporals } = await useCFetch<Response<any>>(`/api/v2/approvals`, {
			method: "GET",
			params: {
				approvalHeaderId: id,
				employeeId: getEmployeeId.value,
			},
		}).then((res: Response<any>) => res)
		return apporals
	}

	const save = async (body: any) => {
		const { data: apporals } = await useCFetch<Response<any>>(`/api/v2/approvals/save`, {
			method: "POST",
			body,
		}).then((res: Response<any>) => res)
		return apporals
	}

	const remove = async (id: any) => {
		return await useCFetch<Response<any>>(`/api/v2/approvals/${id}`, {
			method: "DELETE",
			body: { id },
		}).then((res: Response<any>) => res)
	}

	return {
		detail,
		save,
		remove,
	}
}
