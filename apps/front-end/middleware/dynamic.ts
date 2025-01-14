export default defineNuxtRouteMiddleware(async (to, from) => {
	console.log(to.params.type)
	console.log(to.params.id)

	const response = await Promise.resolve(
		useIFetch(`/api/v2/masters/approvalForms/types/approvalFormTypes`)
			.then((response: any) => response.data.value)
			.then((response: any) => response.data)
	)
	const types = response.map((e: any) => compCase(e.code))

	if (!types.includes(to.params.type as string)) {
		return await navigateTo("/approvals/home")
	}
})
