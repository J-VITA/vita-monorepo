<!-- iwx-select-table.vue -->
<template>
	<div class="iwx-select-table">
		<v-select
			v-model="selected"
			:options="filteredItems"
			:multiple="multiple"
			:searchable="true"
			:filterable="false"
			:placeholder="placeholder"
			@search="onSearch"
			:label="labelField"
			:reduce="(item: any) => item"
			:loading="false"
		>
			<template #spinner="{ loading }">
				<div
					v-if="loading"
					style="border-left-color: rgba(88, 151, 251, 0.71)"
					class="vs__spinner"
				></div>
			</template>
			<template #list-footer>
				<div v-if="totalPages > 0" class="vs-pagination">
					<button
						@click.stop="prevPage"
						:disabled="currentPage === 1"
						class="vs-pagination__button"
					>
						이전
						<i class="fas fa-chevron-left"></i>
					</button>
					<span>{{ currentPage }} / {{ totalPages }}</span>
					<button
						@click.stop="nextPage"
						:disabled="currentPage === totalPages"
						class="vs-pagination__button"
					>
						다음
						<i class="fas fa-chevron-right"></i>
					</button>
				</div>
			</template>

			<template #selected-option="option">
				<div class="vs-selected">
					{{ option[labelField] }}
				</div>
			</template>

			<template #option="option">
				<table>
					<tbody>
						<tr
							:class="{
								selected: isSelected(option),
								disabled: option.disabled,
							}"
							@click="!option.disabled && select(option)"
						>
							<td class="table-cell" v-for="field in fields" :key="field.key">
								{{ option[field.key] }}
							</td>
						</tr>
					</tbody>
				</table>
			</template>

			<template #list-header="{ options }">
				<div class="vs-option-table">
					<table>
						<thead>
							<tr>
								<th class="table-header" v-for="field in fields" :key="field.key">
									{{ field.label }}
								</th>
							</tr>
						</thead>
					</table>
				</div>
			</template>
			<template #no-options="{ search, searching, loading }">
				<div class="vs-no-options">
					{{ searching ? "검색 중..." : "검색결과 없음" }}
				</div>
			</template>
		</v-select>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type PropType, onMounted } from "vue"
import vSelect from "vue-select"
import { useDebounceFn } from "@vueuse/core"
import "vue-select/dist/vue-select.css"

interface Item {
	id: number
	[key: string]: any
}

interface Field {
	key: string
	label: string
}

const props = defineProps({
	fields: {
		type: Array<Field>,
		required: true,
	},
	multiple: {
		type: Boolean,
		default: false,
	},
	placeholder: {
		type: String,
		default: "검색어를 입력하세요",
	},
	labelField: {
		type: String,
		default: "name",
	},
	params: {
		type: Object as PropType<Record<string, any>>,
		default: () => ({}),
	},
	fetchItems: {
		type: Function as PropType<
			(
				query: string,
				page: { page: number; size: number }
			) => Promise<{ items: Item[]; totalCount: number; size: number }>
		>,
		required: true,
	},
})

const emit = defineEmits(["update:modelValue"])

const selected = ref<Item[] | Item | null>(props.multiple ? [] : null)
const items = ref<Item[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalCount = ref(0)

const debouncedSearch = useDebounceFn((val?: string) => {
	currentPage.value = 1 // 검색어 변경시 첫 페이지로 리셋
	onSearch(val || "")
}, 300)

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage.value) || 0)

const filteredItems = computed(() => {
	return items.value.map((item) => ({
		...item,
		disabled:
			selected.value?.some((selectedItem: Item) => selectedItem.id === item.id) || false,
	}))
})

watch(selected, (newValue) => {
	console.log("selected changed:", newValue)
	emit("update:modelValue", newValue)
})

async function onSearch(search: string, loading?: (value: boolean) => void) {
	if (loading) loading(true)
	try {
		const {
			items: fetchedItems,
			totalCount: fetchedTotalCount,
			size,
		} = await props.fetchItems(search || "", {
			page: currentPage.value - 1,
			size: itemsPerPage.value,
		})

		// 기존 선택된 아이템 유지
		items.value = fetchedItems.map((item) => ({
			...item,
			disabled:
				selected.value?.some((selectedItem: Item) => selectedItem.id === item.id) ||
				false,
		}))

		totalCount.value = fetchedTotalCount
		itemsPerPage.value = size
	} catch (error) {
		console.error("Error fetching items:", error)
	} finally {
		if (loading) loading(false)
	}
}

