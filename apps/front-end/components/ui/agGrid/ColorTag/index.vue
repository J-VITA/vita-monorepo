<script setup lang="ts">
import { createAgParams } from ".."

//타입 정의
type ColorTagType = {
	color: string
	text: string
	value: string | number
}
//태그벨류 브랜드명 타입 지정
type ColorTagBrand = "ColorTag"

const props = defineProps<createAgParams<ColorTagType, ColorTagBrand>>()

const { color, text, value } = props.params
</script>
<template>
	<a-tag v-if="value" :color="color">{{ text }}</a-tag>
</template>
