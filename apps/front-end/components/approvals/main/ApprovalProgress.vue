<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response, RequestParams } from "@/types"
import type { Dayjs } from "dayjs"

const { $dayjs } = useNuxtApp()
const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const filterDate = ref<[Dayjs, Dayjs]>([useMonth.lastFrom(), useMonth.to()])

const searchParams = ref<RequestParams<any>>({
	companyCode: getCompanyCode.value,
	searchDateFrom: $dayjs(filterDate.value[0]).format("YYYY-MM-DD"), //시작일
	searchDateTo: $dayjs(filterDate.value[1]).format("YYYY-MM-DD"), //종료일
	documentStatus: undefined,
	draftEmployeeId: undefined,
	title: undefined,
	employeeId: getEmployeeId.value,
})

interface DataItem {
	title: string
	icon: string
	color: string
	bg: string
	contents: { label: string; value: number }[]
}

const data: DataItem[] = [
	{
		title: "결재",
		icon: "edit_square",
		color: "#6146E5",
		bg: "#E6F0FF",
		contents: [
			{ label: "결재처리", value: 0 },
			{ label: "결재상신", value: 0 },
		],
	},
	{
		title: "반려/회수",
		icon: "cancel",
		color: "#DD3545",
		bg: "#F8D7DA",
		contents: [
			{ label: "결재반려", value: 0 },
			{ label: "회수", value: 0 },
		],
	},
	{
		title: "완료/저장",
		icon: "verified",
		color: "#2C8958",
		bg: "#DCF6E8",
		contents: [
			{ label: "결재완료", value: 0 },
			{ label: "임시저장", value: 0 },
		],
	},
	{
		title: "참조",
		icon: "content_paste_go",
		color: "#F3A52F",
		bg: "#FEF3DD",
		contents: [{ label: "참조", value: 0 }],
	},
]

const {
	data: summary,
	pending,
	refresh,
} = await useAsyncData(
	`approvals-summary`,
	() =>
		useCFetch<Response<any>>("/api/v2/approvals/summary", {
			method: "GET",
			params: {
				...searchParams.value,
			},
		}),
	{
		transform: (response: Response<any>) => response.data,
		watch: [searchParams.value],
		immediate: true,
		deep: true,
	}
)

const navigateToSearch = async (path: string, name?: string) => {
	await navigateTo({
		path,
		query: {
			searchDateFrom: searchParams.value.searchDateFrom,
			searchDateTo: searchParams.value.searchDateTo,
		},
	})
}

onActivated(() => {
	refresh()
})
</script>
<template>
	<a-card>
		<template #title>
			<a-space :size="5" class="text-secondary">
				<question-circle-outlined />
				기간내 전자결재 현황입니다. 문서 건수를 클릭하면 관련 문서함으로 이동합니다.
			</a-space>
		</template>
		<a-flex :gap="10">
			<a-space>
				<label>기준 조회기간</label>
				<a-range-picker
					v-model:value="filterDate"
					@change="
						(_, dateString) => {
							searchParams.searchDateFrom = dateString[0]
							searchParams.searchDateTo = dateString[1]
						}
					"
				/>
			</a-space>
			<eacc-button
				componentIs="search"
				type="primary"
				:modal-open="false"
				:data="searchParams"
				@click="(value) => refresh()"
			>
			</eacc-button>
		</a-flex>
		<a-divider />
		<a-spin :spinning="pending">
			<a-row :gutter="15">
				<a-col flex="1" v-for="(item, idx) in data" :key="idx">
					<a-card
						:bodyStyle="{ padding: '1.5rem' }"
						:headStyle="{ padding: '1rem 1.5rem' }"
					>
						<template #title>
							<a-space>
								<a-avatar
									:style="{ backgroundColor: item.bg, color: item.color }"
									:icon="materialIcons('mso', item.icon)"
								>
								</a-avatar>
								<a-typography-text strong>{{ item.title }}</a-typography-text>
							</a-space>
						</template>
						<a-flex
							v-for="(list, idx) in item.contents"
							:key="idx"
							justify="space-between"
							:class="item.contents.length !== idx + 1 ? 'mb-sm' : undefined"
						>
							<!-- TODO: API 만 붙혀놓고 추후 알맞게 동적으로 수정해야함...(기간조회날짜를 넘겨주는 형태로 넘겨야함.) -->
							<label>{{ list.label }}</label>
							<!-- <a-typography-link>{{ list.value }}건</a-typography-link> -->
							<a-typography-link
								v-if="list.label === '결재처리'"
								@click="navigateToSearch('/approvals/wait')"
								>{{ summary.pendingApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '결재상신'"
								@click="navigateToSearch('/approvals/processing')"
								>{{ summary.progressApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '결재반려'"
								@click="navigateToSearch('/approvals/returned/REJECTED')"
								>{{ summary.rejectedApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '회수'"
								@click="navigateToSearch('/approvals/returned/WITHDRAWN')"
								>{{ summary.withdrawnApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '결재완료'"
								@click="navigateToSearch('/approvals/completed')"
								>{{ summary.completedApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '임시저장'"
								@click="navigateToSearch('/approvals/draft')"
								>{{ summary.savedApprovalCount }}건</a-typography-link
							>
							<a-typography-link
								v-if="list.label === '참조'"
								@click="navigateToSearch('/approvals/received')"
								>{{ summary.referencedApprovalCount }}건</a-typography-link
							>
						</a-flex>
					</a-card>
				</a-col>
			</a-row>
		</a-spin>
	</a-card>
</template>
