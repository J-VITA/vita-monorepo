<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import dayjs from "dayjs"
import type { ColumnType, ColumnsType } from "ant-design-vue/lib/table/interface"
import type { Response, SlipType } from "@/types"
import {
	SlipFormType,
	pageSizeOptions,
	pagination,
	pageSize,
	generateSortParams,
} from "@/types"
import {
	type ExpenseList,
	SlipStateType,
	classifications,
	states,
} from "@/types/expenses"
import type { MenuProps } from "ant-design-vue"
import type { Data } from "@/types/master/config"
import { useExpenseListColumns } from "~/types/expenses/commons/list"
import { _formatNumberCommas } from "@iwx/ui"

const { expenseData } = defineProps<{
	expenseData: Response<Array<ExpenseList>>
}>()

const authStore = useAuthStore()
const { getEmployeeId } = storeToRefs(authStore)
const { setRouteParams } = useRouteParams()

const { checkApprovalLimit } = useExpenseRules()

const emit = defineEmits<{
	(e: "expenseModal", value: any, slipType: SlipType): void
	(e: "receiptModal", value: any): void
	(e: "cardHistoryModal"): void
	(e: "excelModal", value: any): void
	(e: "oilExpenseModal", value: any): void
	(e: "pagination", value: any, ...sorter: any): any
	(e: "refresh"): void
}>()

const columns = useExpenseListColumns()

const selectedRowKeys = ref<(string | number)[]>([])
const selectedRows = ref<any[]>([])
const totalAmount = ref<string>("0")

const initTableSelectData = () => {
	selectedRows.value = []
	selectedRowKeys.value = []
	totalAmount.value = "0"
}
const handleResizeColumn = (w: number, col: ColumnType<any>) => {
	col.width = w
}
const cellChange = (pagination: any, filters: any, sorter: any, rows: any) => {
	const sortParams = generateSortParams(sorter)
	initTableSelectData()
	emit("pagination", pagination, sortParams)
}

const onSelectionchange = (size: number) => {
	initTableSelectData()
	emit("pagination", {
		current: 0,
		pageSize: size,
	})
}

const onDelete = (ids: any) => {
	const lastId = ids.at(-1)
	ids.forEach(async (id: number) => {
		await useCFetch<Response<any>>(`/api/v2/slips/expenses/${id}`, {
			method: "DELETE",
			body: { id },
		}).then((res: Response<any>) => {
			if (res.status === 0) {
				if (lastId === id) {
					initTableSelectData()
					message.success(`삭제하였습니다.`)
					emit("refresh")
				}
			}
		})
	})
}

const onCopy = () => {
	if (selectedRows.value && selectedRows.value.length > 0) {
		const headerIds = selectedRows.value.map((e: any) => e.id)
		Modal.confirm({
			title: "선택한 행을 복사하시겠습니까?",
			content: "영수증 및 첨부파일을 제외한 모든 항목이 동일하게 복제됩니다.",
			okType: "primary",
			okText: "확인",
			cancelText: "취소",
			icon: materialIcons("mso", "error"),
			async onOk() {
				await useCFetch<Response<any>>(`/api/v2/slips/expenses/copy`, {
					method: "PUT",
					body: { headerIds },
				}).then((res: Response<any>) => {
					if (res.status === 0) {
						initTableSelectData()
						message.success(`복사하였습니다.`)
						emit("refresh")
					}
				})
			},
		})
	} else {
		message.info(`지출내역 대상을 선택해주세요.`)
	}
}

const onSelectChange = async (keys: (string | number)[], rows: any[]) => {
	selectedRowKeys.value = keys
	selectedRows.value = rows

	if (expenseData.data && expenseData.data.length > 0) {
		const total = calculateSumForSelectedItems(
			rows,
			expenseData.data,
			"id",
			"totalAmount"
		)
		totalAmount.value = total.toLocaleString()
	} else {
		initTableSelectData()
	}
}

const expenseMenuItemClick: MenuProps["onClick"] = async (e) => {
	try {
		if (e.key === "PERSONAL_EXPENSE") {
			emit("expenseModal", undefined, e.key)
		} else if (e.key === "RECEIPT") {
			emit("receiptModal", undefined)
		} else if (e.key === "EXCEL") {
			emit("excelModal", undefined)
		} else if (e.key === "OIL") {
			emit("oilExpenseModal", undefined)
		}
	} catch (e: any) {
		message.error(e.message)
	}
}

