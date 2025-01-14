<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { Link, IconLink, Badge, ColorTag } from "@/components/ui"
import { iwxGrid } from "@iwx/ui"
import type {
	GridApi,
	GridOptions,
	GridReadyEvent,
	ICellRendererParams,
	ValueFormatterParams,
} from "@iwx/ui"
import { type FormInstance } from "ant-design-vue"
import {
	type RequestParams,
	pageSizeOptions,
	dateTimeFormat,
	pageSize,
	SlipType,
	SlipFormType,
	Response,
} from "@/types"
import type { Dayjs } from "dayjs"
import { monthFormat } from "@/types/expenses"
import {
	columnTypes,
	DataType,
	getRowStyle,
	ISlipsDataType,
	options,
} from "@/types/slips/list"
import {
	TSlipConfirmSearch,
	useConfirmSearch,
	useSlipConfirmColumns,
} from "@/types/slips/confirm"

definePageMeta({
	name: "전표검인/확정",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId, getDepartmentId } = storeToRefs(authStore)

const { getColumns, setColumns } = useAgGridColumn()

// 결재문서 상세보기
const showDocument = ref<boolean>(false)
const slipFormId = ref<string | number | undefined>(undefined)
const slipFormType = ref<SlipFormType | undefined>(undefined)

// 지출내역 상세보기
const showDetail = ref<boolean>(false)
const expenseFormId = ref<string | number | undefined>(undefined)

const formId = computed({
	get() {
		return slipFormId.value
	},
	set(value: string | number) {
		slipFormId.value = value
	},
})

const expenseId = computed({
	get() {
		return expenseFormId.value
	},
	set(value: string | number) {
		expenseFormId.value = value
	},
})

//검인자 변경
const formRef = useTemplateRef<FormInstance>("formRef")
const changeCheckerLoading = ref<boolean>(false)
const isChangeChecker = ref<boolean>(false)
const changeCheckerData = ref<{ checker: number | undefined; data: any }>({
	checker: undefined,
	data: undefined,
})

// 검인/확정/반려 모달 안 테이블 collapse falg
const isTableCollapse = ref<boolean>(true)

//반려
const showRejectModal = ref<boolean>(false)
const rejectModalData = ref<{ comment: string }>({
	comment: "",
})
const rejectModalLoading = ref<boolean>(false)

//일괄 검인/확정
const showBatchModal = ref<boolean>(false)
const batchModalData = ref<{ comment: string }>({
	comment: "",
})
const batchModalLoading = ref<boolean>(false)

//확대/축소
const isExpand = ref<boolean>(false)

const { searchParams: params, updateSearchParams } = useConfirmSearch(
	getCompanyCode.value,
	getEmployeeId.value,
	getDepartmentId.value
)

const searchParams = computed({
	get() {
		return params.value
	},
	set(value: RequestParams<TSlipConfirmSearch>) {
		// params.value = value
		updateSearchParams({
			...value,
		})
	},
})
const { checks, slipsManagementTypes, slipsManagementStatus } = useSlips()
const {
	data: slipsData,
	error: slipsError,
	status: slipsStatus,
	execute: slipsExecute,
	refresh: slipsRefresh,
} = await checks(searchParams)
const { data: slipTypeOptions } = await slipsManagementTypes()
const { data: slipStatusOptions } = await slipsManagementStatus()

const gridApi = shallowRef<GridApi<DataType>>()

const gridKey = ref(0)

const gridOptions = {
	overlayLoadingTemplate:
		'<span class="ag-overlay-loading-center">데이터를 불러오는 중입니다.</span>',
	groupDisplayType: "multipleColumns",
	// 그룹 컬럼 순서 유지
	applyColumnState: {
		applyOrder: false,
	},
}

const onGridDestroyed = () => {
	gridKey.value++
}

const columnDefs = ref<GridOptions<ISlipsDataType>["columnDefs"]>([
	{
		field: "slipNumber",
		headerName: "전표번호",
		headerClass: "ag-center-header",
		minWidth: 200,
		headerCheckboxSelection: true,
		checkboxSelection: (params: any) => {
			return params?.data?.slipNumber ? true : false
		},
		cellRenderer: Link,
		cellRendererParams: (params: ICellRendererParams) => {
			return {
				params,
				text: params.value,
				onClick: (params: any) => {
					expenseFormId.value = params.id
					showDetail.value = true
				},
			}
		},
	},
	{
		field: "slipTypeName",
		headerName: "전표유형",
		headerClass: "ag-center-header",
		cellClass: "text-center",
		cellRenderer: ColorTag,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = params.value
				? options.expense.filter((e) => e.value === params.value)?.[0].color || "red"
				: ""
			const text = params.value
				? options.expense.filter((e) => e.value === params.value)?.[0].label || "유형없음"
				: ""
			return {
				params,
				color,
				text,
			}
		},
	},
	// {
	// 	field: "group",
	// 	headerName: "결재문서번호",
	// 	headerClass: "ag-center-header",
	// 	minWidth: 200,
	// 	showRowGroup: true,
	// 	cellStyle: { fontWeight: 700 },
	//   initialPinned: false,
	//   cellRenderer: "agGroupCellRenderer",
	//   cellRendererParams: {
	// 		suppressPadding: true,
	// 	},
	// },
	{
		field: "approvalNumber",
		headerClass: "ag-center-header",
		headerName: "결재문서번호",
		minWidth: 200,
		// rowGroup: true,
		// hide: false,
	},
	{
		field: "approvalHeaderId",
		headerName: "결재문서",
		headerClass: "ag-center-header",
		cellStyle: { textAlign: "center" },
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = "edit_square"
			return {
				params,
				icon,
				onClick: (params: any) => {
					// data 를 받으면 해당 데이터로 디테일 내역 통신하고 모달 오픈
					slipFormId.value = params.approvalHeaderId as string | number
					if (params.slipTypeName === SlipType.PERSONAL_EXPENSE) {
						slipFormType.value = SlipFormType.PERSONAL_EXPENSE_FORM
					} else if (params.slipTypeName === SlipType.CARD) {
						slipFormType.value = SlipFormType.CARD_FORM
					} else {
						slipFormType.value = params.slipTypeName
					}
					showDocument.value = true
				},
			}
		},
	},
	{
		field: "accountingDate",
		headerName: "사용일자",
		headerClass: "ag-center-header",
	},
	{
		field: "workplaceName",
		headerName: "사업장",
		headerClass: "ag-center-header",
	},
	{
		field: "costCenterName",
		rowGroup: false,
		headerName: "코스트센터명",
		headerClass: "ag-center-header",
	},
	{
		field: "employeeName",
		headerName: "사용자",
		headerClass: "ag-center-header",
	},
	{
		field: "evidenceVendorName",
		headerName: "증빙거래처",
		headerClass: "ag-center-header",
	},
	{
		field: "paymentVendorName",
		headerName: "지급거래처",
		headerClass: "ag-center-header",
	},
	{
		field: "krwTotalAmount",
		headerName: "총금액",
		headerClass: "ag-center-header",
		type: "currency",
	},
	{
		field: "krwSupplyAmount",
		headerName: "공급가액",
		headerClass: "ag-center-header",
		type: "currency",
	},
	{
		field: "krwTaxAmount",
		headerName: "부가세",
		headerClass: "ag-center-header",
		type: "currency",
		valueParser: (params) => {
			const parsedValue = params.newValue.replace(/,/g, "")
			return Number(parsedValue || 0)
		},
		valueFormatter: (params: ValueFormatterParams) => {
			if (params.value == null) return "0"
			return params.value.toLocaleString("ko-KR")
		},
	},
	{
		field: "account",
		headerName: "계정/비용과목",
		valueFormatter: (params: ValueFormatterParams) => {
			return params.value ? params.value.name : ""
		},
	},
	{
		field: "slipStatusName",
		headerName: "상태",
		headerClass: "ag-center-header",
		cellRenderer: Badge,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = params.value
				? options.state.filter((e) => e.value === params.value)[0]?.color
				: ""
			const text = params.value
				? options.state.filter((e) => e.value === params.value)[0]?.label
				: ""
			return {
				params,
				color,
				text,
			}
		},
	},

	{
		field: "cardApprovalDateTime",
		headerName: "카드승인일시",
		headerClass: "ag-center-header",
	},
	{
		field: "cardApprovalNumber",
		headerName: "카드승인번호",
		headerClass: "ag-center-header",
	},
	{
		field: "projectName",
		headerName: "프로젝트명",
		headerClass: "ag-center-header",
	},
	{
		field: "paymentDueDate",
		headerName: "지급예정일",
		headerClass: "ag-center-header",
	},
	{
		field: "checkEmployeeName",
		headerName: "현재검인자",
		headerClass: "ag-center-header",
	},
	// {
	// 	field: "nextSealUser",
	// 	headerName: "다음검인자",
	// 	headerClass: "ag-center-header",
	// },
])

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	searchParams.value.searchDateFrom = dateString[0]
	searchParams.value.searchDateTo = dateString[1]
}

