<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { ColorTagValue, IconLink, StyleText } from "@/components/ui"
import { iwxGrid } from "@iwx/ui"
import { createVNode } from "vue"
import { ExclamationCircleOutlined, TrophyFilled } from "@ant-design/icons-vue"
import type { FormInstance } from "ant-design-vue"

import { Response, SlipType, dateTimeFormat } from "@/types"
import { IBusinessTripInfoParams } from "@/types/mypage/business-trip-route"
import type { Data } from "@/types/master/config"
import type { GridApi, GridOptions, ICellRendererParams, RowDragMoveEvent } from "@iwx/ui"
import { gridOptions, calculateTotalAmount } from "@/types/approvals/document"
import dayjs from "dayjs"
import type { Dayjs } from "dayjs"

type Props = {
	type: "write" | "read"
}

const formRef = useTemplateRef<FormInstance>("formRef")
const showBusinessInfoModal = ref<boolean>(false)
const isShow = ref<boolean>(false)
const selectedData = ref<any>(undefined)
const selectedSlipType = ref<SlipType>(SlipType.PERSONAL_EXPENSE)
const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId, getCostCenterId } = storeToRefs(authStore)
const { getRules } = useExpenseRules()
const rules = ref<any>()

const costCenterTreeData = ref<any[]>([])
const filterDate = ref<[Dayjs, Dayjs]>([useMonth.lastFrom(), useMonth.to()])
const rowData = defineModel<any>("rowData")
const { type } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:data", value: any): any
	(e: "onHistory", value: boolean): any
	(e: "onDetail", value: any): void
	(e: "reloadData"): void
	(e: "onDraft", value: any): any
}>()

const gridApi = shallowRef<GridApi<any>>()
const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "slipTypeName",
		headerName: "출장기간",
		type: "default",
	},
	{
		field: "accountingDate",
		headerName: "출장명",
		type: "default",
	},
	{
		field: "slipEvidenceName",
		headerName: "출장일수",
		type: "default",
	},
	{
		field: "evidenceVendorName",
		headerName: "출장구분",
		type: "default",
	},
	{
		field: "totalAmount",
		headerName: "출장지",
		type: "default",
	},
	{
		field: "accountName",
		headerName: "출장신청서 첨부",
		type: "default",
	},
	{
		field: "id",
		headerName: "기능",
		type: "action",
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = type === "write" ? ["delete"] : "quick_reference_all"
			return {
				params,
				icon,
				onClick: onAction,
			}
		},
	},
])

const typeOption = ref<{ label?: string; value?: string }[]>([
	{
		label: undefined,
		value: undefined,
	},
])

const tripInfoParams = ref<IBusinessTripInfoParams>({
	companyCode: getCompanyCode.value,
	name: undefined,
	code: undefined,
	filterDate: filterDate.value,
	searchDateFrom: dayjs(filterDate.value[0]).format("YYYY-MM-DD"), //시작일
	searchDateTo: dayjs(filterDate.value[1]).format("YYYY-MM-DD"), //종료일
	dateCnt: 0,
	locationType: undefined,
	accountingDate: dayjs(),
	evidenceDate: dayjs(filterDate.value[0]),
	costCenterId: getCostCenterId.value,
	costCenterName: undefined,
	projectId: [],
	projectName: undefined,
})

const calculateDaysDifference = (startDate: Dayjs | string, endDate: Dayjs | string) => {
	const start = dayjs(startDate)
	const end = dayjs(endDate)

	return end.diff(start, "day")
}

const onAction = (params: any, actionType?: string) => {
	if (type === "write") {
		if (actionType === "edit") {
			selectedData.value = params
			// 출장정보 수정모달
			console.log("출장정보 수정 모달 오픈")
			showBusinessInfoModal.value = true
		} else {
			// row 삭제
			Modal.confirm({
				title: "해당 출장정보를 삭제하시겠습니까?",
				icon: createVNode(ExclamationCircleOutlined),
				type: "error",
				okText: "확인",
				cancelText: "취소",
				onOk() {
					nextTick(() => {
						rowData.value = rowData.value.filter((e: any) => e.id !== params.id)

						emit(
							"onDraft",
							rowData.value.filter((e: any) => e.id !== params.id)
						)
					})
				},
				onCancel() {
					console.log("Cancel")
				},
			})
		}
	} else {
		// 지출내역 상세 모달 오픈
		emit("onDetail", params)
	}
}

