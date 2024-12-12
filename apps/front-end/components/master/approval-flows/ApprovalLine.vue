<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response, RequestParams } from "@/types"
import type { ApprovalLines } from "@/types/master/approval-flows"

const params = ref<RequestParams<any>>({
	pageNumber: 1,
	size: 10,
	first: true,
	last: true,
	params: {},
})
const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const appStore = useAppsStore()
const { loading } = storeToRefs(appStore)
const { organizationChart } = useCompany()

const searchValue = ref<string>("")
let oldValue = "" // 초기 oldValue
const treeDataCopy = ref<any[]>([])

const selectedKeys = ref<(string | number)[]>([])
// const expandedKeys = ref<(string | number)[]>([]);
// const autoExpandParent = ref<boolean>(true);
// const loadKeys = ref<(string | number)[]>([]);
const selectedNode = ref<any>(undefined)
const selectedTableRowKeys = ref<(string | number)[]>([])
const selectedTableRows = ref<any[]>([])
const approvalId = ref<string | number>()
const showModal = ref<boolean>(false)
const userDetailData = ref<any>(undefined)

const dataTable = ref<any>()

/**
 * 조직도 API 호출
 */
const {
	data: treeData,
	status,
	refresh,
} = await organizationChart({
	companyCode: getCompanyCode.value,
	used: true,
})

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

const onSelect = async (
	keys: any,
	info: {
		event: "select"
		selected: boolean
		node: any
		selectedNodes: any[]
		nativeEvent: MouseEvent
	}
) => {
	if (keys && keys.length > 0) {
		selectedNode.value = keys
		selectedNode.value = info.node.dataRef
		dataTable.value = await getApprovalLines(info.node.dataRef.id)
	} else {
		selectedKeys.value = []
		selectedNode.value = {}
		dataTable.value = []
	}
}

const onDelete = (data: any) => {
	const employeeId = data.employeeId
	const ids = data.filter((id: string | number) => id).map((approval: any) => approval.id)

	let num: number = 1
	ids.forEach(async (id: number) => {
		await useCFetch<Response<any>>(`/api/v2/master/approvalLines/${id}`, {
			method: "DELETE",
			body: { id },
		})
			.then((res: Response<any>) => {
				if (res.status === 0) num = num + 1
			})
			.then(() => {
				if (num === ids.length) {
					message.success(`${num}개의 결재선이 삭제 되었습니다.`)
					selectedTableRowKeys.value = []
					selectedTableRows.value = []
					approvalRefresh(employeeId)
				}
			})
	})
}

const onShowModal = async (record: any) => {
	await refresh()
	if (record) {
		//결재선 상세 조회 id 값 세팅
		if (record) {
			userDetailData.value = await getApprovalLinesDetail(record.id)
		}
		approvalId.value = record.id
	}
	showModal.value = true
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	params.value.pageNumber = pagination.current
	params.value.size = pagination.pageSize
}

/**
 * 결재선 정보 목록 조회 API 호출
 * @param id
 */
const getApprovalLines = async (id: string | number) => {
	return await useCFetch<Response<any>>(`/api/v2/master/approvalLines`, {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			employeeId: id,
		},
	}).then((res: Response<any>) => res.data || [])
}

/**
 * 결재선 정보 상세 조회 API 호출
 * @param id
 */
const getApprovalLinesDetail = async (id: number) => {
	return await useCFetch<Response<ApprovalLines>>(`/api/v2/master/approvalLines/${id}`, {
		method: "GET",
		params: {
			id,
		},
	}).then((res: Response<ApprovalLines>) => res.data || undefined)
}

const approvalRefresh = async (id?: string | number) => {
	dataTable.value = []
	if (id) {
		dataTable.value = await getApprovalLines(id)
	}
}

const rowSelection = ref({
	// selectedRowKeys: selectedTableRowKeys,
	onChange: (keys: (string | number)[], selectedRows: Array<any>) => {
		selectedTableRowKeys.value = keys
		selectedTableRows.value = selectedRows
	},
})

