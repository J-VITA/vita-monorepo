<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { Link, IconLink, Badge, ColorTag } from "@/components/ui"
import { iwxGrid } from "@iwx/ui"
import type {
	GridApi,
	GridOptions,
	ICellRendererParams,
	ValueFormatterParams,
} from "@iwx/ui"
import type { FormInstance } from "ant-design-vue"
import {
	type IFormData,
	type IFormType,
	type Response,
	type RequestParams,
	pageSizeOptions,
} from "@/types"
import type { Dayjs } from "dayjs"
import { classifications, states } from "@/types/expenses"

definePageMeta({
	name: "전표확정",
})

const { getColumns, setColumns } = useAgGridColumn()

// 결재문서 상세보기
const isDocumentDetail = ref<boolean>(false)
const documentId = ref<number>(0)

// 지출내역 상세보기
const isShowExpenseDetail = ref<boolean>(false)
const expenseDetailData = ref<any>()

//검인자 변경
const formRef = useTemplateRef<FormInstance>("formRef")
const changeCheckerLoading = ref<boolean>(false)
const isChangeChecker = ref<boolean>(false)
const changeCheckerData = ref<{ checker: number | undefined; data: any }>({
	checker: undefined,
	data: undefined,
})

const localeText = {
	page: "개",
	more: "더보기",
	to: "-",
	of: "/",
	next: "다음",
	last: "마지막",
	first: "처음",
	previous: "이전",
	loadingOoo: "로딩 중...",
	size: "페이지옵션",
	// 추가적인 텍스트 번역...
}

const selectedRows = ref<Array<any>>([])
const isExpand = ref<boolean>(false)
const filterDate = ref<[Dayjs, Dayjs]>()
const searchParams = ref<any>({
	page: 1,
	size: 10,
	startDate: "",
	endDate: "",
	confirmUser: "",
	slipStatus: ["SEAL_STANDBY", "CONFIRM"],
	slipType: [
		"PERSONAL_EXPENSE",
		"DIVISION_PERSONAL_EXPENSE",
		"CARD",
		"E_TAX_INVOICE",
		"TAX_INVOICE",
	],
})
const gridApi = shallowRef<GridApi<any>>()
const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "slipNo",
		headerName: "전표번호",
		headerClass: "ag-center-header bold",
		headerCheckboxSelection: true,
		checkboxSelection: true,
		cellRenderer: Link,
		cellRendererParams: (params: ICellRendererParams) => {
			return {
				params,
				onClick: (params: any) => {
					console.log(params)
					// data 를 받으면 해당 데이터로 디테일 내역 통신하고 모달 오픈
					expenseDetailData.value = params
					isShowExpenseDetail.value = true
				},
			}
		},
	},
	{
		field: "slipType",
		headerName: "유형",
		headerClass: "ag-center-header bold",
		cellClass: "text-center",
		cellRenderer: ColorTag,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = classifications[params.value].color
			const text = classifications[params.value].text
			return {
				params,
				color,
				text,
			}
		},
	},
	{
		field: "used",
		headerName: "사용일자",
		headerClass: "ag-center-header bold",
	},
	{
		field: "workplaceName",
		headerName: "사업장",
		headerClass: "ag-center-header bold",
	},
	{
		field: "costCenterName",
		headerName: "코스트센터명",
		headerClass: "ag-center-header bold",
	},
	{
		field: "user",
		headerName: "사용자",
		headerClass: "ag-center-header bold",
	},
	{
		field: "storeName",
		headerName: "가맹점(거래처)",
		headerClass: "ag-center-header bold",
	},
	{
		field: "totalAmount",
		headerName: "총금액",
		headerClass: "ag-center-header bold",
		type: "currency",
	},
	{
		field: "supplyAmount",
		headerName: "공급가액",
		headerClass: "ag-center-header bold",
		type: "currency",
	},
	{
		field: "taxAmount",
		headerName: "부가세",
		headerClass: "ag-center-header bold",
		type: "currency",
	},
	{
		field: "accountName",
		headerName: "계정/비용항목",
		headerClass: "ag-center-header bold",
	},
	{
		field: "slipStatus",
		headerName: "상태",
		headerClass: "ag-center-header bold",
		cellRenderer: Badge,
		cellRendererParams: (params: ICellRendererParams) => {
			const color = states[params.value].color
			const text = states[params.value].text
			return {
				params,
				color,
				text,
			}
		},
	},
	{
		field: "documentNo",
		headerName: "결재문서번호",
		headerClass: "ag-center-header bold",
	},
	{
		field: "documentNo",
		headerName: "결재문서",
		headerClass: "ag-center-header bold",
		cellStyle: { textAlign: "center" },
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = "edit_square"
			return {
				params,
				icon,
				onClick: (params: any) => {
					console.log(params)
					documentId.value = params.id
					isDocumentDetail.value = true
				},
			}
		},
	},
	{
		field: "cardApprovalDate",
		headerName: "카드승인일시",
		headerClass: "ag-center-header bold",
	},
	{
		field: "cardApprovalNumber",
		headerName: "카드승인번호",
		headerClass: "ag-center-header bold",
	},
	{
		field: "projectName",
		headerName: "프로젝트명",
		headerClass: "ag-center-header bold",
	},
	{
		field: "paymentDueDate",
		headerName: "지급예정일",
		headerClass: "ag-center-header bold",
	},
	{
		field: "currentSealUser",
		headerName: "현재검인자",
		headerClass: "ag-center-header bold",
	},
	{
		field: "nextSealUser",
		headerName: "다음검인자",
		headerClass: "ag-center-header bold",
	},
])
const rowData = ref<any[]>([])

