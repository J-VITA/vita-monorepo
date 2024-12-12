<script setup lang="ts">
import { BudgetActualDetailData, options } from "@/types/budgets"

type Props = {
	showModal: boolean
	dataSource: Array<BudgetActualDetailData>
}

const { showModal = false, dataSource } = defineProps<Props>()
const emit = defineEmits<{
	(e: "closeModal"): void
}>()

const modalField = ref<Array<string>>([])
</script>

<template>
	<div>
		<field-modal
			title="지출내역 상세"
			cancelText="닫기"
			size="full"
			:field="modalField"
			:showed="showModal"
			:isOkBtn="false"
			@closed="emit('closeModal')"
		>
			<template #content="{ field }">
				<div>
					<a-flex align="center" justify="space-between" class="mb-sm">
						<span style="font-weight: 700">조회년월: {{ "2024-04" }}</span>

						<a-button :icon="materialIcons('mso', 'download')">엑셀다운로드</a-button>
					</a-flex>
					<a-table
						size="small"
						:row-key="(record) => record.id"
						:loading="false"
						:columns="[
							{ title: '전표유형', dataIndex: 'slipType' },
							{
								title: '결재문서번호',
								children: [
									{
										dataIndex: 'approvalNumber',
										width: 150,
										colSpan: 1,
										rowSpan: 0,
									},
									{
										dataIndex: 'approvalHeaderId',
										width: 150,
										rowSpan: 0,
									},
								],
							},
							{ title: '사용일자', dataIndex: 'evidenceDate' },
							{ title: '사용자', dataIndex: 'evidenceVendorName' },
							{ title: '코스트센터명', dataIndex: 'budgetCostCenter' },
							{ title: '계정금액', dataIndex: 'budgetAccount' },
							{ title: '부가세', dataIndex: 'taxAmount' },
							{ title: '총금액', dataIndex: 'totalAmount' },
							{ title: '거래처', dataIndex: 'paymentVendorName' },
							{ title: '계정/비용과목', dataIndex: 'budgetAccount' },
							{ title: '프로젝트', dataIndex: 'projectName' },
							{ title: '전표상태', dataIndex: 'slipStatus' },
							{ title: '내용', dataIndex: 'description' },
							{ title: '작성일자', dataIndex: 'evidenceDate' },
						]"
						:data-source="dataSource"
						:pagination="false"
					>
						<template #bodyCell="{ column, text, record }">
							<template v-if="column.dataIndex === 'slipType'">
								<a-tag
									:color="
										options.slipType.filter((element: any) => {
											return element.value === record.slipType.code
										})[0].color
									"
								>
									{{
										options.slipType.filter((element: any) => {
											return element.value === record.slipType.code
										})[0].label
									}}
								</a-tag>
							</template>
							<template v-if="column.dataIndex === 'approvalHeaderId'">
								<a-button :icon="materialIcons('mso', 'edit_square')"></a-button>
							</template>
							<template v-if="column.dataIndex === 'budgetCostCenter'">
								{{ record.budgetCostCenter.name }}
							</template>
							<template v-if="column.dataIndex === 'budgetAccount'">
								{{ record.budgetAccount.parentName }} >
								{{ record.budgetAccount.name }}
							</template>
							<template v-if="column.dataIndex === 'slipStatus'">
								<a-badge
									:color="
										options.slipStatus.filter((element: any) => {
											return element.value === record.slipStatus.code
										})[0].color
									"
									:text="record.slipStatus.label"
								/>
							</template>
						</template>
					</a-table>
				</div>
			</template>
		</field-modal>
	</div>
</template>
