<script lang="ts" setup>
import { Dayjs } from "dayjs"
import dayjs from "dayjs"
import { type FormProps, Form, FormInstance, TreeSelectProps } from "ant-design-vue"
import {
	type Response,
	type RequestParams,
	type SortTypes,
	pageSizeOptions,
	SortType,
} from "@/types"
import type {
	BudgetParams,
	FormData,
	BudgetEventParams,
	BudgetInitRequestParams,
} from "~/types/budgets"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import { StringGradients } from "ant-design-vue/es/progress/props"
definePageMeta({
	name: "기초예산현황",
})

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const {
	getCompanyCode,
	getCompanyName,
	getWorkplaceCode,
	getCostCenterId,
	getEmployeeId,
} = storeToRefs(authStore)

const budgetFormRef = ref<FormInstance>()
const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const showModal = ref<boolean>(false)
const paginationParam = ref({ pageNum: 0, size: 10 })
const isExpand = ref<boolean>(false)
const isClosed = ref<boolean>(false)
const modalType = ref<"POST" | "PATCH">("POST")
const months: string[] = [
	"january",
	"february",
	"march",
	"april",
	"may",
	"june",
	"july",
	"august",
	"september",
	"october",
	"november",
	"december",
]
const searchParams = ref<BudgetParams>({
	companyCode: getCompanyCode.value,
	workplaceCode: getWorkplaceCode.value,
	costCenterId: undefined,
	accountId: undefined,
	year: undefined,
	page: 0,
	size: 10,
	sort: [],
})

const workplaceSearchParams = ref<BudgetParams>({
	companyCode: getCompanyCode.value,
	placeType: "WORKPLACE",
	used: true,
	page: 0,
	size: 100,
})

const accountSearchParams = ref<BudgetParams>({
	companyCode: getCompanyCode.value,
	costCenterId: getCostCenterId.value,
	employeeId: getEmployeeId.value,
})

const dropdownStyle = ref({ maxHeight: "40rem", overflow: "auto" })
searchParams.value.year = $dayjs()

const modalField = ref<FormData>({
	id: undefined,
	companyCode: getCompanyCode.value,
	workplaceCode: searchParams.value.workplaceCode,
	costCenterId: searchParams.value.costCenterId,
	accountId: searchParams.value.accountId,
	year: searchParams.value.year,
	totalAmount: 0,
	january: 0,
	february: 0,
	march: 0,
	april: 0,
	may: 0,
	june: 0,
	july: 0,
	august: 0,
	september: 0,
	october: 0,
	november: 0,
	december: 0,
	closingStatus: true,
})

const requestSaveParams = ref<BudgetInitRequestParams>({
	id: undefined,
	companyCode: getCompanyCode.value,
	workplaceCode: getWorkplaceCode.value,
	costCenterId: searchParams.value.costCenterId as number,
	accountId: searchParams.value.accountId as number,
	year: dayjs().year().toString(),
	month: "",
	amount: 0,
	closingStatus: false,
})

const columns = ref<ColumnsType<any>>([
	{
		title: "년도",
		dataIndex: "year",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 1,
		},
		width: -1,
	},
	{
		title: "회사",
		dataIndex: "companyName",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 2,
		},
		width: -1,
	},
	{
		title: "사업장",
		dataIndex: "workplaceName",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 3,
		},
		width: -1,
	},
	{
		title: "코스트센터",
		dataIndex: "costCenterName",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 4,
		},
		width: -1,
	},
	{
		title: "계정/비용항목명",
		dataIndex: "budgetAccount",
		resizable: true,
		align: "center",
		sorter: {
			multiple: 5,
		},
		width: -1,
	},
	{
		title: "합계예산",
		dataIndex: "totalBudget",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 6,
		},
		width: -1,
	},
	{
		title: "1월",
		dataIndex: "january",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 7,
		},
		width: -1,
	},
	{
		title: "2월",
		dataIndex: "february",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 8,
		},
		width: -1,
	},
	{
		title: "3월",
		dataIndex: "march",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 9,
		},
		width: -1,
	},
	{
		title: "4월",
		dataIndex: "april",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 10,
		},
		width: -1,
	},
	{
		title: "5월",
		dataIndex: "may",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 11,
		},
		width: -1,
	},
	{
		title: "6월",
		dataIndex: "june",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 12,
		},
		width: -1,
	},
	{
		title: "7월",
		dataIndex: "july",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 13,
		},
		width: -1,
	},
	{
		title: "8월",
		dataIndex: "august",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 14,
		},
		width: -1,
	},
	{
		title: "9월",
		dataIndex: "september",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 15,
		},
		width: -1,
	},
	{
		title: "10월",
		dataIndex: "october",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 16,
		},
		width: -1,
	},
	{
		title: "11월",
		dataIndex: "november",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 17,
		},
		width: -1,
	},
	{
		title: "12월",
		dataIndex: "december",
		resizable: true,
		align: "right",
		sorter: {
			multiple: 18,
		},
		width: -1,
	},
])

