<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { type BudgetList, BudgetLists, IBudgetList } from "~/types/budgets"
import type { ColumnsType } from "ant-design-vue/lib/table/interface"
const {
	show = false,
	budgetData,
	currentPageDataList,
} = defineProps<{
	show: boolean
	budgetData?: any //선택한 데이터 단건
	currentPageDataList?: Array<BudgetList> //페이징된 현재 데이터 다건
}>()
import { onWatcherCleanup, useTemplateRef } from "vue"

const currentPage = ref<number>(1)
const applyDetailModalOpen = ref<boolean>(false)
const budgetProposalData = ref<BudgetLists>(budgetData)

const authStore = useAuthStore()
const {
	getCompanyCode,
	getWorkplaceId,
	getWorkplaceCode,
	getRole,
	getEmployeeId,
	getCostCenterId,
} = storeToRefs(authStore)

const emit = defineEmits<{
	(e: "update:show", value: any): void
	(e: "update:switch", value: any): void
	(e: "close", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value: boolean) {
		emit("update:show", value)
	},
})
/**
 * 페이지 변화 시점에서 해당 예산내역 재 초기화
 */
watch(currentPage, async (newId: number) => {
	const ctr = new AbortController()
	const id = currentPageDataList
		? currentPageDataList
				?.filter((value: any, index: number) => index === currentPage.value - 1)
				.map((value: any) => value.id)[0]
		: budgetData.id
	budgetProposalData.value = (await Promise.resolve(
		getBudgetProposal(id, ctr.signal)
	)) as any

	onWatcherCleanup(() => {
		// abort stale request
		ctr.abort()
	}, true)
})

/**
 * 모달 오픈 시점 데이터 초기화
 */
watch(open, async () => {
	const ctr = new AbortController()
	const id = budgetData.id
	if (open.value) {
		budgetProposalData.value = (await Promise.resolve(
			getBudgetProposal(id, ctr.signal)
		)) as any
	}
	currentPage.value =
		(currentPageDataList?.findIndex((value: any) => value.id === id) ?? 1) + 1
})

const applyInfoColumns = ref<ColumnsType<any>>([
	{
		title: "신청번호",
		dataIndex: "budgetRequestNumber",
		key: "budgetRequestNumber",
		width: -1,
	},
	{
		title: "신청일",
		dataIndex: "createdAt",
		key: "createdAt",
		width: -1,
	},
	{
		title: "신청유형",
		dataIndex: "budgetRequestType.code",
		key: "budgetRequestType.code",
		width: -1,
	},
	{
		title: "신청부서",
		dataIndex: "departmentName",
		key: "departmentName",
		width: -1,
	},
	{
		title: "상태",
		dataIndex: "budgetRequestStatus.code",
		key: "budgetRequestStatus.code",
		width: -1,
	},
	{
		title: "신청자",
		dataIndex: "createdBy",
		key: "createdBy",
		width: -1,
	},
])

const applyFromInfoColumns = ref<ColumnsType<any>>([
	{
		title: "예산년월",
		dataIndex: "fromYearMonth",
		key: "fromYearMonth",
		width: -1,
	},
	{
		title: "코스트센터",
		dataIndex: "fromCostCenter.name",
		key: "fromCostCenter.name",
		width: -1,
	},
	{
		title: "계정항목",
		dataIndex: "fromAccount.name",
		key: "fromAccount.name",
		width: -1,
	},
	{
		title: "예산잔액",
		dataIndex: "fromRemainCost",
		key: "fromRemainCost",
		width: -1,
	},
])

const applyToInfoColumns = ref<ColumnsType<any>>([
	{
		title: "예산년월",
		dataIndex: "toYearMonth",
		key: "toYearMonth",
		width: -1,
	},
	{
		title: "코스트센터",
		dataIndex: "toCostCenter.name",
		key: "toCostCenter.name",
		width: -1,
	},
	{
		title: "계정항목",
		dataIndex: "toAccount.name",
		key: "toAccount.name",
		width: -1,
	},
	{
		title: "예산잔액",
		dataIndex: "toRemainCost",
		key: "toRemainCost",
		width: -1,
	},
])

/**
 * 예산 상세 정보 조회
 * @param id
 * @param signal
 */
const getBudgetProposal = async (id: number, signal?: any) => {
	return await Promise.resolve(
		useCFetch<any>(`/api/v2/budgets/request/${id}`, {
			signal,
		}).then((res: any) => res.data)
	)
}

/**
 * 예산 잔액 조회
 */
const getRemainBudget = (data: any, type: string = "from") => {
	if (!data || data.length == 0) return 0
	const value = typeof data === "object" ? data : data[0]
	let remainData = 0
	const costCenterId = type === "from" ? value.fromCostCenter.id : value.toCostCenter.id
	const accountId = type === "from" ? value.fromAccount.id : value.toAccount.id
	const year =
		type === "from"
			? value.fromYearMonth.split(" ")[0].split("-")[0]
			: value.toYearMonth.split(" ")[0].split("-")[0]
	const month =
		type === "from"
			? value.fromYearMonth.split(" ")[0].split("-")[1]
			: value.toYearMonth.split(" ")[0].split("-")[1]

	const params: any = {
		companyCode: getCompanyCode.value,
		workplaceCode: getWorkplaceCode.value,
		costCenterId,
		accountId,
		year,
		month: month,
	}

	useCFetch<any>(
		`/api/v2/budgets/remainBudget/${params.companyCode}/${params.workplaceCode}/${params.costCenterId}/${params.accountId}/${params.year}/${params.month}`,
		{
			method: "GET",
		}
	).then((res: any) => {
		if (res.status === 0) remainData = res.data
	})
	return remainData
}

