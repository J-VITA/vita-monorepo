import { ref, provide, watch, inject, onMounted, nextTick } from "vue"
import {
	FIRST_PAGE,
	DEFAULT_PAGE_SIZE,
	UNLIMITED,
	LANG_MAX_SELECTED_LIMIT,
	NO_PAGINATION_PAGE_SIZE,
} from "./constants"
import { KO_KR } from "../language"
import { useLanguage, useDebounce } from "./helper"
import { useItemSelection } from "./list"
import { isEmptyArray } from "./utilities"

export function selectPageProps() {
	return {
		/**
		 * binding selected item keys, it must be match 'keyProp' option value
		 */
		modelValue: { type: Array, default: undefined },
		placeholder: { type: String, default: "" },
		/** multiple selection */
		multiple: { type: Boolean, default: false },
		language: { type: String, default: KO_KR },
		/**
		 * specify property to be key field, the value will return by v-model
		 */
		keyProp: { type: String, default: "id" },
		/**
		 * specify property to display in data row
		 */
		labelProp: { type: [String, Function], default: "name" },
		pageSize: { type: Number, default: DEFAULT_PAGE_SIZE },
		/**
		 * maximum number of selection, set 0 to unlimited
		 * depend on `multiple` prop set to true
		 */
		max: { type: Number, default: UNLIMITED, validator: (val) => val >= 0 },
		/**
		 * pagination bar
		 */
		pagination: { type: Boolean, default: true },
		/**
		 * text written from right to left
		 */
		rtl: { type: Boolean, default: false },
		/**
		 * the width of drop down menu
		 */
		width: { type: [String, Number], default: undefined },
		/** debounce delay when typing, in milliseconds */
		debounce: { type: Number, default: 300 },
	}
}

export function dropdownProps() {
	return {
		disabled: { type: Boolean, default: false },
		/** Add custom class to trigger container, work on dropdown selection mode */
		customTriggerClass: { type: String, default: "" },
		/** Add custom class to dropdown container, work on dropdown selection mode */
		customContainerClass: { type: String, default: "" },
	}
}

export function selectPageEmits() {
	return [
		"update:modelValue",
		"fetch-data",
		"fetch-selected-data",
		"selection-change",
		"remove",
		"close-dropdown",
		"adjust-dropdown",
	]
}

export function useData(props, emit) {
	const lang = useLanguage(props.language)
	const {
		selected,
		selectedCount,
		isItemSelected,
		removeAll,
		removeItem,
		selectItem,
		setSelected,
		isKeysEqualToSelected,
	} = useItemSelection(props, emit)

	// query string for search input
	const query = ref("")
	// alert message
	const message = ref("")
	// current page number
	const currentPage = ref(FIRST_PAGE)
	// total row count
	const totalRows = ref(0)
	// data list
	const list = ref([])
	// data loading state
	const loading = ref(false)

	const messageDebounce = useDebounce()

	const isDataEmpty = () => isEmptyArray(list.value)
	const renderCell = (row) => {
		if (!row || !Object.keys(row).length) return ""
		switch (typeof props.labelProp) {
			case "string":
				return row[props.labelProp]
			case "function":
				return props.labelProp(row)
		}
	}
	const checkAndSelectItem = (row) => {
		if (props.max === UNLIMITED) {
			return selectItem(row)
		}
		if (selected.value.length === props.max) {
			message.value = lang.maxSelected.replace(LANG_MAX_SELECTED_LIMIT, props.max)

			messageDebounce(() => {
				message.value = ""
			})
			return
		}
		selectItem(row)
	}
	// fetch current page data
	const fetchData = () => {
		loading.value = true

		const fetchOption = {
			search: query.value,
			pageNumber: currentPage.value,
			pageSize: props.pagination ? props.pageSize : NO_PAGINATION_PAGE_SIZE,
		}

		emit("fetch-data", fetchOption, (data, count) => {
			if (!Array.isArray(data)) return

			list.value = data
			totalRows.value = typeof count === "number" ? count : 0

			nextTick(() => {
				loading.value = false
			})
		})
	}
	// fetch selected items data
	const fetchSelectedData = () => {
		const { modelValue } = props

		if (!Array.isArray(modelValue)) return

		if (!props.multiple && modelValue.length > 1) {
			console.warn(
				'Invalid prop: Only one key can be passed to prop "modelValue/v-model" in single selection mode({ multiple: false }).'
			)
			return
		}
		// empty array will not emit event
		if (!modelValue.length) {
			setSelected([], false)
			return
		}
		// each key exists in the selected models
		if (isKeysEqualToSelected(modelValue)) return

		emit("fetch-selected-data", modelValue, (data) => {
			if (!Array.isArray(data)) return
			/**
			 * when key length not equal to data model length, required to
			 * update `modelValue/v-model` value
			 */
			setSelected(data, modelValue.length !== data.length)
		})
	}

	watch(query, () => {
		// reset current page to first page when query keyword change
		currentPage.value = FIRST_PAGE
		fetchData()
	})
	watch(() => props.modelValue, fetchSelectedData)

	onMounted(() => {
		fetchData()
		if (!isEmptyArray(props.modelValue)) {
			fetchSelectedData()
		}
	})

	provide("keyProp", props.keyProp)
	provide("rtl", props.rtl)
	provide("pageSize", props.pageSize)
	provide("debounce", props.debounce)
	provide("multiple", props.multiple)
	provide("loading", loading)
	provide("language", lang)
	provide("renderCell", renderCell)
	provide("isItemSelected", isItemSelected)
	provide("selectedCount", selectedCount)
	provide("removeAll", removeAll)
	provide("removeItem", removeItem)

	return {
		selected,
		query,
		message,
		currentPage,
		totalRows,
		lang,
		list,

		renderCell,
		isDataEmpty,
		isItemSelected,
		selectedCount,
		selectItem: checkAndSelectItem,
		removeAll,
		removeItem,
		fetchData,
	}
}

export function useInject() {
	return {
		keyProp: inject("keyProp"),
		renderCell: inject("renderCell"),
		rtl: inject("rtl"),
		isItemSelected: inject("isItemSelected"),
		pageSize: inject("pageSize"),
		language: inject("language"),
		debounce: inject("debounce"),
		multiple: inject("multiple"),
		loading: inject("loading"),
		selectedCount: inject("selectedCount"),
		removeAll: inject("removeAll"),
		removeItem: inject("removeItem"),
	}
}
