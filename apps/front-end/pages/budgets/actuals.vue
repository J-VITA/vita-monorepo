<script setup lang="ts">
import type { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { type FormData, calculateTotalAmount } from "@/types/approvals/document"
import type { GridApi, GridOptions } from "@iwx/ui"
import { Link } from "@/components/ui"
import { Search, BudgetActualFormData, BudgetActualDetailData } from "@/types/budgets"
import { type Response, pageSizeOptions, dateTimeFormat } from "@/types"
import type { FormInstance } from "ant-design-vue"
import { iwxGrid } from "@iwx/ui"
import budgetActualsDetailModal from "~/components/budgets/budgetActualsDetailModal.vue"

definePageMeta({
	name: "예산실적내역",
})

const { getColumns } = useAgGridColumn()
const authStore = useAuthStore()
const {
	getCompanyCode,
	getWorkplaceId,
	getWorkplaceCode,
	getRole,
	getEmployeeId,
	getCostCenterId,
} = storeToRefs(authStore)

const lastMonth = dayjs(`${useMonth.toDay().year()}-${useMonth.toDay().month()}`)
const filterDate = ref<[Dayjs, Dayjs]>([lastMonth, useMonth.to()])
const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
const paginationParam = ref({
	pageNum: 0,
	size: 10,
	totalElement: 0,
	currentPage: 0,
})
const isExpand = ref<boolean>(false)
const actualModal = ref<boolean>(false)
const rowModelType = ref("serverSide")
const cacheBlockSize = ref(10)
const budgetActualsData = ref<Array<BudgetActualFormData>>()
const actualDetailData = ref<Array<BudgetActualDetailData>>([])
const gridApi = ref<any>(null)
let columnApi: any = null
const defaultColDef = ref({
	filter: false,
	sortable: true,
})

const gridOptions: GridOptions<any> = {
	paginationPageSize: 10,
	suppressContextMenu: true, // 컬럼 오른쪽 메뉴 hidden
	groupDisplayType: "groupRows",
	groupRowRenderer: "agGroupCellRenderer",
	groupDefaultExpanded: 1,
	getRowStyle: (params: any) => {
		if (params.data && params.data.isSubtotal) {
			return { backgroundColor: "#FDFFEA", fontWeight: 700 }
		}
	},
	columnTypes: {
		default: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-center-cell",
			suppressHeaderMenuButton: true,
			flex: 1,
		},
		action: {
			headerClass: "ag-center-header bold",
			cellClass: "ag-center-cell",
			suppressHeaderMenuButton: true,
			width: 90,
		},
	},
}

const searchParams = ref<Search>({
	companyName: undefined,
	companyCode: undefined,
	searchDateFrom: dayjs(filterDate.value[0]).format("YYYY-MM"),
	searchDateTo: dayjs(filterDate.value[1]).format("YYYY-MM"),
	workplaceCode: getWorkplaceCode.value,
	workplaceName: undefined,
	costCenterId: undefined,
	costCenterName: undefined,
	accountId: undefined,
	accountName: undefined,
	accountParentId: undefined,
	accountParentName: undefined,
	page: 0,
	size: 10,
	sort: [],
})

