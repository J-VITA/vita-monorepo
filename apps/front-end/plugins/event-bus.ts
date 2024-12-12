import mitt from "mitt"

export default defineNuxtPlugin(() => {
	const emitter = mitt()

	return {
		provide: {
			bus: {
				emit: emitter.emit,
				on: emitter.on,
				off: emitter.off,
			},
		},
	}
})
