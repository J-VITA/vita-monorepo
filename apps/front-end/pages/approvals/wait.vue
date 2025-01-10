<script setup lang="ts">
import type { Dayjs } from "dayjs"
import {
	type Response,
	pageSizeOptions,
	pagination,
	generateSortParams,
	dateTimeFormat,
} from "@/types"
import type { ColumnType } from "ant-design-vue/lib/table/interface"
import type { FormInstance } from "ant-design-vue"
import {
	useApprovalWaitListColumns,
	useApprovalWaitListSearch,
} from "@/types/approvals/wait"

definePageMeta({
	name: "결재처리",
})

const route = useRoute()
const { $dayjs } = useNuxtApp()

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const { searchParams, updateSearchParams } = useApprovalWaitListSearch(
	getCompanyCode.value,
	getEmployeeId.value
)
const columns = useApprovalWaitListColumns()
const selectedRowKeys = ref<(string | number)[]>([])

const {
	data: approval,
	status,
	refresh: approvalRefresh,
} = await useAsyncData(`slip-approvals-pending`, async () =>
	useCFetch<Response<Array<any>>>("/api/v2/approvals/pending", {
		method: "GET",
		params: {
			page: searchParams.value.pageNumber > 1 ? searchParams.value.pageNumber - 1 : 0,
			...searchParams.value,
		},
	}).then((data: Response<Array<any>>) => (data || {}) as any)
)

/**
 * 일괄승인
 */
const batchApprovalFormRef = ref<FormInstance>()
const isBatchApproval = ref<boolean>(false)
const batchApprovalData = ref<{ comment: string; ids: (string | number)[] }>({
	comment: "",
	ids: [],
})

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	updateSearchParams({
		pageNumber: 0,
		searchDateFrom: dateString[0],
		searchDateTo: dateString[1],
	})
}

const onSelectChange = (keys: (string | number)[]) => {
	selectedRowKeys.value = keys
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	updateSearchParams({
		pageNumber: pagination.current - 1,
		size: pagination.pageSize,
		sort: sortParams,
	})
}

const onSelectionChange = (size: number) => {
	updateSearchParams({
		pageNumber: 0,
		size,
	})
}

const onSearch = (params: any) => {
	approvalRefresh()
}

const onPage = async (record: any) => {
	await navigateTo(
		`/approvals/read-${compCase(record.approvalFormTypeName)}/${record.id}`
	)
}

/**
 * 일괄승인 Action
 */
const onBatchApproval = () => {
	batchApprovalData.value.ids = selectedRowKeys.value
	batchApprovalData.value.comment = ""
	isBatchApproval.value = true
}
const onBatchApprovalFinish = (data: any) => {
	batchApprovalFormRef.value
		?.validate()
		.then(async () => {
			const body = {
				companyCode: getCompanyCode.value,
				approvalHeaderIds: data.ids.map((x: any) => ({ id: x })),
				comment: data.comment,
				actualApprovalEmployeeId: getEmployeeId.value,
			}

			await useCFetch<Response<Array<any>>>("/api/v2/approvals/approve/bulk", {
				method: "PATCH",
				body: body,
			}).then((res: Response<Array<any>>) => {
				if (res.status === 0) {
					message.success(res.message)
					isBatchApproval.value = false
					approvalRefresh()
				}
			})
		})
		.catch((error) => {
			console.log("error", error)
		})
}

const initSearchParams = () => {
	const { searchDateFrom, searchDateTo } = route.query
	if (searchDateFrom && searchDateTo) {
		updateSearchParams({
			searchDateFrom: searchDateFrom as string,
			searchDateTo: searchDateTo as string,
			filterDate: [$dayjs(searchDateFrom as string), $dayjs(searchDateTo as string)],
		})
	}
}

onMounted(() => {
	if (route?.query) initSearchParams()
	approvalRefresh()
})

onActivated(() => {
	if (route?.query) initSearchParams()
	approvalRefresh()
})
</script>

<template>
	<page-layout>
		<template #content>
			<a-row :gutter="[10, 5]" wrap>
				<a-col>
					<a-space>
						<label>기안일</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>제목</span>
						<a-input v-model:value="searchParams.title" />
					</a-space>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						@click="onSearch"
					/>
				</a-col>
			</a-row>

			<a-divider class="my-md" />

			<a-flex justify="flex-end" class="mb-sm">
				<a-space :size="5">
					<a-button
						type="primary"
						:icon="materialIcons('mso', 'edit_square')"
						:disabled="selectedRowKeys.length === 0"
						@click="onBatchApproval"
					>
						일괄승인
					</a-button>
					<a-select
						v-model:value="searchParams.size"
						:options="pageSizeOptions"
						value-field="key"
						text-field="label"
						@change="(page: any) => onSelectionChange(page)"
					/>
				</a-space>
			</a-flex>
			<a-table
				size="small"
				:columns="columns"
				:data-source="approval.data"
				:loading="status === 'pending'"
				:pagination="
					Object.assign({}, pagination, {
						current: approval.pageNumber ? approval.pageNumber + 1 : 1,
						pageSize: approval.size,
						total: approval.totalElements,
					})
				"
				:row-key="(record: any) => record.id"
				:row-selection="{
					selectedRowKeys: selectedRowKeys,
					onChange: onSelectChange,
					getCheckboxProps: (record: any) => ({
						disabled: !record.isBulkApproval, // Column configuration not to be checked
					}),
				}"
				:show-sorter-tooltip="false"
				@resize-column="handleResizeColumn"
				@change="cellChange"
			>
				<template #headerCell="{ title }">
					<div class="text-center">{{ title }}</div>
				</template>
				<template #bodyCell="{ column, text, record }">
					<template v-if="column.dataIndex === 'title'">
						<a-typography-link @click="onPage(record)">
							{{ text }}
						</a-typography-link>
					</template>
					<template v-if="column.dataIndex === 'approvalDetails'">
						<approval-lines
							:data="text.sort((a: any, b: any) => a.stage - b.stage)"
							:type="record.agreementOptionTypeName"
							:status="true"
							:next-stage="record.nextApprovalStage"
						/>
					</template>
				</template>
			</a-table>
		</template>
		<template #modal>
			<!-- 일괄승인 모달  batch approval-->
			<field-modal
				title="결재"
				:showed="isBatchApproval"
				:field="batchApprovalData"
				cancel-text="취소"
				@closed="isBatchApproval = false"
				@submit="onBatchApprovalFinish"
			>
				<template #content="{ field }">
					<a-flex align="start" class="mb-lg" :gap="10">
						<component
							:is="materialIcons('mso', 'error')"
							class="text-warning"
							style="font-size: 3rem"
						/>
						<div>
							<a-typography-title :level="4">
								선택된 결재문서를 일괄 승인합니다.
							</a-typography-title>
							<a-typography-paragraph class="mb-none">
								대결, 전결, 후결승인은 일괄처리가 불가능하며 일반 결재 대기 문서만
								가능합니다.
							</a-typography-paragraph>
						</div>
					</a-flex>

					<a-form
						ref="batchApprovalFormRef"
						label-align="left"
						:colon="false"
						:model="field"
						:wrapper-col="{ offset: 2, span: 22 }"
						:label-col="{ offset: 2, span: 22 }"
					>
						<a-form-item name="description" label="결재 승인 의견">
							<a-textarea
								v-model:value="field.comment"
								placeholder="결재 의견을 입력하세요."
								style="resize: none"
								:rows="6"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
