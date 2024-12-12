<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { UnwrapRef } from "vue"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { TableColumnType, TableProps } from "ant-design-vue"
import GroupCodeDetailTable from "@/components/settings/codes/GroupCodeDetailTable.vue"
import { type Response, pageSizeOptions, pagination } from "@/types"
import type { GroupCode, SubGroupCode, RequestGroup } from "@/types/settings/codes"
import { Form } from "ant-design-vue"
import type { Rule } from "ant-design-vue/es/form"
// const fetchData = defineModel<Array<GroupCode> | undefined>('fetchData');

type OptionGroupCode = Partial<RequestGroup>

const {
	fetchData,
	params,
	pending = false,
	companyCode,
} = defineProps<{
	fetchData: any
	params?: any
	pending: boolean
	companyCode: string
}>()

const loading = ref(false)

const emit = defineEmits<{
	(e: "codeEditRow", value: any): any
	(e: "codeDeleteRow", value: any): any
	(e: "addGroupCode", value: any): any
	(e: "deleteGroupCodeDetail", value: any): any
	(e: "pagination", value: any, ...sorter: any): any
}>()

// const { getModalVisible, setModalVisible } = useAntModals();
const codeModal = ref(false)
// const codeModal = computed(() => getModalVisible('codeModal'));
const codeModalField = reactive<Partial<GroupCode>>({
	companyCode: companyCode,
	id: undefined,
	code: "",
	name: "",
	description: "",
	color: "",
	used: true,
})

type Key = string | number
const state = reactive<{
	selectedRowKeys: Key
	loading: boolean
	params: OptionGroupCode
}>({
	selectedRowKeys: -1, // Check here to configure the default column
	loading: false,
	params: {
		id: undefined,
		page: 1,
		size: 10,
	},
})

const columns = ref<ColumnsType<GroupCode>>([
	{
		title: "그룹코드",
		dataIndex: "code",
		sorter: (a: GroupCode, b: GroupCode) => a.code.length - b.code.length,
		resizable: true,
		width: -1,
	},
	{
		title: "코드명",
		dataIndex: "name",
		sorter: (a: GroupCode, b: GroupCode) => a.name.length - b.name.length,
		resizable: true,
		width: -1,
	},
	{
		title: "설명",
		dataIndex: "description",
		sorter: (a: GroupCode, b: GroupCode) => a.description.length - b.description.length,
		resizable: true,
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		width: 80,
		resizable: true,
	},
	{
		title: "기능",
		dataIndex: "operation",
		resizable: true,
		width: -1,
		fixed: "right",
	},
])

/**
 * 건 삭제 이벤트
 */
const onDelete = (key: Key) => {
	emit("codeDeleteRow", key)
	subCode.value = {
		data: [],
		size: 10,
	}
}

const editableData: UnwrapRef<Record<string, any>> = reactive({})
/**
 * 건 수정
 */
const onEdit = (key: string) => {
	editableData[key] = _cloneDeep(fetchData.data.filter((item: any) => key === item.id)[0])
}

/**
 * 건 수정 -> 저장
 */
const onSave = (key: any) => {
	Object.assign(
		fetchData.data.filter((item: any) => key === item.id)[0],
		editableData[key]
	)
	emit("codeEditRow", editableData[key])
	delete editableData[key]
}

/**
 * 건 수정 취소
 */
const onCancel = (key: string) => {
	delete editableData[key]
}

/**
 * 건 선택 시 class name 변경(색상)
 */
