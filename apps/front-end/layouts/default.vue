<script setup lang="ts">
const headerHeight = ref("10.5rem")
</script>
<template>
	<transition name="fade" mode="out-in">
		<a-layout>
			<slot name="header"></slot>
			<a-layout class="container" :style="{ marginTop: headerHeight }">
				<slot></slot>
				<reset-password />
			</a-layout>
			<a-layout-footer>
				<p>Copyright © 2024 - All right reserved by blabla</p>
			</a-layout-footer>
		</a-layout>
	</transition>
</template>

<style lang="scss"></style>
