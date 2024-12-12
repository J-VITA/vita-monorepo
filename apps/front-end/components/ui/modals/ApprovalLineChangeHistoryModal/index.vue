<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { type RequestParams, pagination, pageSize } from "@/types"

const { show, id } = defineProps<{
	show: boolean
	id?: number | string
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const params = ref<RequestParams<any>>({
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	params: {},
})

const columns = ref<ColumnsType<any>>([
	{
		title: "변경사유",
		dataIndex: "reason",
		resizable: true,
		width: -1,
	},
	{
		title: "변경전",
		dataIndex: "previousValue",
		resizable: true,
		width: -1,
	},
	{
		title: "변경후",
		dataIndex: "newValue",
		resizable: true,
		width: -1,
	},
	{
		title: "변경자",
		dataIndex: "changeEmployeeName",
		resizable: true,
		width: 80,
		align: "center",
	},
	{
		title: "변경일",
		dataIndex: "changeDateTime",
		resizable: true,
		width: -1,
	},
])
const dataSource = ref<{ totalElements: number; data: any }>({
	totalElements: 0,
	data: [],
})

const showViewer = ref<boolean>(false)

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any) => {
	params.value.pageNumber = pagination.current - 1
}

watch(
	() => open.value,
	async (value) => {
		if (value && id) {
			await useCFetch(`/api/v2/approvals/changes/${id}`, {
				method: "GET",
				params: {
					approvalHeaderId: id,
				},
			}).then((res: any) => {
				if (res.status === 0) {
					dataSource.value.data = res.data
					dataSource.value.totalElements = res.data.length
				}
			})
		}
	}
)
</script>
<template>
	<a-modal
		centered
		width="80%"
		v-model:open="open"
		title="결재선변경이력"
		:destroy-on-close="true"
	>
		<a-table
			size="small"
			:loading="false"
			:columns="columns"
			:data-source="dataSource?.data"
			:row-key="(record) => record.id"
			:pagination="
				Object.assign({}, pagination, {
					current: params?.pageNumber! + 1,
					pageSize: params?.size,
					total: dataSource?.totalElements,
				})
			"
			@change="cellChange"
			@resizeColumn="handleResizeColumn"
		>
			<template #headerCell="{ title }">
				<div class="text-center">{{ title }}</div>
			</template>
			<template #bodyCell="{ column, text }">
				<template v-if="column.dataIndex === 'prevDocument'">
					<a-button
						type="text"
						size="small"
						:icon="materialIcons('mso', 'open_in_new')"
						@click="showViewer = true"
					/>
				</template>
			</template>
		</a-table>
		<template #footer>
			<a-button @click="open = false">닫기</a-button>
		</template>
	</a-modal>
</template>