const setClassName = (record: GroupCode, index: Key) => {
	return record.id === state.selectedRowKeys
		? "active-row cursor-pointer"
		: "cursor-pointer"
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

/**
 * 그룹코드 건 선택
 */
const rowClick = (record: GroupCode, idx: Key) => {
	state.selectedRowKeys = Number(record.id)
	state.params = Object.assign(state.params, record as OptionGroupCode)
	// console.log("state.params.id " ,state.params.id)
	state.params.page = 1
	setSubCode(state.params)
}

const subCode = ref<Response<SubGroupCode[]>>({
	size: 10,
	data: [],
})

const setSubGroupPagination = (pagination: any) => {
	state.params.page = pagination.current
	state.params.size = pagination.pageSize
	setSubCode(state.params)
}

/**
 * 상세코드 조회 API 호출
 */
const setSubCode = async (params: OptionGroupCode) => {
	loading.value = true
	const page = params.page && params.page > 1 ? params.page - 1 : 0
	await useCFetch<Response<SubGroupCode[]>>(`/api/v2/settings/codes/subCodes`, {
		method: "GET",
		params: {
			groupCodeId: params.id,
			companyCode: companyCode,
			page: page,
			size: params.size,
		},
	})
		.then((res: Response<SubGroupCode[]>) => (subCode.value = res))
		.finally(() => (loading.value = false))
}

/**
 * 상세코드추카 API Request
 * @param stage
 * @param data
 */
const addSubCode = async (stage: string, data: SubGroupCode) => {
	if (!data.groupCodeId) {
		message.error("그룹코드를 선택해주세요.")
		return false
	}

	// emit('addSubCode', type, data)
	const body = Object.assign({}, data)

	await useCFetch<Response<any>>(
		`/api/v2/settings/codes/subCodes${stage === "edit" ? "/" + data.id : ""}`,
		{
			method: stage === "edit" ? "PATCH" : "POST",
			body,
		}
	).then(async (res: Response<any>) => {
		if (res.status === 0) {
			await setSubCode(state.params)
		} else {
			message.error(res.message)
		}
	})
}

/**
 * 상세코드 삭제 API Request
 * @param data
 */
const deleteGroupCodeDetail = (data: Array<SubGroupCode>): void => {
	data.forEach((subCode: SubGroupCode) => {
		useCFetch<Response<any>>(`/api/v2/settings/codes/subCodes/${subCode.id}`, {
			method: "DELETE",
			body: {
				id: subCode.id,
			},
		}).then(async (res: Response<any>) => {
			if (res.status === 0) await setSubCode(state.params)
		})
	})
}

/**
 * Ant Form
 */
const useCodeForm = Form.useForm

/**
 * 코드 모달 Form Rules
 */
const codeRulesRef = ref<Record<string, Rule[]>>({
	companyCode: [{ required: false }],
	code: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
	name: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
	description: [{ required: false }],
	used: [{ type: "boolean", required: false }],
})
const { resetFields, validate, validateInfos } = useCodeForm(codeModalField, codeRulesRef)

/**
 * 코드 모달 오픈
 */
const codeModalOpen = (record?: GroupCode) => {
	resetFields()
	// Object.assign(codeModalField.value, record ? record : {});
	if (record && record.id) {
		console.log("record : ", record)
		// codeModalField.value = { ...record };
		codeModalField.id = record.id
		codeModalField.code = record.code
		codeModalField.name = record.name
		codeModalField.description = record.description
		codeModalField.used = record.used
		codeModalField.companyCode = record.companyCode
	} else {
		codeModalField.id = undefined
		codeModalField.code = ""
		codeModalField.name = ""
		codeModalField.description = ""
		codeModalField.used = true
		codeModalField.companyCode = companyCode
	}

	codeModal.value = true
}

/**
 * 코드 모달 클로징
 */
const codeModalClose = () => {
	resetFields()
	codeModal.value = false
	// setModalVisible('codeModal', false);
}

/**
 * 코드 추가 전달 이벤트
 */
const addGroupCode = (code: Partial<GroupCode>) => {
	validate()
		.then(() => {
			if (code.id) {
				emit("codeEditRow", code)
			} else {
				emit("addGroupCode", code)
			}
			codeModalClose()
		})
		.catch((err) => {
			console.error("addGroupCode", err)
		})
}

/**
 * 페이징 처리할 때 필요한 이벤트(테이블 이벤트 변경)
 * @param
 */
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = Array.isArray(sorter)
		? sorter.map((s: any) => ({
				field: s.field,
				order: s.order,
			}))
		: [
				{
					order: sorter.order,
					field: sorter.order ? sorter.field : undefined,
				},
			]
	emit("pagination", pagination, sortParams)
}

const pageSizeUpdate = (size: any) => {
	emit("pagination", {
		current: 1,
		pageSize: size,
	})
}

onMounted(() => {
	if (fetchData && fetchData.length > 0) {
		rowClick(fetchData[0], 0)
	}
})

watchEffect(() => {
	if (companyCode) {
		state.params.id = undefined
		state.params.page = 1
		state.params.size = 10
		state.selectedRowKeys = -1
		state.loading = false
		// setSubCode(state.params);
		// subCode.value.size = 10;
		subCode.value = {}
	}
})
</script>

