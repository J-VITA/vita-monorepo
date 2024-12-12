<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { type RequestParams, type Response, pageSizeOptions, pagination } from "@/types"
import type { CostItem, AddRef, AuthChangeParams } from "@/types/master/cctr"
const { info } = defineProps<{ info: CostItem | undefined }>()

const emit = defineEmits<{
	(e: "update:employee", num: number): number
}>()

const params = ref<RequestParams<any>>({
	page: 0,
	size: 5,
	first: true,
	last: true,
	params: {},
})
const selectedRowKeys = ref<(string | number)[]>([])
const modelRef = ref<AddRef>({
	name: "",
	users: [],
	employeesInfo: [],
	authorityFlag: false,
})
const showAddModal = ref<boolean>(false)
const showAuthConfirmModal = ref<boolean>(false)
const authChangeParams = ref<AuthChangeParams>({ type: "assign", users: [] })

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	`cctr-other-employees-list`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/costCenters/roles", {
			method: "GET",
			params: {
				companyCode: info?.companyCode,
				costCenterId: info?.id,
				page: params.value.page,
				size: params.value.size,
			},
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				emit("update:employee", res?.totalElements!)
				return res
			}
		}),
	{ watch: [() => info?.id, params] }
)

const onDelete = (data: number[]) => {
	let num = 0
	data.forEach(async (id) => {
		await useCFetch<Response<any>>(`/api/v2/master/costCenters/roles/${id}`, {
			method: "DELETE",
			body: {
				id: id,
			},
		})
			.then((res: Response<any>) => {
				if (res.status === 0) num = num + 1
			})
			.then(() => {
				if (num === data.length) {
					message.success(`${num}명의 임직원 정보가 삭제 되었습니다.`)
					selectedRowKeys.value = []
					refresh()
				}
			})
	})
}

const onAddSubmit = async (data: AddRef) => {
	await useCFetch<Response<any>>("/api/v2/master/costCenters/roles", {
		method: "POST",
		body: {
			id: info?.id,
			companyCode: info?.companyCode,
			employeeIds: data.employeesInfo.map((e) => ({ id: e.id })),
			// authorityFlag: data.authorityFlag,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
			showAddModal.value = false
		}
		selectedRowKeys.value = []
		message.success(res.message)
	})
}

const onShowAddModal = () => {
	showAddModal.value = true
	modelRef.value.name = info?.name!
	modelRef.value.users = []
	modelRef.value.employeesInfo = []
}

const onChange = async (type: "assign" | "clear") => {
	showAuthConfirmModal.value = true
	authChangeParams.value.type = type
	authChangeParams.value.users = selectedRowKeys.value
}

const authChangeSubmit = async (params: AuthChangeParams) => {
	await useCFetch<Response<any>>(`/api/v2/master/costCenters/roles/${params.type}`, {
		method: "PATCH",
		body: {
			id: info?.id,
			companyCode: info?.companyCode,
			costCenterEmployeeIds: params.users.map((e) => ({ id: e })),
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			refresh()
			showAuthConfirmModal.value = false
			params.type === "assign" ? message.success(res.message) : message.error(res.message)
		}
		selectedRowKeys.value = []
	})
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

watch(
	() => info,
	() => {
		selectedRowKeys.value = []
		refresh()
	}
)
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md" wrap="wrap">
		<a-typography-title :level="4" class="page-title">
			코스트센터 기타 사용자 [{{ info?.name }}]
		</a-typography-title>
		<a-space :size="5">
			<eacc-button
				component-is="delete"
				:data="selectedRowKeys"
				:modal-open="true"
				@click="onDelete"
				:disabled="selectedRowKeys.length === 0"
			/>
			<a-button
				danger
				:icon="materialIcons('mso', 'block')"
				:disabled="selectedRowKeys.length === 0"
				@click="onChange('clear')"
			>
				조회권한 해제
			</a-button>
			<a-button
				:icon="materialIcons('mso', 'edit')"
				:disabled="selectedRowKeys.length === 0"
				@click="onChange('assign')"
			>
				조회권한 부여
			</a-button>
			<a-button :icon="materialIcons('mso', 'add_circle')" @click="onShowAddModal">
				사용자 추가
			</a-button>
			<a-select
				style="width: 6.4rem"
				v-model:value="params.size"
				:options="[{ key: 5, value: 5, label: '5 건' }, ...pageSizeOptions]"
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
			selectedRowKeys,
			onChange: (keys) => (selectedRowKeys = keys),
		}"
		:columns="[
			{ title: '코스트명', dataIndex: 'costCenterName' },
			{ title: '이름', dataIndex: 'employeeName' },
			{ title: '직위', dataIndex: 'positionName' },
			{ title: '직책', dataIndex: 'jobTitleName' },
			{ title: '사번', dataIndex: 'employeeNumber' },
			{ title: '조회권한', dataIndex: 'searchFlag' },
		]"
		:data-source="dataSource?.data"
		:pagination="
			Object.assign({}, pagination, {
				current: params.page + 1 || 1,
				pageSize: params.size,
				total: dataSource?.totalElements,
			})
		"
		@change="cellChange"
	>
		<template #bodyCell="{ column, text }">
			<template v-if="column.dataIndex === 'searchFlag'">
				{{ text ? "코스트센터" : "개인" }}
			</template>
		</template>
	</a-table>
	<field-modal
		title="코스트센터 기타 사용자 추가"
		ok-text="저장"
		cancel-text="취소"
		:field="modelRef"
		:showed="showAddModal"
		:body-style="{ padding: '2rem 3rem' }"
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
				<a-form-item label="조회권한">
					<a-checkbox v-model:checked="field.authorityFlag">
						코스트센터 조회권한
					</a-checkbox>
				</a-form-item>
			</a-form>
			<div class="help-text-box">
				<ul class="help-text">
					<li>
						기타사용자로 포함되게 되면 전표작성시 여러개의 코스트센터를 선택해서 전표를
						작성할 수 있습니다.
					</li>
					<li>
						조회권한은 기본이 개인조회지만, 조회권한 체크하면 코스트센터 조회권한을 부여할
						수도 있습니다.
					</li>
				</ul>
			</div>
		</template>
	</field-modal>
	<confirm-modal
		:modal-title-text="`조회권한 ${authChangeParams.type === 'assign' ? '부여' : '해제'}`"
		:type="authChangeParams.type === 'assign' ? 'warning' : 'error'"
		:title="`해당 코스트센터의 조회권한을 ${authChangeParams.type === 'assign' ? '부여' : '해제'} 하시겠습니까?`"
		:showed="showAuthConfirmModal"
		:icon="() => materialIcons('mso', 'error_outline')"
		:btn-ok-title="`조회권한${authChangeParams.type === 'assign' ? '부여' : '해제'}`"
		:data="authChangeParams"
		@close="showAuthConfirmModal = false"
		@submit="(params: AuthChangeParams) => authChangeSubmit(params)"
	>
		<template #content>
			<div class="mt-sm">
				<template v-if="authChangeParams.type === 'assign'">
					해당 코스트센터의 조회권한이 ‘코스트센터조회’ 권한으로 변경됩니다.
					<br />
					비용부서내 사용자들의 전표내역도 조회가 가능합니다.
				</template>
				<template v-if="authChangeParams.type === 'clear'">
					해당 코스트센터를 선택해 전표작성은 가능하지만, 개인조회권한으로 변경됩니다.
				</template>
			</div>
		</template>
	</confirm-modal>
</template>
