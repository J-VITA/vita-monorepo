<script setup lang="ts">
definePageMeta({
	name: "법인카드관리",
	middleware(to, from) {
		return navigateTo("/ccards/list")
	},
})
</script>
