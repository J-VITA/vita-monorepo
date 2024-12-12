<script lang="ts" setup>
import SlipsCostCenter from "@/components/slips/list/SlipsCostCenter.vue"
import SlipsProject from "@/components/slips/list/SlipsProject.vue"
import type { TabPaneProps } from "ant-design-vue"

definePageMeta({
	name: "전표내역조회",
})

const tabs = ref<number>(0)
const componentTabs = ref<TabPaneProps["tab"]>([
	{
		tab: shallowRef(SlipsCostCenter),
		tabKey: 0,
		id: "코스트센터",
	},
	{
		tab: shallowRef(SlipsProject),
		tabKey: 1,
		id: "프로젝트",
	},
])

const showDetail = ref<boolean>(false)
const showDocument = ref<boolean>(false)
const getData = ref<any>()
const getId = ref<any>()
const onDetail = (value: { row: any; total: number }) => {
	showDetail.value = true
	getData.value = value
}
const onDocument = (value: any) => {
	console.log("onDocument Info", value)
	showDocument.value = true
	getId.value = value.paymentDocumentNo
}
const onUpdate = (value: boolean) => {
	showDetail.value = value
	getData.value = null
}
</script>

<template>
	<page-layout>
		<!-- <template #header>
      <a-space :size="5">
        <question-circle-outlined />
        프로젝트, 코스트센터 기준별로 전표내역조회가 가능합니다. 상세필터를 통해
        다양한 데이터 조회가 가능하고 인쇄/보고서 기능을 지원합니다.
      </a-space>
    </template> -->
		<template #content>
			<a-tabs v-model:activeKey="tabs" size="small">
				<a-tab-pane :key="item.tabKey" :tab="item.id" v-for="item in componentTabs">
					<component
						:is="item.tab"
						@on-detail="onDetail"
						@on-document="onDocument"
					></component>
				</a-tab-pane>
			</a-tabs>
		</template>
		<template #modal>
			<expense-detail-modal :show="showDetail" :data="getData" @update:show="onUpdate" />
			<document-preview-modal
				:show="showDocument"
				:id="getId"
				:completed="true"
				@update:show="(value) => (showDocument = value)"
			/>
		</template>
	</page-layout>
</template>