const onReset = () => {
	updateSearchParams({
		companyCode: getCompanyCode.value,
		filterDate: [useMonth.twoMonthsAgo(), useMonth.currentMonth()],
		searchDateFrom: useMonth.twoMonthsAgo().format(monthFormat),
		searchDateTo: useMonth.currentMonth().format(monthFormat),
		employeeId: getEmployeeId.value,
		employeeIds: [getEmployeeId.value],
		checkEmployeeId: getEmployeeId.value,
		checkEmployeeIds: [getEmployeeId.value],
		departmentId: getDepartmentId.value,
		departmentIds: [getDepartmentId.value],
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	})
}
const onSearch = (params: any) => {
	slipsRefresh()
}

const onColumnVisible = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsConfirmColumnState", columnState)
}

const onColumnResized = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsConfirmColumnState", columnState)
}

const onColumnMoved = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsConfirmColumnState", columnState)
}

const onGridReady = async (params: GridReadyEvent<DataType>) => {
	gridApi.value = params.api

	const savedColumnState = await Promise.race([getColumns("slipsConfirmColumnState")])
	if (savedColumnState) {
		gridApi.value!.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

/**
 * * Grid Checkbox Selection
 * * 선택되어진 값에 대한
 * @param {*} params
 */
const onRowSelected = (params: any) => {
	const rowNode = params.node
	const isSelected = rowNode.isSelected()
	const rowData = rowNode.data

	if (isSelected) {
		const approvalNumber = rowData.approvalNumber
		params.api.forEachNode((node: any) => {
			if (node.data.approvalNumber === approvalNumber && !node.isSelected()) {
				node.setSelected(true)
			}
		})
	} else {
		const approvalNumber = rowData.approvalNumber
		params.api.forEachNode((node: any) => {
			if (node.data.approvalNumber === approvalNumber && node.isSelected()) {
				node.setSelected(false)
			}
		})
	}
}

const handleSlipNumberClick = (record: any) => {
	expenseFormId.value = record.id
	showDetail.value = true
}
const modalColumns = useSlipConfirmColumns(handleSlipNumberClick)

const isCheckOpenModal = (type: "SEAL" | "REJECT"): boolean => {
	if (gridApi?.value) {
		const rowNode = gridApi.value.getSelectedRows()

		const approvalHeaderIds = rowNode.map((node: any) => ({ id: node.approvalHeaderId }))
		if (_isEmpty(approvalHeaderIds)) {
			message.error("선택된 전표가 없습니다.")
			return false
		}
		const checkEmployeeId = rowNode.map((node: any) => node.checkEmployeeId)

		if (!checkEmployeeId.includes(getEmployeeId.value)) {
			message.error(
				`현재 ${type === "SEAL" ? "검인" : "반려"}할 수 없는 전표가 존재합니다.`
			)
			return false
		}

		return true
	}
	return false
}

/**
 * 일괄 반려
 * @param data
 */
const onReject = async (data: { comment: string }) => {
	if (gridApi?.value) {
		const rowNode = gridApi.value.getSelectedRows()

		const approvalHeaderIds = removeDuplicatesByKey(
			rowNode.map((node: any) => ({ id: node.approvalHeaderId })),
			"id"
		)

		rejectModalLoading.value = true
		await useCFetch<Response<any>>(`/api/v2/slips/managements/reject`, {
			method: "PATCH",
			body: {
				companyCode: getCompanyCode.value,
				approvalHeaderIds,
				comment: data.comment,
				loginEmployeeId: getEmployeeId.value,
			},
		})
			.then((response: Response<any>) => {
				if (response.status === 0) {
					showRejectModal.value = false
					rejectModalData.value.comment = ""
					message.success("반려 되었습니다.")
					slipsRefresh()
				}
			})
			.finally(() => (rejectModalLoading.value = false))
	}
}

/**
 * 일괄검인 버튼 Action
 */
const onBatchSeal = async (data: { comment: string }) => {
	if (gridApi?.value) {
		const rowNode = gridApi.value.getSelectedRows()

		const approvalHeaderIds = removeDuplicatesByKey(
			rowNode.map((node: any) => ({ id: node.approvalHeaderId })),
			"id"
		)

		batchModalLoading.value = true
		await useCFetch<Response<any>>(`/api/v2/slips/managements/check`, {
			method: "PATCH",
			body: {
				companyCode: getCompanyCode.value,
				approvalHeaderIds,
				comment: data.comment,
				loginEmployeeId: getEmployeeId.value,
			},
		})
			.then((response: Response<any>) => {
				if (response.status === 0) {
					showBatchModal.value = false
					batchModalData.value.comment = ""
					message.success("검인/확정되었습니다.")
					slipsRefresh()
				}
			})
			.finally(() => (batchModalLoading.value = false))
	}
}

/**
 * 검인자 변경 모달 Submit
 */
const isShowChangeChecker = () => {
	if (gridApi?.value) {
		const rowNode = gridApi.value.getSelectedRows()

		const approvalHeaderIds = rowNode.map((node: any) => ({ id: node.approvalHeaderId }))
		if (_isEmpty(approvalHeaderIds)) {
			message.error("선택된 전표가 없습니다.")
			return false
		}

		changeCheckerData.value.checker = undefined
		changeCheckerData.value.data = undefined

		return true
	}
	return false
}
const onChangeCheckerFinish = (data: any) => {
	formRef.value
		?.validate()
		.then(async () => {
			try {
				changeCheckerLoading.value = true
				return await new Promise((resolve, reject) => {
					// setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
					if (gridApi?.value) {
						const rowNode = gridApi.value.getSelectedRows()
						const approvalHeaderIds = removeDuplicatesByKey(
							rowNode.map((node: any) => ({ id: node.approvalHeaderId })),
							"id"
						)
						useCFetch<Response<any>>(`/api/v2/slips/managements/change`, {
							method: "PATCH",
							body: {
								companyCode: getCompanyCode.value,
								approvalHeaderIds,
								loginEmployeeId: getEmployeeId.value,
								checkEmployeeId: data.checker[0],
							},
						})
							.then((response: Response<any>) =>
								response.status === 0 ? resolve(response) : reject(response)
							)
							.catch((error: Response<any>) => reject(error))
					} else {
						reject({
							status: -1,
							data: { message: "gridApi is not defined" },
						})
					}
				}).then(() => {
					changeCheckerLoading.value = false
					message.success(
						`${changeCheckerData.value.data[0].name} ${changeCheckerData.value.data[0].gradeName}으로 검인자 변경이 완료되었습니다.`
					)
					slipsRefresh()
				})
			} catch {
				return (changeCheckerLoading.value = false)
			} finally {
				isChangeChecker.value = false
			}
		})
		.catch((error: Error) => {
			console.log("error", error)
		})
}

onMounted(() => {
	onGridDestroyed()
})

onBeforeRouteLeave(() => {
	showDocument.value = false
	slipFormId.value = undefined
	slipFormType.value = undefined

	showDetail.value = false

	showBatchModal.value = false
	batchModalData.value.comment = ""
	showRejectModal.value = false
	rejectModalData.value.comment = ""
	isTableCollapse.value = true
	isChangeChecker.value = false
	changeCheckerData.value.checker = undefined
	changeCheckerData.value.data = undefined
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				전표관리 권한을 가진 담당자는 내부기안이 완료된 전표를 검인/확정하거나 반려 할 수
				있습니다. 검인/확정은 설정된 검인라인 순서에 따라 진행되며 확정완료된 전표내역은
				‘전표확정내역’에서 목록을 확인할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row :gutter="[10, 15]" wrap>
				<a-col>
					<a-space>
						<label>기간설정</label>
						<a-range-picker
							v-model:value="searchParams.filterDate"
							picker="month"
							:value-format="dateTimeFormat"
							@change="onChangeRangePicker"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>검인자</span>
						<eacc-select-table
							:url="`/api/v2/slips/managements/commons/employees`"
							:params="{
								companyCode: searchParams.companyCode,
								joined: true,
							}"
							refresh
							v-model:value="searchParams.checkEmployeeIds"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name },
								{ title: '직위', data: (row: any) => row.gradeName },
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
								{ title: '회사', data: (row: any) => row.companyName },
								{ title: '사업장', data: (row: any) => row.workplaceName },
							]"
							@update:value="(value: any) => (searchParams.checkEmployeeId = value[0])"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>작성부서</span>
						<eacc-select-table
							url="/api/v2/slips/managements/commons/departments"
							:params="{
								companyCode: searchParams.companyCode,
								used: true,
							}"
							v-model:value="searchParams.departmentIds"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name },
								{ title: '직위', data: (row: any) => row.gradeName },
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
								{ title: '회사', data: (row: any) => row.companyName },
								{ title: '사업장', data: (row: any) => row.workplaceName },
							]"
							@update:value="(value: any) => (searchParams.departmentId = value[0])"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>작성자</span>
						<eacc-select-table
							:url="`/api/v2/slips/managements/commons/employees`"
							:params="{
								companyCode: searchParams.companyCode,
								joined: true,
							}"
							refresh
							v-model:value="searchParams.employeeIds"
							key-props="id"
							label-prop="name"
							:columns="[
								{ title: '이름', data: (row: any) => row.name },
								{ title: '직위', data: (row: any) => row.gradeName },
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
								{ title: '회사', data: (row: any) => row.companyName },
								{ title: '사업장', data: (row: any) => row.workplaceName },
							]"
							@update:value="(value: any) => (searchParams.employeeId = value[0])"
						/>
					</a-space>
				</a-col>
				<a-col>
					<a-space class="mr-lg">
						<span>전표상태</span>
						<a-select
							style="width: 20rem"
							v-model:value="searchParams.slipStatus"
							mode="multiple"
							placeholder="전표상태를 선택해주세요."
							:options="slipStatusOptions?.data"
							:max-tag-count="2"
						>
							<template #maxTagPlaceholder="omittedValues">
								<span>외 {{ omittedValues.length }}</span>
							</template>
						</a-select>
					</a-space>
					<a-space>
						<span>전표유형</span>
						<a-select
							style="width: 20rem"
							v-model:value="searchParams.slipType"
							mode="multiple"
							placeholder="전표유형을 선택해주세요."
							:options="slipTypeOptions?.data"
							:max-tag-count="2"
						>
							<template #maxTagPlaceholder="omittedValues">
								<span>외 {{ omittedValues.length }}</span>
							</template>
						</a-select>
					</a-space>
				</a-col>
				<a-col>
					<a-button
						:icon="materialIcons('mso', 'rotate_left')"
						@click="onReset"
						:loading="slipsStatus === 'pending'"
					>
						초기화
					</a-button>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						:loading="slipsStatus === 'pending'"
						@click="onSearch"
					/>
				</a-col>
			</a-row>

			<a-divider class="my-md" />

			<div :class="['grid-area', { expand: isExpand }]">
				<a-flex align="center" justify="space-between" class="mb-sm">
					<a-button
						:icon="materialIcons('mso', isExpand ? 'zoom_in_map' : 'zoom_out_map')"
						@click="onExpand"
					>
						{{ isExpand ? "축소" : "확대" }}
					</a-button>
					<a-space :size="5">
						<eacc-excel-button
							req-type="download"
							size="middle"
							label="엑셀다운로드"
							file-name="전표검인/확정"
							:data="slipsData?.data"
							:disabled="!slipsData?.data || slipsData?.data.length === 0"
						/>
						<a-button
							:icon="materialIcons('mso', 'person')"
							@click="() => (isChangeChecker = isShowChangeChecker())"
						>
							검인자 변경
						</a-button>
						<a-button
							danger
							:icon="materialIcons('mso', 'cancel')"
							@click="() => (showRejectModal = isCheckOpenModal('REJECT'))"
						>
							반려
						</a-button>
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'select_check_box')"
							@click="() => (showBatchModal = isCheckOpenModal('SEAL'))"
						>
							일괄 검인/확정
						</a-button>
						<a-select
							v-model:value="searchParams.size"
							:options="pageSizeOptions"
							value-field="key"
							text-field="label"
						/>
					</a-space>
				</a-flex>
				<iwx-grid
					:key="gridKey"
					group-display-type="custom"
					:grid-options="gridOptions"
					:row-data="slipsData?.data"
					:column-types="columnTypes"
					row-selection="multiple"
					:default-col-def="{ flex: 1, minWidth: 150 }"
					:column-defs="columnDefs"
					:get-row-style="getRowStyle"
					:group-default-expanded="-1"
					:class="`ag-theme-quartz custom`"
					:suppressColumnVirtualisation="true"
					:cell-selection="true"
					:suppress-menu-hide="true"
					:suppress-row-click-selection="true"
					:stop-editing-when-cells-lose-focus="false"
					:pagination="true"
					:pagination-page-size="searchParams.size"
					:pagination-page-size-selector="pageSizeOptions.map((item) => item.key)"
					:autoGroupColumnDef="{
						flex: 1,
						minWidth: 280,
						field: 'approvalNumber',
					}"
					@grid-ready="onGridReady"
					@column-moved="onColumnMoved"
					@column-resized="onColumnResized"
					@column-visible="onColumnVisible"
					@row-selected="onRowSelected"
					:locale-text="AG_GRID_LOCALE_KO"
				/>
			</div>
		</template>
		<template #modal>
			<!--  지출 상세 모달-->
			<eacc-slip-detail-modal
				v-if="gridApi"
				:show="showDetail"
				:expense-id="expenseId"
				:total="
					!isTableCollapse
						? (gridApi.getSelectedRows().length ?? 0)
						: (slipsData?.data.length ?? 0)
				"
				:slip-data="!isTableCollapse ? gridApi.getSelectedRows() : slipsData?.data"
				@update:show="
					(value: boolean) => {
						showDetail = value
					}
				"
			/>
			<!-- 결재문서 상세 모달 -->
			<document-preview-modal
				v-if="formId && slipFormType"
				:show="showDocument"
				:id="formId"
				:slip-type="compCase(slipFormType)"
				:completed="true"
				@update:show="
					(value) => {
						showDocument = value
						if (!value) {
							slipFormId = undefined
							slipFormType = undefined
						}
					}
				"
			/>
			<!-- 검인자 변경 모달 -->
			<field-modal
				title="검인자 변경"
				:showed="isChangeChecker"
				:field="changeCheckerData"
				:loading="changeCheckerLoading"
				cancel-text="취소"
				@closed="isChangeChecker = false"
				@submit="onChangeCheckerFinish"
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
								선택한 행의 검인자를 변경합니다.
							</a-typography-title>
							<a-typography-paragraph class="mb-none">
								결재문서내에 검인자 변경이력이 남습니다.
							</a-typography-paragraph>
						</div>
					</a-flex>

					<a-form ref="formRef" layout="vertical" :model="field">
						<a-form-item
							name="checker"
							label="변경할 검인자"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<eacc-select-table
								v-model:value="field.checker"
								key-props="id"
								label-prop="name"
								:url="`/api/v2/slips/managements/commons/employees`"
								:params="{
									companyCode: getCompanyCode,
									joined: true,
								}"
								:columns="[
									{ title: '이름', data: (row: any) => row.name },
									{ title: '직위', data: (row: any) => row.gradeName },
									{
										title: '부서',
										data: (row: any) => row.departmentName,
									},
									{ title: '회사', data: (row: any) => row.companyName },
									{ title: '사업장', data: (row: any) => row.workplaceName },
								]"
								@update:value="(value: any) => (field.checker = value)"
								@selection-change="(value: any) => (field.data = value)"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
			<!-- 반려 모달 -->
			<field-modal
				title="반려"
				:showed="showRejectModal"
				:field="rejectModalData"
				:loading="rejectModalLoading"
				cancel-text="취소"
				@closed="
					() => {
						showRejectModal = false
						isTableCollapse = true
					}
				"
				@submit="onReject"
				:size="isTableCollapse ? 'small' : 'large'"
			>
				<template #content="{ field }">
					<a-flex align="start" class="mb-lg" :gap="10">
						<component
							:is="materialIcons('mso', 'cancel')"
							class="text-error"
							style="font-size: 3rem"
						/>
						<div>
							<a-typography-title :level="4"> 전표를 반려하겠습니까? </a-typography-title>
							<a-typography-paragraph class="mb-none">
								결재문서내 모든 전표가 반려되며 기안자는 문서를 재기안 해야 합니다.
							</a-typography-paragraph>
						</div>
					</a-flex>

					<a-form
						label-align="left"
						:model="field"
						:wrapper-col="{
							offset: isTableCollapse ? 2 : 1,
							span: isTableCollapse ? 22 : 23,
						}"
						:label-col="{
							offset: isTableCollapse ? 2 : 1,
							span: isTableCollapse ? 22 : 23,
						}"
						:colon="false"
					>
						<a-form-item
							name="comment"
							label="반려의견"
							:rules="[{ required: false, message: '필수값 입니다.' }]"
						>
							<a-textarea
								class="fixed"
								allow-clear
								v-model:value="field.comment"
								show-count
								:auto-size="{
									minRows: 2,
									maxRows: 6,
									adjustOnResize: true,
									resize: 'none',
								}"
								placeholder="반려의견을 입력하세요."
								:maxlength="1000"
							>
							</a-textarea>
						</a-form-item>
					</a-form>
					<collapse-table
						v-if="gridApi"
						v-model:value="isTableCollapse"
						:row-data="gridApi.getSelectedRows()"
						:columns="modalColumns"
						title="검인반려될 전표 목록"
					></collapse-table>
				</template>
			</field-modal>

			<!-- 일괄 검인/확정 모달 -->
			<field-modal
				title="검인/확정"
				:showed="showBatchModal"
				:field="batchModalData"
				:loading="batchModalLoading"
				cancel-text="취소"
				@closed="
					() => {
						showBatchModal = false
						isTableCollapse = true
					}
				"
				@submit="onBatchSeal"
				:size="isTableCollapse ? 'small' : 'large'"
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
								검인/확정 하시겠습니까?
							</a-typography-title>
							<a-typography-paragraph class="mb-none">
								다음 검인자에게 검인을 요청합니다.<br />마지막 검인순서라면 전표는
								확정됩니다.
							</a-typography-paragraph>
						</div>
					</a-flex>

					<a-form
						label-align="left"
						:model="field"
						:wrapper-col="{
							offset: isTableCollapse ? 2 : 1,
							span: isTableCollapse ? 22 : 23,
						}"
						:label-col="{
							offset: isTableCollapse ? 2 : 1,
							span: isTableCollapse ? 22 : 23,
						}"
						:colon="false"
					>
						<a-form-item
							name="comment"
							label="검인의견"
							:rules="[{ required: false, message: '필수값 입니다.' }]"
						>
							<a-textarea
								class="fixed"
								allow-clear
								v-model:value="field.comment"
								show-count
								:auto-size="{
									minRows: 2,
									maxRows: 6,
									adjustOnResize: true,
									resize: 'none',
								}"
								placeholder="검인의견을 입력하세요."
								:maxlength="1000"
							>
							</a-textarea>
						</a-form-item>
					</a-form>
					<collapse-table
						v-if="gridApi"
						v-model:value="isTableCollapse"
						:row-data="gridApi.getSelectedRows()"
						:columns="modalColumns"
						title="검인확정될 전표 목록"
					></collapse-table>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
