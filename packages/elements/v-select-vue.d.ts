declare module "vue-select" {
	import { DefineComponent } from "vue"

	interface VSelectProps {
		options: any[]
		multiple?: boolean
		searchable?: boolean
		filterable?: boolean
		placeholder?: string
		label?: string
		reduce?: (item: any) => any
		loading?: boolean
	}

	const VSelect: DefineComponent<VSelectProps>
	export default VSelect
}
