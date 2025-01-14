<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { iwxGrid } from "@iwx/ui"
import type {
	GroupCellRendererParams,
	IServerSideGetRowsParams,
	GridApi,
	GridOptions,
	ICellRendererParams,
	ValueFormatterParams,
	GridReadyEvent,
	RowSpanParams,
	CellClassParams,
} from "@iwx/ui"
import type { RadioChangeEvent } from "ant-design-vue"
import { Link, IconLink, Badge, ColorTag } from "@/components/ui"
import {
	type DataType,
	options,
	columnTypes,
	getRowStyle,
	TSlipSearch,
	SlipActivityType,
	ISlipsDataType,
} from "@/types/slips/list"
import {
	Code,
	createSearchParams,
	dateTimeFormat,
	RequestParams,
	Response,
} from "@/types"

const authStore = useAuthStore()
const { getCompanyCode, getCompanyId, getWorkplaceCode, getCostCenterId, getEmployeeId } =
	storeToRefs(authStore)

const searchParams = defineModel<
	ReturnType<typeof createSearchParams<RequestParams<TSlipSearch>, "ISlipSearch">>
>("searchParams", { required: true })

type PropsDataType = {
	data: Response<Array<any>>
	pending: boolean
	activeKey: Ref<SlipActivityType>
	slipStatusOptions: Array<Code>
	slipTypeOptions: Array<Code>
	slipProject: Array<Code>
}
const {
	data: lineData,
	pending,
	activeKey,
	slipStatusOptions,
	slipTypeOptions,
} = defineProps<PropsDataType>()

const emit = defineEmits<{
	(
		e: "update:searchParams",
		value: RequestParams<TSlipSearch>
	): RequestParams<TSlipSearch>
	(e: "onDetail", value: { row: any; total: number }): void
	(e: "onDocument", value: any): void
	(e: "refresh"): void
	(e: "reset"): void
}>()

const isExpand = ref<boolean>(false)
const isTotalChecked = ref<boolean>(true)

const monthType = ref<number | undefined>(undefined)

const gridApi = shallowRef<GridApi<DataType>>()
const gridKey = ref(0)

const gridOptions = {
	overlayLoadingTemplate:
		'<span class="ag-overlay-loading-center">데이터를 불러오는 중입니다.</span>',
	suppressRowTransform: true,
}

const onGridDestroyed = () => {
	gridKey.value++
}

// const pinnedBottomRowData = ref<GridOptions<DataType>["pinnedBottomRowData"]>([])

