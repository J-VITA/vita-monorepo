<script setup lang="ts">
import {
	type FormData,
	calculateTotalAmount,
	gridOptions,
} from "@/types/approvals/document"
import type { GridApi, GridOptions, ICellRendererParams, RowDragMoveEvent } from "@iwx/ui"
import { IconLink, ColorTag } from "@/components/ui"
import { BudgetApplyData, options } from "@/types/budgets"
import { DownOutlined } from "@ant-design/icons-vue"
import DocInfo from "@/components/approvals/document/DocInfo.vue"
import DocRelevant from "@/components/approvals/document/DocRelevant.vue"
import AttachedFile from "@/components/approvals/document/AttachedFile.vue"
import ApprovalLine from "@/components/approvals/document/ApprovalLine.vue"
import { SlipFormType, type Response } from "@/types"
import type { FormInstance } from "ant-design-vue"
import BudgetChangeModal from "../document/BudgetChangeModal.vue"
import { iwxGrid } from "@iwx/ui"

const authStore = useAuthStore()
const { getEmployeeId, getCompanyCode } = storeToRefs(authStore)

const route = useRoute()
const { detail, save } = useApprovals()
const { getRouteParams } = useRouteParams()
const { getColumns } = useAgGridColumn()
const rowModelType = ref("serverSide")
const cacheBlockSize = ref(10)

const gridKey = ref(0)
const formRef = useTemplateRef<FormInstance>("formRef")
const deleteModalOpen = ref<boolean>(false)
const selectedRowKey = ref<number>(0)
const showModalAllocation = ref<boolean>(false)
const showModalIncrease = ref<boolean>(false)
const showModalRollover = ref<boolean>(false)
const isLoading = defineModel<boolean>("loading")
const isShowApprove = defineModel<boolean>("showApprove")
const id = defineModel<string | number>("id")
const formData = defineModel<FormData>("formData", {
	required: true,
})
const budgetProposalParams = ref<Array<any>>([])
const budgetApplyData = ref<Array<BudgetApplyData>>([])
const budgetApplRowData = ref<BudgetApplyData>({})

const gridApi = ref<any>(null)
let columnApi: any = null

const emit = defineEmits<{
	(e: "update:loading", value: boolean): boolean
	(e: "update:showApprove", value: boolean): boolean
	(e: "update:formData", value: FormData): FormData
	(e: "historyModalOpen", value: boolean): boolean
	(e: "onDraft"): void
}>()

const columnDefs = ref<GridOptions<any>["columnDefs"]>([
	{
		field: "applyInfo",
		headerName: "신청정보",
		children: [
			{
				field: "budgetRequestType.code",
				headerName: "유형",
				type: "default",
				cellClass: "ag-left-cell",
				rowDrag: (params) => !params.node.group,
				cellRenderer: ColorTag,
				cellRendererParams: (params: ICellRendererParams) => {
					const color = params.value
						? options.budget.filter((e) => e.value === params.value)[0].color
						: ""
					const text = params.value
						? options.budget.filter((e) => e.value === params.value)[0].label
						: ""
					return {
						params,
						color,
						text,
					}
				},
			},
			{
				field: "requestAmount",
				headerName: "신청금액",
				type: "default",
				valueFormatter: (params: any) => {
					const value = params.value
					if (value == null || value === "") return ""
					// 숫자 값을 3자리마다 콤마로 구분
					return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
				},
			},
		],
	},
	{
		field: "fromInfo",
		headerName: "주는대상",
		children: [
			{
				field: "fromYearMonth",
				headerName: "예산년월",
				type: "default",
			},
			{
				field: "fromCostCenter.name",
				headerName: "코스트센터",
				type: "default",
			},
			{
				field: "fromAccount.name",
				headerName: "계정비용/항목",
				type: "default",
			},
		],
	},
	{
		field: "ToInfo",
		headerName: "받는대상",
		children: [
			{
				field: "toYearMonth",
				headerName: "예산년월",
				type: "default",
			},
			{
				field: "toCostCenter.name",
				headerName: "코스트센터",
				type: "default",
			},
			{
				field: "toAccount.name",
				headerName: "계정비용/항목",
				type: "default",
			},
		],
	},
	{
		field: "id",
		headerName: "기능",
		type: "action",
		cellRenderer: IconLink,
		cellRendererParams: (params: ICellRendererParams) => {
			const icon = ["edit", "delete"]
			return {
				params,
				icon,
				onClick: onAction,
			}
		},
	},
])

