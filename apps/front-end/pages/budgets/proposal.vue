<script setup lang="ts">
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"
import {
	IFormData,
	IFormType,
	pageSizeOptions,
	Response,
	RequestParams,
	CommonCode,
	SortType,
} from "@/types"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type {
	Search,
	ConfirmParams,
	departmentParams,
	BudgetApplyData,
} from "~/types/budgets"
import budgetDetailTable from "~/components/budgets/budgetDetailTable.vue"

definePageMeta({
	name: "예산신청내역",
})

const authStore = useAuthStore()
const {
	getCompanyCode,
	getWorkplaceId,
	getWorkplaceCode,
	getRole,
	getEmployeeId,
	getCostCenterId,
} = storeToRefs(authStore)

const filterDate = ref<[Dayjs, Dayjs]>([useMonth.from(), useMonth.to()])
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const dataSource = ref<Response<Array<BudgetApplyData>>>()
const paginationParam = ref({ pageNum: 0, size: 10 })
const isExpand = ref<boolean>(false)
const confirmModalOpen = ref<boolean>(false)
const cancelModalOpen = ref<boolean>(false)
const openBudgetDetail = ref<boolean>(false)
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const selectedData = ref<Array<any>>([])
const budgetApplyData = ref<Array<BudgetApplyData>>([])

const searchParams = ref<Search>({
	companyName: "",
	companyCode: getCompanyCode.value,
	searchDateFrom: dayjs(filterDate.value[0]).format("YYYY-MM-DD"), //시작일
	searchDateTo: dayjs(filterDate.value[1]).format("YYYY-MM-DD"), //종료일
	departmentCode: undefined,
	departmentName: "",
	workplaceCode: getWorkplaceCode.value,
	workplaceName: "",
	fromCostCenterId: getCostCenterId.value,
	budgetRequestType: "",
	budgetRequestName: "",
	budgetRequestStatus: "",
	budgetRequestStatusName: "",
	page: 0,
	size: 10,
	sort: [],
})

const departmentSearchParams = ref<departmentParams>({
	companyCode: getCompanyCode.value,
	used: true,
})

const budgetConfirm = ref<ConfirmParams>({
	companyCode: getCompanyCode.value,
	opinion: "",
})

const mainColumns = ref<ColumnsType<any>>([
	{
		title: "신청정보",
		dataIndex: "applyInfo",
		resizable: true,
		align: "center",
		children: [
			{
				title: "예산신청번호",
				dataIndex: "budgetRequestNumber",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "유형",
				dataIndex: "budgetRequestType.code",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "상태",
				dataIndex: "budgetRequestStatus.code",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "신청일",
				dataIndex: "createdAt",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "부서",
				dataIndex: "departmentName",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "신청자",
				dataIndex: "draftEmployee",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "신청금액",
				dataIndex: "requestAmount",
				resizable: true,
				align: "right",
				width: -1,
			},
		],
		width: -1,
	},
	{
		title: "기능",
		dataIndex: "function",
		resizable: true,
		align: "center",
		children: [
			{
				title: "결제문서번호",
				dataIndex: "approvalId",
				resizable: true,
				align: "center",
				width: -1,
				customCell: (record: any, rowIndex: any, column: any) => {
					const currentValue = record["approvalId"]
					const previousRow = budgetApplyData.value[rowIndex - 1]
					let rowspan = 1
					if (!currentValue) return { rowspan }
					if (previousRow && previousRow["approvalId"] === currentValue) {
						// 같은 값이면 rowspan을 늘림
						rowspan = 0
					} else {
						// 첫 번째 항목이면 rowspan을 1로 설정
						for (let i = rowIndex + 1; i < budgetApplyData.value.length; i++) {
							if (budgetApplyData.value[i]["approvalId"] === currentValue) {
								rowspan++
							} else {
								break
							}
						}
					}
					return {
						rowspan,
					}
				},
			},
			{
				title: "결제문서",
				dataIndex: "id",
				resizable: true,
				align: "center",
				width: -1,
				customCell: (record: any, rowIndex: any, column: any) => {
					const currentValue = record["approvalId"]
					const previousRow = budgetApplyData.value[rowIndex - 1]
					let rowspan = 1
					if (!currentValue) return { rowspan }

					if (previousRow && previousRow["approvalId"] === currentValue) {
						// 같은 값이면 rowspan을 늘림
						rowspan = 0
					} else {
						// 첫 번째 항목이면 rowspan을 1로 설정
						for (let i = rowIndex + 1; i < budgetApplyData.value.length; i++) {
							if (budgetApplyData.value[i]["approvalId"] === currentValue) {
								rowspan++
							} else {
								break
							}
						}
					}
					return {
						rowspan,
					}
				},
			},
		],
		width: -1,
	},
	{
		title: "주는대상",
		dataIndex: "infoFrom",
		resizable: true,
		align: "center",
		children: [
			{
				title: "예산년월",
				dataIndex: "fromYearMonth",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "코스트센터",
				dataIndex: "fromCostCenter.name",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "계정비용/항목",
				dataIndex: "fromAccount.name",
				resizable: true,
				align: "center",
				width: -1,
			},
		],
		width: -1,
	},
	{
		title: "받는대상",
		dataIndex: "infoTo",
		resizable: true,
		align: "center",
		children: [
			{
				title: "예산년월",
				dataIndex: "toYearMonth",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "코스트센터",
				dataIndex: "toCostCenter.name",
				resizable: true,
				align: "center",
				width: -1,
			},
			{
				title: "계정비용/항목",
				dataIndex: "toAccount.name",
				resizable: true,
				align: "center",
				width: -1,
			},
		],
		width: -1,
	},
	{
		title: "예산승인/반려정보",
		dataIndex: "budgetStatusInfo",
		resizable: true,
		align: "center",
		children: [
			{
				title: "승인/반려자",
				dataIndex: "approvalEmployeeName",
				resizable: true,
				align: "right",
				width: -1,
			},
			{
				title: "승인/반려일",
				dataIndex: "approvalDateTime",
				resizable: true,
				align: "right",
				width: -1,
			},
		],
		width: -1,
	},
])

