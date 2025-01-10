/**
 * # Custom Directives
 * ### https://vuejs.org/guide/reusability/custom-directives.html
 * * If you register a Vue directive, you must register it on both client and server side unless you are only using it when rendering one side. If the directive only makes sense from a client side, you can always move it to ~/plugins/my-directive.client.ts and provide a 'stub' directive for the server in ~/plugins/my-directive.server.ts.
 */

import { Modal } from "ant-design-vue"
import type { RouteLocationNormalized, NavigationGuardNext } from "vue-router"

export default defineNuxtPlugin((nuxtApp) => {
	const router = useRouter()
	const { setRedirect } = useRedirectFrom()

	router.afterEach((page) => {
		try {
			useHead({ title: `${page.meta.name}` })
			setRedirect(page.path)
			Modal.destroyAll()
		} catch (err) {
			console.error("defineNuxtPlugin err ", err)
		}
	})

	nuxtApp.hook("page:finish", () => {
		router.beforeEach((to, from, next) => {
			const middlewares: string[] = []

			if (["", "/"].includes(to.path)) {
				// addRouteMiddleware('redirect-main', () => {})
			} else if (to.path.indexOf("/login") > -1) {
				middlewares.push("guest-only")
			} else {
				middlewares.push("authorized")
				if (to.path.indexOf("/master/project") > -1) {
					middlewares.push("open-project")
				} else if (to.path.indexOf("/master/fuels") > -1) {
					middlewares.push("open-fuels")
				} else if (to.path.indexOf("/master/family-events") > -1) {
					middlewares.push("open-family-events")
				} else if (to.path.indexOf("/master/perdiem") > -1) {
					middlewares.push("open-perdiem")
				}
			}

			// 동적으로 추가된 미들웨어 실행
			if (middlewares.length > 0) {
				// console.log('middlewares 11', middlewares);
				runMiddlewares(middlewares, to, from, next)
			} else {
				next()
			}
		})
	})

	// app:created 훅을 사용하여 초기화 시점에 미들웨어 실행
	nuxtApp.hook("app:created", async () => {
		const to = router.currentRoute.value
		const from = { path: "/" } as RouteLocationNormalized // 초기 경로를 '/'로 설정
		const next = (location?: string | false) => {
			if (location === false) return
			if (typeof location === "string") {
				router.push(location)
			}
		}
		await runMiddlewares(getMiddlewares(to), to, from, next as NavigationGuardNext)
	})

	// 라우트 변경 시 미들웨어 실행
	router.beforeEach(async (to, from, next) => {
		// console.log(`Navigation to: ${to.path}`); // 디버깅 로그

		// 로그인 페이지로 이동하는 경우 미들웨어 실행 건너뛰기
		if (to.path === "/login") {
			console.log("Skipping middleware for login page")
			return next()
		}

		const middlewares = getMiddlewares(to)
		// console.log(`Middlewares to run: ${middlewares.join(', ')}`); // 디버깅 로그

		try {
			await runMiddlewares(middlewares, to, from, next)
		} catch (error) {
			console.error("Error in middleware execution:", error)
			next("/error") // 에러 페이지로 리다이렉트
		}
	})
})

// 동적으로 미들웨어를 실행하는 함수
async function runMiddlewares(
	middlewares: string[],
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext
) {
	for (const middleware of middlewares) {
		// console.log(`Executing middleware: ${middleware}`); // 디버깅 로그
		try {
			const mw = await import(`~/middleware/${middleware}.ts`).then((m) => m.default || m)
			const result = await mw(to, from)
			if (result) {
				console.log(`Middleware ${middleware} redirected to: ${result}`)
				return next(result)
			}
		} catch (error) {
			console.error(`Error in middleware ${middleware}:`, error)
			throw error // 에러를 상위로 전파
		}
	}
	next()
}

/**
 * 경로에 따른 미들웨어 목록을 반환하는 함수
 * * 미들웨어 셋업은 아래 함수에 적용하면 됨.
 * @param to
 * @returns
 */
function getMiddlewares(to: RouteLocationNormalized): string[] {
	const middlewares: string[] = []

	if (["", "/"].includes(to.path)) {
		// addRouteMiddleware('redirect-main', () => {})
		middlewares.push("redirect-main")
	} else if (to.path.indexOf("/login") > -1) {
		middlewares.push("guest-only")
	} else {
		middlewares.push("authorized")
		if (to.path.indexOf("/master/project") > -1) {
			middlewares.push("open-project")
		} else if (to.path.indexOf("/master/fuels") > -1) {
			middlewares.push("open-fuels")
		} else if (to.path.indexOf("/master/family-events") > -1) {
			middlewares.push("open-family-events")
		} else if (to.path.indexOf("/master/perdiem") > -1) {
			middlewares.push("open-perdiem")
		}
	}

	return middlewares
}
