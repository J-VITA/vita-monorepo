import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { resolve } from "path"
import dts from "vite-plugin-dts"
import { viteStaticCopy } from "vite-plugin-static-copy"

export default defineConfig({
	plugins: [
		vue(),
		dts({
			include: ["src/**/*.ts", "src/**/*.vue"],
			beforeWriteFile: (filePath: any, content: any) => ({
				filePath,
				content,
			}),
		}),
		viteStaticCopy({
			targets: [
				{
					src: "package.json",
					dest: "../",
					transform: (contents) => {
						return JSON.stringify(
							{
								name: "@iwx/elements",
								version: "0.0.1",
								type: "module",
								main: "./dist/index.cjs.js",
								module: "./dist/index.es.js",
								types: "./dist/index.d.ts",
								exports: {
									".": {
										types: "./dist/index.d.ts",
										import: "./dist/index.es.js",
										require: "./dist/index.cjs.js",
									},
									"./style": "./dist/style.css",
								},
							},
							null,
							2
						)
					},
				},
			],
		}),
	],
	build: {
		outDir: "libs/@iwx/elements/dist",
		lib: {
			entry: resolve(__dirname, "./index.ts"),
			name: "iwx-elements",
			fileName: (format) => `index.${format === "es" ? "es" : "cjs"}.js`,
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: ["vue"],
			output: {
				globals: {
					vue: "Vue",
				},
			},
		},
	},
})
