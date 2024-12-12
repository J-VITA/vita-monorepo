<script lang="ts" setup>
definePageMeta({
	name: "ERP전표",
	middleware(to, from) {
		return navigateTo("/erp-slips/ar")
	},
})
</script>
