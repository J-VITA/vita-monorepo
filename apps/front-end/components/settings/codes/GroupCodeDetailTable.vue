<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { UnwrapRef } from "vue"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { SubGroupCode } from "@/types/settings/codes"
import type { Rule } from "ant-design-vue/es/form"
import { Form } from "ant-design-vue"
import { pageSizeOptions, pagination } from "@/types"

const { groupCodeId, subCodeData, loading, companyCode } = defineProps<{
	groupCodeId: string | number | undefined
	subCodeData?: any
	loading: boolean
	companyCode: string
}>()
// const props = withDefaults(
//   defineProps<{
//     groupCodeId: string | number | undefined;
//     data?: any;
//     loading: boolean;
//     companyCode: string;
//   }>(),
//   {}
// );

const authStore = useAuthStore()

const emit = defineEmits<{
	(e: "addSubCode", stage: string, value: SubGroupCode): SubGroupCode
	(e: "deleteGroupCodeDetail", value: Array<SubGroupCode>): Array<SubGroupCode>
	(e: "pagination", value: any): any
}>()

// const { getModalVisible, setModalVisible } = useAntModals();
// const subCodeModal = computed(() => getModalVisible('subCodeModal'));
const subCodeModal = ref(false)

const subStage = ref<"add" | "edit">("add")
const subCodeField = reactive<SubGroupCode>({
	id: undefined,
	code: "",
	name: "",
	description: "",
	remark1: "",
	remark2: "",
	remark3: "",
	remark4: "",
	remark5: "",
	used: true,
	groupCodeId: undefined,
	orderSeq: undefined,
	companyCode: companyCode,
})

watch(
	//그릅코드 ID 세팅 (필수)
	() => groupCodeId,
	(groupCodeId) => {
		subCodeField.groupCodeId = groupCodeId
	}
)

/**
 * 코드 모달 Form Rules
 */
