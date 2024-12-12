<script lang="ts" setup>
definePageMeta({
	name: "매출세금계산서",
	middleware(to, from) {
		return navigateTo("/tax-invoice/list")
	},
})
</script>
