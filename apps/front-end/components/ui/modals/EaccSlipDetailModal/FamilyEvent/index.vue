<script lang="ts" setup>
import { createViewParams, Response } from "@/types"
import { FamilyEventFormBrand, FamilyEventViewForm } from "@/types/approvals/document"

const { slips } = defineProps<{ slips: any }>()
const formData = ref<any>(createViewParams<FamilyEventViewForm, FamilyEventFormBrand>)

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const isLoading = ref<boolean>(false)

const accountTreeData = ref<any[]>([])

const emit = defineEmits<{
	(e: "modalSize", value: string): void
}>()

const fetchAccountData = async () => {
	return await useCFetch<Response<any>>(`/api/v2/masters/accounts`, {
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

const reload = async () => {
	console.log("slips ", slips)
	if (slips) {
		isLoading.value = true
		await useCFetch<Response<any>>(
			`/api/v2/familyEvents/requests/approvals/${slips.approvalHeaderId}`,
			{
				method: "GET",
				params: { id: slips.approvalHeaderId },
			}
		)
			.then((response: Response<any>) => {
				if (response.status === 0) {
					formData.value = response.data
				} else {
					message.error(`${response.message}`)
				}
			})
			.finally(() => {
				isLoading.value = false
				emit("modalSize", "80rem")
			})
	}
}

onMounted(async () => {
	await reload()
	if (formData?.value?.slipHeader) {
		accountTreeData.value = await fetchAccountData()
	}
})

onUnmounted(() => {
	formData.value = null
	accountTreeData.value = []
})

defineExpose({
	reload,
})
</script>
<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-descriptions size="small" :column="1" bordered :label-style="{ width: '10rem' }">
			<a-descriptions-item label="전표유형">
				<a-tag color="default"> 경조금 </a-tag>
			</a-descriptions-item>
			<a-descriptions-item label="발생일자">
				{{ formData.eventDate }}
			</a-descriptions-item>
			<a-descriptions-item label="신청자">
				{{ formData.requestEmployeeName }}
			</a-descriptions-item>
			<a-descriptions-item label="경조구분">
				{{ formData.familyEventTypeLabel }}
			</a-descriptions-item>
			<a-descriptions-item label="신청금액">
				{{ formData.familyEventAmount?.toLocaleString() }}
			</a-descriptions-item>
			<a-descriptions-item label="계정항목">
				<a-tree-select
					style="width: 100%"
					v-model:value="formData.accountId"
					:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
					placeholder="매칭데이터없음"
					:tree-data="accountTreeData"
					:field-names="{
						children: 'children',
						label: 'name',
						value: 'id',
					}"
					tree-node-filter-prop="name"
					disabled
				>
				</a-tree-select>
			</a-descriptions-item>
			<a-descriptions-item label="상조용품">
				<a-badge
					:color="formData.mutualAidFlag ? 'green' : 'red'"
					:text="formData.mutualAidFlag ? '지원' : '미지원'"
				/>
			</a-descriptions-item>
			<a-descriptions-item label="화환">
				<a-badge
					:color="formData.wreathFlag ? 'green' : 'red'"
					:text="formData.wreathFlag ? '지원' : '미지원'"
				/>
			</a-descriptions-item>
			<a-descriptions-item label="지급예정일">
				{{ formData.paymentDueDate }}
			</a-descriptions-item>
		</a-descriptions>
	</a-spin>
</template>
