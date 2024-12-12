export default defineNuxtRouteMiddleware((to, from) => {
	// 조건에 따라 레이아웃 설정
	if (["", "/", "/dashboard"].includes(to.path)) {
		setPageLayout("default")
	} else if (to.path.indexOf("/login") > -1) {
		setPageLayout("login-layout")
	} else {
		setPageLayout("main-layout")
	}
})
