<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import type { DataProps } from "../../../ui/button/index"
import dayjs, { Dayjs } from "dayjs"
import type { FormInstance } from "ant-design-vue"

const props = withDefaults(defineProps<DataProps>(), {
	label: "사용자퇴직",
	type: "primary",
	ghost: false,
	danger: true,
	size: "middle",
	loading: false,
	modalOpen: false,
	disabled: false,
	data: [],
})

const emit = defineEmits<{
	/**
	 * 모달 또는 버튼 클릭 시 submit
	 * @param value (props delete-data 반환)
	 */
	(e: "click", value: any): void
}>()

const open = ref(false)

/**
 * 모달 또는 버튼 클릭 시 submit
 * @param item
 */
const submit = async (item: any) => {
	formRef.value
		?.validate()
		.then((value) => {
			if (item) {
				const items = { ...item, leftDate: value.pickedLeftDate }
				open.value = !open.value

				formState.pickedLeftDate = ""
				formState.checkedStatus = []
				emit("click", items)
			}
		})
		.catch((error) => {
			console.log("error ; ", error)
		})
}

const onClose = () => {
	open.value = false

	formState.pickedLeftDate = ""
	formState.checkedStatus = []
}

interface FormState {
	pickedLeftDate: string | Dayjs
	checkedStatus: Array<string>
}

const formRef = ref<FormInstance>()
const formState = reactive<FormState>({
	pickedLeftDate: "",
	checkedStatus: [],
})
watch(
	() => props.data,
	() => {
		formState.pickedLeftDate = ""
		formState.checkedStatus = []
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
				<component :is="materialIcons('mso', 'cancel')" />
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
		modalTitleText="사용자 퇴직"
		title="사용자를 퇴직처리 합니다."
		:showed="open"
		modal-type="삭제"
		type="error"
		btn-cancle-title="취소"
		btn-ok-title="사용중지"
		:icon="() => materialIcons('mso', 'cancel')"
		:data="props.data"
		@close="onClose"
		@submit="(params: any) => submit(params)"
	>
		<template #content>
			<span :style="{ lineHeight: '25px' }">
				<p>사용자 퇴직시 해당 사번으로 가입된 모든 아이디는 퇴직처리가 됩니다.</p>
				<p>(조직정보 삭제, 권한삭제, 임시저장 문서 삭제)</p>
				<a-form ref="formRef" :model="formState">
					<a-form-item
						label="퇴사일"
						name="pickedLeftDate"
						:style="{ margin: '20px 0' }"
						:rules="[
							{
								required: true,
								message: '퇴사일을 선택해주세요.',
							},
						]"
					>
						<!-- formState.pickedLeftDate = value -->
						<a-date-picker
							v-model:value="formState.pickedLeftDate"
							value-format="YYYY-MM-DD"
						/>
					</a-form-item>
					<a-form-item
						name="checkedStatus"
						:rules="[
							{
								required: true,
								message: '퇴직처리에 동의해주세요.',
							},
						]"
					>
						<a-checkbox-group v-model:value="formState.checkedStatus">
							<a-checkbox value="1" name="type"> 퇴직처리에 동의합니다. </a-checkbox>
						</a-checkbox-group>
					</a-form-item>
				</a-form>
			</span>
		</template>
	</confirm-modal>
</template>