const subCodeRulesRef = ref<Record<string, Rule[]>>({
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
	orderSeq: [
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
const useSubCodeForm = Form.useForm
const { resetFields, validate, validateInfos } = useSubCodeForm(
	subCodeField,
	subCodeRulesRef
)

const multipleSelection = ref<Array<any>>([])
const editableData: UnwrapRef<Record<string, any>> = reactive({})
const handleSelectionChange = (val: Array<any>) => {
	multipleSelection.value = val
}

const columns = ref<ColumnsType<SubGroupCode>>([
	{
		title: "상세코드",
		dataIndex: "code",
		sorter: (a: SubGroupCode, b: SubGroupCode) => a.code.length - b.code.length,
		resizable: true,
		fixed: "left",
		width: -1,
	},
	{
		title: "코드명",
		dataIndex: "name",
		sorter: (a: SubGroupCode, b: SubGroupCode) => a.name.length - b.name.length,
		resizable: true,
		fixed: "left",
		width: -1,
	},
	{
		title: "설명",
		dataIndex: "description",
		sorter: (a: SubGroupCode, b: SubGroupCode) =>
			a.description.length - b.description.length,
		resizable: true,
		fixed: "left",
		width: -1,
	},
	{
		title: "사용여부",
		dataIndex: "used",
		width: 80,
		fixed: "right",
		resizable: true,
	},
	// { title: '기능', dataIndex: 'operation', width: 100, fixed: 'right' },
])

const rowSelection = ref({
	onChange: (selectedRowKeys: (string | number)[], selectedRows: Array<any>) => {
		// console.log(
		//   `selectedRowKeys: ${selectedRowKeys}`,
		//   'selectedRows: ',
		//   selectedRows
		// );
	},
	onSelect: (record: any, selected: boolean, selectedRows: Array<any>) => {
		// console.log('onSelect', record, selected, selectedRows);
		multipleSelection.value = selectedRows
	},
	onSelectAll: (selected: boolean, selectedRows: Array<any>, changeRows: Array<any>) => {
		// console.log('onSelectAll', selected, selectedRows, changeRows);
		multipleSelection.value = selectedRows
	},
})

/**
 * 건 수정 상태값 변경
 */
const edit = (key: string) => {
	editableData[key] = _cloneDeep(
		subCodeData.data.filter((item: any) => key === item.code)[0]
	)
}

/**
 * 건 수정 호출
 */
const save = (key: string) => {
	Object.assign(
		subCodeData.data.filter((item: any) => key === item.code)[0],
		editableData[key]
	)
	delete editableData[key]
}

/**
 * 건 수정 취소
 */
const cancel = (key: string) => {
	delete editableData[key]
}

/**
 * 상세코드 삭제 호출
 */
const deleteGroupCodeDetail = (items: Array<SubGroupCode>) => {
	if (items && items.length > 0) {
		emit("deleteGroupCodeDetail", items)
		multipleSelection.value = []
	} else {
		message.error("삭제 할 상세코드를 선택해주세요.")
	}
}

/**
 * 코드 모달 클로징
 */
const codeModalClose = () => {
	resetFields()
	// 그룹코드 ID가 모달 클로징 될 때 사라지는 부분으로 초기화 해줌.
	const __groupCodeId = _cloneDeep(groupCodeId)
	subCodeField.groupCodeId = __groupCodeId
	//modal closed
	subCodeModal.value = false
	// setModalVisible('subCodeModal', false);
}

/**
 * 코드 추가 전달 이벤트
 */
const addSubCode = (stage: "add" | "edit", code: SubGroupCode) => {
	// console.log("code " , code)
	validate()
		.then(() => {
			emit("addSubCode", stage, code)
			codeModalClose()
		})
		.catch((err) => {
			console.error("코드추가 벨리데이션 error ", err)
		})
}

/**
 * 서브코드 모달 오픈
 * @param stage
 * @param code
 */
const setSubCodeModalData = (stage: "add" | "edit", code?: SubGroupCode) => {
	if (code) {
		if (stage == "edit") {
			subCodeField.id = code.id
			subCodeField.companyCode = code.companyCode
			subCodeField.code = code.code
			subCodeField.name = code.name
			subCodeField.description = code.description
			subCodeField.used = code.used
			subCodeField.remark1 = code.remark1
			subCodeField.remark2 = code.remark2
			subCodeField.remark3 = code.remark3
			subCodeField.remark4 = code.remark4
			subCodeField.remark5 = code.remark5
			subCodeField.groupCodeId = code.groupCodeId
			subCodeField.orderSeq = code.orderSeq
			//
		}
	} else {
		console.log("code.groupCodeId ", groupCodeId)
		subCodeField.id = undefined
		subCodeField.companyCode = companyCode
		subCodeField.code = ""
		subCodeField.name = ""
		subCodeField.description = ""
		subCodeField.used = true
		subCodeField.remark1 = ""
		subCodeField.remark2 = ""
		subCodeField.remark3 = ""
		subCodeField.remark4 = ""
		subCodeField.remark5 = ""
		subCodeField.groupCodeId = groupCodeId
		subCodeField.orderSeq = 0
	}
	subStage.value = stage
	subCodeModal.value = true
	// setModalVisible('subCodeModal', true);
}

/**
 * 페이징 처리할 때 필요한 이벤트(테이블 이벤트 변경)
 * @param
 */
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	if (groupCodeId && subCodeData) {
		emit("pagination", pagination)
	}
}

/**
 * set resizable for drag column
 * @param w
 * @param col
 */
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
</script>

<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-md">
		<a-typography-title :level="4" class="page-title"> 상세코드 </a-typography-title>
		<a-space :size="5">
			<eacc-button
				component-is="delete"
				:data="multipleSelection"
				:modal-open="true"
				:disabled="multipleSelection.length === 0"
				@click="deleteGroupCodeDetail"
			/>
			<a-button
				:disabled="!(groupCodeId && companyCode)"
				type="primary"
				:icon="materialIcons('mso', 'add_circle')"
				@click="setSubCodeModalData('add')"
			>
				상세코드추가
			</a-button>

			<a-select
				v-model:value="subCodeData.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="
					(value: any) =>
						emit('pagination', {
							current: 1,
							pageSize: value,
						})
				"
			/>
		</a-space>
	</a-flex>
	<a-table
		:data-source="subCodeData.data"
		empty-text="데이터가 없습니다."
		:columns="columns"
		size="small"
		:showSorterTooltip="false"
		:row-key="(record: any) => record.id"
		:row-selection="rowSelection"
		:loading="loading"
		:pagination="
			Object.assign({}, pagination, {
				current: subCodeData.pageNumber ? subCodeData.pageNumber + 1 : 1,
				pageSize: subCodeData.size,
				total: subCodeData.totalElements,
			})
		"
		@change="cellChange"
		@resizeColumn="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'code'">
				<a-button
					type="link"
					@click="setSubCodeModalData('edit', record as SubGroupCode)"
					>{{ text }}</a-button
				>
			</template>
			<template v-else-if="column.dataIndex === 'used'">
				<a-badge
					:color="record.used ? 'green' : 'red'"
					:text="record.used ? '사용중' : '미사용'"
				/>
				<!-- <a-checkbox
          v-if="editableData[record.code]"
          v-model:checked="editableData[record.code][column.dataIndex]"
          disabled
        ></a-checkbox>
        <a-checkbox v-else v-model:checked="record.used" disabled></a-checkbox> -->
			</template>
			<template v-else-if="column.dataIndex === 'operation'">
				<div class="editable-row-operations">
					<span v-if="editableData[record.code]">
						<a-typography-link @click="save(record.code)">저장</a-typography-link>
						|
						<a-popconfirm
							title="취소하시겠습니까?"
							ok-text="확인"
							cancel-text="취소"
							@confirm="cancel(record.code)"
						>
							<a>취소</a>
						</a-popconfirm>
					</span>
					<span v-else>
						<a @click="edit(record.code)">수정</a>
					</span>
				</div>
			</template>
			<template v-else>{{ text }}</template>
		</template>
	</a-table>

	<field-modal
		class="modal"
		:field="subCodeField"
		title="상세코드추가"
		:showed="subCodeModal"
		@closed="codeModalClose()"
		@submit="() => addSubCode(subStage, subCodeField)"
	>
		<template #content="{ field }">
			<a-form
				label-align="left"
				:colon="false"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
				:model="field"
				:rules="subCodeRulesRef"
			>
				<a-form-item
					label="상세코드"
					name="code"
					v-bind="validateInfos.code"
					has-feedback
				>
					<a-input v-model:value="field.code" />
				</a-form-item>
				<a-form-item
					label="상세코드명"
					name="name"
					v-bind="validateInfos.name"
					has-feedback
				>
					<a-input v-model:value="field.name" />
				</a-form-item>
				<a-form-item label="상세코드설명">
					<a-input v-model:value="field.description" />
				</a-form-item>
				<a-form-item label="비고1">
					<a-input v-model:value="field.remark1" />
				</a-form-item>
				<a-form-item label="비고2">
					<a-input v-model:value="field.remark2" />
				</a-form-item>
				<a-form-item label="비고3">
					<a-input v-model:value="field.remark3" />
				</a-form-item>
				<a-form-item label="비고4">
					<a-input v-model:value="field.remark4" />
				</a-form-item>
				<a-form-item label="비고5">
					<a-input v-model:value="field.remark5" />
				</a-form-item>
				<a-form-item label="순번" name="orderSeq" v-bind="validateInfos.orderSeq">
					<a-input type="number" v-model:value="field.orderSeq" />
				</a-form-item>
				<a-form-item label="사용여부">
					<a-switch v-model:checked="field.used" size="small" />
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
