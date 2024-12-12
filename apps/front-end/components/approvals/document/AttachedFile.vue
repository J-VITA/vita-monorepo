<script setup lang="ts">
import { materialIcons } from "@/composables/icons"

type Props = {
	type: "write" | "read"
}
const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
	(e: "add", value: any): void
}>()
</script>
<template>
	<a-flex justify="space-between" class="mb-sm">
		<a-space>
			<a-typography-title :level="4" class="ml-none mb-none">
				첨부파일
			</a-typography-title>
			<a-typography-text>(총0건)</a-typography-text>
		</a-space>
		<a-button
			:icon="materialIcons('mso', 'add_circle')"
			@click="$emit('add', '첨부파일 추가')"
			v-if="props.type === 'write'"
		>
			추가
		</a-button>
	</a-flex>
	<a-table
		size="small"
		:columns="[
			{ title: '파일명', dataIndex: '' },
			{ title: '크기', dataIndex: '', width: 100 },
			{ title: '기능', dataIndex: '', width: 100 },
		]"
	></a-table>
</template>