const cancelColumns = ref<ColumnsType<any>>([
	{
		title: "예산신청번호",
		dataIndex: "budgetRequestNumber",
		resizable: true,
		width: -1,
	},
	{
		title: "결제문서번호",
		dataIndex: "id",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "유형",
		dataIndex: "budgetRequestType.code",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "신청일",
		dataIndex: "createdAt",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "부서",
		dataIndex: "departmentName",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "신청자",
		dataIndex: "createdBy",
		resizable: true,
		align: "center",
		width: -1,
	},
	{
		title: "신청금액",
		dataIndex: "requestAmount",
		resizable: true,
		align: "right",
		width: -1,
	},
])

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.page = 0
	searchParams.value.searchDateFrom = dateString[0]
	searchParams.value.searchDateTo = dateString[1]
}

/**
 * 예산 신청 내역 정보 조회
 */
const { status: budgetApplyStatus, refresh: budgetApplyRefresh } = await useAsyncData(
	`budgets-apply-list`,
	() =>
		useCFetch<Response<Array<BudgetApplyData>>>("/api/v2/budgets/request", {
			method: "GET",
			params: {
				...searchParams.value,
				page:
					!!searchParams.value.page && searchParams.value.page > 1
						? searchParams.value.page - 1
						: 0,
			},
		})
			.then((res: any) => res)
			.then((res: Response<Array<BudgetApplyData>>) => {
				if (res.status === 0 && res.data) {
					dataSource.value = res
					budgetApplyData.value = res.data
				}
			}),
	{ watch: [paginationParam.value] }
)

/**
 * 부서 목록 조회
 * @param departmentData
 */
const {
	data: departmentData,
	status: departmentStatus,
	refresh: departmentRefresh,
} = await useAsyncData(`budget-department-list`, () =>
	useCFetch<Response<any>>("/api/v2/settings/departments", {
		method: "GET",
		params: {
			...departmentSearchParams.value,
		},
	}).then((res: Response<any>) => res.data)
)

const onSearch = () => {
	budgetApplyRefresh()
	selectedRowKeys.value = []
	selectedRows.value = []
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	paginationParam.value.pageNum = pagination.current
	searchParams.value.page = pagination.current
	searchParams.value.size = pagination.pageSize
	selectedRowKeys.value = []
	selectedRows.value = []
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	const newSelectedRowKeys = new Set(selectedRowKeys.value)

	keys.forEach((key) => {
		const selectedRow = rows.find((row) => row.id === key)

		if (selectedRow) {
			if (selectedRow.approvalId) {
				budgetApplyData.value.forEach((element) => {
					if (element.approvalId === selectedRow.approvalId && !!element.id) {
						newSelectedRowKeys.add(element.id)
					}
				})
			} else {
				newSelectedRowKeys.add(selectedRow.id)
			}
		}
	})

	selectedRowKeys.value.forEach((existingKey) => {
		if (!keys.includes(existingKey)) {
			const rowToDeselect = budgetApplyData.value.find((row) => row.id === existingKey)
			if (rowToDeselect) {
				if (rowToDeselect.approvalId) {
					budgetApplyData.value.forEach((element) => {
						if (element.approvalId === rowToDeselect.approvalId && !!element.id) {
							newSelectedRowKeys.delete(element.id)
						}
					})
				} else {
					if (!!rowToDeselect.id) newSelectedRowKeys.delete(rowToDeselect.id)
				}
			}
		}
	})

	selectedRowKeys.value = Array.from(newSelectedRowKeys)

	selectedRows.value = budgetApplyData.value.filter((element) => {
		if (!!element.id) return selectedRowKeys.value.includes(element.id)
	})
}

