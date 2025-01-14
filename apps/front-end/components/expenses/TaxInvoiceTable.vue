<script setup lang="ts">
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import { pageSizeOptions, pagination, generateSortParams } from "@/types"
import { useTaxInvoiceListColumns } from "@/types/expenses/tax-invoice"

const { dataSource, status } = defineProps<{
	dataSource: any
	status: string
}>()

const selectedRows = defineModel<any[]>("selectedRows")

const emit = defineEmits<{
	(e: "pagination", value: any, ...sorter: any): any
	(e: "refresh", value?: any): void
	(e: "approval", value: boolean): boolean // 결재상신 버튼 클릭 시 발생
	(e: "forward", value: boolean): boolean // 전달 버튼 클릭시 발생
	(e: "taxInvoiceModal", value?: number): any // 세금계산서 상세 모달 클릭시 발생
}>()

const columns = useTaxInvoiceListColumns()

const selectedRowKeys = ref<(string | number)[]>([])
const totalAmount = ref<number>(0)
const selectedTotalAmount = ref<number>(0)

const init = () => {
	selectedRowKeys.value = []
	selectedTotalAmount.value = 0
	totalAmount.value = dataSource.data.reduce((acc: number, row: any) => {
		acc += Number(row.totalAmount)
		return acc
	}, 0)
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	emit("pagination", pagination, sortParams)
}

const onPageSizeChange = (size: number) => {
	emit("pagination", { current: 0, pageSize: size })
}

const onSelectChange = (keys: any, rows: any) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows
	selectedTotalAmount.value = rows.reduce((acc: number, row: any) => {
		acc += Number(row.totalAmount)
		return acc
	}, 0)
}

const taxInvoiceMenuItemClick = (data: any) => {
	if (data.key === "DIRECT") {
		emit("taxInvoiceModal", undefined)
	} else {
		console.log("taxInvoiceMenuItemClick", data.key)
	}
}

/**
 * 삭제 버튼 클릭 시 발생
 * @param data 선택한 세금계산서 항목
 */
const onDelete = (data: any) => {
	console.log("onDelete", data)
	setTimeout(() => {
		selectedRows.value = []
		selectedTotalAmount.value = 0
		emit("refresh")
	}, 1000)
}

watch(selectedRows, (value) => {
	console.log("세금세계선 테이블에서 selectedRows 감지", value)
	if (value && value.length === 0) {
		selectedRowKeys.value = []
		selectedTotalAmount.value = 0
	}
})

onMounted(() => {
	init()
})
onActivated(() => {
	init()
})
</script>
<template>
	<a-flex justify="space-between" align="center" class="mb-sm" wrap="wrap">
		<a-space :size="5">
			<a-typography-text>총금액 {{ formatCurrency(totalAmount) }}</a-typography-text>
			<template v-if="selectedRowKeys.length > 0">
				<span>/</span>
				<a-typography-text>
					선택됨({{ selectedRowKeys.length }}건)
					{{ formatCurrency(selectedTotalAmount) }}</a-typography-text
				>
			</template>
		</a-space>

		<a-space :size="5">
			<eacc-button
				component-is="delete"
				size="middle"
				:modal-open="true"
				:data="selectedRowKeys"
				@click="onDelete"
				:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
			/>
			<a-button
				ghost
				type="primary"
				:icon="materialIcons('mso', 'forward')"
				:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
				@click="emit('forward', true)"
			>
				전달
			</a-button>
			<a-dropdown :trigger="['click']">
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'list_alt')"
					class="dropdown-link"
				>
					신규작성
				</a-button>
				<template #overlay>
					<a-menu @click="taxInvoiceMenuItemClick">
						<a-menu-item key="DIRECT">
							<component :is="materialIcons('mso', 'edit')" />
							<span class="ml-sm">직접입력</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="XML">
							<component :is="materialIcons('mso', 'description')" />
							<span class="ml-sm">XML 자동인식</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="Bring" disabled>
							<component :is="materialIcons('mso', 'sync')" />
							<span class="ml-sm">불러오기</span>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>
			<a-button
				type="primary"
				ghost
				:icon="materialIcons('mso', 'edit_square')"
				:disabled="selectedRowKeys.length === 0"
				@click="emit('approval', true)"
			>
				결재상신
			</a-button>
			<a-select
				v-model:value="dataSource.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="(page: any) => onPageSizeChange(page)"
			/>
		</a-space>
	</a-flex>

	<a-table
		size="small"
		:loading="status === 'pending'"
		:row-key="(record: any) => record.id"
		:columns="columns"
		:data-source="dataSource.data"
		:row-selection="{
			selectedRowKeys,
			onChange: onSelectChange,
			getCheckboxProps: (record: any) => ({
				disabled: [1].includes(record.id),
			}),
		}"
		:pagination="{
			...pagination,
			current: dataSource.pageNumber ? dataSource.pageNumber + 1 : 1,
			pageSize: dataSource.size,
			total: dataSource.totalElements,
		}"
		:show-sorter-tooltip="false"
		@resize-column="handleResizeColumn"
		@change="cellChange"
	>
		<template #headerCell="{ title }">
			<div class="text-center">{{ title }}</div>
		</template>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'taxInvoiceType'">
				<a-tag :color="text === 'ELECTRONIC' ? 'cyan' : 'purple'">
					{{ text === "ELECTRONIC" ? "전자세금계산서" : "수기세금계산서" }}
				</a-tag>
			</template>

			<template v-if="column.dataIndex === 'slipNumber'">
				<a-typography-link @click="emit('taxInvoiceModal', record.id)">{{
					text
				}}</a-typography-link>
			</template>

			<template v-if="column.dataIndex === 'state'">
				<a-badge status="default" :text="text" />
			</template>
		</template>
	</a-table>
</template>
