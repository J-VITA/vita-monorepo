<script setup lang="ts">
import { Response, createViewParams } from "@/types"
import type { Data } from "@/types/master/config"

import {
	FamilyEventViewForm,
	FamilyEventFormBrand,
	TFamilyEventAction,
	FamilyEventData,
} from "@/types/approvals/document"

import { _formatNumberCommas } from "@iwx/ui"
import dayjs, { Dayjs } from "dayjs"
import { dateFormat } from "@/types/expenses"

type Props = {
	type: "write" | "read"
}

const authStore = useAuthStore()
const { getCompanyCode, getCostCenterId, getEmployeeId } = storeToRefs(authStore)

const { getRules, checkPaymentDate } = useFamilyEventsRules()
const rules = ref<any>()

const formData = defineModel<
	ReturnType<typeof createViewParams<FamilyEventViewForm, FamilyEventFormBrand>>
>("formData", { required: true })

const { type } = defineProps<Props>()

const accountTreeData = ref<any[]>([])

const fetchAccountData = async (params: {
	costCenterId?: number
	employeeId?: number
	familyEventFlag: boolean
}) => {
	return await useCFetch<Response<any>>("/api/v2/familyEvents/requests/account", {
		method: "GET",
		params: {
			companyCode: getCompanyCode.value,
			costCenterId: params.costCenterId || getCostCenterId.value,
			employeeId: params.employeeId || getEmployeeId.value,
			familyEventFlag: params.familyEventFlag,
		},
	}).then((res: Response<any>) => {
		const data = res.data || []
		return deduplicateTreeNodes(data)
	})
}

const getFamilyEvents = async (
	approvalHeaderId: string | number
): Promise<Response<FamilyEventData>> => {
	return Promise.resolve(
		await useCFetch(`/api/v2/familyEvents/requests/approvals/${approvalHeaderId}`, {
			method: "GET",
		})
	)
}

const loadFormData = async (approvalHeaderId: string | number) => {
	const familyEventsData = (await getFamilyEvents(approvalHeaderId)).data
	return familyEventsData
}

const setOfRestActions = async (
	eventDate?: string | Dayjs,
	familEventType?: string | number
) => {
	useCFetch<Response<TFamilyEventAction>>(`/api/v2/familyEvents/requests/familyEvents`, {
		params: {
			companyCode: getCompanyCode.value,
			familyEventTypeName: familEventType,
			eventDate: eventDate ? dayjs(eventDate).format("YYYY-MM-DD") : undefined,
		},
	}).then((res: Response<TFamilyEventAction>) => {
		const familyData = res.data
		if (familyData) {
			formData.value.familyEventAmount = familyData.familyEventAmount || 0
			formData.value.mutualAidFlag = familyData.mutualAidFlag
			formData.value.wreathFlag = familyData.wreathFlag
		} else {
			formData.value.familyEventAmount = 0
			formData.value.mutualAidFlag = false
			formData.value.wreathFlag = false
		}
	})
}

onMounted(async () => {
	if (type !== "read") {
		await getRules().then((res: Response<Data>) => {
			rules.value = {
				...res.data,
			}
		})

		formData.value.paymentDueDate = await checkPaymentDate()
			.then((res: any) => {
				return dayjs()
					.month(res.month - 1)
					.date(res.day)
					.format("YYYY-MM-DD")
			})
			.catch((error: any) => {
				message.error(`${error.message}`)
				return ""
			})
	}

	accountTreeData.value = await fetchAccountData({
		costCenterId: getCostCenterId.value,
		employeeId: getEmployeeId.value,
		familyEventFlag: true,
	})
})

const isComponentActive = ref(true)

const watchInstance = watch(
	() => [formData.value.eventDate, formData.value.familyEventTypeName],
	async ([neweventDate, newFamilEventType], [oldeventDate, oldFamilEventType]) => {
		if (!isComponentActive.value || type === "read") return
		if (oldeventDate || oldFamilEventType) {
			if (neweventDate !== oldeventDate || newFamilEventType !== oldFamilEventType) {
				setOfRestActions(
					neweventDate as string | Dayjs,
					newFamilEventType as string | number
				)
			}
		}
	},
	{
		immediate: false,
	}
)

onActivated(() => {
	isComponentActive.value = true
})

onDeactivated(() => {
	isComponentActive.value = false
})

