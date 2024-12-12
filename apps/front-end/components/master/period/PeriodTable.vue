<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { pageSizeOptions, pagination } from "@/types"
import { type AccountPeriod } from "@/types/master/period"

const props = withDefaults(
	defineProps<{
		fetchData: any
		loading: boolean
	}>(),
	{
		loading: false,
	}
)

const emit = defineEmits<{
	(e: "accountPeriodClose", value: Array<AccountPeriod>): Array<AccountPeriod>
	(e: "accountPeriodOpen", value: Array<AccountPeriod>): Array<AccountPeriod>
	(e: "createPeriod", opend: boolean): boolean
	(e: "delete", value: Array<AccountPeriod>): Array<AccountPeriod>
	(e: "pagination", value: any): any
}>()

const selectedRowKeys = ref<(string | number)[]>([])
const selectedRowItems = ref<AccountPeriod[]>([])

const cellChange = (pagination: any) => {
	emit("pagination", pagination)
}

const onSelectChange = (keys: (string | number)[], rows: AccountPeriod[]) => {
	selectedRowKeys.value = keys
	selectedRowItems.value = rows
}

/**
 * 페이지 콤보박스 체인지 이벤트
 */
const onSelectionchange = (data: number) => {
	props.fetchData.size = data
	emit("pagination", { ...pagination, pageSize: data })
}

const { fetchData } = toRefs(props)
watch([fetchData], (value) => {
	selectedRowKeys.value = []
	selectedRowItems.value = []
})
</script>

<template>
	<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
		<a-col> </a-col>
		<a-col>
			<a-space :size="5">
				<eacc-button
					component-is="delete"
					:modal-open="true"
					:data="selectedRowItems"
					:disabled="selectedRowKeys.length === 0"
					@click="(data) => emit('delete', data)"
				/>
				<a-button
					danger
					:icon="materialIcons('mso', 'lock_clock')"
					:disabled="selectedRowKeys.length === 0"
					@click="emit('accountPeriodClose', selectedRowItems)"
				>
					월별마감
				</a-button>
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'door_open')"
					:disabled="selectedRowKeys.length === 0"
					@click="emit('accountPeriodOpen', selectedRowItems)"
				>
					월별오픈
				</a-button>
				<a-button
					:icon="materialIcons('mso', 'add_circle')"
					@click="emit('createPeriod', true)"
				>
					신규생성
				</a-button>
				<a-select
					v-model:value="fetchData.size"
					:options="pageSizeOptions"
					value-field="key"
					text-field="label"
					@change="(page: any) => onSelectionchange(page)"
				/>
			</a-space>
		</a-col>
	</a-row>
	<a-table
		size="small"
		:columns="[
			{ title: '기준월', dataIndex: 'standardYearMonth' },
			{ title: '회계구분', dataIndex: 'accountPeriodStatusLabel' },
			{ title: '회사명', dataIndex: 'companyName' },
			{ title: '사업장명', dataIndex: 'workplaceName' },
			{ title: '최종수정일', dataIndex: 'updatedAt' },
			{ title: '최종수정자', dataIndex: 'updatedBy' },
		]"
		:row-selection="{
			selectedRowKeys,
			onChange: onSelectChange,
		}"
		:data-source="fetchData.data"
		:row-key="(record) => record.id"
		:pagination="
			Object.assign({}, pagination, {
				current:
					fetchData.pageNumber === 0 ? fetchData.pageNumber + 1 : fetchData.pageNumber,
				pageSize: fetchData.size,
				total: fetchData.totalElements,
			})
		"
		:loading="loading"
		@change="cellChange"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'accountPeriodStatusLabel'">
				<a-tag :color="`${record.accountPeriodStatusName == 'OPEN' ? 'green' : 'red'}`">{{
					text
				}}</a-tag>
			</template>
		</template>
	</a-table>
</template>
