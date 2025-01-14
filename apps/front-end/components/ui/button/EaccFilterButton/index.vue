<script lang="ts" setup>
import type { IFormData } from "@/types"

const formData = defineModel("formData", {
	required: true,
	type: Array<IFormData>,
	default: undefined,
})
console.log("formData", formData)
interface FilterDataProps {
	/** 버튼 타입 (디폴트값 : primary) */
	type?: "primary" | "dashed" | "text" | "link"
	/** 버튼 텍스트 */
	label?: string
	/** 버튼 ghost option 선택 */
	ghost?: boolean
	/** 버튼 danger option 선택 */
	danger?: boolean
	/** 버튼 기본 사이트 선택  (디폴트값 : middle) */
	size?: "large" | "middle" | "small"
	/** 버튼 로딩 사용할 것인지 선택  (디폴트값 : false) */
	loading?: boolean
	/** icon */
	icon?: any
	/** closed */
	closed?: boolean
}

const props = withDefaults(defineProps<FilterDataProps>(), {
	ghost: false,
	danger: false,
	size: "middle",
	loading: false,
	closed: false,
})

const emit = defineEmits<{
	(e: "submit", value: any): void
	(e: "update:formData", value: any): any
	(e: "update:formDataItem", value: any): any
}>()

const showDetailFilter = ref<boolean>(false)

const submit = (item: any) => {
	// console.log('item ', item);
	if (item) {
		emit("submit", item)
		if (props.closed) {
			showDetailFilter.value = false
		}
	} else {
		message.error(`조회 조건 데이터가 존재하지 않습니다.`)
	}
}
</script>
<template>
	<div>
		<a-button
			v-model="showDetailFilter"
			:type="props.type ? props.type : undefined"
			:ghost="props.ghost"
			:danger="props.danger"
			:size="props.size"
			:loading="props.loading"
			:icon="props.icon"
			@click="showDetailFilter = !showDetailFilter"
		>
			<template #icon>
				<slot v-if="$slots.icon" name="icon" />
				<template v-else>
					<FilterOutlined></FilterOutlined>
				</template>
			</template>

			<span v-if="props.label">{{ props.label }}</span>
			<slot v-else />
		</a-button>

		<eacc-filter-form-drawer
			v-model:form-data="formData"
			title="상세 검색"
			:loadings="props.loading"
			v-model:open="showDetailFilter"
			@submit="submit"
			@update:form-data="(params: any) => emit('update:formData', params)"
			@update:form-data-item="(params: any) => emit('update:formDataItem', params)"
		>
		</eacc-filter-form-drawer>
	</div>
	<!-- <a-drawer
    v-model:open="showDetailFilter"
    placement="right"
    title="상세 필터 조회"
  >
    <p>필터조회 내용</p>
  </a-drawer> -->
</template>
