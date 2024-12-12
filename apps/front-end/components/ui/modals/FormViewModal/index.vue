<script lang="ts" setup>
// import type { Response } from '@/types';

const props = withDefaults(defineProps<{ show: boolean }>(), {
	show: false,
})

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})

const loading = ref<boolean>(false)

const onSubmit = () => {}

const onAfterClose = () => {
	loading.value = false
}

onUpdated(() => {})
</script>
<template>
	<a-modal
		centered
		width="80rem"
		v-model:open="open"
		title="결재 양식"
		:destroy-on-close="true"
		:confirm-loading="loading"
		:after-close="onAfterClose"
		@ok="onSubmit"
	>
		결재 양식 / 지출결의서
	</a-modal>
</template>
