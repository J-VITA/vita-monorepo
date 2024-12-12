<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { type FormProps, Form } from "ant-design-vue"
import type { Response } from "@/types"
import type { CostItem, CostParams, TreeItem } from "@/types/master/cctr"
import type { TreeProps } from "ant-design-vue/es/tree"

const authStore = useAuthStore()
const { getCompanyId, getCompanyCode, getRole, getWorkplaceCode, getWorkplaceId } =
	storeToRefs(authStore)

const useForm = Form.useForm
const props = withDefaults(
	defineProps<{
		tree: TreeItem[]
		node: CostItem | undefined
		employees: number
		pending: boolean
	}>(),
	{}
)

const emit = defineEmits<{
	(e: "selected", value: any): void
	(e: "refresh"): void
}>()

const treeData = ref<TreeItem[]>()

const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue

const expandedKeys = ref<(string | number)[]>([])
const autoExpandParent = ref<boolean>(true)
const selectedKeys = ref<(string | number)[]>([])
const showModal = ref<boolean>(false)
const modelRef = ref<CostParams>({
	companyId: getCompanyId.value,
	companyCode: getCompanyCode.value,
	orderSeq: 1,
	depth: 1,
	used: true,
	id: undefined,
	name: "",
	code: "",
	description: "",
	parentId: undefined,
	workplaceId: undefined,
	workplaceCode: undefined,
})
// Record<string, Rule[]>
const rulesRef = ref<any>({
	companyCode: [
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
	code: [
		{
			required: true,
			message: "필수입력입니다.",
			trigger: "change",
		},
	],
})
const { resetFields, validate, validateInfos } = useForm(modelRef, rulesRef)

/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = async (query: string) => {
	if (query != oldValue) {
		treeData.value = props.tree
		treeData.value = filterTreeData(treeData.value, query)
	}

	if (!query) {
		treeData.value = props.tree
	}
	oldValue = query
}

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key

	autoExpandParent.value = false
}

const onSelect = (keys: (string | number)[], id: number) => {
	selectedKeys.value = keys
	emit("selected", id)
}

const onDelete = (data: CostItem) => {
	if (props.employees === 0) {
		useCFetch<Response<any>>(`/api/v2/master/costCenters/${data.id}`, {
			method: "DELETE",
			params: { id: data.id },
			body: data,
		}).then((res: Response<any>) => {
			if (res.status === 0) emit("refresh")
			message.success(res.message)
			onSelect([props.tree[0].code!], props.tree[0].id!)
		})
	} else {
		message.error("사용자가 등록되어 있으면 코스트센터를 삭제할 수 없습니다.")
	}
}

const onShowModal = (method: "POST" | "PATCH") => {
	showModal.value = true
	modelRef.value.method = method
	modelRef.value.companyCode = props.node?.companyCode
	if (method === "PATCH") {
		modelRef.value.workplaceId = props.node?.workplaceId
		modelRef.value.workplaceCode = props.node?.workplaceCode
		modelRef.value.id = props.node?.id
		modelRef.value.description = props.node?.description
		modelRef.value.name = props.node?.name
		modelRef.value.code = props.node?.code
		modelRef.value.parentId = props.node?.parentId
	} else {
		modelRef.value.workplaceId = props.node?.workplaceId
			? props.node.workplaceId
			: props.node?.id
		modelRef.value.depth = Number(props.node?.depth) + 1
		modelRef.value.parentId = props.node?.id
	}
}

const onSubmit = (data: CostParams) => {
	validate()
		.then(async () => {
			const send = Object.assign({}, data)
			delete send.method

			const url =
				data.method === "PATCH"
					? `/api/v2/master/costCenters/${data.id}`
					: "/api/v2/master/costCenters"
			await useCFetch<Response<any>>(url, {
				method: data.method,
				body: send,
			}).then((res: Response<any>) => {
				if (res.status === 0) {
					emit("refresh")
					onSelect([res.data.code], res.data.id)
					showModal.value = false
				}
				resetFields()
				message.success(res.message)
			})
		})
		.catch((err) => {
			console.log("error", err)
		})
}

watch(props, () => {
	treeData.value = props.tree
})

