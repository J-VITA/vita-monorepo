<script lang="ts" setup>
import type { DataProps } from ".."

const props = withDefaults(defineProps<DataProps>(), {
	label: "조회",
	type: "primary",
	ghost: true,
	danger: false,
	size: "middle",
	loading: false,
	disabled: false,
})

const emit = defineEmits<{
	(e: "submit", value: any): void
}>()

const submit = (item: any) => {
	if (item) {
		emit("submit", item)
	} else {
		message.error(`조회 조건 데이터가 존재하지 않습니다.`)
	}
}
</script>
<template>
	<a-button
		class="search"
		:type="props.type"
		:ghost="props.ghost"
		:danger="props.danger"
		:size="props.size"
		:loading="props.loading"
		:icon="props.icon"
		:disabled="props.disabled"
		@click="submit(props.data)"
	>
		<template #icon>
			<slot v-if="$slots.icon" name="icon" />
			<template v-else>
				<SearchOutlined></SearchOutlined>
			</template>
		</template>
		<slot v-if="$slots.label" name="label" />
		<span v-else>{{ props.label }}</span>
	</a-button>
</template>
