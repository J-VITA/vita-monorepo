<script setup lang="ts">
import type { Response } from "@/types"
import { DownOutlined } from "@ant-design/icons-vue"
import type { MenuProps, FormInstance } from "ant-design-vue"
import type { CardIssueInfo, ReturnFormState } from "@/types/ccards/issue"

const rowId = defineModel<number>("rowId")

const emit = defineEmits<{
	(e: "refresh", value: any): void
}>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const { $dayjs } = useNuxtApp()

const isRequestModal = ref<boolean>(false)

const isConfirmModal = ref<boolean>(false)
const formRef = useTemplateRef<FormInstance>("formRef")
const cardIssueInfo = ref<CardIssueInfo>()
const formState = ref<ReturnFormState>({
	returnDate: "",
	approvedBy: 0,
})

const isCancelModal = ref<boolean>(false)

const onDropdownClick = async () => {
	cardIssueInfo.value = await useCFetch<Response<CardIssueInfo>>(
		`/api/v2/cards/issues/management/info/${rowId.value}`,
		{
			method: "GET",
			params: {
				id: rowId.value,
			},
		}
	).then((res) => res.data)
}

const handleClick: MenuProps["onClick"] = async (e: any) => {
	formState.value.id = cardIssueInfo.value?.id
	formState.value.cardId = cardIssueInfo.value?.card.id
	formState.value.returnDate = cardIssueInfo.value?.returnDate
		? $dayjs(cardIssueInfo.value?.returnDate)
		: $dayjs()
	formState.value.returnedBy = cardIssueInfo.value?.userEmployeeId
	formState.value.approvedBy = cardIssueInfo.value?.approvedBy
		? cardIssueInfo.value?.approvedByEmployeeId
		: undefined

	if (e.key === "request") {
		isRequestModal.value = true
	} else if (e.key === "confirm") {
		isConfirmModal.value = true
	} else if (e.key === "cancel") {
		isCancelModal.value = true
	}
}

const onRequestSubmit = (data: any) => {
	console.log("onRequestSubmit", data)
}

const onConfirmSubmit = (formData: ReturnFormState) => {
	formRef.value
		?.validate()
		.then(async () => {
			await useCFetch<Response<any>>("/api/v2/cards/issues/management/return", {
				method: "PATCH",
				body: {
					...formData,
					approvedBy: formData.approvedBy,
				},
			}).then((res) => {
				if (res.status === 0) {
					emit("refresh", res.data)
					message.success("반납확인 완료")
				}
				isConfirmModal.value = false
			})
		})
		.catch((err) => console.error(err))
}

