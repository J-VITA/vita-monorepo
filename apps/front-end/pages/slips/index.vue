<script lang="ts" setup>
definePageMeta({
	name: "전표관리",
	middleware(to, from) {
		return navigateTo("/slips/list")
	},
})
</script>