// 상세필터
const formData = ref<Array<IFormData>>([
	{
		name: "creatorByName",
		label: "작성자",
		url: "/api/v2/members/list",
		typeInfo: {
			type: "auto",
			fieldName: { label: "name", value: "name" },
		} as IFormType,
		defaultValue: "",
	},

	{
		name: "tradeByName",
		label: "가맹점(거래처)",
		url: `/api/v2/masters/commons/vendors`,
		typeInfo: {
			type: "single-table",
			fieldName: { label: "name", value: "code" },
			columns: [
				{ title: "가맹점명", data: (row: any) => row.name },
				{ title: "구분", data: (row: any) => row.vendorTypeLabel },
				{
					title: "사용여부",
					data: (row: any) => (row.used ? "사용중" : "미사용"),
				},
			],
		} as IFormType,
		defaultValue: [],
	},
	{
		name: "accountId",
		label: "계정/비용항목",
		url: `/api/v2/masters/commons/accounts`,
		rules: [
			{
				required: false,
				type: "array",
			},
		],
		typeInfo: {
			type: "single-table",
			fieldName: { label: "name", value: "id" },
			columns: [
				{ title: "계정과목", data: (row: any) => row.name },
				{ title: "설명", data: (row: any) => row.description },
				{
					title: "사용여부",
					data: (row: any) => (row.used ? "사용중" : "미사용"),
				},
			],
		} as IFormType,
		defaultValue: [],
	},
	{
		name: "projectName",
		label: "프로젝트명",
		defaultValue: "",
	},
	{
		name: "costCenterId",
		label: "코스트센터",
		url: `/api/v2/masters/commons/costCenters`,
		typeInfo: {
			type: "single-table",
			fieldName: { label: "workplaceName", value: "id" },
			columns: [
				{
					title: "코스트센터",
					data: (row: any) => row.workplaceName,
				},
			],
		} as IFormType,
		defaultValue: [],
	},
	{
		name: "internalAttendanceName",
		label: "내부참석자명",
		defaultValue: "",
	},
	{
		name: "externalAttendanceName",
		label: "외부참석자명",
		defaultValue: "",
	},
	{
		name: "amount",
		label: "지출금액",
		defaultValue: [0, 0],
		typeInfo: {
			type: "amount",
		} as IFormType,
	},
])

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onChangeRangePicker = (
	value: [string, string] | [Dayjs, Dayjs],
	dateString: [string, string]
) => {
	console.log("onChangeRangePicker", value, dateString)
	searchParams.value.startDate = dateString[0]
	searchParams.value.endDate = dateString[1]
}

