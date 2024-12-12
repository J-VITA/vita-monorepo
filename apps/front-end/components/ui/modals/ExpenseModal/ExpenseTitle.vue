<template>
	<a-flex justify="space-between" align="center">
		<a-typography-text strong>{{ title }}</a-typography-text>
		<a-space
			class="pr-xl"
			v-if="isPage && currentPageDataList && currentPageDataList.length > 0"
		>
			<slot v-if="$slots.changed" name="changed"></slot>
			<span>{{ currentPage }}</span>
			<span>/</span>
			<span>{{ currentPageDataList.length || 0 }}</span>
			<a-input-group compact>
				<a-button
					:icon="materialIcons('mso', 'chevron_left')"
					:disabled="currentPage === 1"
					size="small"
					:loading="loading"
					@click="() => emit('update:page', currentPage, -1)"
				/>
				<a-button
					:icon="materialIcons('mso', 'chevron_right')"
					:disabled="currentPage === (currentPageDataList.length || 0)"
					size="small"
					:loading="loading"
					@click="() => emit('update:page', currentPage, +1)"
				/>
			</a-input-group>
		</a-space>
	</a-flex>
</template>

<script lang="ts" setup>
const currentPage = defineModel<number>("page", { required: true, default: 1 })

const { loading, title, currentPageDataList, isPage } = defineProps({
	loading: { type: Boolean, required: true },
	title: { type: String, required: true },
	isPage: { type: Boolean, required: true },
	currentPageDataList: { type: Array, required: false, default: () => [] },
})

const emit = defineEmits(["update:page"])
</script>