const defaultColDef = ref({
	filter: false,
	sortable: true,
})

const pinnedBottomRowData = computed(() => {
	return [
		{
			requestAmount: "신청금액 합계",
			fromYearMonth: calculateTotalAmount(budgetApplyData.value, "requestAmount")
				.toString()
				.replace(/\B(?=(\d{3})+(?!\d))/g, ","),
		},
	]
})

const onGridDestroyed = () => {
	gridKey.value++
}

const onGridReady = async (params: any) => {
	gridApi.value = params.api
	columnApi = params.columnApi

	const datasource = {
		getRows: async (params: any) => {
			const rowData = budgetApplyData.value
			params.success({
				rowData,
			})
		},
	}
	gridApi.value.setGridOption("serverSideDatasource", datasource)

	const savedColumnState = await Promise.race([getColumns("userColumnState")])

	if (savedColumnState) {
		gridApi.value.applyColumnState({
			state: savedColumnState,
			applyOrder: true,
		})
	}
}

/**
 * 예산 신청 목록 조회
 */
const getBudgetProposalList = async (id: number, type: string) => {
	await useCFetch<Response<any>>(`/api/v2/budgets/request/${id}`, {
		method: "GET",
		params: {
			...budgetProposalParams.value,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			if (type === "patch") {
				budgetApplyData.value.forEach((element, idx) => {
					if (element.id === id) budgetApplyData.value[idx] = res.data
				})
			} else {
				budgetApplyData.value.push(setIncreaseData(res.data))
			}

			if (gridApi.value) {
				gridApi.value.refreshServerSide() // 데이터 갱신 후 서버사이드 그리드 리프레시
			}

			formData.value.formIds =
				budgetApplyData.value.map((e: any) => {
					return { id: e.id }
				}) || []
			emit("onDraft")
		}
	})
}

/**
 * 예산 결재 문서 번호로 예산 신청 데이터 조회
 */
const getBudgetProposalListByApprovalId = async (
	approvalId: number | string | undefined
) => {
	if (!approvalId) return
	await useCFetch<Response<any>>(`/api/v2/budgets/commons/approvals/${approvalId}`, {
		method: "GET",
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			res.data.forEach((element: any) => {
				budgetApplyData.value.push(element)
			})
			if (gridApi.value) {
				gridApi.value.refreshServerSide() // 데이터 갱신 후 서버사이드 그리드 리프레시
			}
			formData.value.formIds =
				budgetApplyData.value.map((e: any) => {
					return { id: e.id }
				}) || []
		}
	})
}

const setIncreaseData = (data: BudgetApplyData) => {
	let newIncrease: BudgetApplyData = data
	if (newIncrease?.budgetRequestType?.code === "INCREASE") {
		newIncrease.fromYearMonth = undefined
		newIncrease.fromCostCenter = {
			id: undefined,
			code: undefined,
			companyCode: undefined,
			name: undefined,
			workplaceCode: undefined,
		}
		newIncrease.fromAccount = {
			id: undefined,
			name: undefined,
			parentId: undefined,
			parentName: undefined,
		}
	}
	return newIncrease
}

watch(isShowApprove, (flag) => {
	if (flag) {
		formRef.value
			?.validate()
			.then(() => {
				emit("update:showApprove", true)
			})
			.catch((errorInfo: any) => {
				const firstErrorField = errorInfo.errorFields[0]
				if (firstErrorField) {
					formRef.value?.scrollToField(firstErrorField.name)
				}
				emit("update:showApprove", false)
			})
	}
})

const budgetMenuItemClick = async (e: any) => {
	try {
		if (e.key === "BUDGET_ALLOCATION") {
			showModal(e.key, true)
		} else if (e.key === "BUDGET_INCREASE") {
			showModal(e.key, true)
		} else {
			showModal(e.key, true)
		}
	} catch (e: any) {
		message.error(e.message)
	}
}

/**
 * onRowDragEnd
 * row drag 가 끝나는 시점에 row 위치 변경
 */