const confirmSubmit = (data: any) => {
	if (data.length == 0) return
	data.forEach((element: any) => {
		const body = {
			id: element.value,
			comment: budgetConfirm.value.opinion,
			budgetRequestStatus: "APPROVED",
			commentEmployeeId: getEmployeeId.value,
		}
		useIFetch<Response<any>>(
			`/api/v2/budgets/request/approveOrReject/${element.approvalId}`,
			{
				method: "POST",
				body,
			}
		)
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				if (res.status === 0 && data.length === selectedRowKeys.value.length)
					onCloseConfirmModal()
			})
	})
}

const cancelSubmit = (data: any) => {
	if (data.length == 0) return
	data.forEach((element: any) => {
		const body = {
			id: element.id,
			comment: budgetConfirm.value.opinion,
			budgetRequestStatus: "REJECTED",
			commentEmployeeId: getEmployeeId.value,
		}
		useIFetch<Response<any>>(
			`/api/v2/budgets/request/approveOrReject/${element.approvalId}`,
			{
				method: "POST",
				body,
			}
		)
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				if (res.status === 0 && data.length === selectedRowKeys.value.length)
					onCloseCancelModal()
			})
	})
}

const onOpenConfirmModal = () => {
	confirmModalOpen.value = true
	budgetConfirm.value.opinion = undefined
}

const onOpenCancelModal = () => {
	cancelModalOpen.value = true
	budgetConfirm.value.opinion = undefined
}

const onCloseConfirmModal = () => {
	confirmModalOpen.value = false
	selectedRows.value = []
	selectedRowKeys.value = []
}

const onCloseCancelModal = () => {
	cancelModalOpen.value = false
	selectedRows.value = []
	selectedRowKeys.value = []
}

