/**
 * # Custom Directives
 * ### https://vuejs.org/guide/reusability/custom-directives.html
 * * If you register a Vue directive, you must register it on both client and server side unless you are only using it when rendering one side. If the directive only makes sense from a client side, you can always move it to ~/plugins/my-directive.client.ts and provide a 'stub' directive for the server in ~/plugins/my-directive.server.ts.
 */
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.directive("focus", {
		mounted(el) {
			console.log("focus", el)
			el.focus()
		},
		getSSRProps(binding, vnode) {
			console.log("SSR Props ", binding, vnode)
			return {}
		},
	})
})
