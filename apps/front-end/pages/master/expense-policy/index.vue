<script lang="ts" setup>
import basicSetup from "@/components/master/expense-policy/BasicSetup.vue"
import entrySetup from "@/components/master/expense-policy/EntrySetup.vue"
import addOnsSetup from "@/components/master/expense-policy/AddOnsSetup.vue"

definePageMeta({
	name: "경비규정관리/TEST",
})

const forms = reactive({
	purchaseProcessor: true,
	purchaseReceivers: true,
})

const appStore = useAppsStore()
appStore.setLoading(false)

const styles = {
	"border-radius": "4px",
	border: "solid 1px",
	"border-color": "#babfc7",
	"background-color": "#fff",
}

const menuId = ref(0)
const menus = [
	{ id: 0, name: "기본 설정", component: basicSetup },
	{ id: 1, name: "입력항목 관리", component: entrySetup },
	{ id: 2, name: "부가기능 관리", component: addOnsSetup },
]
</script>

<template>
	<page-layout>
		<a-tabs
			v-model:activeKey="menuId"
			style="width: 100%; height: 40px; font-size: large; margin-top: 20px"
		>
			<a-tab-pane
				v-for="tab in menus"
				:key="tab.id"
				:tab="tab.name"
				:style="tab.id === menuId ? {} : { color: '#666E75' }"
			>
				<component
					class="flex flex-col items-baseline"
					style="padding: 1rem"
					:is="tab.component"
				></component>
			</a-tab-pane>
		</a-tabs>
	</page-layout>
</template>
