<script setup lang="ts">
definePageMeta({
	name: "예산관리",
	middleware(to, from) {
		return navigateTo("/budgets/list")
	},
})
</script>
