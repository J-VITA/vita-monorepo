<script setup lang="ts">
type Props = {
	size?: number
	twoTonColor?: string
}
const props = withDefaults(defineProps<Props>(), {
	size: 24,
	twoTonColor: "rgb(243, 168, 53)",
})
</script>
<template>
	<svg
		:width="props.size"
		:height="props.size"
		viewBox="0 0 35 35"
		xmlns="http://www.w3.org/2000/svg"
		fill="currentColor"
	>
		<path
			d="M32.0828 8.02051C32.0828 8.02051 32.0827 26.2951 32.0827 27.708C32.0827 30.1242 25.5535 32.083 17.4993 32.083C9.44519 32.083 2.91604 30.1242 2.91604 27.708C2.91604 26.3534 2.91602 8.02051 2.91602 8.02051"
			fill="white"
			stroke="#333333"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M32.0827 21.1455C32.0827 23.5617 25.5535 25.5205 17.4993 25.5205C9.44519 25.5205 2.91602 23.5617 2.91602 21.1455"
			stroke="#333333"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M32.0827 14.583C32.0827 16.9992 25.5535 18.958 17.4993 18.958C9.44519 18.958 2.91602 16.9992 2.91602 14.583"
			stroke="#333333"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<path
			d="M17.4993 11.6665C25.5535 11.6665 32.0827 9.70775 32.0827 7.2915C32.0827 4.87526 25.5535 2.9165 17.4993 2.9165C9.4452 2.9165 2.91602 4.87526 2.91602 7.2915C2.91602 9.70775 9.4452 11.6665 17.4993 11.6665Z"
			:fill="props.twoTonColor"
			stroke="#333333"
			stroke-width="3"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</template>