onBeforeMount(() => {
	if (props.tree && props.tree.length > 0) {
		treeData.value = props.tree
		expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "code").map(
			(x: any) => x.code
		)
	}

	if (props.tree && selectedKeys.value.length === 0) {
		onSelect([props.tree[0].code!], props.tree[0].id!)
	}
})
</script>
<template>
	<a-flex gap="small" justify="flex-end" align="center" class="mb-md" wrap="wrap">
		<eacc-button
			component-is="delete"
			:data="props.node"
			:modal-open="true"
			:disabled="selectedKeys.length === 0"
			@click="onDelete"
		/>
		<a-button
			:disabled="selectedKeys.length === 0"
			:icon="materialIcons('mso', 'edit')"
			@click="onShowModal('PATCH')"
		>
			수정
		</a-button>
		<a-button
			type="primary"
			:icon="materialIcons('mso', 'add_circle')"
			@click="onShowModal('POST')"
		>
			코스트센터 추가
		</a-button>
	</a-flex>
	<a-spin :spinning="pending">
		<a-input-search
			class="mb-sm"
			v-model:value="searchValue"
			placeholder="검색"
			@input="onQueryChanged(searchValue)"
		/>

		<a-tree
			class="tree-limit"
			block-node
			v-model:selectedKeys="selectedKeys"
			:show-icon="true"
			:tree-data="treeData"
			v-model:expanded-keys="expandedKeys"
			:auto-expand-parent="autoExpandParent"
			:default-expand-all="true"
			:field-names="{
				children: 'children',
				title: 'name',
				key: 'code',
			}"
			@select="(keys, info) => onSelect(keys, info.node.dataRef?.id)"
			@expand="onExpand"
		>
			<template #icon="{ dataRef }">
				<template v-if="!dataRef.parentId">
					<component :is="materialIcons('mso', 'domain')" class="text-warning" />
				</template>

				<template v-else>
					<component :is="materialIcons('mso', 'database')" class="text-warning" />
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
	<field-modal
		title="코스트센터 추가"
		ok-text="저장"
		cancel-text="취소"
		:field="modelRef"
		:showed="showModal"
		@closed="[(showModal = false), resetFields()]"
		@submit="(data: CostItem) => onSubmit(data)"
	>
		<template #content="{ field }">
			<a-form
				label-align="left"
				:colon="false"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
			>
				<a-form-item
					label="회사"
					name="companyCode"
					v-bind="validateInfos.companyCode"
					has-feedback
				>
					<eacc-select
						:url="`/api/v2/settings/companies${getRole === 'ROOT' ? '' : '?code=' + getCompanyCode}`"
						:on-all-field="false"
						v-model:value="field.companyCode"
						:field-names="{ label: 'name', value: 'code' }"
						value-type="any"
						:refresh="true"
						@update:any-value="
							(value: any) => {
								field.companyCode = value.code
								field.companyId = value.id
							}
						"
						:disabled="field.method === 'PATCH' || getRole !== 'ROOT'"
					>
					</eacc-select>
				</a-form-item>
				<a-form-item label="상위 코스트센터">
					<eacc-select
						:url="`/api/v2/masters/commons/costCenters?companyCode=${field.companyCode}&parentId=${field.companyId}`"
						v-model:value="field.parentId"
						:field-names="{ label: 'workplaceName', value: 'id' }"
						:on-all-field="false"
						:disabled="field.method === 'PATCH'"
						refresh
						first
					/>
				</a-form-item>
				<a-form-item label="코스트센터명" v-bind="validateInfos.name">
					<a-input v-model:value="field.name" />
				</a-form-item>
				<a-form-item label="코스트센터 설명">
					<a-input v-model:value="field.description" />
				</a-form-item>
				<a-form-item label="코스트센터 코드" v-bind="validateInfos.code">
					<a-input v-model:value="field.code" :disabled="field.method === 'PATCH'" />
				</a-form-item>
				<a-form-item label="사업장명">
					<eacc-select
						url="/api/v2/masters/commons/companies"
						:params="{
							code: field.companyCode,
							parentId: field.companyId,
							placeType: 'WORKPLACE',
						}"
						:on-all-field="false"
						v-model:value="field.workplaceCode"
						refresh
						:field-names="{ label: 'name', value: 'workplaceCode' }"
						value-type="any"
						@update:any-value="
							(value: any) => {
								field.workplaceId = value.id
								field.workplaceCode = value.workplaceCode
							}
						"
					>
					</eacc-select>
				</a-form-item>
			</a-form>
		</template>
	</field-modal>
</template>