const showBudgetModal = (data: any) => {
	openBudgetDetail.value = true
	selectedData.value = data
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				예산신청서중 결재완료된 신청내역들이 목록에 나열 됩니다. 예산담당자는 신청내역을
				확인하여 예산승인 또는 예산반려를 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="조회년도">
							<a-range-picker v-model:value="filterDate" @change="onChangeRangePicker" />
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="신청부서">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="searchParams.departmentCode"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="신청부서를 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'code',
									}"
									:tree-data="departmentData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="신청유형">
								<eacc-select
									:style="{ width: '20rem' }"
									:url="'/api/v2/budgets/request/types/budgetRequestType'"
									:params="{}"
									v-model:value="searchParams.budgetRequestType"
									:field-names="{
										label: 'label',
										value: 'name',
									}"
									:on-all-field="true"
									first
									:refresh="true"
									:show-search="true"
									:show-arrow="false"
									value-type="any"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="상태">
								<eacc-select
									:style="{ width: '20rem' }"
									:url="'/api/v2/budgets/request/types/budgetApprovalStatus'"
									:params="{}"
									v-model:value="searchParams.budgetRequestStatus"
									:field-names="{
										label: 'label',
										value: 'code',
									}"
									:on-all-field="true"
									first
									:refresh="true"
									:show-search="true"
									:show-arrow="false"
									value-type="any"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<eacc-button
								component-is="search"
								size="middle"
								:modal-open="false"
								:data="searchParams"
								@click="onSearch"
							/>
						</a-space>
					</a-col>
				</a-row>
			</a-form>

			<a-divider class="my-md" />

			<div :class="['grid-area', { expand: isExpand }]">
				<a-row justify="space-between" :gutter="[5, 5]" class="mb-sm">
					<a-col>
						<a-space :size="5">
							<a-button
								:icon="materialIcons('mso', isExpand ? 'zoom_in_map' : 'zoom_out_map')"
								@click="onExpand"
							>
								{{ isExpand ? "축소" : "확대" }}
							</a-button>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-button
								:icon="materialIcons('mso', 'file_download')"
								@click="() => console.log('엑셀다운로드')"
							>
								엑셀다운로드
							</a-button>
							<a-button
								:disabled="selectedRowKeys.length == 0"
								:icon="materialIcons('mso', 'block')"
								ghost
								danger
								@click="() => onOpenCancelModal()"
							>
								예산반려
							</a-button>
							<a-button
								:disabled="selectedRowKeys.length == 0"
								:icon="materialIcons('mso', 'add_circle')"
								type="primary"
								@click="() => onOpenConfirmModal()"
							>
								예산승인
							</a-button>
							<a-select
								v-model:value="searchParams.size"
								:options="
									pageSizeOptions.filter((element: any) => {
										return element.key !== 15 && element.key !== 30
									})
								"
								value-field="key"
								text-field="label"
								@change="(value: any) => (paginationParam.size = value)"
							/>
						</a-space>
					</a-col>
				</a-row>

				<a-table
					size="small"
					:loading="budgetApplyStatus === 'pending'"
					:columns="mainColumns"
					:show-sorter-tooltip="false"
					bordered
					:data-source="budgetApplyData"
					:scroll="{ x: 4000, y: 400 }"
					:row-key="(record: any) => record.id"
					:row-selection="{
						selectedRowKeys,
						onChange: onRowSelection,
					}"
					:pagination="{
						current:
							searchParams?.page === 0 ? searchParams?.page + 1 : searchParams?.page,
						pageSizeOptions: ['10', '20', '50', '100'],
						pageSize: searchParams?.size,
						total: dataSource?.totalElements,
						showTotal: (total: any) => `총 ${total} 건`,
						showLessItems: false,
						showSizeChanger: false,
						showQuickJumper: false,
						locale: { items_per_page: '건' },
						position: ['bottomRight'],
						hideOnSinglePage: false,
					}"
					@change="cellChange"
					@resizeColumn="handleResizeColumn"
				>
					<template #headerCell="{ title }">
						<div class="text-center">{{ title }}</div>
					</template>
					<template #bodyCell="{ column, text, record }">
						<template v-if="column.dataIndex === 'budgetRequestNumber'">
							<a-typography-link @click="showBudgetModal(record)">
								{{ record.budgetRequestNumber }}
							</a-typography-link>
						</template>
						<template v-if="column.dataIndex === 'budgetRequestType.code'">
							<a-tag
								:color="
									record.budgetRequestType.code === 'ROLLOVER'
										? 'orange'
										: record.applyTypeCode === 'INCREASE'
											? 'cyan'
											: 'blue'
								"
							>
								<span>{{
									record.applyTypeCode === "ROLLOVER"
										? "예산이월"
										: record.applyTypeCode === "INCREASE"
											? "예산증액"
											: "예산전용"
								}}</span>
							</a-tag>
						</template>
						<template v-if="column.dataIndex === 'budgetRequestStatus.code'">
							<a-badge
								:color="
									record.budgetRequestStatus.code === 'PENDING'
										? 'orange'
										: record.budgetRequestStatus.code === 'APPROVED'
											? 'green'
											: 'red'
								"
								:text="
									record.budgetRequestStatus.code === 'PENDING'
										? '승인대기'
										: record.budgetRequestStatus.code === 'APPROVED'
											? '예산승인'
											: '예산반려'
								"
							/>
						</template>
						<template v-if="column.dataIndex === 'createdAt'">
							{{ record.createdAt.split(" ")[0] }}
						</template>
						<template v-if="column.dataIndex === 'requestAmount'">
							{{ record.requestAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}
						</template>
						<template v-if="column.dataIndex === 'approvalId'">
							{{ record.approvalId }}
						</template>
						<template v-if="column.dataIndex === 'id'">
							<a-button
								:icon="materialIcons('mso', 'edit_square')"
								@click="console.log('paperId : ', record.id)"
							/>
						</template>
						<template v-if="column.dataIndex === 'fromYearMonth'">
							{{ record.fromYearMonth }}
						</template>
						<template v-if="column.dataIndex === 'fromCostCenter.name'">
							{{ record.fromCostCenter.name }}
						</template>
						<template v-if="column.dataIndex === 'fromAccount.name'">
							{{ record.fromAccount.parentName }} >
							{{ record.fromAccount.name }}
						</template>
						<template v-if="column.dataIndex === 'toYearMonth'">
							{{ record.toYearMonth }}
						</template>
						<template v-if="column.dataIndex === 'toCostCenter.name'">
							{{ record.toCostCenter.name }}
						</template>
						<template v-if="column.dataIndex === 'toAccount.name'">
							{{ record.toAccount.parentName }} >
							{{ record.toAccount.name }}
						</template>
						<template
							v-if="
								column.dataIndex === 'approvalEmployeeName' &&
								!record.approvalEmployeeName
							"
						>
							-
						</template>
						<template
							v-if="column.dataIndex === 'approvalDateTime' && !record.approvalDateTime"
						>
							-
						</template>
					</template>
				</a-table>
			</div>

			<field-modal
				title="예산반려"
				okText="반려"
				:field="selectedRows"
				cancelText="취소"
				size="large"
				:showed="cancelModalOpen"
				@closed="cancelModalOpen = false"
				@submit="(params: any) => cancelSubmit(selectedRows)"
			>
				<template #content>
					<div>
						<component
							:is="materialIcons('mso', 'cancel')"
							class="text-warning"
							style="font-size: 20px; display: inline-flex; margin-right: 10px"
						/>
						<h3 style="display: inline-flex">예산신청을 반려하겠습니까?</h3>
						<p style="margin-left: 30px">
							신청 반려시, 최초 기안자의 결재 문서는 반려 문서로 변경됩니다. 반려시
							예산신청서 부터 재기안 해야 합니다.
						</p>
					</div>
					<div style="margin: 30px 0 0 30px">
						<p>반려의견</p>
						<a-textarea
							v-model:value="budgetConfirm.opinion"
							placeholder="의견을 입력해주세요"
							allow-clear
							:auto-size="{ minRows: 4, maxRows: 8 }"
						/>
					</div>
					<div style="margin: 20px 0 0 30px">
						<p>예산신청 취소 목록</p>
						<a-table
							name="cancel-table"
							size="small"
							:loading="budgetApplyStatus === 'pending'"
							:columns="cancelColumns"
							:show-sorter-tooltip="false"
							:data-source="selectedRows"
							@resizeColumn="handleResizeColumn"
						>
							<template #bodyCell="{ column, text, record }">
								<template v-if="column.dataIndex === 'budgetRequestNumber'">
									<a-typography-link @click="showBudgetModal(record)">
										{{ record.budgetRequestNumber }}
									</a-typography-link>
								</template>
								<template v-if="column.dataIndex === 'budgetRequestType.code'">
									<a-tag
										:color="
											record.budgetRequestType.code === 'ROLLOVER'
												? 'orange'
												: record.applyTypeCode === 'INCREASE'
													? 'cyan'
													: 'blue'
										"
									>
										<span>{{
											record.applyTypeCode === "ROLLOVER"
												? "예산이월"
												: record.applyTypeCode === "INCREASE"
													? "예산증액"
													: "예산전용"
										}}</span>
									</a-tag>
								</template>
								<template v-if="column.dataIndex === 'requestAmount'">
									{{
										record.requestAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
									}}
								</template>
							</template>
						</a-table>
					</div>
				</template>
			</field-modal>

			<field-modal
				title="예산승인"
				okText="승인"
				cancelText="취소"
				:field="selectedRows"
				:showed="confirmModalOpen"
				@closed="cancelModalOpen = false"
				@submit="(params: any) => confirmSubmit(selectedRows)"
			>
				<template #content>
					<div>
						<component
							:is="materialIcons('mso', 'check_circle')"
							class="text-success"
							style="font-size: 20px; display: inline-flex; margin-right: 10px"
						/>
						<h3 style="display: inline-flex">예산신청을 승인하겠습니까?</h3>
					</div>
					<div style="margin: 30px 0 0 30px">
						<p>승인의견</p>
						<a-textarea
							v-model:value="budgetConfirm.opinion"
							placeholder="의견을 입력해주세요"
							allow-clear
							:auto-size="{ minRows: 4, maxRows: 8 }"
						/>
					</div>
				</template>
			</field-modal>
			<budget-detail-table
				:show="openBudgetDetail"
				:budgetData="selectedData"
				:current-page-data-list="
					_orderBy(removeDuplicatesByKey(budgetApplyData ?? [], 'id'), ['id'], ['desc'])
				"
				@update:show="(value: boolean) => (openBudgetDetail = value)"
				@update:switch="(value: boolean) => (cancelModalOpen = value)"
				@close="openBudgetDetail = false"
			>
			</budget-detail-table>
		</template>
	</page-layout>
</template>
