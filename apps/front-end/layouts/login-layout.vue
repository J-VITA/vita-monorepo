<script lang="ts" setup>
import image from "@/assets/img/card.jpg"

// const breakpoints = useBreakpoint();
</script>

<template>
	<transition name="fade" mode="out-in">
		<a-layout class="login-layout">
			<slot />
		</a-layout>
	</transition>
</template>
