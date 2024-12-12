// https://nuxt.com/docs/api/configuration/nuxt-config

import { defineNuxtConfig } from "nuxt/config"
import type { NuxtPage } from "nuxt/schema"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "url"
import Components from "unplugin-vue-components/vite"
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers"

const ONE_DAY = 60 * 60 * 24 * 1000
const ONE_WEEK = ONE_DAY * 7

export default defineNuxtConfig({
	devtools: { enabled: false },
	telemetry: false,
	experimental: {
		// Nuxt와 Nitro에서 중첩된 컴포저블에 대해 네이티브 비동기 컨텍스트 접근을 활성화합니다. 이를 통해 비동기 컴포저블 내부에서 컴포저블을 사용할 수 있으며, Nuxt 인스턴스를 사용할 수 없다는 오류가 발생할 가능성을 줄입니다.
		asyncContext: true,
		// Vue 번들에 대한 비동기 진입점 생성을 활성화하여 모듈 페더레이션 지원을 돕습니다.
		asyncEntry: true,
		// 빌드 시 vue, @vue/*, vue-router를 외부화합니다. 기본적으로 활성화되어 있습니다.
		externalVue: true,
		// vite/webpack 청크 로딩 중 오류가 발생할 때 app:chunkError 훅을 발생시킵니다. 기본 동작은 청크 로딩 실패 시 새로운 라우트로 하드 리로드를 수행합니다.
		emitRouteChunkError: "automatic", // 또는 'manual' 또는 false
		// chunk 오류 발생 후 또는 수동 reloadNuxtApp() 호출 후 sessionStorage에서 Nuxt 앱 상태를 복원할 수 있도록 합니다.
		restoreState: true,
		// 복잡한 타입을 부활시키는 기능이 포함된 JSON 페이로드 렌더링을 허용합니다.
		renderJsonPayloads: true,
		// Nitro 내의 Vue 서버 렌더러 엔드포인트를 비활성화합니다.
		noVueServer: false,
		// nuxt generate로 생성된 페이지의 페이로드 추출을 활성화합니다.
		payloadExtraction: true,
		// Speculation Rules API를 사용한 교차 출처 프리페치를 활성화합니다.
		crossOriginPrefetch: true,
		// 클라이언트 사이드 라우터와 View Transition API 통합을 활성화합니다.
		viewTransition: true,
	},

	vite: {
		vue: { customElement: true },
		vueJsx: { mergeProps: true },
		plugins: [
			Components({
				resolvers: [
					AntDesignVueResolver({
						importStyle: false,
						resolveIcons: true,
					}),
				],
			}),
		],
		ssr: {
			noExternal: ["ant-design-vue", "@ant-design/icons-vue"],
		},
	},

	nitro: {
		prerender: {
			crawlLinks: true,
			ignore: ["/api"],
			routes: ["/dashboard", "/login", "/"],
		},
		routeRules: {
			"/login": {
				ssr: false, // 메인 페이지는 SSR
				prerender: true,
			},
			"/": {
				ssr: false, // 메인 페이지는 SSR
				prerender: true,
			},
			"/dashboard": {
				ssr: false, // 대시보드는 SSR
				prerender: true, // 동적 콘텐츠를 위해 프리렌더링 비활성화
			},
			// "/**": {
			//   ssr: process.env.NODE_ENV === "production" ? true : false,
			//   prerender: process.env.NODE_ENV === "production" ? false : true,
			// },
			"/api/**": {
				proxy: `${process.env.NUXT_PUBLIC_API_BASE}/api/**`,
				cors: true,
			},
			"/_ws": {
				cors: true,
			},
			"/**": {
				// 마지막에 위치하여 다른 모든 경로에 적용
				ssr: true,
				prerender: false,
			},
		},
		experimental: {
			websocket: true,
		},
	},

	webpack: {
		loaders: {
			vue: {
				hotReload: true,
			},
		},
	},

	vue: {
		propsDestructure: true,
	},

	app: {
		head: {
			charset: "utf-8",
			viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
			meta: [
				{ name: "description", content: `WiseXpense 솔루션` },
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1, shrink-to-fit=no",
				},
				{ charset: "utf-8" },
			],
			link: [
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css?family=Material+Icons%7CMaterial+Icons+Outlined%7CMaterial+Icons+Two+Tone%7CMaterial+Icons+Round%7CMaterial+Icons+Sharp",
				},
			],
			script: [
				// Daum 주소 API
				{
					src: "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js",
				},
			],
			style: [
				// <style type="text/css">:root { color: red }</style>
				// { children: ':root { color: red }', type: 'text/css' }
			],
			noscript: [
				// <noscript>JavaScript is required</noscript>
				{ children: "JavaScript is required" },
			],
		},
		rootId: "app",
		// page transitions
		// https://nuxt.com/docs/getting-started/transitions
		// pageTransition: {
		// 	name: "slide-left",
		// 	mode: "out-in",
		// },
		// layoutTransition: {
		// 	name: "fade",
		// 	mode: "out-in",
		// },
	},

	modules: [
		"@pinia/nuxt",
		"@pinia-plugin-persistedstate/nuxt",
		"nuxt-mapbox",
		"@nuxtjs/i18n",
		"nuxt-lodash",
		"dayjs-nuxt",
		"@ant-design-vue/nuxt",
		// '@vuestic/nuxt',
		// '@bootstrap-vue-next/nuxt',
		// 'nuxt-bootstrap-icons',
		// '@element-plus/nuxt',
	],

	antd: {
		// Options ... 대체적으로 사용할 일은 없을듯...
		//Link : https://nuxt.com/modules/ant-design-vue#components
		components: [], // 컴포넌트를 자동으로 가져오지 못하는 경우 여기에 추가 eg) ['button']
		imports: [], // 컨텐츠 추가할 경우
		icons: [], //@ant-design/icons-vue에서 해당 컴포넌트를 가져 못하는 경우 여기에 추가해야함.
		extractStyle: true, //페이지에서 CSS 깜빡 문제 해결 default: false
	},

	piniaPersistedstate: {
		cookieOptions: {
			sameSite: "strict",
		},
		storage: "localStorage", //'localStorage', 'sessionStorage' or 'cookies'
	},

	alias: {
		// pinia: process.env.NODE_ENV === 'production'
		//   ? '../../node_modules/pinia/dist/pinia.mjs'
		//   : '../../node_modules/@pinia/nuxt/node_modules/pinia/dist/pinia.mjs',
		images: fileURLToPath(new URL("./assets/images", import.meta.url)),
		css: fileURLToPath(new URL("./assets/css", import.meta.url)),
		scss: fileURLToPath(new URL("./assets/scss", import.meta.url)),
		pages: fileURLToPath(new URL("./pages", import.meta.url)),
		stores: fileURLToPath(new URL("./stores", import.meta.url)),
		plugins: fileURLToPath(new URL("./plugins", import.meta.url)),
	},

	components: [
		{ path: "@/components/layouts", pathPrefix: false },
		{ path: "@/components/ui", pathPrefix: false },
	],

	imports: {
		dirs: ["./stores"],
	},

	pinia: {
		// autoImports: ['defineStore', 'acceptHMRUpdate']
		// autoImports: ['defineStore', 'storeToRefs'],
		storesDirs: ["stores/**"],
	},

	i18n: {
		vueI18n: "./i18n.config.ts",
		detectBrowserLanguage: {
			useCookie: true,
			cookieSecure: true,
			cookieCrossOrigin: true,
			cookieKey: "i18n_language",
			redirectOn: "root", // recommended
			alwaysRedirect: true,
		},
		strategy: "prefix_except_default",
		customRoutes: "config",
		experimental: {
			localeDetector: "./localeDetector.ts",
			autoImportTranslationFunctions: true,
		},
	},

	lodash: {
		prefix: "_",
		prefixSkip: ["string"],
		upperAfterPrefix: false,
		exclude: ["map"],
		alias: [
			["camelCase", "stringToCamelCase"], // => stringToCamelCase
			["kebabCase", "stringToKebab"], // => stringToKebab
			["upperFirst", "stringToUpperFirst"], // => stringToUpperFirst
			["isDate", "isLodashDate"], // => _isLodashDate
		],
	},

	sourcemap: {
		server: false,
		client: true,
	},

	css: ["scss/styles.scss"],

	postcss: {
		plugins: {
			tailwindcss: {},
			autoprefixer: {},
		},
	},

	mapbox: {
		accessToken:
			"pk.eyJ1IjoianZpdGEyMyIsImEiOiJjbHVycnc5bG0wNG01Mmptb3J3Z2FqaDNzIn0.L4Z6fQgpnB_xTyxzljiFOA",
	},

	plugins: [
		// '@/plugins/i18n.ts'
	],

	// Build configuration
	build: {
		transpile: [
			"@iwx/ui",
			"ag-grid-community",
			"ag-grid-vue3",
			"pinia-plugin-persistedstate",
			"@ant-design/icons-vue",
			"lodash",
			"dayjs",
		],
		// postcss options
		// postcss: {},
		// extend webpack config here
		// extend(config, ctx) {}
	},

	// Environment variables
	runtimeConfig: {
		apiKey: process.env.API_KEY,
		cookieName: "__session",
		cookieSecret: "secret",
		cookieExpires: ONE_DAY.toString(),
		cookieRememberMeExpires: ONE_WEEK.toString(),
		public: {
			apiBase: `${process.env.NUXT_PUBLIC_API_BASE}/api`,
			wsEndpoint: `${process.env.NUXT_PUBLIC_WEBSOCKET_HOST}`,
			environment: "",
			openRouteServiceApiKey: "5b3ce3597851110001cf624896e5b9e113124d02a6985f8e089127f4",
			kakaoAppKey: "88b2f6895cae47800a41290b9f089f5d",
		},
	},

	// TypeScript configuration
	typescript: {
		strict: true,
		// typeCheck: true,
	},

	hooks: {
		"pages:extend"(pages) {
			/**
			 * 페이지 트랜지션 세팅
			 * @param pages
			 */
			function setTransition(pages: NuxtPage[]) {
				for (const page of pages) {
					page.meta ||= {}
					page.meta.pageTransition = {
						name: "slide-left",
						mode: "out-in", // default
					}
					page.meta.layoutTransition = {
						name: "fade",
					}
				}
			}
			// setTransition(pages)

			// /**
			//  * 미들웨어 및 레이아웃 등 기본 메타 세팅
			//  * @param pages
			//  */
			// function setDefaultMeta(pages: NuxtPage[]) {
			//   for (const page of pages) {
			//     page.meta ||= {};

			//     if (['', '/', '/dashboard'].includes(page.path)) {
			//       page.meta.layout = 'default';
			//     } else if (page.path.indexOf('/settings') > -1) {
			//       page.meta.layout = 'main-layout';
			//     } else if (page.path.indexOf('/login') > -1) {
			//       page.meta.layout = 'login-layout';
			//     } else {
			//       page.meta.layout = 'main-layout';
			//     }
			//     if (page.children) {
			//       setDefaultMeta(page.children);
			//     }
			//   }
			// }
			// setDefaultMeta(pages);

			/**
			 * remove routes
			 * @param pattern
			 * @param pages
			 */
			function removePagesMatching(pattern: RegExp, pages: NuxtPage[] = []) {
				const pagesToRemove = []
				for (const page of pages) {
					const file: string = page.file || ""
					if (pattern.test(file)) {
						pagesToRemove.push(page)
					} else {
						removePagesMatching(pattern, page.children)
					}
				}
				for (const page of pagesToRemove) {
					pages.splice(pages.indexOf(page), 1)
				}
			}
			// removePagesMatching(/\.ts$/, pages);
		},
		close: () => {},
	},

	ssr: false,

	router: {
		options: {
			scrollBehaviorType: "smooth", //Scroll Behavior for hash links
			hashMode: false, //Hash Mode (SPA) 모드 해제 시 ssr 플래그 false 로 변경해야함. (뒤 경로에 /# 붙음)
		},
	},

	compatibilityDate: "2024-09-04",
})
