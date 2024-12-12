<script setup lang="ts">
import { ExViewParams, Response, createViewParams } from "@/types"
import type { Data } from "@/types/master/config"

import { FamilyEventViewForm, FamilyEventFormBrand } from "@/types/approvals/document"

type Props = {
	type: "write" | "read"
}

const authStore = useAuthStore()
const { getEmployeeId, getName } = storeToRefs(authStore)

const { getRules } = useExpenseRules()
const rules = ref<any>()

const formData = defineModel<
	ReturnType<typeof createViewParams<FamilyEventViewForm, FamilyEventFormBrand>>
>("formData", { required: true })

const { type } = defineProps<Props>()

const emit = defineEmits<{
	(e: "update:data", value: any): any
}>()

onMounted(() => {
	getRules().then((res: Response<Data>) => {
		rules.value = {
			...res.data,
		}
	})
})
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none">
			경조금 신청내용
		</a-typography-title>
	</a-flex>
	<a-form>
		<a-descriptions
			bordered
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<a-form-item label="발생일자">
				<a-descriptions-item>
					<!-- v-model:value="(formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).actualDate" -->
					<a-date-picker v-model:value="formData.actualDate" style="width: 100%">
					</a-date-picker>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="신청자">
				<a-descriptions-item>
					<!-- v-model:value="(formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).employeeIds" -->
					<eacc-select-table
						url="/api/v2/approvals/commons/employees"
						v-model:value="formData.employeeIds"
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
					/>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="경조구분">
				<a-descriptions-item>
					<eacc-select
						placeholder="경조구분을 선택해주세요"
						:url="`/api/v2/master/familyEvents/types/familyEventTypes`"
						v-model:value="formData.familEventType"
						:field-names="{ label: 'label', value: 'code' }"
						:on-all-field="false"
						first
					/>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="신청금액">
				<a-descriptions-item>
					<!-- (formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>)
								.expendAmount -->
					<eacc-amount-input
						v-model:value="formData.expendAmount"
						:disabled="true"
						placeholder="신청금액을 입력해주세요."
					/>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="상조용품">
				<a-descriptions-item>
					<a-badge
						:color="formData?.mutualYn ? 'green' : 'red'"
						:text="formData?.mutualYn ? '사용' : '미사용'"
					/>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="화환">
				<a-descriptions-item>
					<a-badge
						:color="formData.wreathYn ? 'green' : 'red'"
						:text="formData.wreathYn ? '사용' : '미사용'"
					/>
				</a-descriptions-item>
			</a-form-item>
			<a-form-item label="지급예정일">
				<a-descriptions-item>
					<!-- {{ (formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).expendDate }} -->
					{{ $dayjs(formData.expendDate).format("YYYY-MM-DD") }}
				</a-descriptions-item>
			</a-form-item>
		</a-descriptions>
	</a-form>
</template>
