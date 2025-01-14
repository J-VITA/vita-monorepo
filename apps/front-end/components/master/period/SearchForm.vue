<script lang="ts" setup>
import type { Pageable, Response, SearchParams, CommonCode } from "~/types"
import dayjs from "dayjs"
import { useDateFormat, useNow } from "@vueuse/core"

const { locale } = useLocale()

enum ShortCutType {
	oneMonth,
	oneYear,
	threeMonth,
	sixMonth,
	prevMonth,
}

interface searchDateParams {
	searchYearMonthFrom: string
	searchYearMonthTo: string
}

class Search implements searchDateParams {
	companyCode: string = ""
	searchYearMonthFrom: string = ""
	searchYearMonthTo: string = ""
	accountPeriodStatus: string = "OPEN"
	fieldOfBusinessCode: string = "10"
	closeRemark: string = "적요"
	// pageable: Pageable<any> = {
	//   page: 1,
	//   size: 50,
	//   sort: ['desc']
	// };

	constructor() {}
}

const props = withDefaults(
	defineProps<{
		searchParams: Search
	}>(),
	{}
)

const periodStatusTypes = ref<Array<CommonCode>>([])

useCFetch<Response<any>>("/api/v2/masters/accountPeriods/types/status", {
	method: "GET",
}).then((res: Response<any>) => {
	periodStatusTypes.value = [
		{
			code: "",
			label: "전체",
			used: true,
			name: "ALL",
		},
		...(res.data as any as Array<CommonCode>),
	]
})

const form = reactive({
	status: [] as any,
	workplace: [
		{ key: "", value: "전체" },
		{ key: "10", value: "CNS" },
		{ key: "20", value: "GLOBAL" },
	],
})

const emit = defineEmits<{
	(e: "submit", value: Search): Search
	(e: "shortcuts", value: searchDateParams): Search
}>()

const onSubmit = () => {
	emit("submit", props.searchParams)
}

const onShortcut = (type: ShortCutType) => {
	if (props.searchParams.searchYearMonthFrom > props.searchParams.searchYearMonthTo) {
		message.error(`시작일이 종료일보다 클 수 없습니다.`)
		return false
	}

	props.searchParams.searchYearMonthFrom = useDateFormat(
		dayjs().format("YYYY-MM"),
		"YYYY-MM",
		{ locales: locale.value }
	).value
	if (type === ShortCutType.oneMonth) {
		props.searchParams.searchYearMonthTo = useDateFormat(
			dayjs().format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
	} else if (type === ShortCutType.oneYear) {
		props.searchParams.searchYearMonthTo = useDateFormat(
			dayjs().add(1, "year").format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
	} else if (type === ShortCutType.threeMonth) {
		props.searchParams.searchYearMonthTo = useDateFormat(
			dayjs().add(3, "month").format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
	} else if (type === ShortCutType.sixMonth) {
		props.searchParams.searchYearMonthTo = useDateFormat(
			dayjs().add(6, "month").format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
	} else if (type === ShortCutType.prevMonth) {
		props.searchParams.searchYearMonthFrom = useDateFormat(
			dayjs().add(-1, "month").format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
		props.searchParams.searchYearMonthTo = useDateFormat(
			dayjs().add(-1, "month").format("YYYY-MM"),
			"YYYY-MM",
			{ locales: locale.value }
		).value
	}

	emit("shortcuts", props.searchParams)
}
</script>

<template>
	<a-form class="row gy-2 gx-3 align-items-center">
		<div class="col-auto">기간설정</div>
		<div class="col-auto">
			<a-input
				type="month"
				v-model="props.searchParams.searchYearMonthFrom"
				class="form-control form-control-sm"
			></a-input>
		</div>
		~
		<div class="col-auto">
			<a-input
				type="month"
				v-model="props.searchParams.searchYearMonthTo"
				class="form-control form-control-sm"
			></a-input>
		</div>
		<div class="col-auto">
			<div
				class="btn-group btn-group-sm"
				role="group"
				aria-label="Basic radio toggle button group"
			>
				<input
					type="radio"
					class="btn-check"
					name="btnradio"
					id="btnradio1"
					autocomplete="off"
					@click="onShortcut(ShortCutType.oneMonth)"
				/>
				<label class="btn btn-outline-secondary" for="btnradio1">당월</label>

				<input
					type="radio"
					class="btn-check"
					name="btnradio"
					id="btnradio2"
					autocomplete="off"
					@click="onShortcut(ShortCutType.prevMonth)"
				/>
				<label class="btn btn-outline-secondary" for="btnradio2">전월</label>
			</div>
		</div>
		<div class="col-auto" style="opacity: 0.4">│</div>
		<div class="col-auto">상태</div>
		<div class="col-auto">
			<a-select
				class="form-select form-select-sm"
				v-model:value="props.searchParams.accountPeriodStatus"
				:options="periodStatusTypes"
				value-field="code"
				text-field="label"
			>
				<a-select-option
					v-for="(item, idx) in periodStatusTypes.filter((x) => x.used)"
					:key="idx"
					:value="item.code"
				>
					{{ item.label }}
				</a-select-option>
			</a-select>
		</div>
		<div class="col-auto">사업장선택</div>
		<div class="col-auto">
			<a-select
				class="form-select form-select-sm"
				v-model:value="props.searchParams.fieldOfBusinessCode"
				:options="form.workplace"
				value-field="key"
				text-field="value"
			>
			</a-select>
		</div>
		<div class="col-auto">
			<button class="btn btn-sm btn-secondary" @click="onSubmit">
				<span class="material-icons">search</span> 조회
			</button>
		</div>
	</a-form>
</template>
