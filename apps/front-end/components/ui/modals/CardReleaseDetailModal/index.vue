<script lang="ts" setup>
import { Response } from "@/types"
import { CardTypeColor } from "@/types/ccards"
import { CardHistoryItem } from "@/types/ccards/history"

const { show, data: propsData } = defineProps<{
	show: boolean
	data?: { current: number; list: any[] }
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): boolean
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const { $dayjs } = useNuxtApp()

const data = ref<any>(undefined)
const currentPage = ref<number>(1)

const changePage = (page: number, count: number) => {
	currentPage.value = page + count
	fetchData(propsData?.list[page + count - 1])
}

const fetchData = async (id: number) => {
	data.value = await useCFetch<Response<CardHistoryItem>>(`/api/v2/card/issues/${id}`, {
		method: "GET",
	}).then((res) => res.data)
}

watch(open, (newVal) => {
	if (newVal && propsData) {
		const index = propsData.list.indexOf(propsData.current)
		if (index !== -1) {
			currentPage.value = index + 1
			fetchData(propsData?.current)
		}
	}
})
</script>
<template>
	<a-modal centered v-model:open="open" :destroy-on-close="true" @cancel="open = false">
		<template #title>
			<expense-title
				v-model:page="currentPage"
				:is-page="true"
				:loading="false"
				title="법인카드 불출 신청내역"
				:current-page-data-list="propsData?.list"
				@update:page="changePage"
			></expense-title>
		</template>
		<a-descriptions :column="1" size="small" bordered :label-style="{ width: '30%' }">
			<a-descriptions-item label="신청번호">
				{{ data?.cardIssueNumber }}
			</a-descriptions-item>
			<a-descriptions-item label="상태">
				<!-- <a-badge
							:color="CardUseStateColor[text]"
							:text="record.cardUseStateTypeLabel"
						/> -->
				{{ data?.cardIssueRequestStatus }}
			</a-descriptions-item>
			<a-descriptions-item label="신청일">
				{{ $dayjs(data?.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
			</a-descriptions-item>
			<a-descriptions-item label="카드구분">
				<!-- {{ data?.cardType }}
				{{ data?.cardType.label }} -->

				<a-tag :color="CardTypeColor[data?.cardType.code]">
					{{ data?.cardType.label }}
				</a-tag>
			</a-descriptions-item>
			<a-descriptions-item label="카드소유자">
				{{ data?.owner }}
			</a-descriptions-item>
			<a-descriptions-item label="신청부서">
				{{ data?.department }}
			</a-descriptions-item>
			<a-descriptions-item label="신청자">
				{{ data?.requestedBy }}
			</a-descriptions-item>
			<a-descriptions-item label="사용기간">
				{{ $dayjs(data?.startDate).format("YYYY-MM-DD HH:mm:ss") }} ~
				{{ $dayjs(data?.endDate).format("YYYY-MM-DD HH:mm:ss") }}
			</a-descriptions-item>
			<a-descriptions-item label="신청사유">
				{{ data?.description }}
			</a-descriptions-item>
		</a-descriptions>
		<template #footer>
			<a-button @click="open = false"> 닫기 </a-button>
		</template>
	</a-modal>
</template>