/**
 * 코스트센터 목록 조회
 * @param costCenterData
 */
const {
	data: costCenterData,
	status: costCenterStatus,
	refresh: costCenterRefresh,
} = await useAsyncData(
	`budget-cost-center-search-list`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/costCenters", {
			method: "GET",
			params: workplaceSearchParams,
		}),
	{
		transform: (response: Response<any>) => response.data,
	}
)

/**
 * 계정/비용항목 목록 조회
 * @param accountData
 */
const {
	data: accountData,
	status: accountStauts,
	refresh: accoountRefresh,
} = await useAsyncData(
	`budget-account-search-list`,
	() =>
		useCFetch<Response<any>>("/api/v2/master/accounts", {
			method: "GET",
			params: accountSearchParams,
		}),
	{
		transform: (response: Response<any>) => response.data,
	}
)

const {
	data: dataSource,
	status,
	refresh,
} = await useAsyncData(
	`budget-list`,
	() =>
		useIFetch<Response<any>>("/api/v2/budgets", {
			method: "GET",
			params: {
				...searchParams.value,
				page:
					!!searchParams.value.page && searchParams.value.page > 1
						? searchParams.value.page - 1
						: 0,
				year: $dayjs(searchParams.value.year).year().toString(),
			},
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => res),
	{ watch: [paginationParam.value] }
)

const onSearch = () => {
	refresh()
}

const onUploadExcel = () => {
	console.log("엑셀업로드")
}

const expenseMenuItemClick = async (e: any) => {
	try {
		if (e.key === "WRITE-ACCOUNT") {
			showModal.value = true
		} else if (e.key === "EXCEL") {
			onUploadExcel()
		}
	} catch (e: any) {
		message.error(e.message)
	}
}

const onRowSelection = (keys: (string | number)[], rows: any[]) => {
	console.log(rows)
	selectedRowKeys.value = keys
	selectedRows.value = rows
}

const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}

const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = Array.isArray(sorter)
		? sorter.map((s: any) => ({
				field: s.field,
				order: s.order,
			}))
		: [
				{
					order: sorter.order,
					field: sorter.order ? sorter.field : undefined,
				},
			]
	if (sortParams && sortParams.length > 0) {
		searchParams.value.sort = sortParams.map((x: any) => {
			const order: keyof SortTypes = x.order
			const field: keyof SortTypes = x.field

			if (field && order) {
				return `${field},${SortType[order]}`
			} else {
				return undefined
			}
		})
	}
	paginationParam.value.pageNum = pagination.current
	searchParams.value.page = pagination.current
	searchParams.value.size = pagination.pageSize
	refresh()
}

const onExpand = () => {
	isExpand.value = !isExpand.value
}

const onClosed = (value: boolean) => {
	isClosed.value = value
}

const showBudgetModal = async (type: "POST" | "PATCH", baseBudgetData?: any) => {
	if (baseBudgetData?.costCenterId) {
		modalField.value.companyCode = baseBudgetData.companyCode
		modalField.value.workplaceCode = baseBudgetData.workplaceCode
		modalField.value.costCenterId = baseBudgetData.costCenterId
		modalField.value.accountId = baseBudgetData.budgetAccount.id
		modalField.value.year = $dayjs(baseBudgetData.year)
		modalField.value.january = baseBudgetData.january
		modalField.value.february = baseBudgetData.february
		modalField.value.march = baseBudgetData.march
		modalField.value.april = baseBudgetData.april
		modalField.value.may = baseBudgetData.may
		modalField.value.june = baseBudgetData.june
		modalField.value.july = baseBudgetData.july
		modalField.value.august = baseBudgetData.august
		modalField.value.september = baseBudgetData.september
		modalField.value.october = baseBudgetData.october
		modalField.value.november = baseBudgetData.november
		modalField.value.december = baseBudgetData.december
	} else {
		resetModalField()
	}
	modalType.value = type
	showModal.value = true
}

