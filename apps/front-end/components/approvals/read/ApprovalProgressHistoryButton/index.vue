<script setup lang="ts">
import { materialIcons } from "~/composables/icons"
import { pageSize, type RequestParams, type Response } from "@/types"
import type { FormData } from "@/types/approvals/document"
import type { ColumnsType } from "ant-design-vue/lib/table/interface"

type Data = {
	id: number
	companyCode: string
	approvalNumber: string
	stage: number
	approvalStatusName: string
	approvalStatusLabel: string
	approvalTypeName: string
	approvalTypeLabel: string
	approvalEmployeeId: number
	approvalEmployeeName: string
	approvalEmployeeDepartmentCode: string
	approvalEmployeeDepartmentName: string
	approvalEmployeePositionCode: string
	approvalEmployeePositionName: string
	actualEmployeeId: number
	actualEmployeeName: string
	actualEmployeePositionCode: string
	actualEmployeePositionName: string
	approvalDate: string
}

type Props = {
	data: FormData
}

/**
 * 결재 이력 상세
 */
const { data: documentData } = defineProps<Props>()

const emit = defineEmits<{
	(e: "callback", value: any): void
}>()

const open = ref<boolean>(false)
const loading = ref<boolean>(false)

const params = ref<RequestParams<any>>({
	pageNumber: 0,
	size: pageSize,
	first: true,
	last: true,
	params: {},
})

const columns = ref<ColumnsType<Data>>([
	{
		title: "결재방법",
		dataIndex: "approvalTypeLabel",
		align: "center",
	},
	{
		title: "부서",
		dataIndex: "approvalEmployeeDepartmentName",
		align: "center",
	},
	{
		title: "직위",
		dataIndex: "approvalEmployeePositionName",
		align: "center",
	},
	{
		title: "결재자",
		dataIndex: "approvalEmployeeName",
		align: "center",
	},
	{
		title: "상태",
		dataIndex: "approvalStatusLabel",
		align: "center",
		customRender: (opt) => {
			return opt.record.approvalStatusName === "DELEGATED"
				? `${opt.record.approvalTypeLabel}(${opt.text})`
				: opt.text
		},
	},
	{
		title: "결재시간",
		dataIndex: "approvalDate",
		align: "center",
	},
	{
		title: "대결자",
		dataIndex: "actualEmployeeName",
		align: "center",
		customRender: (opt) => {
			return opt.record.approvalStatusName === "DELEGATED" ? opt.text : undefined
		},
	},
])

const cellChange = (pagination: any) => {
	params.value.pageNumber = pagination.current - 1
}

const dataSource = ref<Data[]>([])

const onClose = () => {
	open.value = false
}

watch(open, async (val) => {
	if (val) {
		loading.value = true
		await useCFetch<Response<Response<Data[]>>>(
			`/api/v2/approvals/${documentData.id}/history`,
			{
				method: "GET",
			}
		).then((res: any) => {
			dataSource.value = res.data
			loading.value = false
		})
	}
})
</script>
<template>
	<a-button :icon="materialIcons('mso', 'search')" @click="open = true">
		결재 이력 상세
	</a-button>

	<a-modal
		centered
		width="80rem"
		v-model:open="open"
		title="결재 진행 상세"
		:destroy-on-close="true"
	>
		<a-table
			size="small"
			:loading="loading"
			:columns="columns"
			:data-source="dataSource"
			:row-key="(record) => record.id"
			:pagination="false"
			@change="cellChange"
		>
			<template #headerCell="{ title }">
				<div class="text-center">{{ title }}</div>
			</template>
		</a-table>
		<template #footer>
			<a-button @click="onClose">닫기</a-button>
		</template>
	</a-modal>
</template>
