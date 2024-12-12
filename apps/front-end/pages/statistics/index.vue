<script setup lang="ts">
definePageMeta({
	name: "통계/보고서",
	middleware(to, from) {
		return navigateTo("/statistics/monthly")
	},
})
</script>
