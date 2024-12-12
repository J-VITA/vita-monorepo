<script lang="ts" setup>
// const props = defineProps(['params']);
import { createAgParams } from ".."

//타입 정의
type TagsType = {
	serveStatusType: string
	value: string | number
}
//링크 브랜드명 타입 지정
type TagsTypeBrand = "Tags"

const props = defineProps<createAgParams<TagsType, TagsTypeBrand>>()

const { serveStatusType, value } = props.params
</script>
<template>
	<a-tag
		v-if="value"
		:color="
			serveStatusType === 'WORKING'
				? 'green'
				: serveStatusType === 'SUSPENDED'
					? 'blue'
					: 'red'
		"
		>{{ value }}</a-tag
	>
</template>
