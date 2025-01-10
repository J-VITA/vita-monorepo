import type { Response } from "@/types"

export type CardStatusType = "ISSUE_READY" | "POSSIBILITY" | "ING" | "STOP" | ""

export const CardStatusColor: Record<string, string> = {
	ISSUE_READY: "default",
	POSSIBILITY: "green",
	ING: "blue",
	STOP: "red",
} as const

export const CardUseStateColor: Record<string, string> = {
	UNPROCESSED: "red",
	IN_PROGRESS: "green",
	COMPLETED: "#00000040",
	PERSONAL_EXPENSE_PROCESSED: "purple",
} as const

export const CardTypeColor: Record<string, string> = {
	PERSONAL: "cyan",
	SHARED: "orange",
} as const

export const myCardOptions = async (
	companyCode: string,
	employeeId: string | number,
	isAll: boolean = false
) => {
	return await useCFetch<Response<Array<any>>>("/api/v2/cards/commons/my-cards", {
		method: "GET",
		params: {
			companyCode,
			employeeId,
		},
	}).then((res) => {
		const list = res.data?.map((x) => ({
			label: `[${x.cardTypeLabel}] ${x.name} / ${formatCardNumber(x.number)}`,
			value: x.id,
			data: { ...x },
		}))

		if (isAll) {
			return [{ label: "전체", value: "" }, ...(list || [])]
		} else {
			return list
		}
	})
}

export const myCardStatuses = async (
	companyCode: string,
	employeeId: string | number,
	cardStatuses: Array<string>
) => {
	const { data, status, refresh } = await useAsyncData(
		`my-cards-statuses`,
		() =>
			useCFetch<any>("/api/v2/cards/commons/my-cards/statuses", {
				method: "GET",
				params: {
					companyCode,
					employeeId,
					cardStatuses,
				},
			}),
		{
			transform: (res: any) => {
				return res.data.map((x: any) => ({
					label: `[${x.cardTypeLabel}] ${x.name} / ${formatCardNumber(x.number)}`,
					value: x.id,
					data: { ...x },
				}))
			},
		}
	)

	return {
		data,
		status,
		refresh,
	}
}
