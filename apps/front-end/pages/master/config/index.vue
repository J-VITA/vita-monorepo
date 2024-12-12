<script lang="ts" setup>
import type { Response } from "@/types"
import type { TabPaneProps } from "ant-design-vue"
import type { Data } from "@/types/master/config"

import DefaultConfig from "@/components/master/config/DefaultConfig.vue"
import ItemManagement from "@/components/master/config/ItemManagement.vue"
import AddOns from "@/components/master/config/AddOns.vue"
import PermissionsManagement from "@/components/master/config/PermissionsManagement.vue"

definePageMeta({
	name: "경비규정관리",
})

const loading = ref(false)
const activeKey = ref<number>(0)
const tabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(DefaultConfig),
		tabKey: 0,
		id: "기본설정",
	},
	{
		tab: shallowRef(ItemManagement),
		tabKey: 1,
		id: "입력항목 관리",
	},
	{
		tab: shallowRef(AddOns),
		tabKey: 2,
		id: "부가기능 관리",
	},
	{
		tab: shallowRef(PermissionsManagement),
		tabKey: 3,
		id: "경비권한관리",
	},
])
const { getRules } = useExpenseRules()

const { data, refresh } = await useAsyncData(`expense-roles-list`, () =>
	getRules().then((res: Response<Data>) => ({
		...res.data,
		approvalLimitStartDay: res.data?.approvalLimitStartDayName || "",
		approvalLimitEndDay: res.data?.approvalLimitEndDayName || "",
		accountInputMethodType: res.data?.accountInputMethodTypeName || "",
		personalExpensePaymentType: res.data?.personalExpensePaymentTypeName || "",
		personalExpensePaymentDay: res.data?.personalExpensePaymentDayName || "",
		corporateCreditCardPaymentType: res.data?.corporateCreditCardPaymentTypeName || "",
		corporateCreditCardPaymentDay: res.data?.corporateCreditCardPaymentDayName || "",
		billInvoicePaymentType: res.data?.billInvoicePaymentTypeName || "",
		billInvoicePaymentDay: res.data?.billInvoicePaymentDayName || "",
		arTaxInvoiceManagerIds: res.data?.arTaxInvoiceManager
			? [res.data?.arTaxInvoiceManager]
			: [],
	}))
)

console.log(data.value)

const onChange = async (params: Data) => {
	loading.value = true

	console.log(params)

	const body = Object.assign({}, params, {
		cardManagers: params.cardManagers.map((x: any) => ({ id: x })),
		apTaxInvoiceManagers: params.apTaxInvoiceManagers.map((x: any) => ({
			id: x,
		})),
		budgetManagers: params.budgetManagers.map((x: any) => ({ id: x })),
	})

	await useCFetch<Response<any>>(`/api/v2/master/expenseRules/${params.id}`, {
		method: "PATCH",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status !== 0) refresh()
		})
		.finally(() => (loading.value = false))
}

onMounted(() => {})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				경비기본규정과 전표입력 항목설정 및 부가기능의 사용유무를 관리할 수 있습니다.
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
					<a-spin :spinning="loading">
						<component :is="item.tab" :data="data" @update:data="onChange"></component>
					</a-spin>
				</a-tab-pane>
			</a-tabs>
		</template>
	</page-layout>
</template>