const { getColumns, setColumns } = useAgGridColumn()
const defaultColDef = ref({
	filter: true,
	sortable: true,
	// flex: 1,
	minWidth: 150,
})
const columnDefs = ref<GridOptions<DataType>["columnDefs"]>([
	{
		field: "group",
		headerName: "프로젝트",
		minWidth: 200,
		pinned: "left",
		showRowGroup: true,
		cellRenderer: "agGroupCellRenderer",
		cellStyle: { fontWeight: 700 },
		cellRendererParams: {
			suppressPadding: true,
			totalValueGetter: (params: GroupCellRendererParams) => {
				return `${params.value} 소계`
			},
		},
	},
	{ field: "projectName", headerName: "프로젝트", rowGroup: true, hide: true },
	{
		field: "slipNumber",
		headerName: "전표번호",
		rowSpan: (params: RowSpanParams<DataType>) => {
			if (params.data?.slipNumber) {
				let count = 1
				let currentRowIndex = params.node?.rowIndex ?? 0

				// 현재 행이 그룹의 첫 번째 행인 경우에만 rowSpanStartIndex를 설정 그렇지 않다면 -1 값으로 매칭되지 않도록 세팅
				if (
					currentRowIndex === 0 ||
					params.api.getDisplayedRowAtIndex(currentRowIndex - 1)?.data?.slipNumber !==
						params.data.slipNumber
				) {
					params.data.rowSpanStartIndex = currentRowIndex
				} else {
					params.data.rowSpanStartIndex = -1
				}

				while (true) {
					const nextRow = params.api.getDisplayedRowAtIndex(currentRowIndex + count)
					if (!nextRow || nextRow.data?.slipNumber !== params.data.slipNumber) {
						break
					}
					count++
				}

				params.data.rowSpan = count
				return count
			}
			return 1
		},
		cellClassRules: {
			"cell-span": (params: CellClassParams<DataType>) => {
				const rowSpan = params.data?.rowSpan ?? 0
				return !!rowSpan && rowSpan > 1
			},
		},
		cellRenderer: Link,
		cellRendererParams: (params: ICellRendererParams) => {
			const rowSpanStartIndex = params.data?.rowSpanStartIndex ?? 0
			if (params.node.rowIndex !== rowSpanStartIndex) {
				return {
					params: undefined,
				} // 병합된 셀의 첫 번째 행이 아닌 경우 빈 문자열 반환
			}
			return {
				params,
				text: params.value,
				onClick: (params: DataType) => {
					emit("onDetail", { row: params, total: lineData.data?.length || 0 })
				},
			}
		},
	},
	{
		field: "slipTypeName",
		headerName: "전표유형",
		cellRenderer: ColorTag,
		rowSpan: (params: RowSpanParams<DataType>) => {
			if (params.data?.slipNumber) {
				let count = 1
				let currentRowIndex = params.node?.rowIndex ?? 0

				// 현재 행이 그룹의 첫 번째 행인 경우에만 rowSpanStartIndex를 설정 그렇지 않다면 -1 값으로 매칭되지 않도록 세팅
				if (
					currentRowIndex === 0 ||
					params.api.getDisplayedRowAtIndex(currentRowIndex - 1)?.data?.slipNumber !==
						params.data.slipNumber
				) {
					params.data.rowSpanStartIndex = currentRowIndex
				} else {
					params.data.rowSpanStartIndex = -1
				}

				while (true) {
					const nextRow = params.api.getDisplayedRowAtIndex(currentRowIndex + count)
					if (!nextRow || nextRow.data?.slipNumber !== params.data.slipNumber) {
						break
					}
					count++
				}

				params.data.rowSpan = count
				return count
			}
			return 1
		},
		cellClassRules: {
			"cell-span": (params: CellClassParams<DataType>) => {
				const rowSpan = params.data?.rowSpan ?? 0
				return !!rowSpan && rowSpan > 1
			},
		},
		cellRendererParams: (params: ICellRendererParams) => {
			const rowSpan = params.data?.rowSpan ?? 0
			const rowSpanStartIndex = params.data?.rowSpanStartIndex ?? 0
			if (params.node.rowIndex !== rowSpanStartIndex) {
				return null // 병합된 셀의 첫 번째 행이 아닌 경우 빈 문자열 반환
			}
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
	{
		field: "slipEvidenceTypeLabel",
		headerName: "증빙유형",
		rowSpan: (params: RowSpanParams<DataType>) => {
			if (params.data?.slipNumber) {
				let count = 1
				let currentRowIndex = params.node?.rowIndex ?? 0

				// 현재 행이 그룹의 첫 번째 행인 경우에만 rowSpanStartIndex를 설정 그렇지 않다면 -1 값으로 매칭되지 않도록 세팅
				if (
					currentRowIndex === 0 ||
					params.api.getDisplayedRowAtIndex(currentRowIndex - 1)?.data?.slipNumber !==
						params.data.slipNumber
				) {
					params.data.rowSpanStartIndex = currentRowIndex
				} else {
					params.data.rowSpanStartIndex = -1
				}

				while (true) {
					const nextRow = params.api.getDisplayedRowAtIndex(currentRowIndex + count)
					if (!nextRow || nextRow.data?.slipNumber !== params.data.slipNumber) {
						break
					}
					count++
				}

				params.data.rowSpan = count
				return count
			}
			return 1
		},
		cellClassRules: {
			"cell-span": (params: CellClassParams<DataType>) => {
				const rowSpan = params.data?.rowSpan ?? 0
				return !!rowSpan && rowSpan > 1
			},
		},
		cellRenderer: (params: ICellRendererParams) => {
			const rowSpan = params.data?.rowSpan ?? 0
			const rowSpanStartIndex = params.data?.rowSpanStartIndex ?? 0
			if (params.node.rowIndex !== rowSpanStartIndex) {
				return "" // 병합된 셀의 첫 번째 행이 아닌 경우 빈 문자열 반환
			}
			if (params.data?.divisionSlipFlag) {
				return `${params.value} 분할`
			}
			if (params.value == null) return ""
			return params.value
		},
	},
	{ field: "accountingDate", type: "date", headerName: "사용일자" },
	{ field: "writerName", headerName: "작성자" },
	{ field: "employeeName", headerName: "사용자" },
	{ field: "evidenceVendorName", headerName: "증빙거래처" },
	{ field: "paymentVendorName", headerName: "지급거래처" },
	{
		field: "krwTotalAmount",
		headerName: "총금액",
		type: "currency",
		cellRenderer: (params: ICellRendererParams) => {
			if (!isTotalChecked.value && params.node.group) {
				return ""
			}
			if (params.value == null) return ""
			return params.value.toLocaleString("ko-KR")
		},
	},
	{
		field: "krwSupplyAmount",
		headerName: "공급가액",
		type: "currency",
		cellRenderer: (params: ICellRendererParams) => {
			if (!isTotalChecked.value && params.node.group) {
				return ""
			}
			if (params.value == null) return ""
			return params.value.toLocaleString("ko-KR")
		},
	},
	{
		field: "krwTaxAmount",
		headerName: "부가세",
		type: "currency",
		cellRenderer: (params: ICellRendererParams) => {
			if (!isTotalChecked.value && params.node.group) {
				return ""
			}
			if (params.value == null) return ""
			return params.value.toLocaleString("ko-KR")
		},
		valueParser: (params) => {
			const parsedValue = params.newValue.replace(/,/g, "")
			return Number(parsedValue || 0)
		},
		valueFormatter: (params: ValueFormatterParams) => {
			if (params.value == null) return "0"
			return params.value.toLocaleString("ko-KR")
		},
	},
	{ field: "account", headerName: "계정/비용과목" },
	{ field: "costCenterName", headerName: "코스트센터" },
	{
		field: "slipStatusName",
		headerName: "상태",
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
	{ field: "description", headerName: "내용" },
	{ field: "approvalNumber", headerName: "결재문서번호" },
	{
		field: "approvalHeaderId",
		headerName: "결재문서",
		cellStyle: { textAlign: "center" },
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = "edit_square"
			return {
				params,
				icon,
				onClick: (params: any) => {
					emit("onDocument", params)
				},
			}
		},
	},
	// { field: "cardApprovalDate", headerName: "카드승인일시" },
	// { field: "cardApprovalNo", headerName: "카드승인번호" },
	{
		field: "costCenterName",
		headerName: "코스트센터",
	},
])

const calculateTotalAmount = (data: any, value: string): number => {
	return data.reduce((total: number, item: any) => total + item[value], 0)
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onReset = () => {
	monthType.value = undefined

	emit("reset")
}
const onSearch = () => {
	emit("refresh")
}

const onGridReady = async (params: GridReadyEvent<DataType>) => {
	gridApi.value = params.api

	const savedColumnState = await Promise.race([getColumns("slipsProjectColumnState")])
	if (savedColumnState) {
		gridApi.value!.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

const onColumnVisible = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsProjectColumnState", columnState)
}

const onColumnResized = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsProjectColumnState", columnState)
}

const onColumnMoved = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsProjectColumnState", columnState)
}

const changeMonth = (e: RadioChangeEvent) => {
	const from = e.target.value === 0 ? useMonth.lastFrom() : useMonth.from()
	const to = e.target.value === 0 ? useMonth.lastTo() : useMonth.to()

	searchParams.value.filterDate = [from, to]
	searchParams.value.searchDateFrom = from.format("YYYY-MM-DD")
	searchParams.value.searchDateTo = to.format("YYYY-MM-DD")
}

onMounted(() => {
	if (pending) {
		gridApi.value?.setGridOption("loading", true)
	}
})

watch(
	() => pending,
	(isLoading) => {
		if (isLoading) {
			gridApi.value?.setGridOption("loading", true)
		} else {
			gridApi.value?.setGridOption("loading", false)
		}
	},
	{ immediate: true }
)

watch(
	() => isTotalChecked.value,
	(flag) => {
		if (gridApi.value) {
			gridApi.value.redrawRows()
		}
	}
)

defineExpose({
	onGridDestroyed,
})
</script>
<template>
	<a-descriptions
		class="search-area mb-md"
		size="small"
		bordered
		:column="{ xxl: 6, xl: 3, lg: 3, md: 3, sm: 1.5, xs: 1 }"
		:label-style="{ width: '12rem' }"
	>
		<template #extra>
			<a-space :size="5">
				<a-button
					:icon="materialIcons('mso', 'rotate_left')"
					@click="onReset"
					:loading="pending"
				>
					초기화
				</a-button>
				<eacc-button
					component-is="search"
					size="middle"
					:modal-open="false"
					:data="searchParams"
					:loading="pending"
					@click="onSearch"
				/>
			</a-space>
		</template>
		<a-descriptions-item label="기간설정" :span="3">
			<a-space :wrap="true" :size="5">
				<a-range-picker
					v-model:value="searchParams.filterDate"
					:value-format="dateTimeFormat"
					@change="
						(_, dateString) => {
							searchParams.searchDateFrom = dateString[0]
							searchParams.searchDateTo = dateString[1]
						}
					"
				/>
				<a-radio-group
					class=""
					v-model:value="monthType"
					option-type="button"
					:options="[
						{ label: '전월', value: 0 },
						{ label: '당월', value: 1 },
					]"
					@change="changeMonth"
				/>
			</a-space>
		</a-descriptions-item>
		<a-descriptions-item label="사업장" :span="1">
			<eacc-select-table
				url="/api/v2/slips/managements/commons/companies"
				:params="{
					code: searchParams.companyCode,
					placeType: 'WORKPLACE',
					parentId: getCompanyId,
				}"
				v-model:value="searchParams.workplaceCodes"
				key-props="workplaceCode"
				label-prop="workplaceName"
				:columns="[
					{ title: '회사', data: (row: any) => row.name },
					{ title: '사업장명', data: (row: any) => row.workplaceName },
					{ title: '유형', data: (row: any) => row.placeTypeLabel },
				]"
				@update:value="(value: any) => (searchParams.workplaceCode = value[0])"
			/>
		</a-descriptions-item>
		<a-descriptions-item label="부서" :span="1">
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
		</a-descriptions-item>
		<a-descriptions-item label="코스트센터" :span="1">
			<eacc-select-table
				url="/api/v2/slips/managements/commons/costCenters"
				:params="{
					companyCode: searchParams.companyCode,
					used: true,
				}"
				v-model:value="searchParams.costCenterIds"
				key-props="id"
				label-prop="workplaceName"
				:columns="[
					{
						title: '코스트센터',
						data: (row: any) => row.workplaceName,
					},
				]"
				@update:value="(value: any) => (searchParams.costCenterId = value[0])"
			/>
		</a-descriptions-item>

		<a-descriptions-item label="프로젝트" :span="2">
			<a-select
				style="width: 100%"
				v-model:value="searchParams.projectIds"
				mode="multiple"
				placeholder="프로젝트를 선택해주세요."
				:options="slipProject"
				:max-tag-count="1"
			>
				<template #maxTagPlaceholder="omittedValues">
					<span>외 {{ omittedValues.length }}</span>
				</template>
			</a-select>
		</a-descriptions-item>
		<a-descriptions-item label="사용자" :span="1">
			<eacc-select-table
				url="/api/v2/slips/managements/commons/employees"
				:params="{
					companyCode: searchParams.companyCode,
					joined: true,
				}"
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
		</a-descriptions-item>
		<a-descriptions-item label="계정/비용항목" :span="1">
			<eacc-select-table
				url="/api/v2/slips/managements/commons/accounts"
				:params="{
					companyCode: searchParams.companyCode,
					used: true,
				}"
				v-model:value="searchParams.accountIds"
				key-props="id"
				label-prop="name"
				:columns="[
					{ title: '계정명', data: (row: any) => row.name },
					{ title: '계정레벨', data: (row: any) => row.accountLevelLabel },
					{ title: '계정유형', data: (row: any) => row.accountGroupTypeLabel },
					{
						title: '설명',
						data: (row: any) => row.description,
					},
				]"
				@update:value="(value: any) => (searchParams.accountId = value[0])"
			/>
		</a-descriptions-item>
		<a-descriptions-item label="지급거래처" :span="1">
			<a-input v-model:value="searchParams.paymentVendorName" />
		</a-descriptions-item>
		<a-descriptions-item label="증빙거래처" :span="1">
			<a-input v-model:value="searchParams.evidenceVendorName" />
		</a-descriptions-item>

		<a-descriptions-item
			label="전표유형"
			:span="3"
			:content-style="{ 'min-width': '50rem', 'max-width': '50rem' }"
		>
			<a-select
				style="width: 100%"
				v-model:value="searchParams.slipType"
				mode="multiple"
				placeholder="전표유형을 선택해주세요."
				:options="slipTypeOptions"
				:max-tag-count="5"
			>
				<template #maxTagPlaceholder="omittedValues">
					<span>외 {{ omittedValues.length }}</span>
				</template>
			</a-select>
		</a-descriptions-item>
		<a-descriptions-item
			label="전표상태"
			:span="3"
			:content-style="{ 'max-width': '50rem' }"
		>
			<a-select
				style="width: 100%"
				v-model:value="searchParams.slipStatus"
				mode="multiple"
				placeholder="전표상태를 선택해주세요."
				:options="slipStatusOptions"
				:max-tag-count="7"
			>
				<template #maxTagPlaceholder="omittedValues">
					<span>외 {{ omittedValues.length }}</span>
				</template>
			</a-select>
		</a-descriptions-item>
	</a-descriptions>

	<div :class="['grid-area', { expand: isExpand }]">
		<a-flex align="center" justify="space-between" class="mb-sm">
			<a-space :size="5">
				<a-button
					:icon="materialIcons('mso', isExpand ? 'zoom_in_map' : 'zoom_out_map')"
					@click="onExpand"
				>
					{{ isExpand ? "축소" : "확대" }}
				</a-button>
				<a-checkbox v-model:checked="isTotalChecked">소계,총계 표시</a-checkbox>
			</a-space>
			<a-space :size="5">
				<a-button :icon="materialIcons('mso', 'receipt_long')">영수증인쇄</a-button>
				<a-button :icon="materialIcons('mso', 'description')">보고서 인쇄</a-button>
				<eacc-excel-button
					req-type="download"
					size="middle"
					label="엑셀다운로드"
					file-name="전표내역조회(프로젝트)"
					:data="lineData.data"
					:disabled="!lineData.data || lineData.data.length === 0"
				/>
			</a-space>
		</a-flex>

		<iwx-grid
			ref="columnApi"
			:key="gridKey"
			group-display-type="custom"
			:group-total-row="isTotalChecked ? 'bottom' : null"
			:grid-options="gridOptions"
			:row-data="lineData.data"
			:column-types="columnTypes"
			:default-col-def="defaultColDef"
			:column-defs="columnDefs"
			:get-row-style="getRowStyle"
			:group-default-expanded="-1"
			:class="`ag-theme-quartz custom`"
			:suppressColumnVirtualisation="true"
			:pinned-bottom-row-data="
				isTotalChecked
					? [
							{
								group: '총계',
								krwTotalAmount: calculateTotalAmount(lineData.data, 'krwTotalAmount'),
								krwSupplyAmount: calculateTotalAmount(lineData.data, 'krwSupplyAmount'),
								krwTaxAmount: calculateTotalAmount(lineData.data, 'krwTaxAmount'),
							},
						]
					: []
			"
			:cell-selection="true"
			:suppress-menu-hide="true"
			:stop-editing-when-cells-lose-focus="false"
			:pagination="false"
			:autoGroupColumnDef="{
				flex: 1,
				minWidth: 280,
				field: 'projectName',
			}"
			@grid-ready="onGridReady"
			@column-moved="onColumnMoved"
			@column-resized="onColumnResized"
			@column-visible="onColumnVisible"
			:locale-text="AG_GRID_LOCALE_KO"
		/>
	</div>
</template>
