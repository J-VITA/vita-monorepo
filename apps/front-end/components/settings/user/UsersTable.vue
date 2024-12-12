<script lang="ts" setup>
import { type UsersManagement, options } from "@/types/settings/user"
import type { Response } from "@/types"
import { iwxGrid } from "@iwx/ui"
import { Tags, Link, Badge } from "@/components/ui"

interface IUserSearch {
	companyCode?: string //회사코드
	workplaceCode?: number | string | undefined //
	keyword?: string | undefined //키워드
	page: number
	size: number
	employeeNumber?: string | undefined //사번
	name?: string | undefined //이름
	departmentName?: string | undefined //부서명
	titleName?: string | undefined //직책명
	positionName?: string | undefined //직위명
	roleCode?: string | undefined //권한코드
	roleName?: string | undefined //권한명
	memberStatusName?: string | undefined //상태코드
	memberStatusLabel?: string | undefined //상태명
	serveStatusTypeName?: string | undefined //재직상태코드
	serveStatusTypeLabel?: string | undefined //재직상태
	searchDateFrom?: string | undefined //가입일 범위: 시작
	searchDateTo?: string | undefined //가입일 범위: 종료
}

interface GetRowIdParams {
	data: any
	level: number
	parentKeys?: string[]
}

const props = withDefaults(
	defineProps<{
		// rowData: any;
		searchParams: IUserSearch
		sizeOption: Array<any>
		styles?: any
		theme?: string
	}>(),
	{
		theme: "alpine",
		styles: {},
	}
)

const { searchParams } = toRefs(props)
watch([searchParams.value], (value) => {
	if (value[0]) {
		refreshCache(undefined)
		allCheckedToDisabled()
	}
})

const rowModelType = ref("serverSide")
const cacheBlockSize = ref(10)
const { getColumns, setColumns } = useAgGridColumn()

const gridApi = ref<any>(null)
let columnApi: any = null

const gridKey = ref(0)

const onGridDestroyed = () => {
	gridKey.value++
}

