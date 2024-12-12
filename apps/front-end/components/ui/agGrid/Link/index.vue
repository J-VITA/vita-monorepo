<script setup lang="ts">
import { createAgParams } from ".."

//타입 정의
type LinkType = {
	data: any
	onClick: Function
	value: string | number
	style?: any
}
//링크 브랜드명 타입 지정
type LinkTypeBrand = "Link"

const props = defineProps<createAgParams<LinkType, LinkTypeBrand>>()

const { data, onClick, value, style } = props.params
</script>
<template>
	<a-typography-link v-if="value" @click="onClick(data)" :style="style">
		{{ value }}
	</a-typography-link>
</template>