const onCancelSubmit = async (formData: ReturnFormState) => {
	console.log("onCancelSubmit", formData)

	await useCFetch<Response<any>>("/api/v2/cards/issues/management/cancelReturn", {
		method: "PATCH",
		body: formData,
	}).then((res) => {
		if (res.status === 0) {
			emit("refresh", res.data)
			message.error("반납취소 완료")
		}
		isCancelModal.value = false
	})
}
</script>
<template>
	<a-dropdown :trigger="['click']">
		<a-button :icon="h(DownOutlined)" class="row-reverse" @click="onDropdownClick">
			반납
		</a-button>
		<template #overlay>
			<a-menu @click="handleClick">
				<a-menu-item
					:icon="materialIcons('mso', 'notifications')"
					key="request"
					:disabled="true"
				>
					수령요청
				</a-menu-item>
				<a-menu-divider />
				<a-menu-item
					:icon="materialIcons('mso', 'check_circle')"
					key="confirm"
					:disabled="cardIssueInfo?.returnDate ? true : false"
				>
					반납확인
				</a-menu-item>
				<a-menu-divider />
				<a-menu-item :icon="materialIcons('mso', 'cancel')" key="cancel">
					반납취소
				</a-menu-item>
			</a-menu>
		</template>
	</a-dropdown>

	<confirm-modal
		:showed="isRequestModal"
		:icon="() => materialIcons('mso', 'error_outline')"
		:data="formState"
		modal-title-text="반납요청"
		title="법인카드 반납요청 알림을 전송할까요?"
		type="warning"
		btn-cancle-title="취소"
		btn-ok-title="전송"
		@close="isRequestModal = false"
		@submit="onRequestSubmit"
	>
		<template #content>
			<a-descriptions
				size="small"
				bordered
				class="full-width mt-md"
				:column="1"
				:label-style="{ width: '30%' }"
			>
				<a-descriptions-item label="카드정보">
					{{ cardIssueInfo?.card?.name }} /
					{{
						cardIssueInfo?.card?.number
							? formatCardNumber(cardIssueInfo?.card?.number)
							: ""
					}}
				</a-descriptions-item>
				<a-descriptions-item label="수령자">{{
					cardIssueInfo?.user
				}}</a-descriptions-item>
				<a-descriptions-item label="사용기간">
					<template v-if="cardIssueInfo?.startDate && cardIssueInfo?.endDate">
						{{ $dayjs(cardIssueInfo.startDate).format("YYYY-MM-DD HH:mm") }} ~
						{{ $dayjs(cardIssueInfo.endDate).format("YYYY-MM-DD HH:mm") }}
					</template>
				</a-descriptions-item>
			</a-descriptions>
		</template>
	</confirm-modal>

	<field-modal
		title="카드반납 확인"
		:showed="isConfirmModal"
		:field="formState"
		@closed="isConfirmModal = false"
		@submit="onConfirmSubmit"
	>
		<template #content="{ field }">
			<a-form ref="formRef" layout="vertical" :model="field">
				<a-descriptions
					title="법인카드 반납 정보"
					bordered
					size="small"
					:column="1"
					:label-style="{ width: '30%' }"
				>
					<a-descriptions-item label="카드반납일">
						<a-form-item
							name="returnDate"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<a-date-picker
								show-time
								class="full-width"
								v-model:value="field.returnDate"
								format="YYYY-MM-DD HH:mm"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="반납자">
						<a-form-item name="returnedBy">
							<a-input :value="cardIssueInfo?.user" :disabled="true" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="반납확인자">
						<a-form-item
							name="approvedBy"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<eacc-select
								placeholder="반납확인자를 선택해주세요."
								:url="`/api/v2/cards/commons/${getCompanyCode}/owners`"
								v-model:value="field.approvedBy"
								:field-names="{ label: 'name', value: 'employeeId' }"
								:on-all-field="false"
								@update:value="(value) => (field.approvedBy = value)"
							/>
						</a-form-item>
					</a-descriptions-item>
				</a-descriptions>
			</a-form>
		</template>
	</field-modal>

	<confirm-modal
		:showed="isCancelModal"
		:icon="() => materialIcons('mso', 'error_outline')"
		:data="formState"
		modal-title-text="불출취소"
		title="법인카드 반납을 취소할까요?"
		content="반납일, 반납자, 반납확인자가 초기화 됩니다."
		type="error"
		btn-cancle-title="취소"
		btn-ok-title="확인"
		@close="isCancelModal = false"
		@submit="onCancelSubmit"
	>
		<template #content>
			<a-descriptions
				size="small"
				bordered
				class="full-width mt-md"
				:column="1"
				:label-style="{ width: '30%' }"
			>
				<a-descriptions-item label="카드정보">
					{{ cardIssueInfo?.card?.name }} /
					{{
						cardIssueInfo?.card?.number
							? formatCardNumber(cardIssueInfo?.card?.number)
							: ""
					}}
				</a-descriptions-item>
				<a-descriptions-item label="반납자">
					{{ cardIssueInfo?.user }}
				</a-descriptions-item>
				<a-descriptions-item label="반납일">
					{{ $dayjs(cardIssueInfo?.returnDate).format("YYYY-MM-DD HH:mm") }}
				</a-descriptions-item>
				<a-descriptions-item label="반납확인자">
					{{ cardIssueInfo?.approvedBy }}
				</a-descriptions-item>
			</a-descriptions>
		</template>
	</confirm-modal>
</template>