// 상세필터
const submit = (value: any) => {
	console.log("상세필터 submit", value)
}

const onSearch = (params: any) => {
	console.log("search params :", params)
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

const onGridReady = async (params: any) => {
	gridApi.value = params.api
	let items: any[] = []
	for (let i = 1; i < 21; i++) {
		const item = {
			id: i,
			slipNo: "2024-BD-00001",
			slipType: "PERSONAL_EXPENSE",
			used: "2024-07-10",
			workplaceName: "본사",
			costCenterName: "마케팅본부",
			user: "김길동",
			storeName: "편의점",
			totalAmount: 660000,
			supplyAmount: 600000,
			taxAmount: 60000,
			accountName: "복리후생[판관비] > 식대",
			slipStatus: "SEAL_STANDBY",
			documentNo: "AP-20230710-02",
			cardApprovalDate: "",
			cardApprovalNumber: "",
			projectName: "",
			paymentDueDate: "2024-03-31",
			currentSealUser: "콩순이",
			nextSealUser: "김재무",
		}
		items.push(item)
	}

	rowData.value = items

	// const savedColumnState = await Promise.race([
	//   getColumns('slipsConfirmColumnState'),
	// ]);

	// if (savedColumnState) {
	//   gridApi.value!.applyColumnState({
	//     state: savedColumnState,
	//     applyOrder: true,
	//   });
	// }
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
		selectedRows.value.push(rowNode.data)
	} else {
		const index = selectedRows.value.findIndex((row) => row.id === rowData.id)
		if (index > -1) {
			selectedRows.value.splice(index, 1)
		}
	}
}

/**
 * 일괄검인 버튼 Action
 */
const onbatchSeal = () => {
	Modal.confirm({
		title: "검인/확정하시겠습니까?",
		content:
			"다음 검인자에게 검인을 요청합니다. \n 마지막 검인순서라면 전표는 확정됩니다.",
		icon: materialIcons("mso", "error"),
		okText: "확인",
		cancelText: "취소",
		async onOk() {
			try {
				return await new Promise((resolve, reject) => {
					setTimeout(resolve, 1000)
				}).then(() => {
					message.success("검인/확정되었습니다.")
				})
			} catch {
				return console.log("Oops errors!")
			}
		},
	})
}

/**
 * 검인자 변경 모달 Submit
 */
