<script setup lang="ts">
import { CreditCardListData } from "@/types/ccards/issue"
import { CardStatusColor, CardStatusType } from "@/types/ccards"

const cardId = defineModel<number | undefined>("cardId")
const cardStatus = defineModel<CardStatusType>("cardStatus")

const { data, status } = defineProps<{
	data?: CreditCardListData[]
	status?: string
}>()

const emit = defineEmits<{
	(e: "refresh", value: any): void
}>()

const isCardManagement = ref<boolean>(false)
const formId = ref<number>(0)

const handleClickCardNumber = (item: CreditCardListData) => {
	if (item && item.id) {
		formId.value = item.id
		isCardManagement.value = true
	}
}

const onCardClick = (item: CreditCardListData) => {
	cardId.value = item.id
	cardStatus.value = item.cardStatusName as CardStatusType
}
</script>
<template>
	<a-flex vertical class="full-height">
		<a-flex align="center" style="min-height: 3.2rem" class="mb-sm">
			<a-typography-title :level="4" class="mb-none"> 법인카드 목록 </a-typography-title>
		</a-flex>
		<a-list
			class="card-issue-list"
			bordered
			item-layout="vertical"
			size="small"
			:loading="status === 'pending'"
			:data-source="data"
			:pagination="{
				pageSize: 6,
			}"
		>
			<template #renderItem="{ item }">
				<a-list-item
					:key="item.id"
					:class="{ active: item.id === cardId }"
					@click="onCardClick(item)"
				>
					<template #extra>
						<component
							style="font-size: 2rem"
							:is="materialIcons('mso', 'chevron_right')"
						/>
					</template>
					<a-list-item-meta>
						<template #description>
							<a-space wrap style="line-height: 1">
								<span>
									<component :is="materialIcons('mso', 'star')" />
									{{ item.name }}
								</span>
								<span>
									<component :is="materialIcons('mso', 'credit_card')" />
									{{ item.cardCompanyTypeLabel }}
								</span>
								<span>
									<component :is="materialIcons('mso', 'person')" />
									{{ item.ownerName }}({{ item.cardTypeLabel }})
								</span>
							</a-space>
						</template>
						<template #title>
							<a-typography-link @click="handleClickCardNumber(item)">
								{{ formatCardNumber(item.number) }}
							</a-typography-link>
						</template>
						<template #avatar>
							<a-tag :color="CardStatusColor[item.cardStatusName]">
								{{ item.cardStatusLabel }}
							</a-tag>
						</template>
					</a-list-item-meta>
				</a-list-item>
			</template>
		</a-list>
	</a-flex>

	<card-management-modal
		:show="isCardManagement"
		:form-id="formId"
		@update:show="(value) => (isCardManagement = value)"
		@refresh="(data) => emit('refresh', data)"
	/>
</template>