function prevPage() {
	if (currentPage.value > 1) {
		currentPage.value--

		// 검색어나 선택된 아이템의 name을 전달
		const searchTerm =
			typeof selected.value === "object"
				? Array.isArray(selected.value)
					? selected.value.map((item) => item.name).join(",")
					: selected.value?.name
				: ""
		onSearch("")
	}
}

function nextPage() {
	if (currentPage.value < totalPages.value) {
		currentPage.value++
		const searchTerm =
			typeof selected.value === "object"
				? Array.isArray(selected.value)
					? selected.value.map((item) => item.name).join(",")
					: selected.value?.name
				: ""
		onSearch("")
	}
}

function select(item: Item) {
	if (props.multiple) {
		if (!Array.isArray(selected.value)) {
			selected.value = []
		}
		const index = selected.value.findIndex((i) => i.id === item.id)
		if (index === -1) {
			selected.value.push(item)
		} else {
			selected.value.splice(index, 1)
		}
	} else {
		selected.value = item
	}
	emit("update:modelValue", selected.value)
}

function isSelected(item: Item): boolean {
	if (!selected.value) return false

	if (props.multiple) {
		return Array.isArray(selected.value) && selected.value.some((i) => i.id === item.id)
	}
	return !Array.isArray(selected.value) && selected.value.id === item.id
}

onMounted(() => {
	debouncedSearch()
})
</script>

<style lang="scss">
.iwx-select-table {
	.vs__dropdown-toggle {
		padding: 4px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	.vs__selected {
		margin: 2px;
		padding: 2px 8px;
		background: #f0f0f0;
		border-radius: 4px;
		border: none;
	}

	.vs__deselect {
		margin-left: 4px;
		fill: #999;
		&:hover {
			fill: #f56c6c;
		}
	}

	.vs__search {
		padding: 4px;
		margin: 0;
	}

	.vs-pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 8px;
		background: #f9f9f9;
		border-top: 1px solid #eee;

		&__button {
			padding: 4px 8px;
			margin: 0 4px;
			background: #fff;
			border: 1px solid #d9d9d9;
			border-radius: 4px;
			cursor: pointer;

			&:hover:not(:disabled) {
				background: #1890ff;
				color: #fff;
			}

			&:disabled {
				opacity: 0.5;
				cursor: not-allowed;
			}
		}
	}

	.vs-option {
		padding: 8px;
		display: flex;
		gap: 8px;

		&__field {
			flex: 1;
		}
	}
	.vs-option-table {
		width: 100%;

		table {
			width: 100%;
			table-layout: fixed; // 컬럼 너비 고정
		}

		.table-header {
			padding: 12px 16px; // 헤더의 패딩을 좀 더 크게
			text-align: left;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			background: #f5f5f5;
			font-weight: 500;
			border-bottom: 1px solid #eee;
			position: sticky;
			top: 0;
			z-index: 1;

			// 각 헤더의 최소 너비 설정
			min-width: 120px;

			// 마지막 헤더는 남은 공간을 채우도록
			&:last-child {
				width: auto;
			}

			// 헤더 사이 구분선 추가
			&:not(:last-child) {
				border-right: 1px solid #eee;
			}
		}

		.table-cell {
			padding: 8px 16px;
			text-align: left;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			border-bottom: 1px solid #eee;

			// 각 셀의 최소 너비 설정
			min-width: 120px;

			// 마지막 셀은 남은 공간을 채우도록
			&:last-child {
				width: auto;
			}
		}

		th,
		td {
			padding: 8px 16px; // 좌우 패딩 증가
			text-align: left;
			border-bottom: 1px solid #eee;
			white-space: nowrap;
			min-width: 120px; // 최소 너비 설정

			// 균등 분할을 위한 설정
			width: 1%; // 모든 열이 동일한 너비를 가지도록 설정
		}

		&:last-child {
			width: auto;
		}

		th {
			background: #f5f5f5;
			font-weight: 500;
			position: sticky;
			top: 0;
			z-index: 1;
		}

		// 테이블 스크롤을 위한 컨테이너 설정
		overflow-x: auto; // 가로 스크롤 추가
		display: block;
		max-height: 300px;

		tbody tr {
			&:hover {
				background-color: #f5f5f5;
				cursor: pointer;
			}

			&.disabled {
				opacity: 0.5;
				cursor: not-allowed;
				background-color: #f5f5f5;
			}

			&:not(.disabled):hover {
				background-color: #f5f5f5;
				cursor: pointer;
			}

			&.selected {
				background-color: #e6f7ff;
			}
		}

		.vs__dropdown-menu {
			max-height: 300px;
			overflow-y: auto;
		}
	}

	// 페이지네이션 스타일은 기존 유지
	.vs-pagination {
		margin-top: 8px;
	}
}
</style>
