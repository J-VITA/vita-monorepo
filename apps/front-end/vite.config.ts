// vite.config.js/ts
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Icons from "unplugin-icons/vite"
import Components from "unplugin-vue-components/vite"
import IconsResolve from "unplugin-icons/resolver"
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
	resolve: {
		alias: {
			"@iwx/tsconfig": path.resolve(__dirname, "../../packages/tsconfig"),
		},
	},
	plugins: [
		vue(),
		Components({
			resolvers: [
				IconsResolve(),
				AntDesignVueResolver({
					importStyle: false, // css in js
				}),
			],
			dts: true,
		}),
		Icons({
			compiler: "vue3",
			autoInstall: true,
		}),
	],
})
