<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import {
	type RequestParams,
	type Response,
	pageSizeOptions,
	pagination,
	pageSize,
} from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { AccountRolesItem, AccountRoleDetail } from "@/types/master/accounts"

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const showModal = ref<boolean>(false)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRowItems = ref<AccountRolesItem[]>([])
const detailItem = ref<AccountRoleDetail | undefined>(undefined)
const params = ref<RequestParams<any>>({
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	params: {},
})
const columns = ref<ColumnsType<any>>([
	{ title: "권한명", dataIndex: "name" },
	{
		title: "비용항목수",
		dataIndex: "accountItemAmount",
		align: "right",
	},
	{
		title: "코스트센터",
		dataIndex: "costCenterAmount",
		align: "right",
	},
	{
		title: "기타 사용자",
		dataIndex: "employeeAmount",
		align: "right",
	},
	{ title: "권한설명", dataIndex: "description" },
	{ title: "사용여부", dataIndex: "used" },
])
const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	`account-roles-list`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/accountRoles", {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				page: params.value.pageNumber > 1 ? params.value.pageNumber - 1 : 0,
				size: params.value.size,
			},
		}).then((res: Response<any>) => res),
	{ watch: [params.value] }
)

const onCopy = async () => {
	await Promise.all(
		selectedRowItems.value.map((item) =>
			useCFetch<Response<any>>(`/api/v2/master/accountRoles/copy/${item.id}`, {
				method: "PUT",
				params: { id: item.id },
				body: { id: item.id },
			})
		)
	)
	refresh()
	selectedRowKeys.value = []
	selectedRowItems.value = []
}

const onSelectChange = (keys: (string | number)[], rows: AccountRolesItem[]) => {
	selectedRowKeys.value = keys
	selectedRowItems.value = rows
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	// console.log('pagination', pagination, rows);
	params.value.pageNumber = pagination.current
	params.value.size = pagination.pageSize
}

const deleteCallback = async (items: AccountRolesItem[]) => {
	await Promise.all(
		items.map((item) =>
			useCFetch<Response<any>>(`/api/v2/master/accountRoles/${item.id}`, {
				method: "DELETE",
				params: { id: item.id },
				body: {
					id: item.id,
				},
			})
		)
	)
	message.success("삭제되었습니다.")
	refresh()
}

const onDetail = async (record: AccountRolesItem) => {
	showModal.value = true
	detailItem.value = await useCFetch<Response<any>>(
		`/api/v2/master/accountRoles/${record.id}`,
		{
			method: "GET",
			params: { id: record.id },
		}
	).then((res: Response<any>) => {
		return { ...res.data, code: record.code }
	})
}

const modalCallback = () => {
	detailItem.value = undefined
	refresh()
}
</script>

<template>
	<a-row :gutter="[15, 15]">
		<a-col span="24">
			<a-flex gap="small" justify="space-between">
				<span></span>

				<a-space :size="5">
					<eacc-button
						component-is="delete"
						:data="selectedRowItems"
						:modal-open="true"
						:disabled="selectedRowKeys.length === 0"
						@click="deleteCallback"
					/>
					<a-button
						:disabled="selectedRowKeys.length === 0"
						:icon="materialIcons('mso', 'content_copy')"
						@click="onCopy"
					>
						복사
					</a-button>
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="() => (showModal = true)"
					>
						계정/비용항목 권한추가
					</a-button>
					<a-select
						v-model:value="params.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
						@change="(page: any) => (params.size = page)"
					/>
				</a-space>
			</a-flex>
		</a-col>
		<a-col span="24">
			<a-table
				size="small"
				:columns="columns"
				:row-selection="{
					selectedRowKeys,
					onChange: onSelectChange,
				}"
				:data-source="dataSource?.data"
				:loading="status === 'pending'"
				:row-key="(record) => record.id"
				:pagination="
					Object.assign({}, pagination, {
						current: params.pageNumber === 0 ? params.pageNumber + 1 : params.pageNumber,
						pageSize: params.size,
						total: dataSource?.totalElements,
					})
				"
				@change="cellChange"
			>
				<template #bodyCell="{ column, record }">
					<template v-if="column.dataIndex === 'name'">
						<a-typography-link @click="onDetail(record)">
							{{ record.name }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'used'">
						<a-badge
							:color="record.used ? 'green' : 'red'"
							:text="record.used ? '사용중' : '미사용'"
						/>
					</template>
				</template>
			</a-table>
		</a-col>
	</a-row>
	<authority-modal
		:show="showModal"
		:data="detailItem"
		@update:show="(value) => (showModal = value)"
		@callback="modalCallback"
	/>
</template>
