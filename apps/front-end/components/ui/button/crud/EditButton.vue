<script lang="ts" setup>
import type { DataProps } from "../index"

const props = withDefaults(defineProps<DataProps>(), {
	label: "수정",
	type: "primary",
	ghost: false,
	danger: false,
	size: "middle",
	loading: false,
	modalOpen: false,
	disabled: false,
})

const emit = defineEmits<{
	(e: "submit", value: any): void
}>()

const submit = (item: any) => {
	if (item) {
		open.value = !open.value
		emit("submit", item)
	} else {
		message.error(`데이터를 선택해주세요.`)
	}
}

const open = ref(false)

watch(
	() => open.value,
	(data) => {
		if (data) {
			if (!props.data) {
				message.error(`데이터를 선택해주세요.`)
				open.value = false
			}
		}
	}
)
</script>
<template>
	<a-button
		:type="props.type"
		:ghost="props.ghost"
		:danger="props.danger"
		:size="props.size"
		:loading="props.loading"
		:icon="props.icon"
		:disabled="props.disabled"
		@click="props.modalOpen ? (open = true) : submit(props.data)"
	>
		<template #icon>
			<slot v-if="$slots.icon" name="icon" />
			<template v-else>
				<SaveOutlined></SaveOutlined>
			</template>
		</template>
		<slot v-if="$slots.label" name="label" />
		<span v-else>{{ props.label }}</span>
	</a-button>

	<confirm-modal
		v-if="props.modalOpen"
		class="modal"
		size="small"
		title="수정"
		:showed="open"
		modal-type="수정"
		btn-cancle-title="취소"
		btn-ok-title="수정"
		:data="props.data"
		:body-style="{
			'text-align': 'center',
		}"
		@close="open = false"
		@submit="(params: any) => submit(params)"
	>
		<template #icon>
			<EditTwoTone two-tone-color="#6146e5" style="font-size: 3rem" />
		</template>
		<template #content>
			<p class="bold" style="font-weight: bold; font-size: medium; margin-top: 20px">
				수정 하시겠습니까?
			</p>
		</template>
	</confirm-modal>
</template>