const onRowDragEnd = (event: RowDragMoveEvent) => {
	// console.log('Row drag end event:', event);

	const movingNode = event.node
	const overNode = event.overNode

	// Restrict movement between groups if necessary
	if (movingNode.data.slipType !== overNode?.data.slipType) {
		console.log("Movement between groups is not allowed.")
		return
	}

	// Ensure the rows are moved both up and down
	if (overNode) {
		const movingData = { ...movingNode.data }
		const overData = { ...overNode.data }

		// Reorder rows by swapping their positions
		const rowDataClone = [...budgetApplyData.value]
		const movingIndex = rowDataClone.findIndex((item) => item.id === movingData.id)
		const overIndex = rowDataClone.findIndex((item) => item.id === overData.id)

		if (movingIndex >= 0 && overIndex >= 0) {
			rowDataClone.splice(movingIndex, 1) // Remove the moving row
			rowDataClone.splice(overIndex, 0, movingData) // Insert it at the new position

			budgetApplyData.value = rowDataClone
		}

		if (gridApi.value) {
			gridApi.value.refreshServerSide() // 데이터 갱신 후 서버사이드 그리드 리프레시
		}
	}
}

const onAction = (data: any, actionType: any) => {
	actionType === "edit" ? onEditData(data) : openDeleteModal(data)
}

const showModal = (type: string, status: boolean) => {
	if (type === "BUDGET_ALLOCATION") {
		showModalAllocation.value = status
	} else if (type === "BUDGET_INCREASE") {
		showModalIncrease.value = status
	} else {
		showModalRollover.value = status
	}
}

const onEditData = async (data: any) => {
	budgetApplRowData.value = data
	const type: string = data.budgetRequestType.name
	if (type === "BUDGET_ALLOCATION") {
		showModalAllocation.value = true
	} else if (type === "BUDGET_INCREASE") {
		showModalIncrease.value = true
	} else {
		showModalRollover.value = true
	}
}

const onDelete = async (id: number) => {
	await useCFetch<Response<any>>(`/api/v2/budgets/request/delete/${id}`, {
		method: "DELETE",
		body: { id },
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success(res.message)
			deleteModalOpen.value = false
			budgetApplyData.value = budgetApplyData.value.filter((element) => {
				return element.id !== id
			})
			if (gridApi.value) {
				gridApi.value.refreshServerSide()
			}
			formData.value.formIds =
				budgetApplyData.value.map((e: any) => {
					return { id: e.id }
				}) || []
			emit("onDraft")
		} else {
			message.error(res.message)
		}
	})
}

const openDeleteModal = (data: any) => {
	selectedRowKey.value = data.id
	deleteModalOpen.value = true
}

const responseResult = async (form: any) => {
	if (form.draftEmployeeId === getEmployeeId.value) {
		getBudgetProposalListByApprovalId(id.value)
		formData.value = Object.assign(formData.value, form, {
			agreementOptionType: form.agreementOptionTypeName,
		})
	} else {
		navigateTo("/approvals/home")
	}
}

onMounted(() => {
	onGridDestroyed()
	formData.value.approvalFormType = SlipFormType.BUDGET
	if (id.value) {
		detail(id.value).then(async (data: any) => {
			await responseResult(data)
		})
	} else {
		getRouteParams(`/approvals/write-${compCase(SlipFormType.BUDGET)}`)
			.then((list: any[]) => {
				if (list && list.length > 0) {
					formData.value.budgetList = list
					formData.value.formIds = list.map((e: any) => {
						return { id: e.id }
					})
					if (formData.value.id) {
						save(formData.value).then(async (data: any) => await responseResult(data))
					}
				}
			})
			.catch(async (data: any) => {
				console.log("전자결재홈에서 유입한 경우로 판단.", data)
			})
	}
})
</script>

