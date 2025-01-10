<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { TreeProps, FormInstance } from "ant-design-vue"
import type { AccountRoleDetail, AccountRoleForm } from "@/types/master/accounts"

const { show, data: roleDetailData } = defineProps<{
	show: boolean
	data?: AccountRoleDetail
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): boolean
	(e: "callback"): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
		emit("callback")
		loading.value = false
	},
})
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const formRef = useTemplateRef<FormInstance>("formRef")
const loading = ref<boolean>(false)
const searchValue = ref<string>("")
const copyTreeData = ref<any[]>([])

const checkedKeys = ref<number[]>([])
const expandedKeys = ref<(string | number)[]>([])
const autoExpandParent = ref<boolean>(true)

const modelRef = ref<AccountRoleForm>({
	companyCode: getCompanyCode.value,
	code: "",
	name: "",
	description: "",
	used: true,
	accountIds: [],
	costCenterIds: [],
	employeeIds: [],
})

const {
	data: treeData,
	status,
	refresh,
} = await useAsyncData(`accounts-tree-list`, () =>
	useCFetch<Response<any>>("/api/v2/masters/accounts", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
		},
	}).then((res: Response<any>) => {
		copyTreeData.value = res.data
		return res.data
	})
)

const onFetch = async (
	method: "PATCH" | "POST",
	id?: string | number,
	data?: AccountRoleForm
) => {
	const url = id ? `/api/v2/masters/accountRoles/${id}` : "/api/v2/masters/accountRoles"

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
 * 트리 필터링 New (keyup 이벤트)
 * @param e Keyboard Event
 */
const onQueryChanged = (e: any) => {
	e.preventDefault()

	const getMatchingKeysInList = (flatTree: any[]) => {
		const ids = modelRef.value.accountIds?.filter((account) => !account.halfChecked)
		return ids
			?.filter((x) => flatTree.some((e) => e.id === x.id)) // ids의 id가 flatTree에 있는지 확인
			.map((x) => x.id) // 일치하는 id만 반환
	}

	searchValue.value = e.target.value
	if ((isHangulComplete(e.target.value) && e.isComposing) || isNumeric(e.target.value)) {
		copyTreeData.value = filterTreeData(treeData.value, e.target.value)
	}
	if (e.target.value === "") {
		copyTreeData.value = treeData.value
	}

	// 검색되는 트리 리스트에 따라 체크키 변동
	checkedKeys.value =
		getMatchingKeysInList(transformTreeToFlatArray(copyTreeData.value)) || []
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	autoExpandParent.value = false
}

const onCheck: TreeProps["onCheck"] = (keys, info) => {
	let checkList: any[] = []

	Array.from(keys as []).map((x) => checkList.push({ id: x, halfChecked: false }))

	Array.from(info.halfCheckedKeys as []).map((x) =>
		checkList.push({ id: x, halfChecked: true })
	)

	modelRef.value.accountIds = checkList
}

const onSubmit = () => {
	formRef.value
		?.validate()
		.then((res) => {
			loading.value = true
			console.log("res", res)
			console.log("modelRef.value", modelRef.value)

			const send = Object.assign({}, modelRef.value, {
				employeeIds: modelRef.value.employeeIds?.map((x) => ({ id: x })),
				costCenterIds: modelRef.value.costCenterIds?.map((x) => ({ id: x })),
			})

			if (roleDetailData) {
				onFetch("PATCH", roleDetailData.id, send)
			} else {
				onFetch("POST", undefined, send)
			}
		})
		.catch((err) => console.error(err))
}

watch(
	() => show,
	(value) => {
		if (value) {
			formRef.value?.resetFields()
			searchValue.value = ""
			refresh()
			if (treeData.value) {
				expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "id").map(
					(x: any) => x.id
				)
			}
			if (roleDetailData) {
				modelRef.value = {
					...roleDetailData,
					accountIds: roleDetailData.accountList.map((e: any) => {
						return { id: e.accountId, halfChecked: e.halfChecked }
					}),
					costCenterIds: roleDetailData.accountCostCenters?.map(
						(item) => item.costCenterId
					),
					employeeIds: roleDetailData.accountEmployees?.map(
						(item: any) => item.employeeId
					),
				}

				checkedKeys.value = roleDetailData.accountList
					.filter((x) => !x.halfChecked)
					.map((x) => x.accountId)
			}
		}
	}
)
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
		@ok="onSubmit"
	>
		<a-row :gutter="[15, 15]">
			<a-col flex="1">
				<a-form
					ref="formRef"
					label-align="left"
					:model="modelRef"
					:colon="false"
					:label-col="{ span: 6 }"
					:wrapper-col="{ span: 18 }"
				>
					<a-form-item
						label="권한명"
						name="name"
						:rules="[{ required: true, message: '필수값 입니다.' }]"
					>
						<a-input v-model:value="modelRef.name" />
					</a-form-item>
					<a-form-item
						label="권한코드"
						name="code"
						:rules="[
							{ required: roleDetailData ? false : true, message: '필수값 입니다.' },
						]"
					>
						<a-input v-model:value="modelRef.code" :disabled="data !== undefined" />
					</a-form-item>
					<a-form-item label="권한설명" name="description">
						<a-input v-model:value="modelRef.description" />
					</a-form-item>
					<a-form-item label="사용여부" name="used">
						<a-switch size="small" v-model:checked="modelRef.used" />
					</a-form-item>
					<a-form-item label="코스트센터" name="costCenterIds">
						<eacc-select-multi-table
							key-props="id"
							label-prop="workplaceName"
							url="/api/v2/settings/commons/costCenters"
							v-model:value="modelRef.costCenterIds"
							:columns="[
								{
									title: '코스트센터',
									data: (row: any) => row.workplaceName,
								},
							]"
							@update:value="(value) => (modelRef.costCenterIds = value)"
						/>
					</a-form-item>
					<a-form-item name="employeeIds">
						<template #label>
							<a-space :size="3">
								<a-typography-text>기타 사용자</a-typography-text>
								<a-popover placement="bottom">
									<template #content>
										<p>특별한 사용자가 아니라면, 인사 이동시 사용이 용이하도록</p>
										<p>코스트센터를 등록하는걸 권장합니다.</p>
									</template>
									<component :is="materialIcons('mso', 'help')" class="popover-help" />
								</a-popover>
							</a-space>
						</template>
						<eacc-select-multi-table
							url="/api/v2/masters/commons/employees"
							v-model:value="modelRef.employeeIds"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name, width: '10rem' },
								{ title: '직위', data: (row: any) => row.jobName },
								{ title: '부서', data: (row: any) => row.departmentName },
								{ title: '회사', data: (row: any) => row.companyName },
							]"
							@update:value="(value) => (modelRef.employeeIds = value)"
						/>
					</a-form-item>
				</a-form>
			</a-col>
			<a-col flex="1rem">
				<a-divider type="vertical" class="full-height mx-none" />
			</a-col>
			<a-col flex="1">
				<a-spin :spinning="status === 'pending'">
					<a-input-search
						class="mb-sm"
						v-model:value="searchValue"
						placeholder="검색"
						@keyup="onQueryChanged"
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
						:tree-data="copyTreeData"
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

						<!-- <template #title="{ name }">
							<span v-if="name.indexOf(searchValue) > -1">
								{{ name.substring(0, name.indexOf(searchValue)) }}
								<span class="text-error">{{ searchValue }}</span>
								{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
							</span>
							<span v-else>{{ name }}</span>
						</template> -->
						<template #title="{ dataRef }">
							<span
								v-if="
									dataRef.name.indexOf(searchValue) > -1 ||
									dataRef.code.toString().indexOf(searchValue) > -1
								"
							>
								<span
									v-if="
										dataRef.name.includes(searchValue) ||
										dataRef.code.toString().includes(searchValue)
									"
								>
									{{
										`${dataRef.name}(${dataRef.code})`.substring(
											0,
											`${dataRef.name}(${dataRef.code})`.indexOf(searchValue)
										)
									}}
								</span>
								<span class="text-error">{{ searchValue }}</span>
								{{
									`${dataRef.name}(${dataRef.code})`.substring(
										`${dataRef.name}(${dataRef.code})`.indexOf(searchValue) +
											searchValue.length
									)
								}}
							</span>
							<span v-else>{{ dataRef.name }} ({{ dataRef.code }})</span>
						</template>
					</a-tree>
				</a-spin>
			</a-col>
		</a-row>
	</a-modal>
</template>