const colDefs = ref([
	{
		field: "employee.name",
		headerName: "이름",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
		cellRenderer: Link,
		cellRendererParams: (params: any) => {
			return {
				params,
				onClick: (params: any) => emit("openModal", params),
			}
		},
	},
	{
		field: "loginId",
		headerName: "ID",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.dutyName",
		headerName: "직위",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.titleName",
		headerName: "직책",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.departmentName",
		headerName: "부서",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.mobileNumber",
		headerName: "연락처",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.phoneNumber",
		headerName: "회사전화",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.roleName",
		headerName: "권한",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.email",
		headerName: "이메일",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "employee.joinedDate",
		headerName: "입사일",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
		filter: false,
		// filter: 'agDateColumnFilter',
		// filterParams: {
		//   filterOptions: ['equals'],
		//   maxNumConditions: 1,
		// },
	},
	{
		field: "employee.leftDate",
		headerName: "퇴사일",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
		filter: false,
	},
	{
		field: "employee.employeeNumber",
		headerName: "사번",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
	},
	{
		field: "memberStatusName",
		headerName: "사용상태",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
		filter: false,
		cellRenderer: Badge,
		cellRendererParams: (params: any) => {
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
	{
		field: "employee.serveStatusTypeLabel",
		headerName: "재직상태",
		headerClass: "ag-center-header",
		cellClass: "ag-center-cell",
		filter: false,
		cellRenderer: Tags,
		cellRendererParams: (params: any) => ({
			...params,
			serveStatusType: params.data.employee.serveStatusTypeName,
		}),
	},
])

/**
 * 그리드 첫 컬럼에서만 체크박스 활성
 * @param params
 */
const isFirstColumn = (params: any): boolean => {
	var displayedColumns = params.api.getAllDisplayedColumns()
	var isFirstColumn = displayedColumns[0] === params.column
	return isFirstColumn
}

const gridOptions = {
	multiSortKey: "ctrl",
	getRowId: (params: GetRowIdParams) => {
		if (params.data.id != null) {
			return `${params.data.id}`
		}
		// 그룹 행의 경우 고유 ID 생성
		const groupKey = params.data[params.level]
		return `${params.parentKeys?.join("-") || ""}-${groupKey}`
	},
	rowModelType: rowModelType.value,
	rowSelection: {
		mode: "multiRow", // 또는 'singleRow'
		headerCheckbox: isFirstColumn,
		enableClickSelection: true,
	},
	columnDefs: [
		{
			checkboxSelection: isFirstColumn, // 필요한 경우
			// 다른 열 정의...
		},
	],
	// 다른 그리드 옵션...
}

const defaultColDef = ref({
	filter: false,
	sortable: true,
})

const emit = defineEmits<{
	(e: "rowSelected", value: Array<UsersManagement>): Array<UsersManagement>
	(e: "openModal", value: any): any
}>()

const { user } = useUsers()

/**
 * ag-grid ready (life cycle)
 * @param params
 */
const onGridReady = async (params: any) => {
	gridApi.value = params.api
	columnApi = params.columnApi

	console.log(params)
	console.log(gridApi.value)

	const datasource = {
		getRows: async (params: any) => {
			console.log("params.request ", params.request)
			try {
				const res = await user({
					keyword: props.searchParams.keyword || undefined,
					departmentName: props.searchParams.departmentName || undefined,
					companyCode: props.searchParams.companyCode,
					workplaceCode: props.searchParams.workplaceCode || undefined,
					memberStatus: props.searchParams.memberStatusName || undefined,
					serveStatusType: props.searchParams.serveStatusTypeName || undefined,
					name: props.searchParams.name || undefined,
					employeeNumber: props.searchParams.employeeNumber || undefined,
					positionName: props.searchParams.positionName || undefined,
					titleName: props.searchParams.titleName || undefined,
					searchDateFrom: props.searchParams.searchDateFrom || undefined,
					searchDateTo: props.searchParams.searchDateTo || undefined,
					page: params.request.startRow / props.searchParams.size,
					size: props.searchParams.size,
					sort: params.request.sortModel.map((x: any) => `${x.colId},${x.sort}`),
				})

				params.success({
					rowData: res.data,
					rowCount: res.totalElements,
				})
			} catch (e) {
				params.fail()
			}
		},
	}

	gridApi.value.setGridOption("serverSideDatasource", {
		...datasource,
		gridOptions,
	})

	const savedColumnState = await Promise.race([getColumns("userColumnState")])
	if (savedColumnState) {
		gridApi.value.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

/**
 * 컬럼 위치 이동 이벤트
 * @param event
 */
const onColumnMoved = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("userColumnState", columnState)
}

/**
 * 컬럼 정렬 이벤트
 * @param event
 */
const onSortChanged = (event: any) => {
	// const columnState = event.api.getColumnState();
	// setColumns('userColumnState', columnState);
}

/**
 * 컬럼 사이즈 이벤트
 * @param event
 */
const onColumnResized = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("userColumnState", columnState)
}

/**
 * 컬럼 Visible 이벤트
 * @param event
 */
const onColumnVisible = (event: any) => {
	const columnState = event.api.getColumnState()
	setColumns("userColumnState", columnState)
}

/**
 * 그리드 변수 변경 이벤트
 * @param event
 */
const onCellValueChanged = (params: any) => {
	const field = params.colDef.field
	console.log("onCellValueChanged", field)
}

const refreshCache = (route?: any) => {
	gridApi.value.refreshServerSide({ route: route, purge: true })
}

const allCheckedToDisabled = () => {
	gridApi.value.deselectAll()
}
const selectedRows = ref<Array<UsersManagement>>([])
/**
 * * Grid Checkbox Selection
 * * 선택되어진 값에 대한
 * @param {*} params
 */
const onRowSelected = (params: any) => {
	console.log("params : ", params)
	const rowNode = params.node
	const isSelected = rowNode.isSelected()
	const rowData = rowNode.data
	if (isSelected) {
		selectedRows.value.push(rowNode.data)
	} else {
		const index = selectedRows.value.findIndex((row) => row.id === rowData.id)
		if (index > -1) {
			selectedRows.value.splice(index, 1)
		}
	}

	emit("rowSelected", selectedRows.value)
}

defineExpose({
	onGridDestroyed,
})
</script>

<template>
	<iwx-grid
		id="columnApi"
		:key="gridKey"
		:col-defs="colDefs"
		:style="props.styles"
		:default-col-def="defaultColDef"
		:class="`ag-theme-quartz custom`"
		:options="gridOptions"
		@column-moved="onColumnMoved"
		@sort-changed="onSortChanged"
		@column-resized="onColumnResized"
		@column-visible="onColumnVisible"
		@grid-ready="onGridReady"
		@cell-value-changed="onCellValueChanged"
		:cell-selection="true"
		:suppress-menu-hide="true"
		:stop-editing-when-cells-lose-focus="false"
		:row-model-type="rowModelType"
		:pagination="true"
		:pagination-page-size="props.searchParams.size"
		:pagination-page-size-selector="props.sizeOption.map((item) => item.key)"
		:cacheBlockSize="cacheBlockSize"
		@row-selected="onRowSelected"
		:locale-text="AG_GRID_LOCALE_KO"
	>
	</iwx-grid>
</template>

<style lang="scss">
//@import '@vuestic/ag-grid-theme';
</style>
