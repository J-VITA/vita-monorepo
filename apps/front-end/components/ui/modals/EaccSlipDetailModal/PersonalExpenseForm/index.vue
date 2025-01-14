<script lang="ts" setup>
import { Response } from "@/types"
import { ExpenseBuilder, Slip, SlipTaxType, states } from "@/types/expenses"

const { slips } = defineProps<{ slips: any }>()
const formData = ref<Slip>(new ExpenseBuilder().build())

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const isLoading = ref<boolean>(false)

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

const costCenterTreeData = ref<any[]>([])
const accountTreeData = ref<any[]>([])

const reload = async () => {
	if (slips.id) {
		isLoading.value = true
		await useCFetch<Response<any>>(`/api/v2/slips/expenses/${slips.id}`, {
			method: "GET",
			params: { id: slips.id },
		})
			.then((response: Response<any>) => {
				if (response.status === 0) {
					formData.value = {
						...response.data,
						slipHeader: {
							...response.data.slipHeader,
							workplaceCodes: [response.data.slipHeader.workplaceCode],
							writer: [response.data.slipHeader.writerId as number],
						},
						slipDetails: response.data.slipDetails.map((detail: any) => ({
							...detail,
							taxCode:
								detail.taxCode === "A"
									? SlipTaxType.NON_DEDUCTION
									: SlipTaxType.DEDUCTION,
							employee: detail.employee ? detail.employee : [detail.employeeId as number],
							employeeId: detail.employeeId
								? detail.employeeId
								: response.data.slipHeader,
							projectIds: [detail.projectId],
						})),
						receiptFile: response.data.receiptFile
							? [
									{
										...response.data.receiptFile,
										uid: response.data.receiptFile.id,
									},
								]
							: [],
						files:
							response.data.files?.map((file: any) => ({ ...file, uid: file.id })) || [],
						documents:
							response.data.documents?.map((file: any) => ({
								...file,
								uid: file.id,
							})) || [],
					}
					if (formData.value.slipHeader.divisionSlipFlag) {
						emit("modalSize", "140rem")
					} else {
						emit("modalSize", "80rem")
					}
				} else {
					message.error(`${response.message}`)
				}
			})
			.finally(async () => (isLoading.value = false))
	}
}

onMounted(async () => {
	await reload()
	if (formData?.value?.slipHeader) {
		accountTreeData.value = await fetchAccountData()
		costCenterTreeData.value = await fetchCostCenterData()
	}
})

onUnmounted(() => {
	formData.value = new ExpenseBuilder().build()
	accountTreeData.value = []
	costCenterTreeData.value = []
})

