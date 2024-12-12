export default defineNuxtRouteMiddleware((to, from) => {
	if (["/", ""].includes(to.path)) {
		return navigateTo("/dashboard")
	}
})
