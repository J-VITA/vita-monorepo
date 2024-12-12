<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { iwxGrid } from "@iwx/ui"
import type {
	GroupCellRendererParams,
	IServerSideGetRowsParams,
	GridApi,
	GridOptions,
	ICellRendererParams,
} from "@iwx/ui"
import type { TreeSelectProps, RadioChangeEvent } from "ant-design-vue"
import type { Dayjs } from "dayjs"
import { Link, IconLink, Badge, ColorTag } from "@/components/ui"
import {
	type DataType,
	type SearchParams,
	options,
	columnTypes,
	getRowStyle,
	getData,
} from "./list"

const emit = defineEmits<{
	(e: "onDetail", value: { row: any; total: number }): void
	(e: "onDocument", value: any): void
}>()

const isExpand = ref<boolean>(false)
const filterDate = ref<[Dayjs, Dayjs]>()
const searchParams = ref<SearchParams>({
	startDate: "",
	endDate: "",
	// workplaceCode: '전체',
	costCenter: undefined,
	accountCostItem: undefined,
	user: "전체",
	storeName: "",
	expenditureType: [],
	state: [],
	size: 10,
})

const monthType = ref<number | undefined>(undefined)
const costCenterTreeData = ref<TreeSelectProps["treeData"]>([])
const accountData = ref<any[]>([])

const gridApi = shallowRef<GridApi<DataType>>()
let columnApi: any = null
const pinnedBottomRowData = ref<GridOptions<DataType>["pinnedBottomRowData"]>([])

const { getColumns, setColumns } = useAgGridColumn()
const columnDefs = ref<GridOptions<DataType>["columnDefs"]>([
	{
		field: "group",
		headerName: "코스트센터",
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
	{
		field: "costCenter",
		headerName: "코스트센터",
		rowGroup: true,
		hide: true,
	},
	{
		field: "slipNo",
		headerName: "전표번호",
		cellRenderer: Link,
		cellRendererParams: (params: ICellRendererParams) => {
			return {
				params,
				onClick: (params: DataType) => {
					emit("onDetail", { row: params, total: getData.length })
				},
			}
		},
	},
	{
		field: "expenditureType",
		headerName: "지출유형",
		cellRenderer: ColorTag,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = params.value
				? options.expense.filter((e) => e.value === params.value)[0].color
				: ""
			const text = params.value
				? options.expense.filter((e) => e.value === params.value)[0].label
				: ""
			return {
				params,
				color,
				text,
			}
		},
	},
	{ field: "useDate", headerName: "사용일자" },
	{ field: "author", headerName: "작성자" },
	{ field: "user", headerName: "사용자" },
	{ field: "store", headerName: "가맹점(거래처)" },
	{
		field: "totalAmount",
		headerName: "총금액",
		type: "currency",
	},
	{
		field: "supplyValue",
		headerName: "공급가액",
		type: "currency",
	},
	{
		field: "vat",
		headerName: "부가세",
		type: "currency",
	},
	{ field: "accountCostItem", headerName: "계정/비용과목" },
	{
		field: "status",
		headerName: "상태",
		cellRenderer: Badge,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = params.value
				? options.state.filter((e) => e.value === params.value)[0].color
				: ""
			const text = params.value
				? options.state.filter((e) => e.value === params.value)[0].label
				: ""
			return {
				params,
				color,
				text,
			}
		},
	},
	{ field: "description", headerName: "내용" },
	{ field: "paymentDocumentNo", headerName: "결재문서번호" },
	{
		field: "paymentDocumentNo",
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
	{ field: "cardApprovalDate", headerName: "카드승인일시" },
	{ field: "cardApprovalNo", headerName: "카드승인번호" },
	{ field: "project", headerName: "프로젝트" },
	{ field: "projectCode", headerName: "프로젝트코드" },
])
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const expenditureType = ref({
	indeterminate: false,
	checkAll: false,
	checkedList: [],
})
const state = ref({
	indeterminate: false,
	checkAll: false,
	checkedList: [],
})