const approvalMenuItemClick: MenuProps["onClick"] = async (e) => {
	try {
		const checkDate = await checkApprovalLimit()
		if (checkDate) {
			postApprovals(`${e.key}`)
		} else {
			message.info(`상신 기간이 아닙니다.`)
		}
	} catch (e: any) {
		message.error(e.message)
	}
}

/**
 * 결재상신 (임시저장)
 * @description approvalFormType => DISBURSEMENT_FORM: 지출결의서(통합), PERSONAL_EXPENSE_FORM: 개인경비신청서, CARD_FORM: 법인카드사용내역서
 * @param type
 */
const postApprovals = async (type: string) => {
	if (selectedRows.value && selectedRows.value.length > 0) {
		// const formIds = selectedRows.value.map((x) => ({ id: x.id }));

		const path: string = `/approvals/write-${compCase(type)}`

		Modal.confirm({
			title: "선택한 지출항목으로 결재문서를 작성하시겠습니까?",
			okType: "primary",
			okText: "확인",
			cancelText: "취소",
			icon: materialIcons("mso", "error"),
			async onOk() {
				await setRouteParams(path, selectedRows.value).finally(async () => {
					initTableSelectData()
					await navigateTo(path)
				})
			},
		})
	} else {
		message.info(
			`${type === SlipFormType.DISBURSEMENT_FORM ? "지출결의서" : "개인경비신청서"} 대상을 선택해주세요`
		)
	}
}

const moveToApprovalDocuments = async (
	formType: SlipFormType,
	approvalHeaderId: string | number,
	slipStatus: SlipStateType
) => {
	// 작성완료(임시저장) 을 제외
	const filteredSlipStateType = enumOmit(SlipStateType, "COMPLETE_TEMP_BOX")
	const isRead =
		Object.values(filteredSlipStateType).filter((e) => e === slipStatus).length > 0
	const path: string = `/approvals/${isRead ? "read" : "write"}-${compCase(formType)}Form/${approvalHeaderId}`
	await navigateTo(path)
}

