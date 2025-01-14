<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Response } from "@/types"
import { ApprovalRules } from "@/types/master/approval-flows"

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const { organizationChart } = useCompany()

/**
 * 조직도 API 호출
 */
const { data: treeData, refresh: treeRefresh } = await organizationChart({
	companyCode: getCompanyCode.value,
	used: true,
})

const columns = ref<ColumnsType<any>>([
	{
		title: "결재선명",
		dataIndex: "approvalLineName",
		key: "approvalLineName",
		width: -1,
	},
	{
		title: "결재선",
		dataIndex: "approvalLineDetailsText",
		key: "approvalLineDetailsText",
		width: -1,
	},
	{
		title: "참조",
		dataIndex: "approvalLineReferrerDtos",
		key: "approvalLineReferrerDtos",
		width: -1,
	},
	{ title: "사용여부", dataIndex: "used", key: "used", width: -1 },
])

const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const approvalId = ref<string | number>()
const showModal = ref<boolean>(false)
const userDetailData = ref<any>(undefined)
const myInfo = ref<any>(undefined)

const {
	data,
	status,
	refresh: tableRefresh,
} = await useAsyncData("persons-approval-lines", () =>
	useIFetch<Response<Array<any>>>(`/api/v2/persons/approvalLines`, {
		method: "GET",
		lazy: false,
		params: {
			employeeId: getEmployeeId.value,
			companyCode: getCompanyCode.value,
		},
	})
		.then((res: any) => res.data.value)
		.then((res: Response<Array<any>>) => res.data)
)

/**
 * 결재선 정보 상세 조회 API 호출
 * @param id
 */
const getApprovalLinesDetail = async (id: number) => {
	return await useCFetch<Response<ApprovalRules>>(`/api/v2/masters/approvalLines/${id}`, {
		method: "GET",
		params: {
			id,
		},
	}).then((res: Response<ApprovalRules>) => res.data || undefined)
}

const myEmployeesInfo = async () => {
	return await useCFetch<Response<any>>(
		`/api/v2/settings/employees/${getEmployeeId.value}`,
		{
			method: "GET",
			params: {
				id: getEmployeeId.value,
			},
		}
	).then((res: Response<any>) => res.data)
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const onDelete = (data: any) => {
	console.log("onDelete", data)
	const employeeId = data.employeeId
	const ids = data.filter((id: string | number) => id).map((approval: any) => approval.id)
	for (const id of ids) {
		useCFetch<Response<any>>(`/api/v2/persons/approvalLines/${id}`, {
			method: "DELETE",
			body: { id },
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				// selectedRowKeys.value = [];
				// selectedRows.value = [];
			}
		})
	}
}
const onShowModal = async (id?: number) => {
	await treeRefresh()
	myInfo.value = await myEmployeesInfo()
	if (id) {
		approvalId.value = id
		userDetailData.value = await getApprovalLinesDetail(id)
	}

	showModal.value = true
}
</script>
<template>
	<a-flex gap="small" justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="page-title">
			개인결재선 설정
		</a-typography-title>
		<a-space :size="5">
			<eacc-button
				component-is="delete"
				:data="selectedRows"
				:modal-open="true"
				:disabled="selectedRowKeys.length === 0"
				@click="onDelete"
			/>
			<a-button
				type="primary"
				:icon="materialIcons('mso', 'add_circle')"
				@click="onShowModal()"
			>
				결재선 추가
			</a-button>
		</a-space>
	</a-flex>
	<a-table
		size="small"
		:loading="status === 'pending'"
		:columns="columns"
		:data-source="data || []"
		:pagination="false"
		:show-sorter-tooltip="false"
		:row-key="(record) => record.id"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: (keys, rows) => {
				selectedRowKeys = keys
				selectedRows = rows
			},
		}"
		@resize-column="handleResizeColumn"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'approvalLineName'">
				<a-typography-link @click="onShowModal(record.id)">
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
						record.approvalLineReferrerDtos && record.approvalLineReferrerDtos.length > 2
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
				<a-badge :color="text ? 'green' : 'magenta'" :text="text ? '사용중' : '미사용'" />
			</template>
		</template>
	</a-table>

	<PaymentLineAddModal
		:show="showModal"
		:user="myInfo"
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
		@refresh="() => tableRefresh()"
	/>
</template>
