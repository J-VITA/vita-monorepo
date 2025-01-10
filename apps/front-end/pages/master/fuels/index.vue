<script lang="ts" setup>
import FuelStandardInfo from "@/components/master/fuels/FuelStandardInfo.vue"
import FuelAccount from "@/components/master/fuels/FuelAccount.vue"
import type { TabPaneProps } from "ant-design-vue"

definePageMeta({
	name: "유류단가관리",
})

const tabs = ref<number>(0)
const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(FuelStandardInfo),
		tabKey: 0,
		id: "유류단가기준",
	},
	{
		tab: shallowRef(FuelAccount),
		tabKey: 1,
		id: "계정/비용항목 설정",
	},
])
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				유류단가를 등록/관리할 수 있습니다. 자차이용시 거리에 따라 리터당 금액을 자동산출
				할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-tabs v-model:activeKey="tabs" size="small">
				<a-tab-pane :key="item.tabKey" :tab="item.id" v-for="item in componentTabs">
					<component :is="item.tab"></component>
				</a-tab-pane>
			</a-tabs>
		</template>
	</page-layout>
</template>
