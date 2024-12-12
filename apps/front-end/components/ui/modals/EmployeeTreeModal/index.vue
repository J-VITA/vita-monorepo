<script lang="ts" setup>
import type { TreeProps } from "ant-design-vue/es/tree"
import { pagination, RequestParams } from "@/types"

const router = useRouter()
const open = defineModel<boolean>("open")

const { title } = defineProps<{
	title: string
}>()

const emit = defineEmits<{
	(e: "update:open", value: boolean): boolean
	(e: "refresh", value: boolean): boolean
}>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const selectedKeys = ref<(string | number)[]>([])
const expandedKeys = ref<(string | number)[]>([])
const autoExpandParent = ref<boolean>(true)
const loadKeys = ref<(string | number)[]>([])
// const selectedNode = ref<any>(undefined);

// const dataTable = ref<any>([]) as any;
const selectedTableRowKeys = ref<(string | number)[]>([])
const selectedTableRows = ref<any[]>([])

const treeData = ref()
const treeDataCopy = ref()

const searchParams = ref<any>({
	id: undefined,
	companyCode: getCompanyCode.value,
	used: true,
})
const params = ref<RequestParams<any>>({
	pageNumber: 1,
	size: 10,
	first: true,
	last: true,
	params: {},
})

const columns = [
	{ title: "이름", dataIndex: "name", key: "name", width: 120 },
	{
		title: "부서",
		dataIndex: "departmentName",
		key: "departmentName",
		width: 120,
	},
	{ title: "직위", dataIndex: "positionName", key: "positionName", width: 120 },
	{ title: "직책", dataIndex: "titleName", key: "titleName", width: 120 },
	{ title: "이메일", dataIndex: "email", key: "email", width: 160 },
	{ title: "연락처", dataIndex: "phoneNumber", key: "phoneNumber", width: 140 },
]

const {
	treeList,
	selectedNode,
	dataTable,
	onSelect,
	cellChange,
	loading: employeeLoading,
} = useEmployeeTree()

const {
	data: employeeTreeData,
	error,
	status,
	execute,
	refresh,
} = await treeList(searchParams)

const loading = computed(() => (status.value === "pending" ? true : false))

const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue
/**
 * 트리 필터링 (input 이벤트)
 * @param query
 */
const onQueryChanged = (query: string) => {
	if (query != oldValue) {
		treeData.value = treeDataCopy.value
		treeData.value = filterTreeData(treeDataCopy.value, query)
	}
	if (!query) {
		treeData.value = treeDataCopy.value
	}
	oldValue = query
}

const rowSelection = ref({
	// selectedRowKeys: selectedTableRowKeys,
	onChange: (keys: (string | number)[], selectedRows: Array<any>) => {
		selectedTableRowKeys.value = keys
		selectedTableRows.value = selectedRows
	},
})

const onExpand: TreeProps["onExpand"] = async (key, info: any) => {
	expandedKeys.value = key
	// Load data when a node is expanded
	if (!info.node.dataRef.children || info.node.dataRef.children.length === 0) {
		// await onLoadData(info.node);
	}

	autoExpandParent.value = false
}

onMounted(() => {
	treeData.value = employeeTreeData.value
	treeDataCopy.value = employeeTreeData.value
	if (treeData.value && treeData.value.length > 0) {
		expandedKeys.value = transformTreeToFlatArray(treeData.value as any, "key").map(
			(x: any) => x.key
		)
	}
})

/**
 * 모달이 닫혀있을 때는 라우트 변경에 반응하지 않고, 모달이 열려있을 때만 라우트 변경을 감지하여 모달을 닫음.
 */
const previousRoute = ref(router.currentRoute.value.fullPath)
watch(
	() => router.currentRoute.value.fullPath,
	(newPath) => {
		if (open.value && newPath !== previousRoute.value) {
			open.value = false
		}
		previousRoute.value = newPath
	}
)
</script>

<template>
	<a-modal
		width="auto"
		centered
		v-model:open="open"
		:title="title"
		:confirmLoading="loading"
		:destroy-on-close="true"
		:mask-closable="true"
	>
		<a-row :gutter="[15, 15]" :wrap="false">
			<a-col flex="32rem">
				<a-spin :spinning="loading">
					<a-input-search
						class="mb-sm"
						v-model:value="searchValue"
						placeholder="검색"
						@input="onQueryChanged(searchValue)"
					/>
					<a-tree
						block-node
						virtual
						lazy
						v-model:selectedKeys="selectedKeys"
						v-model:expanded-keys="expandedKeys"
						:loaded-keys="loadKeys"
						:default-expand-all="true"
						:auto-expand-parent="true"
						:tree-data="treeData"
						:show-icon="true"
						:field-names="{
							children: 'children',
							title: 'name',
							key: 'key',
						}"
						@select="onSelect"
						@expand="onExpand"
					>
						<template #icon="{ dataRef }">
							<template v-if="dataRef.type === 'c'">
								<component :is="materialIcons('mso', 'domain')" class="text-warning" />
							</template>
							<template v-else-if="dataRef.type === 'd'">
								<component :is="materialIcons('mso', 'tenancy')" class="text-warning" />
							</template>
							<template v-else>
								<component :is="materialIcons('mso', 'person')" />
							</template>
						</template>

						<template #title="{ name }">
							<span v-if="name?.indexOf(searchValue) > -1">
								{{ name.substring(0, name.indexOf(searchValue)) }}
								<span class="text-error">{{ searchValue }}</span>
								{{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
							</span>
							<span v-else>{{ name }}</span>
						</template>
						<template #switcherIcon="{ dataRef, defaultIcon }">
							<span v-if="dataRef.type === 'u'"> </span>
							<component :is="defaultIcon" v-else />
						</template>
					</a-tree>
				</a-spin>
			</a-col>
			<a-col flex="5rem" style="text-align: center">
				<a-divider type="vertical" class="full-height mx-none" />
			</a-col>
			<a-col flex="auto">
				<a-flex
					gap="small"
					justify="space-between"
					align="center"
					class="mb-md"
					wrap="wrap"
				>
					<a-typography-title :level="4" class="page-title">
						{{ selectedNode?.name ? "[" + selectedNode?.name + "]" : "" }}
					</a-typography-title>
				</a-flex>
				<a-table
					size="small"
					:row-key="(record: any) => record.id"
					:loading="employeeLoading"
					:row-selection="rowSelection"
					:columns="columns"
					:data-source="dataTable"
					:pagination="
						Object.assign({}, pagination, {
							total: dataTable.length || 0,
						})
					"
				>
					<!-- @change="cellChange" -->
				</a-table>
			</a-col>
		</a-row>
		<template #footer>
			<a-flex align="center" justify="center">
				<a-button @click="open = !open">닫기</a-button>
			</a-flex>
		</template>
	</a-modal>
</template>
