<script setup lang="ts">
import Loading from "./Loading.vue"
import Error from "./Error.vue"

type Props = {
	show: boolean
	expenseId?: string | number
	total?: number
	slipData?: Array<any>
	// slipType: SlipFormType
}
const { show = false, expenseId, total, slipData } = defineProps<Props>()

const componentMap: Record<string, () => Promise<Component>> = {
	PersonalExpense: () => import("./PersonalExpenseForm/index.vue"),
	Disbursement: () => import("./DisbursementForm/index.vue"),
	Card: () => import("./CardForm/index.vue"),
	TaxInvoice: () => import("./TaxInvoice/index.vue"),
	FamilyEvent: () => import("./FamilyEvent/index.vue"),
	ErpSlip: () => import("./ErpSlip/index.vue"),
	// 다른 컴포넌트들도 여기에 추가하세요
}

const componentName = computed<Component>(() => {
	const index = slipData?.map((item: any) => item.id).indexOf(expenseId)
	if (index !== -1) {
		const type = slipData?.[currentPage.value - 1]?.slipTypeName

		const componentType = compCase(type)

		const asyncComponent = componentMap[componentType]

		if (asyncComponent) {
			// return defineAsyncComponent(asyncComponent)
			return defineAsyncComponent({
				loader: asyncComponent,
				loadingComponent: Loading,
				errorComponent: Error,
				delay: 200,
				timeout: 3000,
			})
		} else {
			console.warn(`${componentType}은 지원되지 않는 유형입니다..`)
			return defineComponent({
				render() {
					return h("div", `${componentType}은 지원되지 않는 유형입니다..`)
				},
			})
		}
	} else {
		return defineComponent({
			render() {
				return h("div", `지원할 수 없는 유형입니다..`)
			},
		})
	}
})

const modalWidth = ref<string>("80rem")
const documentRef = useTemplateRef<{ reload: () => void }>("documentRef")

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const slips = computed(() => slipData?.[currentPage.value - 1])

const currentPage = ref<number>(1)

const changePage = (page: number, count: number) => {
	currentPage.value = page + count
}

watch(
	() => show,
	async (newVal) => {
		if (newVal && slipData) {
			const index = slipData.map((item: any) => item.id).indexOf(expenseId)
			if (index !== -1) {
				currentPage.value = index + 1
				// fetchData(expenseId)
				// await documentRef.value?.reload()
			}
		} else {
			currentPage.value = 1
		}
	}
)

onMounted(async () => {
	// await documentRef.value?.reload()
	Object.values(componentMap).forEach((component) => component())
})

const isContentReady = ref(false)

watch(
	() => componentName.value,
	async () => {
		isContentReady.value = false
		await nextTick()
		isContentReady.value = true
	}
)
</script>
<template>
	<a-modal
		v-if="isContentReady"
		:width="modalWidth"
		centered
		v-model:open="open"
		:destroy-on-close="true"
	>
		<template #title>
			<eacc-paging-title
				v-model:page="currentPage"
				:is-page="true"
				:loading="false"
				title="지출상세"
				:current-page-data-list="slipData"
				@update:page="changePage"
			></eacc-paging-title>
		</template>
		<!-- 깜빡거리는 현상을 줄이기 위해  -->
		<keep-alive>
			<Transition name="fade" mode="out-in">
				<component
					ref="documentRef"
					:is="componentName"
					:slips="slips"
					@modal-size="
						(size?: string) => {
							modalWidth = size ??= '80rem'
						}
					"
				/>
			</Transition>
		</keep-alive>
		<template #footer>
			<a-button
				@click="
					() => {
						open = false
						currentPage = 1
					}
				"
				>닫기</a-button
			>
		</template>
	</a-modal>
</template>
