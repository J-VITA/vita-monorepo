<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import { createAgParams } from ".."

//타입 정의
type IconLinkType = {
	icon: string | Array<string>
	data: any
	onClick: Function
	value: string | number
}
//아이콘 링크 브랜드명 타입 지정
type IconLinkTypeBrand = "IconLink"

const props = defineProps<createAgParams<IconLinkType, IconLinkTypeBrand>>()

const { icon, data, onClick, value } = props.params
</script>
<template>
	<a-space v-if="value">
		<template v-if="typeof icon === 'string'">
			<a-button
				type="text"
				size="small"
				@click="onClick(data)"
				:icon="materialIcons('mso', icon)"
			/>
		</template>
		<template v-else>
			<a-button
				v-for="item in icon"
				type="text"
				size="small"
				@click="params.onClick(data, item)"
				:icon="materialIcons('mso', item)"
			/>
		</template>
	</a-space>
</template>
