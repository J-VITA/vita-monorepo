import { h } from "vue"

export const materialIcons = (
	type: "m" | "mo" | "mso" = "m",
	text: string,
	size?: number
) => {
	const ico = {
		m: "material-icons",
		mo: "material-icons-outlined",
		mso: "material-symbols-outlined",
	} as const
	const fontSize = size ? size + "rem" : "1.6rem"

	return h(
		"span",
		{
			class: ["anticon", "material"],
			style: { fontSize: fontSize, verticalAlign: "-0.21em" },
		},
		[
			h("i", {
				class: [ico[type], "notranslate"],
				style: { fontSize: "inherit" },
				innerHTML: text,
			}),
		]
	)
}
