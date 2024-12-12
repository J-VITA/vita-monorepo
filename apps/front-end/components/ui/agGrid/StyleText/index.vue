<script setup lang="ts">
import { createAgParams } from ".."

//타입 정의
type StyleTextType = {
	style: any
	value: string | number
}
//태그벨류 브랜드명 타입 지정
type StyleTextBrand = "StyleText"

const props = defineProps<createAgParams<StyleTextType, StyleTextBrand>>()

const { style, value } = props.params
</script>

<template>
	<a-typography-text :style="style">
		{{ value }}
	</a-typography-text>
</template>