const onCloseCancelModal = () => {
	emit("update:switch", true)
	emit("close", false)
}

onUpdated(() => {
	applyDetailModalOpen.value = show
})
</script>
<template>
	<div>
		<!-- title="예산신청내역 상세" -->
		<a-modal
			centered
			v-model:open="applyDetailModalOpen"
			:mask-closable="false"
			width="80rem"
			:destroy-on-close="true"
			@cancel="emit('close', false)"
		>
			<template #title>
				<a-flex justify="space-between" align="center">
					<span>
						{{ "예산신청내역" }}
					</span>
					<a-space class="pr-xl" v-if="budgetData && currentPageDataList">
						<span>{{ currentPage }}</span>
						<span>/</span>
						<span>{{ currentPageDataList.length || 0 }}</span>
						<a-input-group compact>
							<a-button
								:icon="materialIcons('mso', 'chevron_left')"
								:disabled="currentPage === 1"
								size="small"
								@click="() => (currentPage = currentPage - 1)"
							/>
							<a-button
								:icon="materialIcons('mso', 'chevron_right')"
								:disabled="currentPage === (currentPageDataList.length || 0)"
								size="small"
								@click="() => (currentPage = currentPage + 1)"
							/>
						</a-input-group>
					</a-space>
				</a-flex>
			</template>
			<div>
				<a-descriptions title="신청정보" bordered>
					<a-descriptions-item
						v-for="(applyData, idx) in applyInfoColumns"
						:key="idx"
						:label="applyData.title"
						:span="2"
					>
						<span v-if="applyData.key == 'budgetRequestNumber'">
							{{ budgetProposalData[`requestNumber`] }}
						</span>
						<a-tag
							v-if="applyData.key == 'budgetRequestType.code'"
							:color="
								budgetProposalData[`budgetRequestType`]?.code === 'ROLLOVER'
									? 'orange'
									: budgetProposalData[`budgetRequestType`]?.code === 'INCREASE'
										? 'cyan'
										: 'blue'
							"
						>
							<span>{{
								budgetProposalData[`budgetRequestType`]?.code === "ROLLOVER"
									? "예산이월"
									: budgetProposalData[`budgetRequestType`]?.code === "INCREASE"
										? "예산증액"
										: "예산전용"
							}}</span>
						</a-tag>
						<a-badge
							v-else-if="applyData.key === 'budgetRequestStatus.code'"
							:color="
								budgetProposalData[`budgetRequestStatus`]?.code === 'PENDING'
									? 'orange'
									: budgetProposalData[`budgetRequestStatus`]?.code === 'APPROVED'
										? 'green'
										: 'red'
							"
							:text="
								budgetProposalData[`budgetRequestStatus`]?.code === 'PENDING'
									? '승인대기'
									: budgetProposalData[`budgetRequestStatus`]?.code === 'APPROVED'
										? '예산승인'
										: '예산반려'
							"
						/>
						<span v-else>{{ budgetProposalData[`${applyData.key}`] }}</span>
					</a-descriptions-item>
				</a-descriptions>
			</div>
			<div style="display: inline-flex; margin: 30px 0">
				<div align="left">
					<a-descriptions title="받는대상(To)" bordered>
						<a-descriptions-item
							v-for="(applyData, idx) in applyToInfoColumns"
							:key="idx"
							:label="applyData.title"
							:span="3"
						>
							<span v-if="applyData.key === 'toRemainCost'">{{
								getRemainBudget(budgetProposalData, "to")
									.toString()
									.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
							}}</span>
							<span v-else-if="applyData.key === 'toCostCenter.name'">{{
								budgetProposalData[`toCostCenter`]?.name
							}}</span>
							<span v-else-if="applyData.key === 'toAccount.name'"
								>{{ budgetProposalData[`toAccount`]?.parentName }} >
								{{ budgetProposalData[`toAccount`]?.name }}</span
							>
							<span v-else>{{ budgetProposalData[`${applyData.key}`] }}</span>
						</a-descriptions-item>
					</a-descriptions>
				</div>
				<div style="position: relative; left: 120px">
					<a-descriptions title="주는대상(From)" bordered>
						<a-descriptions-item
							v-for="(applyData, idx) in applyFromInfoColumns"
							:key="idx"
							:label="applyData.title"
							:span="3"
						>
							<span v-if="applyData.key === 'fromRemainCost'">{{
								getRemainBudget(budgetProposalData, "from")
									.toString()
									.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
							}}</span>
							<span v-else-if="applyData.key === 'fromCostCenter.name'">{{
								budgetProposalData[`fromCostCenter`]?.name
							}}</span>
							<span v-else-if="applyData.key === 'fromAccount.name'"
								>{{ budgetProposalData["fromAccount"]?.parentName }} >
								{{ budgetProposalData["fromAccount"]?.name }}</span
							>
							<span v-else>{{ budgetProposalData[`${applyData.key}`] }}</span>
						</a-descriptions-item>
					</a-descriptions>
				</div>
			</div>
			<template #footer>
				<a-button @click="emit('close', false)">
					{{ "닫기" }}
				</a-button>
			</template>
		</a-modal>
	</div>
</template>
