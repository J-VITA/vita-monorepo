<script lang="ts" setup>
import ExpenseWrite from "@/components/expenses/ExpenseWrite.vue"

definePageMeta({
	name: "개인경비",
	pageTransition: {
		onBeforeEnter: (el) => {
			console.log("Before enter...!!!!", el)
		},
		onEnter: (el, done) => {},
		onAfterEnter: (el) => {},
		onAfterLeave: (el) => {
			console.log("onAfterLeave...!!!!", el)
		},
	},
})

const authStore = useAuthStore()

const getRowData = async () => {
	// const appStore = useAppsStore();
	// appStore.setLoading(true);
	// fetch('https://www.ag-grid.com/example-assets/row-data.json', {
	//     method: 'GET',
	// })
	// .then(res => res.json())
	// .then(data => {
	// })
	// .finally(() => appStore.setLoading(false))
}

// const { data, pending, error, refresh } = await useIFetch(`https://www.ag-grid.com/example-assets/row-data.json`);

onBeforeMount(async () => {
	await nextTick()
	if (process.server) {
		console.log("in server")
	}
	if (process.client) {
		console.log("in client")
	}
	console.log("in both ")
})
</script>

<template>
	<page-layout>
		<expense-write></expense-write>
	</page-layout>
</template>
