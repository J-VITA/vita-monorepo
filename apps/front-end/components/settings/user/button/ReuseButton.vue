<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { DataProps } from "../../../ui/button/index"

const props = withDefaults(defineProps<DataProps>(), {
	label: "사용중지 해제",
	type: "primary",
	ghost: false,
	danger: true,
	size: "middle",
	loading: false,
	modalOpen: false,
	disabled: false,
})

const emit = defineEmits<{
	/**
	 * 모달 또는 버튼 클릭 시 submit
	 * @param value (props delete-data 반환)
	 */
	(e: "click", value: any): void
}>()
// const open = computed(() => getModalVisible('delete-button'))
const open = ref(false)

// const { getModalVisible, setModalVisible, getModals } = useAntModals();
/**
 * 모달 또는 버튼 클릭 시 submit
 * @param item
 */
const submit = (item: any) => {
	if (item) {
		open.value = !open.value
		// setModalVisible('delete-button', !open.value)
		emit("click", item)
	} else {
		message.error(`사용중지 해제하실 행을 선택해주세요.`)
	}
}

watch(
	() => open.value,
	(data) => {
		if (data) {
			if (!props.data || props.data.length === 0) {
				message.error(`사용중지 해제하실 행을 선택해주세요.`)
				open.value = false
				// setModalVisible('delete-button', false)
			}
		}
	}
)

const test = ref("")
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
				<component :is="materialIcons('mso', 'edit')" />
			</template>
		</template>
		<slot v-if="$slots.label" name="label" />
		<span v-else>{{ props.label }}</span>
	</a-button>
	<!-- :icon="() => materialIcons('mso', 'cancel')" -->
	<confirm-modal
		v-if="props.modalOpen"
		class="modal"
		size="small"
		modalTitleText="사용중지 해제"
		title="사용중지를 해제 하시겠습니까?"
		:showed="open"
		modal-type="저장"
		type="warning"
		btn-cancle-title="취소"
		btn-ok-title="사용중지 해제"
		:icon="() => materialIcons('mso', 'cancel')"
		:data="props.data"
		@close="open = false"
		@submit="(params: any) => submit(params)"
	>
		<template #content>
			<span>
				<p>사용중지 해제를 한 사용자는 서비스 이용이 가능합니다.</p>
			</span>
		</template>
	</confirm-modal>
</template>
