<script lang="ts" setup>
import type { TabPaneProps } from "ant-design-vue"
import Management from "@/components/master/accounts/Management.vue"
import AuthoritySetting from "@/components/master/accounts/AuthoritySetting.vue"

definePageMeta({
	name: "계정/비용항목관리",
})
const tabs = ref<number>(0)

const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(Management),
		tabKey: 0,
		id: "계정/비용항목 관리",
	},
	{
		tab: shallowRef(AuthoritySetting),
		tabKey: 1,
		id: "계정/비용항목 권한설정",
	},
])

// 화면 활성화 시 콜백되어지는 사이클
onActivated(() => {})
</script>

<template>
	<page-layout>
		<template #header>
			<a-space :size="5">
				<question-circle-outlined />
				전표작성에 필요한 계정과목과 세부 비용항목을 등록할 수 있고, 사용권한을 부여할 수
				있습니다.
			</a-space>
		</template>
		<template #content>
			<a-tabs v-model:activeKey="tabs">
				<a-tab-pane :key="item.tabKey" :tab="item.id" v-for="item in componentTabs">
					<component :is="item.tab"></component>
				</a-tab-pane>
			</a-tabs>
		</template>
	</page-layout>
</template>