<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-row :gutter="[20, 15]">
			<a-col :xs="24" :xxl="18">
				<a-card>
					<a-form
						ref="formRef"
						name="ApproveSubmitted"
						layout="vertical"
						:model="formData"
					>
						<a-form-item>
							<template #label>
								<a-typography-title :level="4" class="ml-none mb-none">
									제목
								</a-typography-title>
							</template>
							<a-flex :gap="20">
								<a-form-item
									class="full-width"
									name="title"
									has-feedback
									:rules="[
										{
											required: true,
											message: '제목을 입력해주세요.',
											trigger: 'change',
										},
									]"
								>
									<a-input v-model:value="formData.title" />
								</a-form-item>
								<a-form-item>
									<a-space :size="0" style="width: 10rem; flex-shrink: 0">
										<a-checkbox v-model:checked="formData.urgent">
											<a-typography-text>긴급문서</a-typography-text>
										</a-checkbox>
										<a-popover placement="right">
											<template #content>
												<p>긴급문서 체크시 결재문서 제목 앞에</p>
												<p>'[긴급]' 문구가 추가되어 강조됩니다.</p>
											</template>
											<div style="line-height: 1; color: #666; cursor: pointer">
												<component
													:is="materialIcons('mso', 'help')"
													style="font-size: 1.6rem"
												/>
											</div>
										</a-popover>
									</a-space>
								</a-form-item>
							</a-flex>
						</a-form-item>
						<a-form-item>
							<approval-line type="write" v-model:form-data="formData" />
						</a-form-item>
						<a-form-item>
							<a-flex justify="space-between" class="mb-sm">
								<a-typography-title :level="4" class="ml-none mb-none">
									예산신청목록
								</a-typography-title>
								<a-dropdown :trigger="['click']">
									<a-button :icon="materialIcons('mso', 'add_circle')">
										예산신청 항목추가
										<DownOutlined />
									</a-button>
									<template #overlay>
										<a-menu @click="budgetMenuItemClick">
											<a-menu-item key="BUDGET_ALLOCATION">
												<component :is="materialIcons('mso', 'sync')" />
												<span class="ml-sm">예산전용</span>
											</a-menu-item>
											<a-menu-divider />
											<a-menu-item key="BUDGET_INCREASE">
												<component :is="materialIcons('mso', 'add_circle')" />
												<span class="ml-sm">예산증액</span>
											</a-menu-item>
											<a-menu-divider />
											<a-menu-item key="BUDGET_CARRYFORWARD">
												<component :is="materialIcons('mso', 'turn_right')" />
												<span class="ml-sm">예산이월</span>
											</a-menu-item>
										</a-menu>
									</template>
								</a-dropdown>
							</a-flex>
							<iwx-grid
								:key="gridKey"
								:grid-options="gridOptions"
								:column-defs="columnDefs"
								:default-col-def="defaultColDef"
								:class="`ag-theme-quartz`"
								:style="{ width: '100%', height: '40rem' }"
								:cell-selection="false"
								:suppress-menu-hide="true"
								:stop-editing-when-cells-lose-focus="false"
								:row-model-type="rowModelType"
								:cacheBlockSize="cacheBlockSize"
								:pagination="false"
								:pinned-bottom-row-data="pinnedBottomRowData"
								@grid-ready="onGridReady"
								@row-drag-end="onRowDragEnd"
							/>
						</a-form-item>
						<a-form-item name="description">
							<a-flex justify="space-between" class="mb-sm">
								<a-typography-title :level="4" class="ml-none mb-none">
									내용
								</a-typography-title>
							</a-flex>
							<a-textarea
								v-model:value="formData.description"
								class="fixed"
								placeholder="내용을 입력해주세요."
								allow-clear
							/>
						</a-form-item>
					</a-form>
				</a-card>
			</a-col>
			<a-col :xs="24" :xxl="6">
				<a-row :gutter="[15, 30]">
					<a-col :span="24">
						<!-- 문서정보 -->
						<doc-info type="write" v-model:form-data="formData" />
					</a-col>
					<a-col :span="24">
						<!-- 첨부파일 -->
						<attached-file
							type="write"
							@add="(value: any) => console.log(`${value} 진행시켜`)"
						/>
					</a-col>
					<a-col :span="24">
						<!-- 관련문서 -->
						<doc-relevant
							type="write"
							@add="(value: any) => console.log(`${value} 진행시켜`)"
						/>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</a-spin>
	<BudgetChangeModal
		:editData="budgetApplRowData"
		:show="showModalAllocation || showModalIncrease || showModalRollover"
		:type="
			showModalAllocation ? 'allocation' : showModalIncrease ? 'increase' : 'rollover'
		"
		@update:show="
			(value: any) => {
				showModalAllocation = value
				showModalIncrease = value
				showModalRollover = value
				if (!value) budgetApplRowData = {}
			}
		"
		@update:value="(value: number, type: string) => getBudgetProposalList(value, type)"
	></BudgetChangeModal>

	<confirm-modal
		:showed="deleteModalOpen"
		class="modal"
		size="small"
		modalTitleText="예산신청삭제"
		title="선택한 예산신청 내역을 삭제하시겠습니까?"
		modal-type="삭제"
		type="error"
		btn-cancle-title="취소"
		btn-ok-title="삭제"
		:icon="() => materialIcons('mso', 'cancel')"
		:data="selectedRowKey"
		@close="deleteModalOpen = false"
		@submit="(params: any) => onDelete(params)"
	></confirm-modal>
</template>
