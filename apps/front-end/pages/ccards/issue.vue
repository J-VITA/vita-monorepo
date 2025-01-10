<script setup lang="ts">
import { Response } from "@/types"
import type { CreditCardListData } from "@/types/ccards/issue"
import type { CardStatusType } from "@/types/ccards"
import CreditCardList from "@/components/ccards/issue/CreditCardList.vue"
import CreditCardIssueDetail from "@/components/ccards/issue/CreditCardIssueDetail.vue"

definePageMeta({
	name: "법인카드 불출 관리",
})

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)

const currentCard = ref<number | undefined>(undefined)
const currentCardStatus = ref<CardStatusType>("")

/**
 * 카드 목록
 */
const cardList = await useAsyncData(
	`credit-card-issue-my-cards`,
	() =>
		useCFetch<Response<Array<CreditCardListData>>>("/api/v2/cards/commons/my-cards", {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				employeeId: getEmployeeId.value,
			},
		}),
	{
		default: () => [],
		transform: (res) => {
			if (res.data && res.data.length > 0) {
				currentCard.value = res.data[0].id
				currentCardStatus.value = res.data[0].cardStatusName as CardStatusType
			}
			return res.data
		},
	}
)

const onRefresh = (data?: any) => {
	cardList.refresh().then(() => {
		if (data) {
			currentCard.value = data.card.id
		}
	})
}
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				법인카드 사용자의 불출과 반납을 처리하며 이력관리를 할 수 있는 페이지 입니다. 전표
				대리작성자도 지정할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-row class="full-height" :gutter="[15, 15]">
				<a-col flex="40rem">
					<credit-card-list
						v-model:card-id="currentCard"
						v-model:card-status="currentCardStatus"
						:data="cardList.data?.value || []"
						:status="cardList.status?.value || ''"
						@refresh="onRefresh"
					/>
				</a-col>
				<a-col flex="1">
					<credit-card-issue-detail
						v-model:card-id="currentCard"
						v-model:card-status="currentCardStatus"
						@refresh="onRefresh"
					/>
				</a-col>
			</a-row>
		</template>
	</page-layout>
</template>
