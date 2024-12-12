<script setup lang="ts">
import type { Response } from "@/types"
import { DownOutlined } from "@ant-design/icons-vue"
import type { MenuProps, FormInstance } from "ant-design-vue"
import type { FormState } from "./type"

const cardId = defineModel<number | undefined>("cardId")

const emit = defineEmits<{
	(e: "refresh", value: any): void
}>()

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const { $dayjs } = useNuxtApp()

const isRequestModal = ref<boolean>(false)

const isConfirmModal = ref<boolean>(false)
const formRef = useTemplateRef<FormInstance>("formRef")
const formState = ref<Partial<FormState>>({
	issueDate: $dayjs(),
	cardId: cardId.value,
	user: "",
})

const isCancelModal = ref<boolean>(false)

const { data, refresh } = await useAsyncData(
	"card-issues-management-receive-request",
	() =>
		useCFetch<Response<any>>(
			`/api/v2/card/issues/management/receive/request/${cardId.value}`,
			{
				method: "GET",
				params: {
					cardId: cardId.value,
				},
			}
		),
	{
		immediate: false,
		watch: [cardId],
		transform: (res) => {
			console.log(res.data)
			formState.value.cardId = cardId.value
			formState.value.cardName = res.data.card.name
			formState.value.cardNumber = res.data.card.number
			formState.value.user = res.data.user
			formState.value.userId = res.data.card.userId
			formState.value.approvedBy = res.data.approvedBy
			formState.value.startDate = res.data.startDate
			formState.value.endDate = res.data.endDate
			formState.value.issueDate = res.data.issueDate
				? $dayjs(res.data.issueDate)
				: $dayjs()
			return res.data
		},
	}
)

const handleClick: MenuProps["onClick"] = (e: any) => {
	refresh()
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

const onConfirmSubmit = (data: any) => {
	console.log("onConfirmSubmit", data)

	formRef.value
		?.validate()
		.then(async () => {
			await useCFetch<Response<any>>("/api/v2/card/issues/management/out", {
				method: "PATCH",
				body: data,
			}).then((res) => {
				console.log(res)
				isConfirmModal.value = false
				emit("refresh", res)
			})
		})
		.catch((err) => console.error(err))
}

const onCancelSubmit = async (data: any) => {
	console.log("onCancelSubmit", data)

	await useCFetch<Response<any>>("/api/v2/card/issues/management/cancelOut", {
		method: "PATCH",
		body: data,
	}).then((res) => {
		console.log(res)
		isCancelModal.value = false
		emit("refresh", res)
	})
}
</script>
<template>
	<a-dropdown :trigger="['click']" :disabled="!data">
		<a-button :icon="h(DownOutlined)" class="row-reverse"> 불출 </a-button>
		<template #overlay>
			<a-menu @click="handleClick">
				<a-menu-item :icon="materialIcons('mso', 'notifications')" key="request">
					수령요청
				</a-menu-item>
				<a-menu-divider />
				<a-menu-item :icon="materialIcons('mso', 'check_circle')" key="confirm">
					불출확인
				</a-menu-item>
				<a-menu-divider />
				<a-menu-item
					:icon="materialIcons('mso', 'cancel')"
					key="cancel"
					:disabled="!formState.approvedBy"
				>
					불출취소
				</a-menu-item>
			</a-menu>
		</template>
	</a-dropdown>

	<confirm-modal
		:showed="isRequestModal"
		:icon="() => materialIcons('mso', 'error_outline')"
		:data="data"
		modal-title-text="수령요청"
		title="법인카드 수령요청 알림을 전송할까요?"
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
					{{ data.card.name }} / {{ formatCardNumber(data.card.number) }}
				</a-descriptions-item>
				<a-descriptions-item label="수령자">{{ data.user }}</a-descriptions-item>
				<a-descriptions-item label="사용기간">
					<template v-if="data.startDate">
						{{ $dayjs(data.startDate).format("YYYY-MM-DD HH:mm:ss") }} ~
						{{ $dayjs(data.endDate).format("YYYY-MM-DD HH:mm:ss") }}
					</template>
				</a-descriptions-item>
			</a-descriptions>
		</template>
	</confirm-modal>

	<field-modal
		title="카드불출 확인"
		:showed="isConfirmModal"
		:field="formState"
		@closed="isConfirmModal = false"
		@submit="onConfirmSubmit"
	>
		<template #content="{ field }">
			<a-form ref="formRef" layout="vertical" :model="field">
				<a-descriptions
					title="법인카드 불출 정보"
					bordered
					size="small"
					:column="1"
					:label-style="{ width: '30%' }"
				>
					<a-descriptions-item label="카드불출일">
						<a-form-item
							name="issueDate"
							:rules="[{ required: true, message: '필수값 입니다.' }]"
						>
							<a-date-picker
								show-time
								class="full-width"
								v-model:value="field.issueDate"
								format="YYYY-MM-DD HH:mm:ss"
							/>
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="사용자">
						<a-form-item name="userId">
							<a-input v-model:value="field.user" :disabled="true" />
						</a-form-item>
					</a-descriptions-item>
					<a-descriptions-item label="수령확인자">
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
		title="법인카드 불출을 취소할까요?"
		content="불출일, 수령자, 수령확인자가 초기화 됩니다."
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
					{{ formState.cardName }} / {{ formatCardNumber(formState.cardNumber!) }}
				</a-descriptions-item>
				<a-descriptions-item label="수령자">{{
					formState.issueDate
				}}</a-descriptions-item>
				<a-descriptions-item label="불출일">
					{{ $dayjs(formState.issueDate).format("YYYY-MM-DD HH:mm:ss") }}
				</a-descriptions-item>
				<a-descriptions-item label="수령확인자">
					{{ formState.approvedBy }}
				</a-descriptions-item>
			</a-descriptions>
		</template>
	</confirm-modal>
</template>
