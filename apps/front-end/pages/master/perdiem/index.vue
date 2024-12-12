<script lang="ts" setup>
import PerdiemStandardInfo from "@/components/perdiem/list/PerdiemStandardInfo.vue"
import EmployeeGrade from "@/components/perdiem/list/EmployeeGrade.vue"
import PerdiemAllowance from "@/components/perdiem/list/PerdiemAllowance.vue"
import type { TabPaneProps } from "ant-design-vue"

definePageMeta({
	name: "출장기준관리",
})

const tabs = ref<number>(0)
const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(PerdiemStandardInfo),
		tabKey: 0,
		id: "출장 기준정보관리",
	},
	{
		tab: shallowRef(EmployeeGrade),
		tabKey: 1,
		id: "임직원 등급관리",
	},
	{
		tab: shallowRef(PerdiemAllowance),
		tabKey: 2,
		id: "출장 급지관리",
	},
])
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				출장비용정산과 관련된 기준정보들을 설정/관리 할 수 있습니다.
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