const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "yearMonth",
		headerName: "년월",
		type: "default",
	},
	{
		field: "companyName",
		headerName: "회사",
		type: "default",
	},
	{
		field: "workplaceName",
		headerName: "사업장",
		type: "default",
	},
	{
		field: "costCenterName",
		headerName: "코스트센터",
		type: "default",
	},
	{
		field: "accountId",
		headerName: "계정/비용항목명",
		type: "default",
		cellRenderer: Link,
		cellRendererParams: (params: any) => {
			if (!!params.data.budgetAccount) {
				const accountParentsName = params.data.budgetAccount.parentName || ""
				const accountName = params.data.budgetAccount.name || ""
				const accountValue = `${accountParentsName} > ${accountName}`

				return {
					onClick: (params: any) => onOpenActualModal(params, true),
					data: params.data,
					text: accountValue,
				}
			}
		},
	},
	{
		field: "initialBudget",
		headerName: "기초예산편성",
		type: "default",
		valueFormatter: (params: any) => {
			const value = params.value
			if (value == null || value === "") return ""
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
	},
	{
		field: "adjustmentAmount",
		headerName: "예산증감액",
		type: "default",
		valueFormatter: (params: any) => {
			if (!params.value) return
			let value: string = params.value
			let splitValue: string[] = []
			let signValue: string = ""
			if (value == null || value === "") return ""
			if (value.includes("-")) {
				splitValue = value.split("-")
				signValue = "-"
				value = splitValue[1]
			}
			return signValue + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
	},
	{
		field: "finalBudget",
		headerName: "최종예산",
		type: "default",
		valueFormatter: (params: any) => {
			const value = params.value
			if (value == null || value === "") return ""
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
	},
	{
		field: "actualUsage",
		headerName: "예산실적",
		type: "default",
		valueFormatter: (params: any) => {
			const value = params.value
			if (value == null || value === "") return ""
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
	},
	{
		field: "remainingBudget",
		headerName: "잔여예산",
		type: "default",
		valueFormatter: (params: any) => {
			const value = params.value
			if (value == null || value === "") return ""
			return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
		},
	},
	{
		field: "progressRate",
		headerName: "집행률",
		type: "default",
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

const onGridReady = async (params: any) => {
	gridApi.value = params.api
	columnApi = params.columnApi
	const datasource = {
		getRows: async (params: any) => {
			const { startRow, endRow } = params.request // 요청된 시작, 끝 행 번호

			// startRow, endRow 값에 맞게 데이터를 잘라서 서버로 요청
			const page = Math.floor(startRow / paginationParam.value.size) // 페이지 번호 계산
			const pageSize = paginationParam.value.size // 페이지 크기

			try {
				// 서버에서 데이터 요청
				const response = await useIFetch<Response<any>>("/api/v2/budgets/summary", {
					method: "GET",
					params: {
						...searchParams.value,
						page: page, // 0-based page
						size: pageSize, // 페이지당 데이터 개수
					},
				})
					.then((res: any) => res.data.value)
					.then((res: any) => {
						return res
					})

				const rowData = response.data.content || [] // 현재 페이지의 데이터
				const rowCount = response.data.totalElements || 0 // 전체 데이터의 개수 (전체 행 수)

				// 서버에서 받은 데이터로 그리드에 성공적으로 전달
				params.success({
					rowData, // 현재 페이지 데이터
					rowCount, // 전체 데이터의 개수 (페이징에 사용)
				})
			} catch (error) {
				console.error("Error loading data:", error)
				params.fail() // 에러 발생 시 그리드에 에러 처리
			}
		},
	}
	gridApi.value.paginationSetPageSize = paginationParam.value.size
	gridOptions.paginationPageSize = paginationParam.value.size

	// const datasource = {
	//   getRows: async (params: any) => {console.log(params)
	//     const { startRow, endRow } = params.request;
	//     const rowData = budgetActualsData.value?budgetActualsData.value.slice(startRow, endRow):'';
	//     const rowCount = paginationParam.value.totalElement;
	//     params.success({
	//       rowData,
	//       rowCount,
	//     });
	//   },
	// };
	gridApi.value.setGridOption("serverSideDatasource", datasource)
}

/**
 * 예산 실적 내역 정보 조회
 */
const { status: budgetActualsStatus, refresh: budgetActualsRefresh } = await useAsyncData(
	`budgets-actuals-list-data`,
	() =>
		useIFetch<Response<any>>("/api/v2/budgets/summary", {
			method: "GET",
			params: {
				...searchParams.value,
				page:
					!!searchParams.value.page && searchParams.value.page > 1
						? searchParams.value.page - 1
						: 0,
			},
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				budgetActualsData.value = res.data.content
				paginationParam.value.totalElement = res.data.totalElements

				if (gridApi.value) {
					gridApi.value.paginationSetPageSize = paginationParam.value.size
					gridOptions.paginationPageSize = paginationParam.value.size
					gridApi.value.refreshServerSide()
				}
			}),
	{ watch: [paginationParam.value] }
)

/**
 * 사업장 목록 조회
 * @param costCenterData
 */
const {
	data: workPlaceData,
	status: workPlacerStatus,
	refresh: workPlaceRefresh,
} = await useAsyncData(`budget-actual-workPlace-search-list`, () =>
	useIFetch<any>("/api/v2/settings/companies", {
		method: "GET",
		params: {
			code: getCompanyCode.value,
			palceType: "WORKPLACE",
			parentId: "1",
		},
	})
		.then((res: any) => res.data)
		.then((res: any) => res.value.data)
)

/**
 * 코스트센터 목록 조회
 * @param costCenterData
 */
const {
	data: costCenterData,
	status: costCenterStatus,
	refresh: costCenterRefresh,
} = await useAsyncData(`budget--actual-cost-center-search-list`, () =>
	useIFetch<any>("/api/v2/settings/costCenters", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			placeType: "WORKPLACE",
			used: true,
			page: 0,
			size: 100,
		},
	})
		.then((res: any) => res.data)
		.then((res: any) => res.value.data)
)

/**
 * 계정/비용항목 목록 조회
 * @param accountData
 */
const {
	data: accountData,
	status: accountStauts,
	refresh: accoountRefresh,
} = await useAsyncData(`budget-actual-account-search-list`, () =>
	useIFetch<any>("/api/v2/masters/accounts", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			costCenterId: getCostCenterId.value,
			employeeId: getEmployeeId.value,
		},
	})
		.then((res: any) => res.data)
		.then((res: any) => res.value.data)
)

const getActualDetatilData = (data: any) => {
	useIFetch<any>("/api/v2/budgets/summary/detail", {
		method: "GET",
		params: {
			searchDate: data.yearMonth,
			companyCode: data.companyCode,
			workplaceCode: data.workplaceCode,
			costCenterId: data.costCenterId,
			accountId: data.accountId,
		},
	})
		.then((res: any) => res.data)
		.then((res: any) => (actualDetailData.value = res.value.data))
}

const onSearch = () => {
	budgetActualsRefresh()
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onOpenActualModal = (data: any, value: boolean) => {
	getActualDetatilData(data)
	actualModal.value = value
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
						<a-form-item label="조회기간">
							<a-range-picker
								v-model:value="filterDate"
								@change="onChangeRangePicker"
								:value-format="dateTimeFormat"
								picker="month"
							/>
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="회사">
								<eacc-select
									:style="{ width: '20rem' }"
									:url="'/api/v2/masters/commons/companies'"
									:params="{
										code: searchParams.companyCode,
										placeType: 'COMPANY',
										page: searchParams.page,
										size: searchParams.size,
									}"
									:on-all-field="false"
									first
									v-model:value="searchParams.companyCode"
									:field-names="{
										label: 'workplaceName',
										value: 'workplaceCode',
									}"
									:refresh="true"
									:show-search="true"
									:show-arrow="false"
									disabled
									value-type="any"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="사업장">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="searchParams.workplaceCode"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="사업장을 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'workplaceName',
										value: 'workplaceCode',
									}"
									disabled
									:tree-data="workPlaceData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="코스트센터">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="searchParams.costCenterId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="코스트센터를 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="costCenterData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								/>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="계정/비용항목">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="searchParams.accountId"
									show-search
									:tree-line="true"
									:dropdown-style="dropdownStyle"
									placeholder="계정/비용항목을 선택해주세요."
									allow-clear
									show-checked-strategy="SHOW_ALL"
									tree-default-expand-all
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									:tree-data="accountData"
									tree-node-filter-prop="name"
									:max-tag-count="2"
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
								disabled
								:icon="materialIcons('mso', 'print')"
								@click="() => console.log('인쇄')"
							>
								인쇄
							</a-button>
							<eacc-excel-button
								req-type="download"
								label="엑셀다운로드"
								file-name="예산신청내역"
								:data="budgetActualsData"
								:disabled="!budgetActualsData || budgetActualsData.length === 0"
							/>
							<a-select
								v-model:value="searchParams.size"
								:options="pageSizeOptions"
								value-field="key"
								text-field="label"
								@change="
									(value: any) => {
										paginationParam.size = value
									}
								"
							/>
						</a-space>
					</a-col>
				</a-row>
				<iwx-grid
					:grid-options="gridOptions"
					:column-defs="columnDefs"
					:default-col-def="defaultColDef"
					:class="`ag-theme-quartz custom`"
					:cell-selection="false"
					:suppress-menu-hide="true"
					:stop-editing-when-cells-lose-focus="false"
					:row-model-type="rowModelType"
					:cacheBlockSize="cacheBlockSize"
					:pagination="true"
					:pagination-page-size="searchParams.size"
					@grid-ready="onGridReady"
				/>
				<!-- :pinned-bottom-row-data="pinnedBottomRowData" -->
				<budget-actuals-detail-modal
					:show-modal="actualModal"
					:data-source="actualDetailData"
					@close-modal="actualModal = false"
				></budget-actuals-detail-modal>
			</div>
		</template>
	</page-layout>
</template>
