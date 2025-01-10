<script lang="ts" setup>
definePageMeta({
	name: "개인설정",
	middleware(to, from) {
		return navigateTo("/mypage/notifications")
	},
})
</script>