onBeforeUnmount(() => {
	watchInstance() //컴포넌트 비활성화 시 watch 수동 꺼짐. 주기가 뭔가 안맞음.
})

onUnmounted(() => {
	//경조금 변수 초기화
	formData.value = createViewParams<FamilyEventViewForm, FamilyEventFormBrand>({
		eventDate: dayjs(),
		requestEmployeeId: getEmployeeId.value,
		requestEmployeeIds: [getEmployeeId.value],
		companyCode: getCompanyCode.value,
		familyEventTypeName: "",
		familyEventAmount: 0,
		mutualAidFlag: false,
		wreathFlag: false,
		paymentDueDate: "",
	})
})

defineEmits<{
	(e: "update:data", value: any): any
}>()

defineExpose({
	loadFormData,
})
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-typography-title :level="4" class="ml-none mb-none">
			경조금 신청내용
		</a-typography-title>
	</a-flex>
	<a-descriptions
		bordered
		size="small"
		:column="2"
		:labelStyle="{ width: '15%' }"
		:contentStyle="{ width: '35%' }"
	>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				발생일자
			</template>
			<!-- v-model:value="(formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).eventDate" -->
			<a-date-picker
				v-model:value="formData.eventDate"
				:format="dateFormat"
				value-format="YYYY-MM-DD"
				style="width: 100%"
				:disabled="type === 'read'"
			>
			</a-date-picker>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				신청자
			</template>
			<!-- v-model:value="(formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).employeeIds" -->
			<eacc-select-table
				url="/api/v2/approvals/commons/employees"
				v-model:value="formData.requestEmployeeIds"
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
				:disabled="type === 'read'"
			/>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				경조구분
			</template>
			<eacc-select
				placeholder="경조구분을 선택해주세요"
				:url="`/api/v2/masters/familyEvents/types/familyEventTypes`"
				v-model:value="formData.familyEventTypeName"
				:field-names="{ label: 'label', value: 'code' }"
				:on-all-field="false"
				:disabled="type === 'read'"
				style="width: 100%"
			/>
		</a-descriptions-item>
		<a-descriptions-item label="신청금액">
			<!-- (formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>)
            .expendAmount -->
			<eacc-amount-input
				v-model:value="formData.familyEventAmount"
				:disabled="true"
				placeholder="신청금액을 입력해주세요."
			/>
			<!-- <a-space class="text-right">
        {{ _formatNumberCommas(formData.expendAmount, ',', '.')}}

      </a-space> -->
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				계정항목
			</template>
			<!-- <a-tree-select
				v-model:value="formData.accountId"
				show-search
				:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
				placeholder="계정항목을 선택해주세요."
				:allow-clear="false"
				tree-default-expand-all
				:show-checked-strategy="SHOW_ALL"
				:tree-data="accountTreeData"
				:tree-line="true"
				:field-names="{
					children: 'children',
					label: 'name',
					value: 'id',
				}"
				tree-node-filter-prop="name"
				:disabled="type === 'read'"
			>
			</a-tree-select> -->
			<a-select
				v-model:value="formData.accountId"
				:options="accountTreeData"
				:disabled="type === 'read'"
				:field-names="{
					label: 'name',
					value: 'id',
				}"
				style="width: 100%"
				placeholder="계정항목을 선택해주세요"
			>
			</a-select>
		</a-descriptions-item>
		<a-descriptions-item label="상조용품">
			<a-badge
				:color="formData?.mutualAidFlag ? 'green' : 'red'"
				:text="formData?.mutualAidFlag ? '지원' : '미지원'"
			/>
		</a-descriptions-item>
		<a-descriptions-item label="화환">
			<a-badge
				:color="formData.wreathFlag ? 'green' : 'red'"
				:text="formData.wreathFlag ? '지원' : '미지원'"
			/>
		</a-descriptions-item>
		<a-descriptions-item>
			<template #label>
				<span class="text-error">*</span>
				지급예정일
			</template>
			<!-- {{ (formData as ExViewParams<FamilyEventViewForm, FamilyEventFormBrand>).expendDate }} -->
			{{
				formData.paymentDueDate
					? $dayjs(formData.paymentDueDate).format("YYYY-MM-DD")
					: "미설정"
			}}
		</a-descriptions-item>
	</a-descriptions>
</template>
