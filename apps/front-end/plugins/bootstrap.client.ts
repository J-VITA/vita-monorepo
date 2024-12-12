import BootstrapVue from "bootstrap-vue-next"
// import {createBootstrap, useColorMode} from 'bootstrap-vue-next'

export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.use(BootstrapVue)
	// nuxtApp.vueApp.mount('#app')
})
