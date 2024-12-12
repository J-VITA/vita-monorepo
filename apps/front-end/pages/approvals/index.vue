<script setup lang="ts">
definePageMeta({
	name: "전자결재",
	middleware(to, from) {
		return navigateTo("/approvals/home")
	},
})
</script>
