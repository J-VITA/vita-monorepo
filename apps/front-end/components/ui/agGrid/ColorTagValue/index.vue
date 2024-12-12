<script setup lang="ts">
import { createAgParams } from ".."

//타입 정의
type TagValueType = {
	disabled: boolean
	color: string
	text: string
	value: string | number
}
//태그벨류 브랜드명 타입 지정
type TagValueBrand = "TagValue"

const props = defineProps<createAgParams<TagValueType, TagValueBrand>>()

const { disabled, color, text, value } = props.params
</script>
<template>
	<a-row :gutter="4" align="middle" style="width: 100%">
		<a-col :span="disabled ? 12 : 0" style="text-align: left">
			<a-tag v-if="disabled" :color="color">{{ text }}</a-tag>
		</a-col>
		<a-col :span="disabled ? 12 : 24" style="text-align: right">
			<a-typography-text>{{ value }}</a-typography-text>
		</a-col>
	</a-row>
</template>
