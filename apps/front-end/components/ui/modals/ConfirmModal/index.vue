<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { PropType, CSSProperties } from "vue"
import { useDraggable } from "@vueuse/core"

const value = defineModel<string | number>("value")
// const value = defineModel('value', {
//   type: String,
//   required: false,
//   default: undefined,
// });

const props = withDefaults(
	defineProps<{
		modalTitleText?: string
		title?: string
		icon?: any
		modalType?: "저장" | "삭제" | "수정" | "조회" | "마감" | "오픈" | "" | undefined
		type?: "success" | "warning" | "error" | "info"
		content?: string
		btnCancleTitle?: string
		btnOkTitle?: string
		showed?: boolean
		data?: any
		size?: "small" | "large" | "medium" | "auto"
		loading?: boolean
		callback?: (data: any) => any
	}>(),
	{
		title: "확인",
		type: "info",
		content: "",
		btnCancleTitle: "취소",
		btnOkTitle: "확인",
		showed: false,
		data: [],
	}
)

const open = ref(false)
watch(
	() => props.showed,
	(data) => {
		console.log("show ;", data)
		open.value = data
	}
)

const emit = defineEmits<{
	(e: "submit", value: any): any
	(e: "close", value?: boolean): void
	(e: "update:value", value: string | number): string
}>()

// dragging 관련 s.
const modalTitleRef = ref<HTMLElement | null>(null)
const { x, y, isDragging } = useDraggable(modalTitleRef)

const startX = ref<number>(0)
const startY = ref<number>(0)
const startedDrag = ref(false)
const transformX = ref(0)
const transformY = ref(0)
const preTransformX = ref(0)
const preTransformY = ref(0)
const dragRect = ref({ left: 0, right: 0, top: 0, bottom: 0 })

watch([x, y], () => {
	if (!startedDrag.value) {
		startX.value = x.value
		startY.value = y.value
		const bodyRect = document.body.getBoundingClientRect()
		const titleRect = modalTitleRef.value?.getBoundingClientRect()
		dragRect.value.right = bodyRect.width - titleRect!.width
		dragRect.value.bottom = bodyRect.height - titleRect!.height
		preTransformX.value = transformX.value
		preTransformY.value = transformY.value
	}
	startedDrag.value = true
})

watch(isDragging, () => {
	if (!isDragging) {
		startedDrag.value = false
	}
})

watchEffect(() => {
	if (startedDrag.value) {
		transformX.value =
			preTransformX.value +
			Math.min(Math.max(dragRect.value.left, x.value), dragRect.value.right) -
			startX.value
		transformY.value =
			preTransformY.value +
			Math.min(Math.max(dragRect.value.top, y.value), dragRect.value.bottom) -
			startY.value
	}
})

const transformStyle = computed<CSSProperties>(() => {
	return {
		transform: `translate(${transformX.value}px, ${transformY.value}px)`,
	}
})
// dragging 관련 e.

const submit = (value: any) => {
	emit("submit", value)
}

onBeforeRouteLeave(() => {
	emit("close")
})
</script>

<template>
	<a-modal
		class="confirm-modal"
		v-model:open="open"
		wrap-class-name="overflow-hidden"
		:mask-closable="false"
		@cancel="$emit('close')"
	>
		<template #title>
			<div ref="modalTitleRef" class="drag-handler">
				{{ props.modalTitleText }}
			</div>
		</template>
		<a-flex :gap="10" align="start" class="full-width">
			<template v-if="$slots.icon">
				<slot name="icon"> </slot>
			</template>
			<template v-else>
				<component
					:is="props.icon"
					:class="`text-${props.type}`"
					style="font-size: 2.4rem"
				></component>
			</template>
			<div class="contents">
				<template v-if="props.title">
					<a-typography-title :level="4" style="font-size: 1.6rem">
						{{ props.title }}
					</a-typography-title>
				</template>
				<template v-if="$slots.content">
					<slot name="content"></slot>
				</template>
			</div>
		</a-flex>

		<template #modalRender="{ originVNode }">
			<div :style="transformStyle">
				<component :is="originVNode" />
			</div>
		</template>
		<template #footer>
			<a-button @click="$emit('close')">
				{{ props.btnCancleTitle }}
			</a-button>
			<a-button
				type="primary"
				:danger="props.type === 'error'"
				:loading="props.loading"
				@click="value ? emit('update:value', value) : submit(props.data)"
			>
				{{ props.btnOkTitle }}
			</a-button>
		</template>
	</a-modal>
</template>
