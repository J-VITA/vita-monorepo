<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { type Response, pageSizeOptions, pagination } from "@/types"
import type { UnwrapRef } from "vue"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Titles } from "@/types/settings/titles"
import type { EmployeeDetail, AddRef } from "@/types/master/cctr"
import type { Rule } from "ant-design-vue/es/form"
import { type TableProps, type FormInstance, Form } from "ant-design-vue"

type Key = string | number

const {
	data,
	params,
	loading = false,
	companyCode,
} = defineProps<{
	data: Response<Array<EmployeeDetail>>
	params?: any
	loading: boolean
	companyCode: string
}>()

interface IAddField {
	id?: string | number
	workplaceId: string | number
	parentId: string | number
	departmentName?: string
	departmentCode?: string
	stage?: "new" | "update"
	orderSeq?: number
	workplaceCode?: string
}

const authStore = useAuthStore()
const { getCompanyCode, getWorkplaceId, getRole } = storeToRefs(authStore)

const multipleSelection = ref<IDeptDataType>({
	member: [],
	currentCode: undefined,
})
const selectedRowKeys = ref<(string | number)[]>([])
const showTitleModal = ref<boolean>(false)

const showUserModal = ref<boolean>(false)

interface AddUserRef extends AddRef {
	id?: number | string
}

watch(
	() => loading,
	(value) => {
		if (value) {
			resetCheckedField()
		}
	}
)

const state = reactive<{
	selectedRowKeys: Key
	loading: boolean
	params: any
}>({
	selectedRowKeys: -1, // Check here to configure the default column
	loading: false,
	params: {},
})

const columns = ref<ColumnsType<Titles>>([
	{
		title: "직책",
		dataIndex: "jobName",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.jobName!.length - b.jobName!.length,
		width: -1,
	},
	{
		title: "이름",
		dataIndex: "name",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.name!.length - b.name!.length,
		width: -1,
	},
	{
		title: "부서",
		dataIndex: "departmentName",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.departmentName!.length - b.departmentName!.length,
		width: -1,
	},
	{
		title: "직위",
		dataIndex: "gradeName",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.gradeName!.length - b.gradeName!.length,
		width: -1,
	},
	{
		title: "이메일",
		dataIndex: "email",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.email!.length - b.email!.length,
		width: -1,
	},
	{
		title: "사번",
		dataIndex: "employeeNumber",
		resizable: true,
		sorter: (a: Titles, b: Titles) => a.employeeNumber!.length - b.employeeNumber!.length,
		width: -1,
	},
])

const emit = defineEmits<{
	(e: "pagination", value: any): any
	(e: "refresh"): void
}>()

/**
 * 행 선택 시 class name 변경(색상)
 */
const setClassName = (record: Titles, index: Key) => {
	return index === state.selectedRowKeys ? "active-row" : ""
}

/**
 * 페이징 처리할 때 필요한 이벤트(테이블 이벤트 변경)
 * @param
 */
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	emit("pagination", pagination)
}

/**
 * 페이지 콤보박스 체인지 이벤트
 */
const onSelectionchange = (size: number) => {
	data.size = size

	emit("pagination", { pageSize: size })
}
/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

interface DataTableType {
	id: number
	departmentName: string
	name: string
	gradeName: string
	jobName: string
	email: string
}

interface IDeptDataType {
	member: DataTableType[]
	currentCode: (string | number)[] | undefined
}

const onSelectChange = (key: (string | number)[], selectedRows: DataTableType[]) => {
	selectedRowKeys.value = key
	multipleSelection.value.currentCode = key || []
	multipleSelection.value.member = selectedRows
}

/**
 * 부서이동 Submit 콜백
 * @param value
 */
const callbackDeptModal = (value: any) => {
	console.log("callbackDeptModal", value)
	if (value) {
		resetCheckedField()
		emit("refresh")
	}
}

/**
 * 사용자 모달 Form Rules
 */
const userRulesRef = ref<Record<string, Rule[]>>({
	users: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
})

/**
 * Ant Form
 */
const addUsersField = ref<Partial<AddUserRef>>({
	name: "",
	users: [],
	employeesInfo: [],
})

const useUserForm = Form.useForm
const {
	resetFields: userResetFields,
	validate: userValidate,
	validateInfos: userValidateInfos,
} = useUserForm(addUsersField, userRulesRef)

const resetCheckedField = () => {
	multipleSelection.value.currentCode = []
	multipleSelection.value.member = []
	selectedRowKeys.value = []
}

/**
 * 사용자 모달 오픈
 */
const userModalOpen = async () => {
	userResetFields()
	resetCheckedField()

	await getDepartmentEmployees(params).finally(() => (showUserModal.value = true))
}

/**
 * 임직원 변수
 */
//  const memberList = ref<DataTableType[]>([]);

/**
 * 직책별 임직원 조회
 * @param id
 */