const onShowChangeChecker = () => {
	changeCheckerData.value.checker = undefined
	changeCheckerData.value.data = undefined

	isChangeChecker.value = true
}
const onChangeCheckerFinish = (data: any) => {
	formRef.value
		?.validate()
		.then(async () => {
			try {
				changeCheckerLoading.value = true
				return await new Promise((resolve, reject) => {
					setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
					console.log("검인자 변경 모달 Submit", data)
				}).then(() => {
					changeCheckerLoading.value = false
					message.success(
						`${changeCheckerData.value.data[0].name} ${changeCheckerData.value.data[0].gradeName}으로 검인자 변경이 완료되었습니다.`
					)
				})
			} catch {
				changeCheckerLoading.value = false
				return message.error("검인자 변경에 실패하였습니다.")
			} finally {
				isChangeChecker.value = false
			}
		})
		.catch((error: Error) => {
			console.log("error", error)
		})
}
onMounted(() => {
	filterDate.value = [useMonth.lastFrom(), useMonth.to()]
	searchParams.value.startDate = useMonth.lastFrom().format("YYYY-MM-DD")
	searchParams.value.endDate = useMonth.to().format("YYYY-MM-DD")
	searchParams.value.confirmUser = "전체"
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
						<a-range-picker v-model:value="filterDate" @change="onChangeRangePicker" />
					</a-space>
				</a-col>
				<a-col>
					<a-space>
						<span>검인자</span>
						<a-select
							style="width: 12rem"
							v-model:value="searchParams.confirmUser"
							:options="[
								{ label: '전체', value: '전체' },
								{ label: '홍길동', value: '홍길동' },
								{ label: '나회계', value: '나회계' },
							]"
						/>
					</a-space>
				</a-col>
				<a-col>
					<eacc-filter-button
						v-model:form-data="formData"
						@update:form-data="(params: any) => (formData = params)"
						:loading="false"
						:icon="materialIcons('mso', 'filter_alt')"
						@submit="submit"
					>
						상세필터
					</eacc-filter-button>
				</a-col>
				<a-col>
					<eacc-button
						component-is="search"
						:data="searchParams"
						:modal-open="false"
						@click="onSearch"
					/>
				</a-col>
				<a-col span="24">
					<a-space class="mr-lg">
						<span>전표상태</span>
						<a-checkbox-group
							v-model:value="searchParams.slipStatus"
							:options="[
								{ label: '검인대기', value: 'SEAL_STANDBY' },
								{ label: '확정', value: 'CONFIRM' },
							]"
						/>
					</a-space>
					<a-space>
						<span>지출유형</span>
						<a-checkbox-group
							v-model:value="searchParams.slipType"
							:options="[
								{ label: '개인경비', value: 'PERSONAL_EXPENSE' },
								{ label: '개인경비분할', value: 'DIVISION_PERSONAL_EXPENSE' },
								{ label: '법인카드', value: 'CARD' },
								{ label: '전자세금계산서', value: 'E_TAX_INVOICE' },
								{ label: '수기세금계산서', value: 'TAX_INVOICE' },
							]"
						/>
					</a-space>
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
						<a-button :icon="materialIcons('mso', 'download')"> 엑셀다운로드 </a-button>
						<a-button :icon="materialIcons('mso', 'person')" @click="onShowChangeChecker">
							검인자 변경
						</a-button>
						<a-button
							type="primary"
							:icon="materialIcons('mso', 'select_check_box')"
							@click="onbatchSeal"
						>
							일괄 검인/확정
						</a-button>
						<a-select
							v-model:value="searchParams.size"
							:options="pageSizeOptions"
							@change="
								(params) => {
									searchParams.page = 1
								}
							"
							value-field="key"
							text-field="label"
						/>
					</a-space>
				</a-flex>
				<iwx-grid
					:row-data="rowData"
					:column-types="{
						currency: {
							aggFunc: 'sum',
							cellStyle: { textAlign: 'right' },
							valueFormatter: (params: ValueFormatterParams) =>
								params.value ? Number(params.value).toLocaleString() : params.value,
						},
					}"
					row-selection="multiple"
					:default-col-def="{ flex: 1, minWidth: 150 }"
					:column-defs="columnDefs"
					:class="`ag-theme-quartz full`"
					:cell-selection="true"
					:suppress-menu-hide="true"
					:suppress-row-click-selection="true"
					:stop-editing-when-cells-lose-focus="false"
					:pagination="true"
					:pagination-page-size="searchParams.size"
					:pagination-page-size-selector="pageSizeOptions.map((item) => item.key)"
					:locale-text="localeText"
					@grid-ready="onGridReady"
					@column-moved="onColumnMoved"
					@column-resized="onColumnResized"
					@column-visible="onColumnVisible"
					@row-selected="onRowSelected"
				/>
			</div>
		</template>
		<template #modal>
			<!--  지출 상세 모달-->
			<expense-detail-modal
				:show="isShowExpenseDetail"
				:data="expenseDetailData"
				@update:show="
					(value: boolean) => {
						isShowExpenseDetail = value
						expenseDetailData = null
					}
				"
			/>
			<!-- 결재문서 상세 모달 -->
			<document-preview-modal
				:show="isDocumentDetail"
				:id="documentId"
				:completed="true"
				@update:show="(value: boolean) => (isDocumentDetail = value)"
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
								url="/api/v2/masters/commons/employees"
								:columns="[
									{ title: '사업장', data: (row: any) => row.workplaceName },
									{ title: '부서', data: (row: any) => row.department },
									{ title: '직위', data: (row: any) => row.gradeName },
									{ title: '이름', data: (row: any) => row.name },
								]"
								@update:value="(value: any) => (field.checker = value)"
								@selection-change="(value: any) => (field.data = value)"
							/>
						</a-form-item>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
