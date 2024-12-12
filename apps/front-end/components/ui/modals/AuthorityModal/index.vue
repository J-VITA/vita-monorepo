<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import { type TreeProps, Form } from "ant-design-vue"
import type { AccountRoleDetail, AccountRoleForm } from "@/types/master/accounts"

const useForm = Form.useForm
const props = withDefaults(defineProps<{ show: boolean; data?: AccountRoleDetail }>(), {
	show: false,
})

const emit = defineEmits<{
	(e: "update:show", value: boolean): boolean
	(e: "callback"): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
		emit("callback")
		loading.value = false
	},
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const loading = ref<boolean>(false)
const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const checkedKeys = ref<number[]>([])
const costCenters = ref<number[]>([])
const employees = ref<number[]>([])

const expandedKeys = ref<(string | number)[]>([])
const autoExpandParent = ref<boolean>(true)

const modelRef = ref<AccountRoleForm>({
	code: "",
	name: "",
	companyCode: getCompanyCode.value,
	description: "",
	used: true,
	accountIds: [],
	costCenterIds: [],
	employeeIds: [],
})

const rulesRef = ref<any>({
	name: [
		{
			required: true,
			message: "권한명은 필수입니다.",
			trigger: "blur",
		},
	],
	code: [
		{
			required: props.data ? false : true,
			message: "권한코드는 필수입니다.",
			trigger: "blur",
		},
	],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)
const {
	data: treeData,
	status,
	refresh,
} = await useAsyncData(`accounts-tree-list`, () =>
	useCFetch<Response<any>>("/api/v2/master/accounts", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
		},
	}).then((res: Response<any>) => res.data)
)

const onFetch = async (
	method: "PATCH" | "POST",
	id?: string | number,
	data?: AccountRoleForm
) => {
	const url = id ? `/api/v2/master/accountRoles/${id}` : "/api/v2/master/accountRoles"

	await useCFetch<Response<any>>(url, {
		method: method,
		params: id ? { id: id } : undefined,
		body: data,
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				message.success(
					`계정/비용 항목 권한이 ${method === "PATCH" ? "수정" : "저장"} 되었습니다.`
				)
			}
		})
		.finally(() => (open.value = false))
}

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		refresh().finally(() => {
			treeData.value = filterTreeData(treeData.value, query)
		})
	}

	if (!query) {
		refresh()
	}
	oldValue = query
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	autoExpandParent.value = false
}

const onCheck: TreeProps["onCheck"] = (keys, info) => {
	modelRef.value.accountIds = info.checkedNodes.map((x) => {
		return { id: x.id }
	})
}

const onSubmit = () => {
	validate()
		.then(async () => {
			loading.value = true
			const send = Object.assign({}, modelRef.value)

			if (props.data) {
				onFetch("PATCH", props.data.id, send)
			} else {
				onFetch("POST", undefined, send)
			}
		})
		.catch((err) => {
			console.error(err)
		})
}

const onAfterClose = () => {
	loading.value = false
	checkedKeys.value = []
	costCenters.value = []
	employees.value = []
}

