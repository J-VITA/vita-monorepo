<script lang="ts" setup>
import type { Response } from "@/types"
import type { FormInstance } from "ant-design-vue"
import {
	initialFormState,
	type ResponseItem,
	type FormState,
} from "@/components/ui/modals/CardManagementModal/type"
import CardDelegatorTable from "@/components/ccards/CardDelegatorTable/index.vue"

const { show, formId } = defineProps<{
	show: boolean
	formId?: number
}>()

const emit = defineEmits<{
	(e: "update:show", value: boolean): void
	(e: "refresh"): void
}>()

const open = computed({
	get() {
		return show
	},
	set(value) {
		emit("update:show", value)
	},
})

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)
const { $dayjs } = useNuxtApp()

const formRef = useTemplateRef<FormInstance>("formRef")
const formState = ref<FormState>({ ...initialFormState })
const loading = ref(false)

const onCancel = () => {
	loading.value = false
	open.value = false
}
const onSubmit = () => {
	formRef.value
		?.validate()
		.then(async () => {
			console.log("onSubmit", formState.value)

			const url = formId
				? `/api/v2/card/managements/${formId}`
				: `/api/v2/card/managements`
			await useCFetch<Response<ResponseItem>>(url, {
				method: formId ? "PATCH" : "POST",
				body: {
					...formState.value,
					companyCode: getCompanyCode.value,

					// collectionStartDate: formState.value.collectionStartDate
					// 	? $dayjs(formState.value.collectionStartDate).format("YYYY-MM-DD")
					// 	: undefined,
					// issueDate: $dayjs(formState.value.issueDate).format("YYYY-MM-DD"),
					// cancellationDate: formState.value.cancellationDate
					// 	? $dayjs(formState.value.cancellationDate).format("YYYY-MM-DD")
					// 	: undefined,
				},
			}).then((res: Response<ResponseItem>) => {
				if (res.status === 0) {
					message.success(formId ? "카드가 수정되었습니다." : "카드가 등록되었습니다.")
					emit("refresh")
					open.value = false
				}
			})
		})
		.catch((err) => console.error(err))
}

const onDelete = async () => {
	await useCFetch<Response<any>>(`/api/v2/card/managements/${formId}`, {
		method: "DELETE",
		params: {
			id: formId,
		},
		body: {
			id: formId,
		},
	}).then((res: Response<any>) => {
		if (res.status === 0) {
			message.success("카드가 삭제되었습니다.")
			emit("refresh")
			open.value = false
		}
	})
}