const getDepartmentEmployees = async (employee: EmployeeDetail) => {
	if (employee.id) {
		const page = params.page && params.page > 1 ? params.page - 1 : 0

		return await useCFetch<Response<DataTableType[]>>(
			`/api/v2/settings/commons/employees`,
			{
				method: "GET",
				params: {
					companyCode: companyCode,
					jobTitleId: params.id,
					// jobTitleName: params.name,
					page: page,
					size: params.size,
				},
			}
		).then((res: Response<DataTableType[]>) => {
			if (res.status === 0) {
				const memberList = res.data as DataTableType[]
				addUsersField.value.users = memberList
					.filter((member) => member.id)
					.map((member) => member.id) as (string | number)[]
				// props.params.page = res.pageNumber || 0;
				// props.params.size = res.size || 0;
				// props.params.totalElements = res.totalElements || 0;
			}
		})
	}
}

/**
 * 사용자 모달 닫기
 */
const userModalClose = async () => {
	showUserModal.value = false
}

/**
 * 사용자 추가 전달 이벤트
 * * 성공 시 API(저장/수정) 호출
 * * 실패 시 필드 리젝
 */
const submitUser = (v: AddUserRef) => {
	userValidate()
		.then(() => {
			putTitleAssignEmployees(v).finally(() => userModalClose())
		})
		.catch((err) => {
			console.error("사용자 추가 필드 리젝", err)
		})
}

/**
 * 직책 사용자 할당 수정
 * @param data
 */
const putTitleAssignEmployees = async (data: AddUserRef) => {
	type EmployeeIdType = { id: string | number }
	const employeeIds: Array<EmployeeIdType> = []
	data.users.forEach((item) => {
		employeeIds.push({ id: item })
	})
	const body = Object.assign(
		{},
		{
			id: params.id,
			companyCode: companyCode,
			employeeIds,
		}
	)

	return await useCFetch<Response<any>>(`/api/v2/settings/jobTitles/assign/employees`, {
		method: "PUT",
		body,
	}).then((res: Response<any>) => {
		if (res.status == 0) {
			message.success(`${res.message}`)
			emit("refresh")
		} else {
			message.error(`${res.message}`)
		}
	})
}
</script>

<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md">
		<a-typography-title :level="4" class="page-title">
			직책정보 {{ params.name ? "[" + params.name + "]" : "" }}
		</a-typography-title>
		<a-space :size="5">
			<a-button
				type="primary"
				ghost
				:icon="materialIcons('mso', 'autorenew')"
				@click="
					() => {
						showTitleModal = true
					}
				"
				:disabled="multipleSelection.member.length < 1"
			>
				직책 변경
			</a-button>

			<a-button
				type="primary"
				:icon="materialIcons('mso', 'person_add')"
				@click="userModalOpen()"
				:disabled="!params.id"
				>사용자 추가</a-button
			>
			<a-select
				v-model:value="data.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="(page: any) => onSelectionchange(page)"
			/>
		</a-space>
	</a-flex>

	<a-table
		:showSorterTooltip="false"
		:data-source="data.data"
		:columns="columns"
		:loading="loading"
		size="small"
		empty-text="데이터가 없습니다."
		:row-key="(record) => record.id"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: onSelectChange,
		}"
		:pagination="
			Object.assign({}, pagination, {
				current: data.pageNumber ? data.pageNumber + 1 : 1,
				pageSize: data.size || 10,
				total: data.totalElements || 0,
			})
		"
		:row-class-name="setClassName"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record, value }">
			<template v-if="column.dataIndex === 'email'">
				<a-button type="link" v-model="record.email">{{ text }}</a-button>
			</template>
			<template v-else>
				{{ text }}
			</template>
		</template>
	</a-table>

	<title-change-modal
		:show="showTitleModal"
		:data="multipleSelection"
		:company-code="companyCode"
		@update:show="(value) => (showTitleModal = value)"
		@callback="callbackDeptModal"
	/>

	<field-modal
		:field="addUsersField"
		title="사용자추가"
		size="large"
		:showed="showUserModal"
		@closed="userModalClose()"
		@submit="(data: any) => submitUser(data)"
	>
		<template #content="{ field }">
			<a-form
				ref="userFormRef"
				label-align="left"
				:colon="false"
				:model="field"
				:rules="userRulesRef"
				:style="{
					padding: '1.5rem 0 1.5rem',
				}"
			>
				<a-form-item name="users" v-bind="userValidateInfos.users" has-feedback>
					<eacc-select-multi-table
						url="/api/v2/settings/commons/employees/paging"
						:params="{
							companyCode,
						}"
						v-model:value="field.users"
						key-props="id"
						:columns="[
							{
								title: '이름',
								data: (row: any) => row.name,
							},
							{ title: '직책', data: (row: any) => row.jobName },
							{ title: '부서', data: (row: any) => row.departmentName },
							{ title: '회사', data: (row: any) => row.companyName },
						]"
						@update:value="(value) => (field.users = value)"
						@selection-change="(value) => (field.employeesInfo = value)"
					/>
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
