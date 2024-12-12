declare module "@env" {
	export interface Env {
		NUXT_TELEMETRY_DISABLED: number
		NODE_TLS_REJECT_UNAUTHORIZED: number
		API_KEY: string
		NUXT_COOKIE_NAME: string
		NUXT_COOKIE_SECRET: string
		NUXT_COOKIE_EXPIRES: number
		NUXT_COOKIE_REMEMBER_ME_EXPIRES: number
		PROJECT_NM: string
		NUXT_PUBLIC_API_BASE: string
		PORT: number
		NUXT_PUBLIC_WEBSOCKET_HOST: string
	}
}