const resetModalField = () => {
	modalField.value.id = undefined
	modalField.value.workplaceCode = undefined
	modalField.value.costCenterId = undefined
	modalField.value.accountId = undefined
	modalField.value.year = undefined
	modalField.value.totalAmount = 0
	modalField.value.january = 0
	modalField.value.february = 0
	modalField.value.march = 0
	modalField.value.april = 0
	modalField.value.may = 0
	modalField.value.june = 0
	modalField.value.july = 0
	modalField.value.august = 0
	modalField.value.september = 0
	modalField.value.october = 0
	modalField.value.november = 0
	modalField.value.december = 0
}

const onDeleteBudgetRow = async (rowData: any) => {
	let completeCnt = 0
	rowData.forEach(async (rowElement: any) => {
		const body = {
			companyCode: rowElement.companyCode,
			workplaceCode: rowElement.workplaceCode,
			costCenterId: rowElement.costCenterId,
			accountId: rowElement.budgetAccount.id,
			year: rowElement.year,
			closingStatus: false,
		}
		await useIFetch<Response<any>>(`/api/v2/budgets`, {
			method: "DELETE",
			body,
		})
			.then((res: any) => res.data.value)
			.then((res: Response<any>) => {
				res.status == 0 ? completeCnt++ : message.error(res.message)
			})
		if (rowData.length === completeCnt) {
			message.success("삭제 성공")
			refresh()
		}
	})
}

const onChangeTotalAccount = (value: any, name: any) => {
	const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
	if (korean.test(value)) return

	// 'name'에 맞는 월 예산을 설정
	const monthIndex = parseInt(name) - 1 // 1월 -> 0, 12월 -> 11
	if (monthIndex >= 0 && monthIndex < months.length) {
		modalField.value[months[monthIndex]] = value
	}

	// 총합 계산 (배열로 처리)
	modalField.value.totalAmount = months.reduce((total, month) => {
		return total + (modalField.value[month] || 0) // 각 월 예산 값 합산
	}, 0)
}

