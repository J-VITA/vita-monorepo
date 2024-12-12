<script lang="ts" setup>
definePageMeta({
	name: "전표처리",
	middleware(to, from) {
		return navigateTo("/expenses/list")
	},
})
</script>