const calculateTotalAmount = (data: any, value: string): number => {
	return data.reduce((total: number, item: any) => total + item[value], 0)
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onReset = () => {
	console.log("onSearch searchParams.value:", searchParams.value)
}
const onSearch = () => {
	console.log("onSearch searchParams.value:", searchParams.value)
}

const onGridReady = async (params: any) => {
	gridApi.value = params.api
	columnApi = params.columnApi

	const datasource = {
		getRows: async (params: IServerSideGetRowsParams) => {
			params.success({
				rowData: getData,
			})

			pinnedBottomRowData.value = [
				{
					group: "총계",
					totalAmount: calculateTotalAmount(getData, "totalAmount"),
					supplyValue: calculateTotalAmount(getData, "supplyValue"),
					vat: calculateTotalAmount(getData, "vat"),
				},
			]
		},
	}

	gridApi.value!.setGridOption("serverSideDatasource", datasource)
	const savedColumnState = await Promise.race([getColumns("slipsCostColumnState")])
	if (savedColumnState) {
		gridApi.value!.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

const onColumnVisible = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsCostColumnState", columnState)
}

const onColumnResized = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsCostColumnState", columnState)
}

const onColumnMoved = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("slipsCostColumnState", columnState)
}

const changeMonth = (e: RadioChangeEvent) => {
	const from = e.target.value === 0 ? useMonth.lastFrom() : useMonth.from()
	const to = e.target.value === 0 ? useMonth.lastTo() : useMonth.to()

	filterDate.value = [from, to]
	searchParams.value.startDate = from.format("YYYY-MM-DD")
	searchParams.value.endDate = to.format("YYYY-MM-DD")
}

onMounted(() => {
	filterDate.value = [useMonth.lastFrom(), useMonth.to()]
	searchParams.value.startDate = useMonth.lastFrom().format("YYYY-MM-DD")
	searchParams.value.endDate = useMonth.to().format("YYYY-MM-DD")

	costCenterTreeData.value = [
		{
			label: "연구소",
			value: "1",
			children: [
				{ label: "연구소 1-1", value: "1-1", children: [] },
				{ label: "연구소 1-2", value: "1-2", children: [] },
			],
		},
		{
			label: "경영관리",
			value: "2",
			children: [],
		},
		{
			label: "R&D",
			value: "3",
			children: [],
		},
		{
			label: "사업부",
			value: "4",
			children: [],
		},
	]
	accountData.value = [
		{ label: "복리후생비[판관비]", value: "1" },
		{ label: "회의비", value: "1-1" },
		{ label: "식대", value: "1-2" },
		{ label: "시내교통비", value: "2" },
		{ label: "운송비", value: "3" },
	]
})