<template>
	<a-row :gutter="30">
		<a-col flex="2">
			<a-flex gap="small" justify="space-between" align="center" class="mb-md">
				<a-typography-title :level="4" class="page-title"> 그룹코드 </a-typography-title>
				<a-space :size="5">
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'add_circle')"
						@click="codeModalOpen()"
					>
						그룹코드추가
					</a-button>
					<a-select
						v-model:value="params.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
						@change="(value) => pageSizeUpdate(value)"
					/>
				</a-space>
			</a-flex>

			<a-table
				v-if="fetchData"
				:data-source="fetchData.data"
				:columns="columns"
				:loading="pending"
				size="small"
				:row-key="(record: any) => record.id"
				:custom-row="
					(record, idx) => {
						return {
							onClick: (event) => rowClick(record, idx as Key),
						}
					}
				"
				:row-class-name="setClassName"
				:pagination="
					Object.assign({}, pagination, {
						current: params.page,
						pageSize: params.size,
						total: fetchData.totalElements,
					})
				"
				@change="cellChange"
				@resizeColumn="handleResizeColumn"
			>
				<template #bodyCell="{ column, text, record }">
					<!-- <template v-if="['code', 'name', 'description'].includes(column.dataIndex)"> -->
					<template v-if="column.dataIndex === 'code'">
						<a-button type="link" @click="codeModalOpen(record as GroupCode)">{{
							text
						}}</a-button>
					</template>
					<template v-if="column.dataIndex === 'name'">
						<div>
							<a-input
								v-if="editableData[record.id]"
								v-model:value="editableData[record.id][column.dataIndex]"
								style="margin: -5px 0; width: 10rem"
							/>
							<template v-else>
								{{ text }}
							</template>
						</div>
					</template>
					<template v-if="column.dataIndex === 'description'">
						<div>
							<a-input
								v-if="editableData[record.id]"
								v-model:value="editableData[record.id][column.dataIndex]"
								style="margin: -5px 0; width: 12rem"
							/>
							<template v-else>
								{{ text }}
							</template>
						</div>
					</template>
					<template v-else-if="column.dataIndex === 'used'">
						<a-badge
							:color="record.used ? 'green' : 'red'"
							:text="record.used ? '사용중' : '미사용'"
						/>
					</template>
					<template v-else-if="column.dataIndex === 'operation'">
						<a-space :size="5" v-if="editableData[record.id]">
							<a-button type="primary" size="small" @click="onSave(record.id)"
								>저장</a-button
							>
							<a-button danger size="small" @click="onCancel(record.id)">취소</a-button>
						</a-space>
						<a-space :size="5" v-else>
							<!-- <a-button
                size="small"
                :icon="materialIcons('mso', 'edit')"
                @click="onEdit(record.id)"
              /> -->
							<a-popconfirm
								v-if="fetchData.data.length"
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
				</template>
			</a-table>
		</a-col>
		<a-col flex="3">
			<group-code-detail-table
				:group-code-id="state.params.id"
				:sub-code-data="subCode"
				:company-code="companyCode"
				:loading="loading"
				@add-sub-code="(stage: string, data: SubGroupCode) => addSubCode(stage, data)"
				@delete-group-code-detail="
					(data: Array<SubGroupCode>) => deleteGroupCodeDetail(data)
				"
				@pagination="setSubGroupPagination"
			>
			</group-code-detail-table>
		</a-col>
	</a-row>

	<field-modal
		:field="codeModalField"
		title="그룹코드추가"
		:showed="codeModal"
		@closed="codeModalClose()"
		@submit="() => addGroupCode(codeModalField)"
	>
		<template #content="{ field }">
			<a-form
				label-align="left"
				:colon="false"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
				:model="field"
				:rules="codeRulesRef"
			>
				<a-form-item
					v-bind="validateInfos.code"
					label="그룹코드"
					name="code"
					has-feedback
				>
					<a-input v-model:value="field.code" />
				</a-form-item>
				<a-form-item
					v-bind="validateInfos.name"
					label="그룹코드명"
					name="name"
					has-feedback
				>
					<a-input v-model:value="field.name" />
				</a-form-item>
				<a-form-item label="그룹코드설명" name="description">
					<a-input v-model:value="field.description" />
				</a-form-item>
				<a-form-item label="사용여부">
					<a-switch v-model:checked="field.used" size="small" />
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
