<script setup lang="ts">
import { createAgParams } from ".."

type BadgeType = {
	color: string
	text: string
	value: string
}
type BagBrand = "Badge"

const props = defineProps<createAgParams<BadgeType, BagBrand>>()

const { color, text, value } = props.params
</script>
<template>
	<a-badge v-if="value" :color="color" :text="text" />
</template>