defineExpose({
	reload,
})
</script>
<template>
	<a-spin :spinning="isLoading" tip="데이터를 불러오는 중입니다.">
		<a-row :gutter="40">
			<a-col :span="formData.slipHeader.divisionSlipFlag ? 8 : 11">
				<div class="viewer mb-xl">
					<receipt-file-upload
						:is-read="true"
						v-model:file-list="formData.receiptFile"
						:file-props="{
							companyCode: getCompanyCode,
							fileType: 'RECEIPT',
							documentedNumber: formData.slipHeader.slipNumber,
						}"
					/>
				</div>
				<a-descriptions
					size="small"
					:column="1"
					bordered
					:label-style="{ width: '10rem' }"
				>
					<a-descriptions-item label="첨부파일">
						<a-flex v-for="(item, idx) in formData?.files" :key="idx">
							<paper-clip-outlined />
							<a-typography-link :href="item.downloadUrl" :download="item.originalName">
								{{ item.originalName }}
							</a-typography-link>
						</a-flex>
					</a-descriptions-item>
					<a-descriptions-item label="관련문서">
						<a-flex v-for="(item, idx) in formData?.documents" :key="idx">
							<paper-clip-outlined />
							<a-typography-link :href="item.downloadUrl" :download="item.originalName">
								{{ item.originalName }}
							</a-typography-link>
						</a-flex>
					</a-descriptions-item>
				</a-descriptions>
			</a-col>
			<a-col :span="formData.slipHeader.divisionSlipFlag ? 16 : 13">
				<a-flex
					v-if="formData.slipHeader.divisionSlipFlag"
					justify="space-between"
					wrap="wrap"
				>
					<a-typography-title :level="5" class="ml-none mb-none"
						>공통 전표정보</a-typography-title
					>
					<a-divider type="horizontal" class="full-height mt-sm mb-md" />
				</a-flex>
				<a-descriptions
					size="small"
					:column="formData.slipHeader.divisionSlipFlag ? 2 : 1"
					bordered
					:label-style="{ width: '10rem' }"
				>
					<a-descriptions-item label="전표유형">
						<a-tag color="orange">개인경비</a-tag>
					</a-descriptions-item>
					<a-descriptions-item label="상태">
						<a-badge
							:color="
								states[formData.slipHeader.slipStatusName || '']
									? states[formData.slipHeader.slipStatusName || '']?.color || 'red'
									: 'blue'
							"
							:text="formData.slipHeader.slipStatusLabel"
						/>
					</a-descriptions-item>
					<a-descriptions-item
						label="사용자"
						v-if="!formData.slipHeader.divisionSlipFlag"
					>
						<eacc-select-table
							v-model:value="formData.slipHeader.writer"
							key-props="id"
							label-prop="name"
							url="/api/v2/slips/commons/employees"
							:columns="[
								{ title: '회사', data: (row: any) => row.companyName },
								{ title: 'id', data: (row: any) => row.id },
								{
									title: '사업장',
									data: (row: any) => row.workplaceName,
								},
								{
									title: '코스트센터',
									data: (row: any) => row.costCenterName,
								},
								{ title: '직위', data: (row: any) => row.gradeName },
								{ title: '이름', data: (row: any) => row.name },
							]"
							disabled
						/>
						<!-- {{ formData.slipHeader.evidenceVendorName }} -->
					</a-descriptions-item>
					<a-descriptions-item label="사용일자">
						{{ formData.slipHeader.evidenceDate }}
					</a-descriptions-item>
					<a-descriptions-item label="부채계정">
						<eacc-select
							style="width: 100%"
							:url="`/api/v2/slips/commons/credit`"
							:params="{
								companyCode: getCompanyCode,
								personalExpenseFlag: true,
								cardFlag: false,
								billInvoiceFlag: false,
							}"
							placeholder="매칭데이터없음"
							:on-all-field="false"
							v-model:value="formData.slipHeader.accruedAccountCode"
							:field-names="{ label: 'name', value: 'code' }"
							disabled
						/>
					</a-descriptions-item>
					<a-descriptions-item label="지급예정일">
						{{ formData.slipHeader.paymentDueDate }}
					</a-descriptions-item>
					<a-descriptions-item label="가맹점">
						{{ formData.slipHeader.storeName }}
					</a-descriptions-item>
					<a-descriptions-item label="총금액">
						{{ formData.slipHeader.totalAmount?.toLocaleString() }}
					</a-descriptions-item>
				</a-descriptions>
				<a-row :gutter="20">
					<a-col
						:span="formData.slipHeader.divisionSlipFlag ? 12 : 24"
						v-for="(form, key) in formData.slipDetails"
						:key="key"
					>
						<a-flex
							justify="space-between"
							wrap="wrap"
							class="mt-md"
							v-if="formData.slipHeader.divisionSlipFlag"
						>
							<a-space :size="3">
								<a-typography-title :level="5" class="ml-none mb-md"
									>분할 전표 {{ key + 1 }}</a-typography-title
								>
							</a-space>
						</a-flex>
						<a-descriptions
							size="small"
							:column="1"
							bordered
							:label-style="{ width: '10rem' }"
						>
							<a-descriptions-item
								label="참석자"
								v-if="formData.slipHeader.divisionSlipFlag"
							>
								<eacc-select-table
									v-model:value="form.employee"
									key-props="id"
									label-prop="name"
									url="/api/v2/slips/commons/employees"
									:columns="[
										{ title: '회사', data: (row: any) => row.companyName },
										{ title: 'id', data: (row: any) => row.id },
										{ title: '사업장', data: (row: any) => row.workplaceName },
										{
											title: '코스트센터',
											data: (row: any) => row.costCenterName,
										},
										{ title: '직위', data: (row: any) => row.gradeName },
										{ title: '이름', data: (row: any) => row.name },
									]"
									disabled
								/>
							</a-descriptions-item>
							<a-descriptions-item label="과세유형">
								<eacc-select
									style="width: 100%"
									url="/api/v2/slips/expenses/types/deductionTypes"
									placeholder="매칭데이터없음"
									v-model:value="form.taxCode"
									:field-names="{ label: 'label', value: 'code' }"
									:on-all-field="false"
									disabled
								/>
							</a-descriptions-item>
							<a-descriptions-item label="공급가액">
								{{ form.supplyAmount?.toLocaleString() }}
							</a-descriptions-item>
							<a-descriptions-item label="부가세">
								{{ form.taxAmount?.toLocaleString() }}
							</a-descriptions-item>
							<a-descriptions-item label="내용">
								{{ form.description }}
							</a-descriptions-item>
							<a-descriptions-item label="코스트센터">
								<a-tree-select
									style="width: 100%"
									:dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
									v-model:value="form.costCenterId"
									:tree-data="costCenterTreeData"
									:field-names="{
										children: 'children',
										label: 'name',
										value: 'id',
									}"
									placeholder="매칭데이터없음"
									tree-node-filter-prop="name"
									:on-all-field="false"
									disabled
								/>
							</a-descriptions-item>
							<a-descriptions-item label="계정항목">
								<a-tree-select
									style="width: 100%"
									v-model:value="form.accountId"
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
							<a-descriptions-item label="프로젝트">
								<eacc-select-table
									url="/api/v2/slips/commons/projects"
									v-model:value="form.projectIds"
									placeholder="매칭데이터없음"
									key-props="id"
									label-prop="name"
									:columns="[{ title: '이름', data: (row: any) => row.name }]"
									disabled
								/>
							</a-descriptions-item>
							<a-descriptions-item label="사업장">
								<eacc-select-table
									:url="`/api/v2/slips/commons/companies`"
									:params="{
										code: getCompanyCode,
									}"
									key-props="workplaceCode"
									label-prop="workplaceName"
									placeholder="매칭데이터없음"
									v-model:value="formData.slipHeader.workplaceCodes"
									:columns="[
										{ title: '사업장명', data: (row: any) => row.workplaceName },
										{ title: '사업장코드', data: (row: any) => row.workplaceCode },
									]"
									disabled
								>
								</eacc-select-table>
							</a-descriptions-item>
						</a-descriptions>
					</a-col>
				</a-row>
			</a-col>
		</a-row>
	</a-spin>
</template>
