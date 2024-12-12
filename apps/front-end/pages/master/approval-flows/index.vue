<script lang="ts" setup>
import type { TabPaneProps } from "ant-design-vue"
import ApprovalRules from "@/components/master/approval-flows/ApprovalRules.vue"
import ApprovalLine from "@/components/master/approval-flows/ApprovalLine.vue"
import ApprovalForm from "@/components/master/approval-flows/ApprovalForm.vue"

definePageMeta({
	name: "결재환경설정",
})

const tabs = ref<number>(0)
//
const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(ApprovalRules),
		tabKey: 0,
		id: "결재옵션",
	},
	{
		tab: shallowRef(ApprovalLine),
		tabKey: 1,
		id: "결재선관리",
	},
	{
		tab: shallowRef(ApprovalForm),
		tabKey: 2,
		id: "결재양식관리",
	},
])
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				전자결재에 필요한 기능들을 관리할 수 있으며, 개인별 결재선 지정 및 사용할
				결재양식을 설정 할 수 있습니다.
			</a-space>
		</template>
		<template #content>
			<a-tabs v-model:activeKey="tabs" size="small" :destroyInactiveTabPane="true">
				<a-tab-pane
					:key="item.tabKey"
					:tab="item.id"
					v-for="item in componentTabs"
					class="custom-tab-pane"
				>
					<component :is="item.tab"></component>
				</a-tab-pane>
			</a-tabs>
		</template>
	</page-layout>
</template>