const onGridReady = (params: any) => {
	gridApi.value = params.api

	if (gridApi.value) {
		// rowData.value = data;
		// rowData.value = props.data;
	}
}

const onOpenModal = (value: boolean) => {
	showBusinessInfoModal.value = value
}

const onChangeResult = async () => {
	await useCFetch<Response<any>>(`/api/v2/businessTrip/requests/calculation`, {
		method: "GET",
		params: {
			companyCode: tripInfoParams.value.companyCode,
			startDate: tripInfoParams.value.searchDateFrom,
			endData: tripInfoParams.value.searchDateTo,
			locationType: tripInfoParams.value.locationType,
			locationCode: tripInfoParams.value.code,
			requestEmployeeId: getEmployeeId.value,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			console.log("result : ", res)
			isShow.value = !isShow.value
		} else {
			message.error(res.message)
		}
	})
}

const onSubmit = () => {
	formRef.value?.validate().then(() => {
		console.log("success")
	})
}

const onChangeType = async (value: any) => {
	await useCFetch<Response<any>>(`/api/v2/masters/businessTripLocations`, {
		method: "GET",
		params: { locationType: value },
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			typeOption.value = res.data
		}
	})
}

const fetchCostCenterData = async () => {
	return await useCFetch<Response<any>>(`/api/v2/settings/costCenters`, {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			used: true,
		},
	}).then((res: Response<any>) => {
		const data = res.data || []
		return deduplicateTreeNodes(data)
	})
}

