<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { Response } from "@/types"
import type { FormInstance } from "ant-design-vue"
import { myCardOptions, myCardStatuses } from "@/types/ccards"
import type { CardIssuesAdditional } from "@/types/ccards/issue"

const cardId = defineModel<number>("cardId")
const { disabled = false } = defineProps<{ disabled?: boolean }>()

const emit = defineEmits<{
	(e: "refresh", value: any): void
}>()

const authStore = useAuthStore()
const { getCompanyCode, getEmployeeId } = storeToRefs(authStore)
const { data: cardStatuses } = await myCardStatuses(
	getCompanyCode.value,
	getEmployeeId.value,
	["ISSUE_READY", "POSSIBILITY"]
)

const open = ref<boolean>(false)
const formRef = useTemplateRef<FormInstance>("formRef")
const formState = ref<CardIssuesAdditional>({
	companyCode: getCompanyCode.value,
	userIds: [],
	dates: [null, null],
})

const onSubmit = (data: any) => {
	formRef.value
		?.validate()
		.then(async () => {
			await useCFetch<Response<any>>("/api/v2/card/issues/additional", {
				method: "POST",
				body: data,
			}).then((res) => {
				emit("refresh", res)
				open.value = false
			})
		})
		.catch((err) => console.error(err))
}

const onShow = async () => {
	formState.value.companyCode = getCompanyCode.value
	formState.value.cardId = cardId.value
	open.value = true
}

watch(open, async (newValue) => {
	if (!newValue) {
		formRef.value?.resetFields()
	}
})
</script>
<template>
	<a-button
		:icon="materialIcons('mso', 'credit_card')"
		@click="onShow"
		:disabled="disabled"
	>
		카드불출 추가
	</a-button>

	<field-modal
		width="60rem"
		title="카드불출 추가"
		ok-text="저장"
		cancel-text="취소"
		:showed="open"
		:field="formState"
		@closed="open = false"
		@submit="onSubmit"
	>
		<template #content="{ field }">
			<a-space direction="vertical" :size="1" class="mb-sm">
				<a-typography-text>
					* 법인카드 불출신청서 상신을 생략한 경우 사용합니다.
				</a-typography-text>
				<a-typography-text>
					* 공용법인카드 수신자 등록되었다면 임의의 사용자에게 카드불출이 가능합니다.
				</a-typography-text>
			</a-space>

			<a-form ref="formRef" layout="vertical" :model="field">
				<a-descriptions size="small" bordered :column="1" :label-style="{ width: '30%' }">
					<a-descriptions-item label="불출카드지정">
						<a-select
							placeholder="선택하세요."
							class="full-width"
							v-model:value="field.cardId"
							:options="cardStatuses || []"
							:disabled="true"
						/>
					</a-descriptions-item>
					<a-descriptions-item label="카드사용자">
						<a-form-item
							name="userIds"
							:rules="[{ required: true, message: '필수값 입니다.', type: 'array' }]"
						>
							<eacc-select-table
								url="/api/v2/approvals/commons/employees"
								v-model:value="field.userIds"
								key-props="id"
								label-prop="name"
								:columns="[
									{ title: '이름', data: (row: any) => row.name },
									{ title: '직위', data: (row: any) => row.gradeName },
									{
										title: '코스트센터',
										data: (row: any) => row.costCenterName,
									},
									{ title: '회사', data: (row: any) => row.companyName },
									{ title: '사업장', data: (row: any) => row.workplaceName },
								]"
								@update:value="(value: any) => (field.userId = value[0])"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="사용기간">
						<a-form-item
							name="dates"
							:rules="[{ required: true, message: '필수값 입니다.', type: 'array' }]"
						>
							<a-range-picker
								class="full-width"
								v-model:value="field.dates"
								show-time
								format="YYYY-MM-DD HH:mm:ss"
								@change="
									(value) => {
										field.startDate = value[0]
										field.endDate = value[1]
									}
								"
							/>
						</a-form-item>
					</a-descriptions-item>
				</a-descriptions>
			</a-form>
		</template>
	</field-modal>
</template>
