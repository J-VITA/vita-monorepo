<script lang="ts" setup>
interface CurrencyOption {
	label: string
	value: string
	currency: string
	precision: number
}

const props = withDefaults(
	defineProps<{
		options?: CurrencyOption[]
		disabled: boolean
		currencyDisabled?: boolean
		precision?: number
		suffix?: string
		placeholder?: string
	}>(),
	{
		// options: [],
		disabled: false,
		currencyDisabled: false,
		precision: 0,
	}
)

/**
 * select v-model:value 값
 * @param v-model
 */
const value = defineModel<string | number>("value")
const currency = defineModel<string | number | undefined>("currency", {
	required: false,
	default: "",
})

/**
 * select v-model:value 값이 변경 될 때 리턴
 * @return value 반환 (key)
 */
const emit = defineEmits<{
	(e: "update:value", value: number): number
	(e: "update:currency", value: string): string
	(e: "change", value: string | number): string | number
}>()

const currencyFormatter = (value: string | number) => {
	if (!value) return ""
	// 소수점 위치를 찾아서 소수점 앞과 뒤를 분리
	const [integerPart, decimalPart] = `${value}`.split(".")

	// 소수점 앞부분에만 콤마 추가
	const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

	// 옵션에서 넘어온 값과 통화의 자릿수를 비교하여 표시하기 위한 체크
	const precision =
		props.options
			?.filter((x: CurrencyOption) => x.value === currency.value)
			.map((x: CurrencyOption) => x.precision)[0] || props.precision
	// 통화에 따른 자릿수가 0보다 클 경우 소수점 자릿수를 표시
	if (precision > 0 && decimalPart) {
		return `${formattedIntegerPart}.${decimalPart}`
	} else {
		return formattedIntegerPart
	}
}

const currencyParser = (amt: string | number) => {
	if (typeof amt === "string") {
		return amt.replace(/,/g, "")
	}
	return amt
}
</script>

<template>
	<a-input-group compact v-if="currency">
		<a-input-number
			class="text-right"
			v-model:value="value"
			:formatter="currencyFormatter"
			:parser="currencyParser"
			:precision="
				options
					?.filter((x: CurrencyOption) => x.value === currency)
					.map((x: CurrencyOption) => x.precision)[0] || 0
			"
			style="width: 70%"
			:disabled="disabled"
			:placeholder="placeholder"
			@change="$emit('change', $event)"
		>
			<!-- <template #addonBefore>
        <a-select
          v-model:value="currency"
          style="width: 60px"
          :showArrow="false"
          :field-names="{ label: 'currency', value: 'value' }"
          :options="options"
          disabled
        >
        </a-select>
      </template> -->
		</a-input-number>
		<a-select
			style="width: 30%"
			v-model:value="currency"
			:options="options"
			:disabled="currencyDisabled"
		/>
	</a-input-group>

	<a-input-group compact v-else>
		<a-input-number
			style="width: 100%"
			class="text-right"
			v-model:value="value"
			:formatter="currencyFormatter"
			:parser="currencyParser"
			:precision="precision"
			:disabled="disabled"
			:addon-after="suffix"
			:placeholder="placeholder"
			@change="$emit('change', $event)"
		>
			<!--    <template #prefix>-->
			<!--      <span>-->
			<!--        {{ suffix }}-->
			<!--      </span>-->
			<!--    </template>-->
		</a-input-number>
	</a-input-group>
</template>