onUpdated(() => {
	resetFields()
	if (treeData.value) {
		expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "id").map(
			(x: any) => x.id
		)
	}

	if (props.show && props.data) {
		const data = props.data
		let employ: number[] = []
		let cost: number[] = []

		modelRef.value.id = data.id
		modelRef.value.code = data.code
		modelRef.value.companyCode = data.companyCode
		modelRef.value.name = data.name
		modelRef.value.description = data.description
		modelRef.value.used = data.used

		modelRef.value.accountIds = data.accountList.map((e: any) => {
			return { id: e.accountId }
		})
		modelRef.value.costCenterIds = data.accountCostCenters.map((e: any) => {
			return { id: e.costCenterId }
		})
		modelRef.value.employeeIds = data.accountEmployees.map((e: any) => {
			return { id: e.employeeId }
		})

		data.accountList?.forEach((item) => checkedKeys.value.push(item.accountId))
		data.accountCostCenters?.forEach((item) => cost.push(item.costCenterId))
		data.accountEmployees?.forEach((item) => employ.push(item.employeeId))
		employees.value = employ
		costCenters.value = cost
	}
})
</script>
<template>
	<a-modal
		centered
		width="80rem"
		v-model:open="open"
		title="계정/비용항목 권한추가"
		ok-text="저장"
		:force-render="true"
		:destroy-on-close="true"
		:confirm-loading="loading"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		<a-row :gutter="[15, 15]">
			<a-col flex="1">
				<a-form
					:colon="false"
					label-align="left"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
				>
					<a-form-item label="권한명" v-bind="validateInfos.name">
						<a-input v-model:value="modelRef.name" />
					</a-form-item>
					<a-form-item label="권한코드" v-bind="validateInfos.code">
						<a-input v-model:value="modelRef.code" :disabled="props.data !== undefined" />
					</a-form-item>
					<a-form-item label="권한설명">
						<a-input v-model:value="modelRef.description" />
					</a-form-item>
					<a-form-item label="사용여부">
						<a-switch size="small" v-model:checked="modelRef.used" />
					</a-form-item>
					<a-form-item label="코스트센터">
						<eacc-select-multi-table
							key-props="id"
							label-prop="workplaceName"
							url="/api/v2/masters/commons/costCenters"
							v-model:value="costCenters"
							:columns="[
								{
									title: '코스트센터',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="(value) => (costCenters = value)"
							@selection-change="
								(value) => {
									modelRef.costCenterIds = value.map((e: any) => {
										return { id: e.id }
									})
								}
							"
						/>
					</a-form-item>
					<a-form-item>
						<template #label>
							<a-space :size="3">
								<a-typography-text>기타 사용자</a-typography-text>
								<a-popover placement="bottom">
									<template #content>
										<p>특별한 사용자가 아니라면, 인사 이동시 사용이 용이하도록</p>
										<p>코스트센터를 등록하는걸 권장합니다.</p>
									</template>
									<component :is="materialIcons('m', 'help')" class="popover-help" />
								</a-popover>
							</a-space>
						</template>
						<eacc-select-multi-table
							url="/api/v2/masters/commons/employees"
							v-model:value="employees"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name, width: '10rem' },
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{ title: '회사', data: (row: any) => row.companyName },
							]"
							@update:value="(value) => (employees = value)"
							@selection-change="
								(value) => {
									modelRef.employeeIds = value.map((e: any) => {
										return { id: e.id }
									})
								}
							"
						/>
					</a-form-item>
				</a-form>
			</a-col>
			<a-col flex="1rem">
				<a-divider type="vertical" class="full-height mx-none" />
			</a-col>
			<a-col flex="32rem">
				<a-spin :spinning="status === 'pending'">
					<a-input-search
						class="mb-sm"
						v-model:value="searchValue"
						placeholder="검색"
						@input="onQueryChanged(searchValue)"
					/>
					<a-tree
						block-node
						checkable
						v-model:checkedKeys="checkedKeys"
						v-model:expanded-keys="expandedKeys"
						:auto-expand-parent="autoExpandParent"
						:selectable="false"
						:show-icon="true"
						:default-expand-all="true"
						:tree-data="treeData"
						:height="500"
						:field-names="{
							children: 'children',
							title: 'name',
							key: 'id',
						}"
						@check="onCheck"
						@expand="onExpand"
					>
						<template #icon="{ dataRef }">
							<template v-if="dataRef.accountLevelName === 'GROUP'">
								<component :is="materialIcons('m', 'folder')" class="text-warning" />
							</template>
							<template v-else>
								<component :is="materialIcons('mso', 'description')" />
							</template>
						</template>

						<template #title="{ name }">
							<span v-if="name.indexOf(searchValue) > -1">
								{{ name.substring(0, name.indexOf(searchValue)) }}
								<span class="text-error">{{ searchValue }}</span>
								{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
							</span>
							<span v-else>{{ name }}</span>
						</template>
					</a-tree>
				</a-spin>
			</a-col>
		</a-row>
	</a-modal>
</template>
