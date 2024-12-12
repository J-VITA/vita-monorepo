<script setup lang="ts">
definePageMeta({
	name: "기준정보관리",
	middleware(to, from) {
		console.log(">>>>>")
		return navigateTo("/master/config")
	},
})
</script>
