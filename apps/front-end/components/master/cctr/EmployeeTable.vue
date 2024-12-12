<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import {
	type RequestParams,
	type Response,
	pageSizeOptions,
	pagination,
	pageSize,
} from "@/types"
import type { CostItem, AddRef, Employee, TreeItem } from "@/types/master/cctr"

const props = withDefaults(
	defineProps<{ info: CostItem | undefined; tree: TreeItem[] }>(),
	{}
)
const emit = defineEmits<{
	(e: "update:employee", num: number): number
}>()

const params = ref<RequestParams<any>>({
	page: 0,
	size: pageSize,
	first: true,
	last: true,
	params: {},
})
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<Employee[]>([])
const showExcelUploadModal = ref<boolean>(false)
const modelRef = ref<AddRef>({ name: "", users: [], employeesInfo: [] })
const showAddModal = ref<boolean>(false)
const showModalModal = ref<boolean>(false)

const { data, status, refresh } = await useAsyncData(
	`cctr-employees-list`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/costCenters/employees", {
			method: "GET",
			params: {
				companyCode: props.info?.companyCode,
				costCenterId: props.info?.id,
				page: params.value.page,
				size: params.value.size,
			},
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				emit("update:employee", res?.totalElements!)
				return res
			}
		}),
	{ watch: [props, params] }
)

const onDelete = async (data: number[]) => {
	const users = data.map((e) => ({ id: e }))
	await useCFetch<Response<any>>(
		`/api/v2/master/costCenters/employees/${props.info?.id}`,
		{
			method: "DELETE",
			body: {
				id: props.info?.id,
				companyCode: props.info?.companyCode,
				employeeIds: users,
			},
		}
	).then((res: Response<any>) => {
		message.success(res.message)
		refresh()
	})
}

const onAddSubmit = async (data: AddRef) => {
	const users = data.employeesInfo.map((e) => ({ id: e.id }))

	await useCFetch<Response<any>>("/api/v2/master/costCenters/employees", {
		method: "POST",
		body: {
			id: props.info?.id,
			companyCode: props.info?.companyCode,
			employeeIds: users,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
			showAddModal.value = false
		}
		message.success(res.message)
	})
}

const onShowAddModal = () => {
	showAddModal.value = true
	modelRef.value.name = props.info?.name!
	modelRef.value.users = []
	modelRef.value.employeesInfo = []
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	params.value.page = pagination.current - 1
	params.value.size = pagination.pageSize
	refresh()
}

/**
 * 페이지 콤보박스 체인지 이벤트
 */
const onSelectionchange = (data: number) => {
	params.value.page = 0
	params.value.size = data
	refresh()
}
watch(props, () => {
	selectedRowKeys.value = []
})
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md" wrap="wrap">
		<a-typography-title :level="4" class="page-title">
			코스트센터 정보 [{{ props.info?.name }}]
		</a-typography-title>
		<a-space :size="5">
			<eacc-button
				component-is="delete"
				:data="selectedRowKeys"
				:modal-open="true"
				:disabled="selectedRowKeys.length === 0"
				@click="onDelete"
			/>
			<a-button
				:icon="materialIcons('mso', 'east')"
				:disabled="selectedRowKeys.length === 0"
				@click="() => (showModalModal = true)"
			>
				이동
			</a-button>
			<a-button
				type="primary"
				ghost
				:icon="materialIcons('mso', 'file_upload')"
				@click="() => (showExcelUploadModal = true)"
			>
				엑셀일괄등록
			</a-button>
			<a-button
				type="primary"
				:icon="materialIcons('mso', 'add_circle')"
				@click="onShowAddModal"
			>
				사용자 추가
			</a-button>
			<a-select
				v-model:value="params.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="(page: any) => onSelectionchange(page)"
			/>
		</a-space>
	</a-flex>
	<a-table
		size="small"
		:row-key="(record) => record.id"
		:loading="status === 'pending'"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: (keys, rows) => {
				selectedRowKeys = keys
				selectedRows = rows
			},
		}"
		:columns="[
			{ title: '코스트명', dataIndex: 'costCenterName' },
			{ title: '이름', dataIndex: 'employeeName' },
			{ title: '직위', dataIndex: 'positionName' },
			{ title: '직책', dataIndex: 'jobTitleName' },
			{ title: '사번', dataIndex: 'employeeNumber' },
		]"
		:data-source="data?.data"
		:pagination="
			Object.assign({}, pagination, {
				current: params.page + 1 || 1,
				pageSize: params.size,
				total: data?.totalElements,
			})
		"
		@change="cellChange"
	>
	</a-table>
	<field-modal
		title="코스트센터 사용자 추가"
		ok-text="저장"
		cancel-text="취소"
		:field="modelRef"
		:showed="showAddModal"
		@closed="showAddModal = false"
		@submit="(data: AddRef) => onAddSubmit(data)"
	>
		<template #content="{ field }">
			<a-form
				label-align="left"
				:colon="false"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
			>
				<a-form-item label="코스트센터명">
					<a-input v-model:value="field.name" disabled />
				</a-form-item>
				<a-form-item label="사용자추가">
					<eacc-select-multi-table
						url="/api/v2/masters/commons/employees"
						v-model:value="field.users"
						key-props="employeeNumber"
						:columns="[
							{ title: '사업장', data: (row: any) => row.workplaceName },
							{ title: '부서', data: (row: any) => row.departmentName },
							{ title: '직위', data: (row: any) => row.jobName },
							{
								title: '이름',
								data: (row: any) => row.name,
							},
							{
								title: '코스트센터',
								data: (row: any) =>
									row.costCenterName ? row.costCenterName : row.costCenterId,
							},
						]"
						@update:value="(value) => (field.users = value)"
						@selection-change="(value) => (field.employeesInfo = value)"
					/>
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
	<cost-center-move-modal
		:show="showModalModal"
		:data="selectedRows"
		:cost-center-info="props.info"
		:tree="props.tree"
		@update:show="(value) => (showModalModal = value)"
		@callback="
			() => {
				refresh(), (selectedRowKeys = [])
			}
		"
	/>
	<excel-upload-modal
		:show="showExcelUploadModal"
		@update:show="(value) => (showExcelUploadModal = value)"
	/>
</template>