onMounted(async () => {
	onChangeType("DOMESTIC")
	tripInfoParams.value.dateCnt = calculateDaysDifference(
		filterDate.value[0],
		filterDate.value[1]
	)
	costCenterTreeData.value = await fetchCostCenterData()
	getRules().then((res: Response<Data>) => {
		rules.value = { ...res.data }
	})
})
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none"> 출장정보 </a-typography-title>
		<a-button
			v-if="type === 'write'"
			:icon="materialIcons('mso', 'receipt_long')"
			@click="onOpenModal(true)"
		>
			출장정보 추가
		</a-button>
	</a-flex>

	<iwx-grid
		:grid-options="gridOptions"
		:column-defs="columnDefs"
		:row-data="rowData"
		:class="`ag-theme-quartz`"
		:style="{ width: '100%', height: '40rem' }"
		:cell-selection="false"
		:suppress-menu-hide="true"
		:stop-editing-when-cells-lose-focus="false"
		:pagination="false"
		@grid-ready="onGridReady"
	/>
	<a-modal
		centered
		width="70rem"
		:title="'출장정보 추가'"
		v-model:open="showBusinessInfoModal"
		:destroy-on-close="false"
		@ok="onSubmit"
		@cancel="onOpenModal(false)"
	>
		<a-form
			ref="formRef"
			:model="tripInfoParams"
			label-align="left"
			:colon="false"
			name="출장정보 입력"
		>
			<a-typography-title :level="5" class="ml-none mb-10">
				출장정보입력
			</a-typography-title>
			<a-form-item
				name="name"
				label="출장명"
				:label-col="{ span: 1.1 }"
				:wrapper-col="{ offset: 3 }"
				style="max-width: 60rem"
				:rules="{ required: true }"
			>
				<a-input
					v-model:value="tripInfoParams.name"
					placeholder="출장명을 작성해주세요."
				/>
			</a-form-item>
			<a-flex :gap="15">
				<a-form-item
					name="filterDate"
					label="출장기간"
					:wrapper-col="{ offset: 4 }"
					style="min-width: 36rem"
					:rules="{ required: true }"
				>
					<a-range-picker
						v-model:value="filterDate"
						:value-format="dateTimeFormat"
						@change="
							(_, dateString) => {
								tripInfoParams.searchDateFrom = dateString[0]
								tripInfoParams.searchDateTo = dateString[1]
								tripInfoParams.evidenceDate = dateString[0]
								tripInfoParams.dateCnt = calculateDaysDifference(
									dateString[0],
									dateString[1]
								)
							}
						"
					/>
				</a-form-item>
				<a-form-item name="dateCnt" label="출장일수">
					<a-input v-model:value="tripInfoParams.dateCnt" />
				</a-form-item>
			</a-flex>
			<a-flex :gap="15">
				<a-form-item
					name="locationType"
					label="출장지"
					:wrapper-col="{ offset: 7 }"
					style="min-width: 24rem"
					:rules="{ required: true }"
				>
					<eacc-select
						:url="`/api/v2/masters/businessTrip/types/locationTypes`"
						v-model:value="tripInfoParams.locationType"
						:field-names="{ label: 'label', value: 'code' }"
						first
						:on-all-field="false"
						@update:value="onChangeType"
					></eacc-select>
				</a-form-item>
				<a-form-item
					name="code"
					style="min-width: 34.4rem"
					:rules="[{ required: true, message: '지역을 선택해주세요.' }]"
				>
					<a-select
						v-model:value="tripInfoParams.code"
						:options="typeOption || []"
						:field-names="{ label: 'name', value: 'code' }"
						placeholder="지역을 선택해주세요."
					></a-select>
				</a-form-item>
			</a-flex>
			<a-typography-title :level="5" class="ml-none mb-10">
				전표정보입력
			</a-typography-title>
			<a-flex :gap="30">
				<a-form-item
					name="accountingDate"
					label="회계일자"
					:wrapper-col="{ offset: 6 }"
					style="min-width: 24rem"
					:rules="{ required: true }"
				>
					<a-date-picker
						v-model:value="tripInfoParams.accountingDate"
						:format="'YYYY-MM-DD'"
					></a-date-picker>
				</a-form-item>
				<a-form-item
					name="costCenterId"
					label="코스트센터"
					:wrapper-col="{ offset: 1 }"
					style="min-width: 36rem"
					:rules="[{ required: true, message: '코스트센터를 선택해주세요.' }]"
				>
					<a-tree-select
						style="width: 100%"
						:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
						v-model:value="tripInfoParams.costCenterId"
						:tree-data="costCenterTreeData"
						:field-names="{
							children: 'children',
							label: 'name',
							value: 'id',
						}"
						placeholder="코스트센터를 선택해주세요."
						tree-node-filter-prop="name"
						:on-all-field="false"
					/>
				</a-form-item>
			</a-flex>
			<a-flex :gap="30">
				<a-form-item
					name="evidenceDate"
					label="사용일자"
					:wrapper-col="{ offset: 6 }"
					style="min-width: 24rem"
					:rules="{ required: true }"
				>
					<a-date-picker
						v-model:value="tripInfoParams.evidenceDate"
						:format="'YYYY-MM-DD'"
					></a-date-picker>
				</a-form-item>
				<a-form-item
					name="projectId"
					label="프로젝트"
					:wrapper-col="{ offset: 2 }"
					style="min-width: 36rem"
				>
					<eacc-select-table
						url="/api/v2/slips/commons/projects"
						:params="{ companyCode: getCompanyCode }"
						v-model:value="tripInfoParams.projectId"
						placeholder="프로젝트를 선택해주세요"
						key-props="id"
						label-prop="name"
						:columns="[{ title: '이름', data: (row: any) => row.name }]"
					/>
				</a-form-item>
			</a-flex>
			<a-button class="full-width" type="primary" ghost @click="onChangeResult"
				>계산결과보기<span class="material-symbols-outlined"
					>keyboard_arrow_down</span
				></a-button
			>
			<div v-if="isShow">
				<a-divider :style="{ borderColor: '#000000', opacity: 0.3 }" dashed />
				<a-typography-title :level="5" class="ml-none mb-10">
					출장규정금액
				</a-typography-title>
				<a-table
					size="small"
					:columns="[
						{ title: '항목', dataIndex: 'name' },
						{ title: '금액', dataIndex: 'cost' },
						{ title: '계정과목', dataIndex: 'accountId' },
					]"
					:pagination="false"
				>
					<!-- :loading="status === 'pending'"
                    :data-source="dataSource?.data" -->
				</a-table>
			</div>
		</a-form>
	</a-modal>
</template>
