<script lang="ts" setup>
import { createSearchParams, pageSize, RequestParams } from "@/types"
import type { TabPaneProps } from "ant-design-vue"

import FinalApproveManagement from "@/components/master/confirm-flows/FinalApproveManagement.vue"
import RecipientLineManagement from "@/components/master/confirm-flows/RecipientLineManagement.vue"
import {
	createConfirmFlowsModalProps,
	FlowsActivityType,
	TConfirmFlowsSearch,
} from "@/types/master/confirm-flows"

definePageMeta({
	name: "검인/수신 라인관리",
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const activeKey = ref<string>(FlowsActivityType.FINAL_APPROVE)
const tabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(FinalApproveManagement),
		tabKey: FlowsActivityType.FINAL_APPROVE,
		id: "검인라인 관리",
	},
	{
		tab: shallowRef(RecipientLineManagement),
		tabKey: FlowsActivityType.RECIPIENT,
		id: "수신자 관리",
	},
])

const params = ref<Array<TConfirmFlowsSearch>>([
	createSearchParams({
		companyCode: getCompanyCode.value,
		used: "",
		tabKey: FlowsActivityType.FINAL_APPROVE,
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	}),
	createSearchParams({
		companyCode: getCompanyCode.value,
		used: "",
		tabKey: FlowsActivityType.RECIPIENT,
		pageNumber: 0,
		size: pageSize,
		first: true,
		last: true,
		sort: [],
	}),
])

const searchParams = computed({
	get() {
		return params.value.find(
			(item: RequestParams<TConfirmFlowsSearch>) => item.tabKey === activeKey.value
		)
	},
	set(value: RequestParams<TConfirmFlowsSearch>) {
		const index = params.value.findIndex(
			(item: RequestParams<TConfirmFlowsSearch>) => item.tabKey === activeKey.value
		)
		if (index !== -1) {
			params.value[index] = value
		}
	},
})

const { list } = useConfirmFlows()

const {
	data: confirmFlowData,
	error,
	status,
	execute,
	refresh,
} = await list(activeKey, searchParams)

const finalApproveIsModal = ref(false)
const recipientLineIsModal = ref(false)
const modalPropsId = ref<string | number | undefined>(undefined)
const openModal = (id?: string | number) => {
	console.log("openModal id ", id)
	modalPropsId.value = id || undefined
	if (activeKey.value === FlowsActivityType.RECIPIENT) {
		recipientLineIsModal.value = true
	} else {
		finalApproveIsModal.value = true
	}
}

watch(
	[activeKey, searchParams],
	() => {
		if (activeKey || searchParams) {
			refresh()
		}
	},
	{
		deep: true,
		immediate: true,
	}
)

onBeforeRouteLeave(() => {
	recipientLineIsModal.value = false
	finalApproveIsModal.value = false
})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				내부기안이 완료된 이후 필요한 검인/수신라인을 등록 할 수 있습니다. 금액 조건,
				부서에 따라 상이한 검인라인을 만들 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-tabs v-model:activeKey="activeKey" size="small" :destroyInactiveTabPane="true">
				<a-tab-pane
					:key="item.tabKey"
					:tab="item.id"
					v-for="item in tabs"
					class="custom-tab-pane"
				>
					<component
						:is="item.tab"
						v-model:search-params="searchParams"
						:data="confirmFlowData"
						:pending="status === 'pending'"
						@open-modal="openModal"
						@refresh="() => refresh()"
					></component>
				</a-tab-pane>
			</a-tabs>
		</template>
		<template #modal>
			<final-approve-modal
				v-if="activeKey === FlowsActivityType.FINAL_APPROVE"
				v-model:open="finalApproveIsModal"
				:item-id="modalPropsId"
				@update:open="() => (finalApproveIsModal = false)"
				@submit="() => refresh()"
			>
			</final-approve-modal>
			<recipient-line-modal
				v-if="activeKey === FlowsActivityType.RECIPIENT"
				v-model:open="recipientLineIsModal"
				:item-id="modalPropsId"
				@update:open="() => (recipientLineIsModal = false)"
				@submit="() => refresh()"
			>
			</recipient-line-modal>
		</template>
	</page-layout>
</template>