watch(
	() => formId,
	async (value) => {
		if (value) {
			loading.value = true
			await useCFetch<Response<any>>(`/api/v2/card/managements/${formId}`, {
				method: "GET",
				params: {
					id: formId,
				},
			}).then((res: Response<ResponseItem>) => {
				if (res.status === 0) {
					console.log(res.data)

					formState.value = {
						...res.data,
						paymentDayType: res.data?.paymentDayName,
						cardType: res.data?.cardTypeName,
						bankType: res.data?.bankTypeName,
						cardUseType: res.data?.cardUseTypeName,
						issueDate: $dayjs(res.data?.issueDate),
						...(res.data?.collectionStartDate && {
							collectionStartDate: $dayjs(res.data?.collectionStartDate),
						}),
						...(res.data?.cancellationDate && {
							cancellationDate: $dayjs(res.data?.cancellationDate),
						}),
						cardCompanyType: res.data?.cardCompanyTypeName,
						cardStatus: res.data?.cardStatusName,
						userIds: [res.data?.userId],
						vendorIds: [res.data?.vendorId],
						ownerIds: [res.data?.ownerId],
						...(res.data?.startDate && {
							usedDate: [$dayjs(res.data?.startDate), $dayjs(res.data.endDate)],
						}),
					} as FormState
					loading.value = false
				}
			})
		} else {
			formState.value = { ...initialFormState }
		}
	}
)
</script>
<template>
	<a-modal
		width="80rem"
		centered
		v-model:open="open"
		:title="`법인카드 ${formId ? '상세' : '등록'}`"
		:mask-closable="false"
		:destroy-on-close="true"
		:confirm-loading="loading"
	>
		<a-spin :spinning="loading">
			<a-typography-title :level="5">카드정보</a-typography-title>
			<a-form
				ref="formRef"
				label-align="left"
				:label-col="{ span: 6 }"
				:wrapper-col="{ span: 18 }"
				:model="formState"
				:colon="false"
				class="pa-sm"
			>
				<a-row :gutter="[30, 10]">
					<a-col :span="12">
						<a-form-item
							:flex="1"
							label="카드번호"
							name="number"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<a-input
								v-model:value="formState.number"
								placeholder="카드번호"
								:disabled="!!formId"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item :flex="1" label="카드사" name="cardCompanyType">
							<eacc-select
								placeholder="선택해주세요."
								url="/api/v2/card/managements/types/CardCompanyType"
								v-model:value="formState.cardCompanyType"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
								:disabled="!!formId"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item
							label="카드용도"
							name="cardUseType"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<eacc-select
								placeholder="선택해주세요."
								url="/api/v2/card/managements/types/CardUseType"
								v-model:value="formState.cardUseType"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item label="유효기간" :rules="[{ required: true }]">
							<a-flex :gap="5">
								<a-form-item
									class="mb-none"
									name="expirationMonth"
									:rules="[
										{
											trigger: 'blur',
											required: true,
											message: '월을 입력해주세요.',
										},
										{
											trigger: 'blur',
											pattern: /^(0[1-9]|1[0-2])$/,
											message: '01-12 사이의 값을 입력해주세요.',
										},
									]"
								>
									<a-input v-model:value="formState.expirationMonth" placeholder="MM" />
								</a-form-item>
								<a-form-item
									class="mb-none"
									name="expirationYear"
									:rules="[
										{
											trigger: 'blur',
											required: true,
											message: '년도를 입력해주세요.',
										},
										{
											trigger: 'blur',
											pattern: /^\d{2}$/,
											message: '두 자리 연도를 입력해주세요.',
										},
									]"
								>
									<a-input v-model:value="formState.expirationYear" placeholder="YY" />
								</a-form-item>
							</a-flex>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item
							label="카드 별칭"
							name="name"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<a-input v-model:value="formState.name" placeholder="카드 별칭" />
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="수집 시작일" name="collectionStartDate">
							<a-date-picker
								class="full-width"
								v-model:value="formState.collectionStartDate"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item
							label="발급일자"
							name="issueDate"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<a-date-picker class="full-width" v-model:value="formState.issueDate" />
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							label="한도금액"
							name="limitAmount"
							:rules="[
								{ trigger: 'blur', required: true },
								{
									trigger: 'blur',
									type: 'number',
									min: 1,
									message: '0 이상 이어야합니다.',
								},
							]"
						>
							<eacc-amount-input
								v-model:value="formState.limitAmount"
								:disabled="false"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item label="결제계좌" :rules="[{ required: true }]">
							<a-flex :gap="5">
								<a-form-item
									style="min-width: 11rem"
									class="mb-none"
									name="expirationMonth"
									:rules="[
										{
											trigger: 'blur',
											required: true,
											message: '은행을 선택해주세요.',
										},
									]"
								>
									<eacc-select
										placeholder="선택해주세요."
										url="/api/v2/card/managements/types/BankType"
										v-model:value="formState.bankType"
										:field-names="{ label: 'label', value: 'code' }"
										:on-all-field="false"
									/>
								</a-form-item>
								<a-form-item
									class="mb-none"
									name="expirationYear"
									:rules="[
										{
											trigger: 'blur',
											required: true,
											message: '계좌번호를 입력해주세요.',
										},
									]"
								>
									<a-input v-model:value="formState.accountNumber" />
								</a-form-item>
							</a-flex>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item
							label="결제일"
							name="paymentDayType"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<eacc-select
								class="full-width"
								placeholder="선택해주세요."
								url="/api/v2/master/expenseRules/types/dayTypes"
								v-model:value="formState.paymentDayType"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item
							label="카드구분"
							name="cardType"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<eacc-select
								placeholder="선택해주세요."
								url="/api/v2/card/managements/types/CardType"
								v-model:value="formState.cardType"
								:field-names="{ label: 'label', value: 'code' }"
								:on-all-field="false"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item name="ownerId" :rules="[{ trigger: 'blur', required: true }]">
							<template #label>
								<a-space align="center" :size="2" style="line-height: 1">
									카드소유자
									<a-popover placement="right">
										<template #content>
											지급된 카드에 대한 최초 소유자를 의미합니다.
										</template>
										<component
											class="cursor-pointer text-secondary"
											style="font-size: 1.6rem"
											:is="materialIcons('mso', 'help')"
										/>
									</a-popover>
								</a-space>
							</template>
							<eacc-select-table
								url="/api/v2/cards/commons/employees"
								v-model:value="formState.ownerIds"
								key-props="id"
								label-prop="name"
								:columns="[
									{ title: '이름', data: (row: any) => row.name },
									{ title: '직위', data: (row: any) => row.gradeName },
									{
										title: '코스트센터',
										data: (row: any) => row.costCenterName,
									},
								]"
								@update:value="(value) => (formState.ownerId = value[0])"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item name="userId" :rules="[{ trigger: 'blur', required: true }]">
							<template #label>
								<a-space align="center" :size="2" style="line-height: 1">
									카드 사용자
									<a-popover placement="right">
										<template #content>
											현재 카드를 사용중인 수령자를 의미합니다.
										</template>
										<component
											class="cursor-pointer text-secondary"
											style="font-size: 1.6rem"
											:is="materialIcons('mso', 'help')"
										/>
									</a-popover>
								</a-space>
							</template>
							<eacc-select-table
								url="/api/v2/cards/commons/employees"
								v-model:value="formState.userIds"
								key-props="id"
								label-prop="name"
								:columns="[
									{ title: '이름', data: (row: any) => row.name },
									{ title: '직위', data: (row: any) => row.gradeName },
									{
										title: '코스트센터',
										data: (row: any) => row.costCenterName,
									},
								]"
								@update:value="(value) => (formState.userId = value[0])"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="사용기간" name="usedDate">
							<a-range-picker
								class="full-width"
								v-model:value="formState.usedDate"
								@change="
									(value) => {
										formState.startDate = value[0]
										formState.endDate = value[1]
									}
								"
							/>
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item
							label="거래처코드/명"
							name="vendorId"
							:rules="[{ trigger: 'blur', required: true }]"
						>
							<eacc-select-table
								url="/api/v2/cards/commons/vendors"
								v-model:value="formState.vendorIds"
								key-props="id"
								label-prop="name"
								:columns="[
									{
										title: '거래처명',
										data: (row: any) => row.name,
									},
									{
										title: '거래처구분',
										data: (row: any) => row.vendorTypeLabel,
									},
									{
										title: '임직원 여부',
										data: (row: any) => (row.employeeVendorFlag ? '임직원' : ''),
									},
									{
										title: '대표자명',
										data: (row: any) => row.representativeName,
									},
								]"
								@update:value="(value) => (formState.vendorId = value[0])"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12">
						<a-form-item label="카드사용여부" name="used">
							<a-switch v-model:checked="formState.used" size="small" />
						</a-form-item>
					</a-col>

					<a-col :span="12">
						<a-form-item name="cancellationDate">
							<template #label>
								<a-space align="center" :size="2" style="line-height: 1">
									해지일자
									<a-popover placement="right">
										<template #content>
											카드사용여부 스위치를 끄면 해지일자 입력이 가능합니다.
										</template>
										<component
											class="cursor-pointer text-secondary"
											style="font-size: 1.6rem"
											:is="materialIcons('mso', 'help')"
										/>
									</a-popover>
								</a-space>
							</template>
							<a-date-picker
								class="full-width"
								v-model:value="formState.cancellationDate"
								:disabled="formState.used"
							/>
						</a-form-item>
					</a-col>
					<a-col :span="12"></a-col>
				</a-row>
			</a-form>
		</a-spin>

		<template v-if="formId">
			<a-divider />

			<!-- 전표 대리 작성  -->
			<card-delegator-table :id="formId" />
		</template>

		<template #footer>
			<a-row>
				<a-col>
					<a-button danger @click="onDelete">카드삭제</a-button>
				</a-col>
				<a-col :flex="1">
					<a-space :size="5">
						<a-button @click="onCancel">취소</a-button>
						<a-button type="primary" @click="onSubmit">저장</a-button>
					</a-space>
				</a-col>
			</a-row>
		</template>
	</a-modal>
</template>
