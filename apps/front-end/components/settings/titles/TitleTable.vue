<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Titles } from "@/types/settings/titles"

type Key = string | number
const { titleData, loading = false } = defineProps<{
	titleData: Array<Titles>
	loading: boolean
}>()
// const props = withDefaults(
//   defineProps<{
//     fetchData: Array<Titles>;
//     params?: any;
//     pending: boolean;
//   }>(),
//   {
//     pending: false,
//   }
// );

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)
const route = useRoute()
const routePath = computed(() => route.path)

const state = reactive<{
	selectedRowKeys: Key
	loading: boolean
	params: any
	updown: "up" | "down" | undefined
}>({
	selectedRowKeys: -1, // Check here to configure the default column
	loading: false,
	params: {
		page: 0,
		size: 10,
		totalElements: 0,
		first: true,
		last: false,
	},
	updown: undefined,
})

const emit = defineEmits<{
	(e: "addTitleClick", value: any): any
	(e: "deleteTitleClick", value: any): any
	(e: "deleteTitleSubmit", value: any): any
	(e: "selected-row", value: any, idx: any): any
	(e: "refresh"): void
}>()

const columns = ref<ColumnsType<Titles>>([
	{
		title: "코드",
		dataIndex: "code",
		resizable: true,
		align: "center",
		// sorter: (a: Titles, b: Titles) => a.code!.length - b.code!.length,
		width: -1,
	},
	{
		title: "직책",
		dataIndex: "name",
		resizable: true,
		align: "center",
		// sorter: (a: Titles, b: Titles) => a.name!.length - b.name!.length,
		width: -1,
	},
	{
		title: "사용자수",
		dataIndex: "employeeCount",
		resizable: true,
		align: "center",
		// sorter: (a: Titles, b: Titles) => a.employeeCount! - b.employeeCount!,
		width: -1,
	},
	{
		title: "순번",
		dataIndex: "orderSeq",
		resizable: true,
		align: "center",
		// sorter: (a: Titles, b: Titles) => a.employeeCount! - b.employeeCount!,
		width: -1,
	},
	{
		title: "기능",
		dataIndex: "operation",
		align: "center",
		resizable: true,
		width: -1,
	},
])

/**
 * 직위목록 행 선택
 */
const rowClick = (record: Titles, idx: Key) => {
	state.selectedRowKeys = idx
	state.params.page = 0
	Object.assign(state.params, record as Titles)
	emit("selected-row", state.params, idx)
}

const clickTitleAdd = (record?: Titles) => {
	emit(
		"addTitleClick",
		Object.assign(
			{ workplaceId: getWorkplaceId.value },
			record ? record : { companyCode: getCompanyCode.value },
			{ showed: true }
		)
	)
}

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: Titles, index: Key) => {
	// eacc-table-row-selected
	return index === state.selectedRowKeys ? "active-row cursor-pointer" : "cursor-pointer"
}

/**
 * 행 삭제 이벤트
 */
const onDelete = (key: Key) => {
	emit("deleteTitleSubmit", key)
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

watch(
	() => loading,
	(value) => {
		state.loading = value
	}
)

// watch(() => props.pending, value => {
//   const ctr = new AbortController();
//   console.log("ctr.signal.aborted ", ctr.signal)
//   state.loading = value;
//   onWatcherCleanup(() => {
//     ctr.abort();
//   })
// })
</script>

<template>
	<a-row :gutter="30">
		<a-col flex="2">
			<a-flex gap="small" justify="space-between" align="center" class="mb-md">
				<a-typography-title :level="4" class="page-title"></a-typography-title>
				<a-space :size="5">
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="clickTitleAdd()"
					>
						직책추가
					</a-button>
					<eacc-excel-button
						url="/api/v2/settings/jobTitles/validate"
						req-type="upload"
						label="일괄등록"
						:sample-file-key="routePath"
						@submit="() => emit('refresh')"
					/>
				</a-space>
			</a-flex>

			<a-table
				:data-source="titleData"
				:columns="columns"
				:loading="loading"
				size="small"
				empty-text="데이터가 없습니다."
				:pagination="false"
				:custom-row="
					(record, idx) => {
						return {
							onClick: (event) => rowClick(record, idx as Key),
						}
					}
				"
				:row-class-name="setClassName"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record, value }">
					<template v-if="column.dataIndex === 'code'">
						<a-button type="link" @click="clickTitleAdd(record)">{{ text }}</a-button>
					</template>
					<template v-else-if="column.dataIndex === 'operation'">
						<a-space :size="5">
							<a-popconfirm
								v-if="titleData && titleData.length"
								title="삭제 하시겠습니까?"
								@confirm="onDelete(record.id)"
							>
								<a-button
									type="text"
									size="small"
									:icon="materialIcons('mso', 'delete')"
								/>
							</a-popconfirm>
						</a-space>
					</template>
					<template v-else>
						{{ text }}
					</template>
				</template>
			</a-table>
		</a-col>
	</a-row>
</template>