const onSubmit = (data: BudgetEventParams, type: string) => {
	const saveParams = months.map((element, idx) => {
		return {
			...requestSaveParams.value,
			id: data.id ? data.id : undefined,
			workplaceCode: data.workplaceCode,
			costCenterId: data.costCenterId,
			accountId: data.accountId,
			year: $dayjs(data.year).get("y").toString(),
			month: idx + 1,
			amount: data[element],
		}
	})
	budgetFormRef.value
		?.validate()
		.then(async () => {
			const url = "/api/v2/budgets/list"
			await useIFetch<Response<any>>(url, {
				method: modalType,
				body: saveParams,
			})
				.then((res: any) => res.data.value)
				.then((res: Response<any>) => {
					if (!res) return
					if (type == "saveClose") {
						showModal.value = false
					} else {
						resetModalField()
					}
					budgetFormRef.value?.resetFields()
					message.success(res.message)
					refresh()
				})
		})
		.catch((err) => {
			console.log("error", err)
		})
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				부서와 계정/비용항목에 따라 월단위 예산을 입력할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-form label-align="left" class="mb-md" :colon="false">
				<a-row :gutter="[10, 5]" wrap>
					<a-col>
						<a-form-item label="조회년도">
							<a-date-picker v-model:value="searchParams.year" picker="year" />
						</a-form-item>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="회사">
								<a-input :disabled="true" :value="getCompanyName"> </a-input>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="5">
							<a-form-item label="사업장">
								<eacc-select
									:style="{ width: '20rem' }"
									url="/api/v2/masters/commons/companies"
									:params="workplaceSearchParams"
									v-model:value="searchParams.workplaceCode"
									:on-all-field="false"
									:field-names="{
										label: 'workplaceName',
										value: 'workplaceCode',
									}"
									:first="true"
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
								>
								</a-tree-select>
							</a-form-item>
						</a-space>
					</a-col>
					<a-col>
						<a-space :size="10">
							<a-form-item label="계정/비용항목">
								<a-tree-select
									:style="{ width: '20rem' }"
									v-model:value="searchParams.accountId"
									show-search
									:dropdown-style="dropdownStyle"
									placeholder="계정항목을 선택해주세요."
									allow-clear
									tree-default-expand-all
									show-checked-strategy="SHOW_ALL"
									:tree-data="accountData"
									:tree-line="true"
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									tree-node-filter-prop="name"
									:max-tag-count="2"
								>
								</a-tree-select>
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
								v-if="!isClosed"
								:icon="materialIcons('mso', 'block')"
								ghost
								danger
								@click="() => onClosed(true)"
							>
								예산입력마감
							</a-button>
							<a-button
								v-if="isClosed"
								:icon="materialIcons('mso', 'refresh')"
								ghost
								danger
								@click="() => onClosed(false)"
							>
								입력마감해제
							</a-button>
							<eacc-button
								:disabled="isClosed || selectedRows.length == 0"
								component-is="delete"
								:data="selectedRows"
								:modal-open="true"
								:deleteTitle="'사용된 예산내역이 있으면 삭제할 수 없습니다.'"
								:modalHeaderText="'예산삭제'"
								@click="onDeleteBudgetRow"
							/>
							<a-button
								:icon="materialIcons('mso', 'file_download')"
								@click="() => console.log('엑셀다운로드')"
							>
								엑셀다운로드
							</a-button>
							<a-dropdown :trigger="['click']">
								<a-button
									:disabled="isClosed"
									type="primary"
									:icon="materialIcons('mso', 'receipt_long')"
									class="dropdown-link"
								>
									예산등록
								</a-button>
								<template #overlay>
									<a-menu @click="expenseMenuItemClick">
										<!-- @click="emit('selected', undefined)" -->
										<a-menu-item key="WRITE-ACCOUNT" @click="showBudgetModal('POST')">
											<component :is="materialIcons('mso', 'edit')" />
											<span class="ml-sm">직접입력</span>
										</a-menu-item>
										<a-menu-divider />
										<a-menu-item key="EXCEL">
											<component :is="materialIcons('mso', 'upload_file')" />
											<span class="ml-sm">엑셀 일괄등록</span>
										</a-menu-item>
									</a-menu>
								</template>
							</a-dropdown>
							<a-select
								v-model:value="searchParams.size"
								:options="pageSizeOptions"
								value-field="key"
								text-field="label"
								@change="(value: any) => (paginationParam.size = value)"
							/>
						</a-space>
					</a-col>
				</a-row>
				<a-table
					id="budget-table"
					size="small"
					:loading="status === 'pending'"
					:columns="columns"
					:show-sorter-tooltip="false"
					:data-source="dataSource?.data"
					:scroll="{ x: 2500 }"
					:row-key="(record) => record.budgetAccount.id"
					:row-selection="
						isClosed
							? undefined
							: {
									selectedRowKeys,
									onChange: onRowSelection,
								}
					"
					:pagination="{
						current:
							searchParams?.page === 0 ? searchParams?.page + 1 : searchParams?.page,
						pageSizeOptions: ['10', '20', '50', '100'],
						pageSize: searchParams?.size,
						total: dataSource?.totalElements,
						showTotal: (total) => `총 ${total} 건`,
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
						<template v-if="column.dataIndex === 'budgetAccount' && !isClosed">
							<a-typography-link @click="showBudgetModal('PATCH', record)">
								{{ record.budgetAccount.name }}
							</a-typography-link>
						</template>
						<template
							v-if="
								column.dataIndex !== 'year' &&
								column.dataIndex !== 'companyName' &&
								column.dataIndex !== 'workplaceName' &&
								column.dataIndex !== 'costCenterName' &&
								column.dataIndex !== 'budgetAccount'
							"
						>
							<span>{{ text.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") }}</span>
						</template>
					</template>
				</a-table>
			</div>
		</template>
		<template #modal>
			<field-modal
				:title="modalField.costCenterId ? '예산수정' : '예산등록'"
				okText="저장"
				cancelText="취소"
				:is-third-btn="!modalField.costCenterId"
				:field="modalField"
				:showed="showModal"
				:third-btn-text="'저장 후 추가'"
				@closed="
					() => {
						budgetFormRef?.resetFields()
						showModal = false
					}
				"
				@submit="(data: FormData) => onSubmit(data, 'saveClose')"
				@submit-add="(data: FormData) => onSubmit(data, 'saveAdd')"
			>
				<template #content="{ field }">
					<a-form
						ref="budgetFormRef"
						:model="field"
						label-align="left"
						layout="horizontal"
						:colon="false"
						:label-col="{ span: 8 }"
						:wrapper-col="{ span: 16 }"
					>
						<a-form-item
							label="예산편성년도"
							name="year"
							:rules="[
								{
									required: false,
									message: '예산편성년도를 선택해주세요.',
									trigger: 'change',
								},
							]"
							has-feedback
						>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-date-picker
										class="full-width"
										picker="year"
										:disabled="!!field.costCenterId"
										v-model:value="field.year"
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item label="회사" name="companyName">
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-input type="text" disabled v-model:value="field.companyCode" />
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item label="사업장" name="workspaceName" has-feedback>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<eacc-select
										:url="`/api/v2/approvals/commons/companies?placeType=WORKPLACE&code=${field.companyCode}&page=0&size=100`"
										v-model:value="field.workplaceCode"
										:field-names="{
											label: 'workplaceName',
											value: 'workplaceCode',
										}"
										:on-all-field="false"
										:disabled="!!field.id"
										first
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item label="코스트센터명" name="costCenterName" has-feedback>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-tree-select
										:style="{ width: '20rem' }"
										v-model:value="field.costCenterId"
										show-search
										:tree-line="true"
										:dropdown-style="dropdownStyle"
										placeholder="코스트센터를 선택해주세요."
										:allow-clear="false"
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
										:disabled="!!field.id"
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item label="계정/비용항목" name="accountId" has-feedback>
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<a-tree-select
										:style="{ width: '20rem' }"
										v-model:value="field.accountId"
										show-search
										:dropdown-style="dropdownStyle"
										placeholder="계정항목을 선택해주세요."
										:allow-clear="false"
										tree-default-expand-all
										show-checked-strategy="SHOW_ALL"
										:tree-data="accountData"
										:tree-line="true"
										:field-names="{
											children: 'children',
											label: 'name',
											value: 'id',
										}"
										tree-node-filter-prop="name"
										:max-tag-count="2"
										:disabled="!!field.id"
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form-item label="예산금액합계" name="year">
							<a-row :wrap="false" align="middle">
								<a-col flex="1">
									<eacc-amount-input
										v-model:value="field.totalAmount"
										class="text-right mb-xs"
										disabled
									/>
								</a-col>
							</a-row>
						</a-form-item>
						<a-form
							name="budget_info"
							:style="{
								border: '1px solid #E7E7E7',
								borderRadius: '0.4rem',
								backgroundColor: '#F9F9F9',
								padding: '0 20px 20px 20px',
							}"
						>
							<a-form
								name="budget_info_first"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="1월" name="january">
									<eacc-amount-input
										v-model:value="field.january"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '1')"
									/>
								</a-form-item>
								<a-form-item label="2월" name="february">
									<eacc-amount-input
										v-model:value="field.february"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '2')"
									/>
								</a-form-item>
							</a-form>
							<a-form
								name="budget_info_second"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="3월" name="march">
									<eacc-amount-input
										v-model:value="field.march"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '3')"
									/>
								</a-form-item>

								<a-form-item label="4월" name="april">
									<eacc-amount-input
										v-model:value="field.april"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '4')"
									/>
								</a-form-item>
							</a-form>
							<a-form
								name="budget_info_third"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="5월" name="may">
									<eacc-amount-input
										v-model:value="field.may"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '5')"
									/>
								</a-form-item>

								<a-form-item label="6월" name="june">
									<eacc-amount-input
										v-model:value="field.june"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '6')"
									/>
								</a-form-item>
							</a-form>
							<a-form
								name="budget_info_fourth"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="7월" name="july">
									<eacc-amount-input
										v-model:value="field.july"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '7')"
									/>
								</a-form-item>

								<a-form-item label="8월" name="august">
									<eacc-amount-input
										v-model:value="field.august"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '8')"
									/>
								</a-form-item>
							</a-form>
							<a-form
								name="budget_info_fifth"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="9월" name="september">
									<eacc-amount-input
										v-model:value="field.september"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '9')"
									/>
								</a-form-item>

								<a-form-item label="10월" name="october">
									<eacc-amount-input
										v-model:value="field.october"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '10')"
									/>
								</a-form-item>
							</a-form>
							<a-form
								name="budget_info_sixth"
								layout="inline"
								:colon="false"
								:style="{
									display: 'inline-flex',
									flexWrap: 'nowrap',
									marginTop: '20px',
								}"
							>
								<a-form-item label="11월" name="november">
									<eacc-amount-input
										v-model:value="field.november"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '11')"
									/>
								</a-form-item>

								<a-form-item label="12월" name="december">
									<eacc-amount-input
										v-model:value="field.december"
										class="text-right mb-xs"
										:disabled="false"
										@change="onChangeTotalAccount($event, '12')"
									/>
								</a-form-item>
							</a-form>
						</a-form>
					</a-form>
				</template>
			</field-modal>
		</template>
	</page-layout>
</template>
