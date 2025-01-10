<script setup lang="ts">
import { ExViewParams, Response, createViewParams, dateTimeFormat } from "@/types"
import type { Data } from "@/types/master/config"

import {
	CardIssueData,
	CardIssueRequestStatus,
	CardIssueViewForm,
	CardIssueViewFormBrand,
	CardType,
} from "@/types/approvals/document"
import dayjs, { Dayjs } from "dayjs"

type Props = {
	type: "write" | "read"
}

const authStore = useAuthStore()
const { getEmployeeId, getCompanyCode } = storeToRefs(authStore)
const { getRules } = useExpenseRules()
const rules = ref<any>()

const formData = defineModel<
	ReturnType<typeof createViewParams<CardIssueViewForm, CardIssueViewFormBrand>>
>("formData", { required: true })

const { type } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:data", value: any): any
}>()

const disabledCardEmployee = computed(() => formData.value?.cardType === CardType.SHARED)

const getCardIssues = async (
	approvalHeaderId: string | number
): Promise<Response<CardIssueData>> => {
	return Promise.resolve(
		await useCFetch(`/api/v2/cards/commons/issues/${approvalHeaderId}`, {
			method: "GET",
		})
	)
}

const loadFormData = async (approvalHeaderId: string | number) => {
	const cardIssueData = (await getCardIssues(approvalHeaderId)).data
	return cardIssueData
}

onMounted(async () => {
	getRules().then((res: Response<Data>) => {
		rules.value = {
			...res.data,
		}
	})
})

onUnmounted(() => {
	formData.value = createViewParams<CardIssueViewForm, CardIssueViewFormBrand>({
		id: undefined,
		approvalHeaderId: undefined,
		requestedBy: getEmployeeId.value,
		requestedByEmployeeIds: [getEmployeeId.value],
		companyCode: getCompanyCode.value,
		startDate: useMonth.toDay(),
		endDate: useMonth.todayEnd(),
		usedDate: [useMonth.toDay(), useMonth.todayEnd()],
		cardType: "",
		cardOwnerEmployeeIds: [],
		cardOwnerEmployeeId: "",
		description: "",
		cardIssueRequestStatus: CardIssueRequestStatus.PENDING,
	})
})

defineExpose({
	loadFormData,
})
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none"> 신청내용 </a-typography-title>
	</a-flex>
	<a-descriptions
		bordered
		size="small"
		:column="2"
		:labelStyle="{ width: '15%' }"
		:contentStyle="{ width: '35%' }"
	>
		<a-descriptions-item label="신청자">
			<eacc-select-table
				url="/api/v2/approvals/commons/employees"
				v-model:value="formData.requestedByEmployeeIds"
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
				disabled
			/>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				사용 기간
			</template>
			<a-range-picker
				show-time
				show-today
				v-model:value="formData.usedDate"
				:value-format="dateTimeFormat"
				@change="
					(_, date: [string, string] | [Dayjs, Dayjs]) => {
						if (date) {
							formData.startDate = date[0]
							formData.endDate = date[1]
						} else {
							formData.startDate = dayjs(undefined)
							formData.endDate = dayjs(undefined)
						}
					}
				"
				:disabled="type === 'read'"
			>
			</a-range-picker>
		</a-descriptions-item>

		<a-descriptions-item label="신청카드유형">
			<eacc-select
				placeholder="신청카드유형"
				:url="`/api/v2/cards/managements/types/CardType`"
				v-model:value="formData.cardType"
				:field-names="{ label: 'label', value: 'code' }"
				:on-all-field="false"
				:first="!formData.cardType"
				style="width: 100%"
				@update:value="
					(code: CardType) => {
						// 공용법카 선택 시 소유자 지정 불가, 공용법카 수신자는 수신라인관리에서 지정
						if (
							code === CardType.SHARED &&
							formData?.cardOwnerEmployeeIds &&
							formData?.cardOwnerEmployeeIds.length > 0
						) {
							formData.cardOwnerEmployeeIds = []
						}
					}
				"
				:disabled="type === 'read'"
			/>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span v-if="formData.cardType == CardType.PERSONAL" class="text-error">*</span>
				카드소유자
			</template>
			<eacc-select-table
				url="/api/v2/approvals/commons/employees"
				v-model:value="formData.cardOwnerEmployeeIds"
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
				:disabled="disabledCardEmployee || type === 'read'"
				@selection-change="
					(row: any) => {
						if (row && row.length > 0) {
							formData.cardOwnerEmployeeId = row[0].id
						} else {
							formData.cardOwnerEmployeeId = ''
						}
					}
				"
			/>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				사용목적
			</template>
			<a-textarea
				v-model:value="formData.description"
				class="fixed"
				placeholder="사용목적을 입력해주세요."
				allow-clear
				:disabled="type === 'read'"
			/>
		</a-descriptions-item>
	</a-descriptions>
</template>
