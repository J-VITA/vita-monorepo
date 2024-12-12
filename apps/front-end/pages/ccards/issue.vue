<script setup lang="ts">
import CreditCardList from "@/components/ccards/issue/CreditCardList.vue"
import CreditCardIssueDetail from "@/components/ccards/issue/CreditCardIssueDetail.vue"

definePageMeta({
	name: "법인카드 불출 관리",
})

const currentCard = ref<number | undefined>(undefined)
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
					<credit-card-list v-model:cardId="currentCard" />
				</a-col>
				<a-col flex="1">
					<credit-card-issue-detail v-model:cardId="currentCard" />
				</a-col>
			</a-row>
		</template>
	</page-layout>
</template>
