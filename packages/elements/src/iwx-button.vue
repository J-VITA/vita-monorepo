<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		title?: string
		class?: string
	}>(),
	{
		title: "Button",
		class: "btn btn-primary",
	}
)

defineEmits<{
	(e: "submit", value: any): void
}>()
</script>

<template>
	<button type="button" :class="`${props.class}`" @click="$emit('submit', '')">
		<slot>{{ props.title }}</slot>
	</button>
</template>