onBeforeMount(() => {
	treeDataCopy.value = treeData.value || []
})
</script>
<template>
	<a-row :gutter="[15, 15]" :wrap="false">
		<a-col flex="32rem">
			<a-spin :spinning="status === 'pending'">
				<a-input-search
					class="mb-sm"
					v-model:value="searchValue"
					placeholder="검색"
					@input="onQueryChanged(searchValue)"
				/>
				<a-tree
					lazy
					block-node
					v-model:selectedKeys="selectedKeys"
					:default-expand-all="true"
					:tree-data="treeDataCopy"
					:show-icon="true"
					@select="onSelect"
				>
					<template #icon="{ dataRef }">
						<template v-if="dataRef.depth === 1">
							<component :is="materialIcons('mso', 'domain')" class="text-warning" />
						</template>
						<template v-else-if="dataRef.depth !== 1 && dataRef.code">
							<component :is="materialIcons('mso', 'tenancy')" class="text-warning" />
						</template>
						<template v-else>
							<component :is="materialIcons('mso', 'person')" />
						</template>
					</template>
					<template #title="{ title }">
						<span v-if="title?.indexOf(searchValue) > -1">
							{{ title.substring(0, title.indexOf(searchValue)) }}
							<span class="text-error">{{ searchValue }}</span>
							{{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
						</span>
						<span v-else>{{ title }}</span>
					</template>
					<template #switcherIcon="{ dataRef, defaultIcon }">
						<span v-if="dataRef.employeeNumber"> </span>
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
					저장된 결재선
					{{ selectedNode?.name ? "[" + selectedNode?.name + "]" : "" }}
				</a-typography-title>
				<a-space :size="5">
					<eacc-button
						component-is="delete"
						:data="selectedTableRows"
						:modal-open="true"
						:disabled="selectedTableRowKeys.length === 0"
						@click="onDelete"
					/>
					<a-button
						:icon="materialIcons('mso', 'add_circle')"
						type="primary"
						@click="onShowModal(undefined)"
						:disabled="selectedNode === undefined"
					>
						결재선 추가
					</a-button>
				</a-space>
			</a-flex>
			<a-table
				size="small"
				:row-key="(record) => record.id"
				:loading="loading"
				:row-selection="rowSelection"
				:columns="[
					{
						title: '결재선명',
						dataIndex: 'approvalLineName',
						key: 'approvalLineName',
						width: -1,
					},
					{
						title: '결재선',
						dataIndex: 'approvalLineDetailsText',
						key: 'approvalLineDetailsText',
						width: -1,
					},
					{
						title: '참조',
						dataIndex: 'approvalLineReferrerDtos',
						key: 'approvalLineReferrerDtos',
						width: -1,
					},
					{ title: '사용여부', dataIndex: 'used', key: 'used', width: -1 },
				]"
				:data-source="dataTable"
				:pagination="false"
				@change="cellChange"
			>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'approvalLineName'">
						<a-typography-link @click="onShowModal(record)">
							{{ text }}
						</a-typography-link>
						<a-tag v-if="record.mainApprovalLineFlag" class="ml-xs" color="green">
							대표결재선
						</a-tag>
					</template>
					<template v-if="column.dataIndex === 'approvalLineDetailsText'">
						<approval-lines
							:data="record.approvalLineDetails"
							:type="record.agreementOptionTypeName"
							:label="true"
							:status="false"
						/>
					</template>
					<template v-if="column.dataIndex === 'approvalLineReferrerDtos'">
						<span
							v-if="
								record.approvalLineReferrerDtos &&
								record.approvalLineReferrerDtos.length > 2
							"
						>
							{{ record.approvalLineReferrerDtos[0].referEmployeeName }},
							{{ record.approvalLineReferrerDtos[1].referEmployeeName }} 외
							{{ record.approvalLineReferrerDtos.length - 2 }}명
						</span>
						<span v-else>
							{{
								record.approvalLineReferrerDtos
									.map((x: any) => x.referEmployeeName)
									.join(", ")
							}}
						</span>
					</template>
					<template v-if="column.dataIndex === 'used'">
						<a-badge
							:color="text ? 'green' : 'magenta'"
							:text="text ? '사용중' : '미사용'"
						/>
					</template>
				</template>
			</a-table>
		</a-col>
	</a-row>

	<PaymentLineAddModal
		:show="showModal"
		:user="selectedNode"
		:approval-id="approvalId"
		:tree-data="treeData || []"
		:user-detail="userDetailData"
		@update:show="
			(value) => {
				showModal = value
				approvalId = undefined
				userDetailData = undefined
			}
		"
		@refresh="() => approvalRefresh()"
	/>
</template>