watchSyncEffect(() => {
	if (
		expenseData.data &&
		expenseData.data.length > 0 &&
		selectedRows.value &&
		selectedRows.value.length > 0
	) {
		const total = calculateSumForSelectedItems(
			selectedRows.value,
			expenseData.data,
			"id",
			"totalAmount"
		)
		totalAmount.value = total.toLocaleString()
	} else {
		initTableSelectData()
	}
})
</script>
<template>
	<a-flex gap="small" justify="space-between" align="center" class="mb-sm" wrap="wrap">
		<a-typography-text>
			{{ selectedRowKeys.length }}건 ({{ totalAmount }}원) 선택됨
		</a-typography-text>
		<a-space :size="5">
			<eacc-button
				component-is="delete"
				size="middle"
				:modal-open="true"
				:data="selectedRowKeys"
				@click="onDelete"
				:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
			/>
			<a-button
				:icon="materialIcons('mso', 'content_copy')"
				@click="onCopy"
				:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
			>
				복사
			</a-button>
			<a-button
				type="primary"
				:icon="materialIcons('mso', 'credit_card')"
				@click.prevent="emit('cardHistoryModal')"
			>
				법인카드
			</a-button>
			<a-dropdown :trigger="['click']">
				<a-button
					type="primary"
					:icon="materialIcons('mso', 'receipt_long')"
					class="dropdown-link"
				>
					개인경비
				</a-button>
				<template #overlay>
					<a-menu @click="expenseMenuItemClick">
						<!-- @click="emit('selected', undefined)" -->
						<a-menu-item key="PERSONAL_EXPENSE">
							<component :is="materialIcons('mso', 'edit')" />
							<span class="ml-sm">지출내역추가</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="RECEIPT">
							<component :is="materialIcons('mso', 'center_focus_weak')" />
							<span class="ml-sm">영수증 자동 인식</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="OIL">
							<component :is="materialIcons('mso', 'directions_car')" />
							<span class="ml-sm">유류대 추가</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="EXCEL" disabled>
							<component :is="materialIcons('mso', 'upload_file')" />
							<span class="ml-sm">엑셀업로드</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item key="CARD" disabled>
							<component :is="materialIcons('mso', 'credit_card')" />
							<span class="ml-sm">개인카드 불러오기</span>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>
			<a-dropdown
				:trigger="['click']"
				:disabled="!selectedRowKeys || selectedRowKeys.length === 0"
			>
				<a-button
					type="primary"
					ghost
					:icon="materialIcons('mso', 'edit_square')"
					class="dropdown-link"
				>
					결재상신
				</a-button>
				<template #overlay>
					<a-menu @click="approvalMenuItemClick">
						<a-menu-item :key="SlipFormType.DISBURSEMENT_FORM" disabled>
							<component :is="materialIcons('mso', 'edit_square')" />
							<span class="ml-sm">지출결의서</span>
						</a-menu-item>
						<a-menu-divider />
						<a-menu-item :key="SlipFormType.PERSONAL_EXPENSE_FORM">
							<component :is="materialIcons('mso', 'receipt_long')" />
							<span class="ml-sm">개인경비신청서</span>
						</a-menu-item>
					</a-menu>
				</template>
			</a-dropdown>
			<a-select
				v-if="expenseData.size"
				v-model:value="expenseData.size"
				:options="pageSizeOptions"
				value-field="key"
				text-field="label"
				@change="(page: any) => onSelectionchange(page)"
			/>
		</a-space>
	</a-flex>

	<!-- :custom-row="
      (record: any) => {
        return {
          onClick: () => {
            emit('expenseModal', record);
          },
        };
      }
    " 
    row-class-name="cursor-pointer"
  -->
	<a-table
		v-if="expenseData"
		size="small"
		:columns="columns"
		:data-source="expenseData.data"
		:pagination="
			Object.assign({}, pagination, {
				current: expenseData.pageNumber ? expenseData.pageNumber + 1 : 1,
				pageSize: expenseData.size,
				total: expenseData.totalElements,
			})
		"
		:row-key="(record: any) => record.id"
		:row-selection="{
			selectedRowKeys: selectedRowKeys,
			onChange: onSelectChange,
			getCheckboxProps: (record: any) => ({
				disabled: [
					'UNPROCESSED',
					'COMPLETE_TEMP_BOX',
					'CONFIRM',
					'SEAL_STANDBY',
					'APPROVAL_ING',
				].includes(record.slipStatusName),
			}),
		}"
		:show-sorter-tooltip="false"
		@resize-column="handleResizeColumn"
		@change="cellChange"
	>
		<template #bodyCell="{ column, text, record }">
			<template v-if="column.dataIndex === 'slipTypeName'">
				<a-tag :color="classifications[text].color">
					{{ classifications[text].text }}
				</a-tag>
			</template>
			<template v-else-if="column.dataIndex === 'slipNumber'">
				<a-typography-link @click="emit('expenseModal', record, record.slipTypeName)">
					{{ text }}
				</a-typography-link>
			</template>
			<template v-else-if="column.dataIndex === 'krwTotalAmount'">
				<a-tag style="float: left" color="red" v-if="record.divisionSlipFlag">분할</a-tag>
				<a-typography-text strong>
					<!-- {{ formatCurrency(text, record.currencyTypeName) }} -->
					{{ _formatNumberCommas(text, ",", ".") }}
				</a-typography-text>
			</template>
			<template v-else-if="column.dataIndex === 'description'">
				<a-typography-text
					:style="{ width: `${column.width}px` }"
					:ellipsis="{
						tooltip: text,
					}"
					:content="text"
				/>
			</template>
			<template v-else-if="column.dataIndex === 'fileId'">
				<component
					:is="materialIcons('mso', text ? 'radio_button_unchecked' : 'close')"
				/>
			</template>
			<template v-else-if="column.dataIndex === 'slipStatusName'">
				<a-badge
					v-if="['UNPROCESSED', 'COMPLETE'].includes(text)"
					status="default"
					:color="states[text]?.color"
					:text="states[text]?.text"
				/>
				<a-popover v-else placement="bottomLeft">
					<template #content>
						<a-typography-link
							@click="
								moveToApprovalDocuments(
									record.slipTypeName,
									record.approvalHeaderId,
									text
								)
							"
						>
							{{ record.title || "제목없음" }}
						</a-typography-link>
					</template>
					<a-badge
						class="cursor-pointer"
						status="processing"
						:color="states[text]?.color"
						:text="states[text]?.text"
					/>
				</a-popover>
			</template>
			<template v-else>
				{{ text }}
			</template>
		</template>
	</a-table>
</template>
