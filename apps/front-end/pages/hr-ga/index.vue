<script lang="ts" setup>
definePageMeta({
	name: "인사총무관리",
	middleware(to, from) {
		return navigateTo("/hr-ga/family-events")
	},
})
</script>
