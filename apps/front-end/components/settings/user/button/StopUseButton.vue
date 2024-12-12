<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { DataProps } from "../../../ui/button/index"

const props = withDefaults(defineProps<DataProps>(), {
	label: "사용중지",
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
		message.error(`사용중지하실 행을 선택해주세요.`)
	}
}

watch(
	() => open.value,
	(data) => {
		if (data) {
			if (!props.data || props.data.length === 0) {
				message.error(`사용중지하실 행을 선택해주세요.`)
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
				<component :is="materialIcons('mso', 'delete')" />
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
		modalTitleText="사용중지"
		title="선택된 사용자의 서비스 사용을 중지시킬까요?"
		:showed="open"
		modal-type="삭제"
		type="error"
		btn-cancle-title="취소"
		btn-ok-title="사용중지"
		:icon="() => materialIcons('mso', 'cancel')"
		:data="props.data"
		@close="open = false"
		@submit="(params: any) => submit(params)"
	>
		<template #content>
			<span>
				<p>사용중지된 사용자는 서비스 이용이 중단됩니다.</p>
				<p>관리자가 사용중지를 다시 해제할 수 있습니다.</p>
			</span>
		</template>
	</confirm-modal>
</template>
