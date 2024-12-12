declare module "#app" {
	interface RuntimeNuxtHooks {
		"app:unmounted": () => void
	}
}

import { defineNuxtPlugin } from "#app"
import { useWebSocket } from "@vueuse/core"

export default defineNuxtPlugin((nuxtApp) => {
	const authStore = useAuthStore()
	const { getUserId } = storeToRefs(authStore)

	const config = useRuntimeConfig()
	const wsUrl = `ws://${window.location.host}/_ws?userId=${getUserId.value}`

	const { status, data, send, open, close } = useWebSocket(wsUrl, {
		autoReconnect: {
			retries: 3,
			delay: 5000,
			onFailed() {
				console.log("WebSocket reconnection failed after 3 attempts")
			},
		},
		onConnected(ws) {
			// console.log('WebSocket connected');
		},
		onDisconnected(ws, event) {
			// console.log('WebSocket disconnected:', event);
		},
		onError(ws, event) {
			// console.error('WebSocket error:', event);
		},
		onMessage(ws, event) {
			const msg = JSON.parse(event.data)
			console.log("WebSocket message received:", msg.content)

			// 여기에서 private_message 메시지 처리 로직을 추가할 수 있습니다.
			message.info(`${msg.content}`)
		},
	})

	// 컴포넌트가 마운트될 때 연결 시도
	nuxtApp.hook("app:mounted", () => {
		open()
	})

	// 앱이 언마운트될 때 연결 종료
	nuxtApp.hook("app:unmounted", () => {
		close()
	})

	return {
		provide: {
			websocket: {
				status,
				data,
				send,
				open,
				close,
			},
		},
	}
})
