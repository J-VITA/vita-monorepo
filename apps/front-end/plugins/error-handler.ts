export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.hook("vue:error", (error, instance, info) => {
		if (
			error instanceof TypeError &&
			error.message.includes("Cannot read properties of null (reading 'da')")
		) {
			console.warn("Ignoring known error during layout transition:", error)
			return
		}

		if (process.client) {
			console.error("Error:", error)
			console.log("Component:", instance?.$options.name || "Unknown")
			console.log("Error Info:", info)
			console.log("File:", (error as any).fileName || "Unknown")
			console.log("Line:", (error as any).lineNumber || "Unknown")
		}
	})

	nuxtApp.hook("app:error", (error) => {
		if (
			error instanceof TypeError &&
			error.message.includes("Cannot read properties of null (reading 'da')")
		) {
			console.warn("Ignoring known error during layout transition:", error)
			return
		}

		if (process.client) {
			console.error("App Error:", error)
			console.log("Stack:", error.stack)
		}
	})

	nuxtApp.vueApp.config.errorHandler = (error: any, instance, info) => {
		if (
			error instanceof TypeError &&
			error.message.includes("Cannot read properties of null (reading 'da')")
		) {
			console.warn("Ignoring known error during layout transition:", error)
			return
		}

		if (process.client) {
			console.error("Global Error:", error)
			console.log("Component:", instance?.$options.name || "Unknown")
			console.log("Error Info:", info)
			console.log("File:", (error as any).fileName || "Unknown")
			console.log("Line:", (error as any).lineNumber || "Unknown")
			console.log("Stack:", error.stack)

			// 추가: 라우터 관련 오류 처리
			if (error.name === "NavigationDuplicated") {
				console.warn("Navigation duplicated:", error.message)
				return
			}

			// 추가: 컴포넌트 언마운트 관련 오류 처리
			if (error.message.includes("Cannot read properties of null")) {
				console.warn("Possible unmount error:", error.message)
				return
			}
		}
	}
})
