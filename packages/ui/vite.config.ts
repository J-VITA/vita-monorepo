import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import dts from "vite-plugin-dts"
import { resolve } from "path"
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
						const pkg = JSON.parse(contents.toString())
						return JSON.stringify(
							{
								name: "@iwx/ui",
								version: "0.0.1",
								type: "module",
								main: "./dist/index.cjs.js",
								module: "./dist/index.mjs",
								types: "./dist/index.d.ts",
								exports: {
									".": {
										types: "./dist/index.d.ts",
										module: "./dist/index.mjs",
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
		outDir: "libs/@iwx/ui/dist",
		lib: {
			entry: resolve(__dirname, "./index.ts"),
			name: "iwx-ui",
			fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
			formats: ["es", "cjs"],
		},
		rollupOptions: {
			external: ["vue", "ag-grid-community", "ag-grid-enterprise"],
			output: {
				globals: {
					vue: "Vue",
					"ag-grid-community": "agGrid",
					"ag-grid-enterprise": "agGridEnterprise",
				},
			},
		},
	},
})