watch(
	() => state.value.checkedList,
	(val) => {
		state.value.indeterminate = !!val.length && val.length < options.state.length
		state.value.checkAll = val.length === options.state.length
	}
)
watch(
	() => expenditureType.value.checkedList,
	(val) => {
		expenditureType.value.indeterminate =
			!!val.length && val.length < options.expense.length
		expenditureType.value.checkAll = val.length === options.expense.length
	}
)
</script>
<template>
	<a-descriptions
		class="search-area mb-md"
		size="small"
		bordered
		:column="{ xxl: 3, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }"
		:label-style="{ width: '12rem' }"
	>
		<template #extra>
			<a-space :size="5">
				<a-button :icon="materialIcons('mso', 'rotate_left')" @click="onReset">
					초기화
				</a-button>
				<eacc-button
					component-is="search"
					size="middle"
					:modal-open="false"
					:data="searchParams"
					@click="onSearch"
				/>
			</a-space>
		</template>
		<a-descriptions-item label="기간설정">
			<a-space :wrap="true" :size="5">
				<a-range-picker
					v-model:value="filterDate"
					@change="
						(_, dateString) => {
							searchParams.startDate = dateString[0]
							searchParams.endDate = dateString[1]
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
		<a-descriptions-item label="사업장">
			<a-select></a-select>
			<!-- <eacc-select
        url="/api/v2/masters/commons/companies"
        v-model:value="searchParams.user"
        :field-names="{ label: 'name', value: 'id' }"
        @update:value="(value) => (searchParams.user = value)"
      /> -->
		</a-descriptions-item>

		<a-descriptions-item label="사용자">
			<eacc-select
				url="/api/v2/masters/commons/employees"
				v-model:value="searchParams.user"
				:field-names="{ label: 'name', value: 'id' }"
				@update:value="(value) => (searchParams.user = value)"
			/>
		</a-descriptions-item>
		<a-descriptions-item label="코스트센터">
			<a-tree-select
				multiple
				v-model:value="searchParams.costCenter"
				show-search
				:tree-line="true"
				:dropdown-style="dropdownStyle"
				placeholder="전체"
				allow-clear
				tree-default-expand-all
				:tree-data="costCenterTreeData"
				tree-node-filter-prop="label"
				:max-tag-count="2"
				@change="
					(value) => {
						console.log(value)
					}
				"
			>
				<template #maxTagPlaceholder="omittedValues">
					<span>외 {{ omittedValues.length }}</span>
				</template>
			</a-tree-select>
		</a-descriptions-item>
		<a-descriptions-item label="계정/비용항목">
			<a-select
				v-model:value="searchParams.accountCostItem"
				mode="multiple"
				placeholder="전체"
				:options="accountData"
				:max-tag-count="2"
			>
				<template #maxTagPlaceholder="omittedValues">
					<span>외 {{ omittedValues.length }}</span>
				</template>
			</a-select>
		</a-descriptions-item>
		<a-descriptions-item label="가맹점(거래처)">
			<a-input v-model:value="searchParams.storeName" />
		</a-descriptions-item>

		<a-descriptions-item label="지출유형">
			<a-space :wrap="true" :size="2">
				<a-checkbox
					v-model:checked="expenditureType.checkAll"
					:indeterminate="expenditureType.indeterminate"
					@change="
						(e: any) => {
							Object.assign(expenditureType, {
								checkedList: e.target.checked ? options.expense.map((e) => e.value) : [],
								indeterminate: false,
							})
							searchParams.expenditureType = expenditureType.checkedList
						}
					"
				>
					전체
				</a-checkbox>
				<a-checkbox-group
					v-model:value="expenditureType.checkedList"
					:options="options.expense"
					@change="(val: any) => (searchParams.expenditureType = val)"
				/>
			</a-space>
		</a-descriptions-item>
		<a-descriptions-item label="전표상태">
			<a-space :wrap="true" :size="2">
				<a-checkbox
					v-model:checked="state.checkAll"
					:indeterminate="state.indeterminate"
					@change="
						(e: any) => {
							Object.assign(state, {
								checkedList: e.target.checked ? options.state.map((e) => e.value) : [],
								indeterminate: false,
							})
							searchParams.state = state.checkedList
						}
					"
				>
					전체
				</a-checkbox>
				<a-checkbox-group
					v-model:value="state.checkedList"
					:options="options.state"
					@change="(val: any) => (searchParams.state = val)"
				/>
			</a-space>
		</a-descriptions-item>
	</a-descriptions>

	<div :class="['grid-area', { expand: isExpand }]">
		<a-flex align="center" justify="space-between" class="mb-sm">
			<a-button
				:icon="materialIcons('mso', isExpand ? 'zoom_in_map' : 'zoom_out_map')"
				@click="onExpand"
			>
				{{ isExpand ? "축소" : "확대" }}
			</a-button>
			<a-space :size="5">
				<a-button :icon="materialIcons('mso', 'receipt_long')">영수증인쇄</a-button>
				<a-button :icon="materialIcons('mso', 'description')">보고서 인쇄</a-button>
				<a-button :icon="materialIcons('mso', 'download')">엑셀다운로드</a-button>
			</a-space>
		</a-flex>

		<iwx-grid
			ref="columnApi"
			group-display-type="custom"
			group-total-row="bottom"
			row-model-type="serverSide"
			:column-types="columnTypes"
			:default-col-def="{ flex: 1, minWidth: 150 }"
			:column-defs="columnDefs"
			:get-row-style="getRowStyle"
			:group-default-expanded="-1"
			:class="`ag-theme-quartz custom`"
			:pinned-bottom-row-data="pinnedBottomRowData"
			:cell-selection="false"
			:suppress-menu-hide="true"
			:stop-editing-when-cells-lose-focus="false"
			:pagination="false"
			:cache-block-size="5"
			:autoGroupColumnDef="{
				flex: 1,
				minWidth: 280,
				field: 'costCenter',
			}"
			@grid-ready="onGridReady"
			@column-moved="onColumnMoved"
			@column-resized="onColumnResized"
			@column-visible="onColumnVisible"
		/>
	</div>
</template>
