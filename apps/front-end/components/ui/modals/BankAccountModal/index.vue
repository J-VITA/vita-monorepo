<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { FormInstance } from "ant-design-vue"
import type { Response } from "@/types"
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"

type Data = {
	bankTypeLabel: string
	bankTypeName: string
	accountNumber: string
	description: string
	mainAccountFlag: boolean
}

const props = withDefaults(
	defineProps<{
		show: boolean
		vendor: any
		account?: any
	}>(),
	{
		show: false,
	}
)

const emit = defineEmits<{
	(e: "update:show", value: any): void
}>()

const open = computed({
	get() {
		return props.show
	},
	set(value) {
		emit("update:show", value)
	},
})
const loading = ref<boolean>(false)
const formRef = ref<FormInstance>()
const formState = reactive<{ accounts: Data[] }>({
	accounts: [
		{
			bankTypeLabel: "",
			bankTypeName: "",
			accountNumber: "",
			description: "",
			mainAccountFlag: false,
		},
	],
})

const onAdd = () => {
	formState.accounts.push({
		bankTypeLabel: "",
		bankTypeName: "",
		accountNumber: "",
		description: "",
		mainAccountFlag: false,
	})
}

const onRemove = (item: Data) => {
	const index = formState.accounts.indexOf(item)
	if (index !== -1) {
		formState.accounts.splice(index, 1)
	}
}

const deleteVendorBankAccounts = (item: any) => {
	Modal.confirm({
		title: "삭제하시겠습니까?",
		icon: createVNode(ExclamationCircleOutlined),
		okText: "확인",
		cancelText: "취소",
		onOk() {
			const body = Object.assign({}, item, {
				vendorId: props.vendor.id,
				bankType: item.bankTypeName,
			})
			useCFetch<Response<any>>(`/api/v2/masters/vendorBankAccounts/${item.id}`, {
				method: "delete",
				body,
			})
				.then((res: Response<any>) => {
					if (res.status === 0) {
						message.success("계좌정보가 삭제 되었습니다.")
					}
				})
				.finally(() => (open.value = false))
		},
		onCancel() {
			console.log("Cancel")
		},
	})
}

const onFinish = (values: any) => {
	console.log("Received values of form:", values)
	console.log("formState.accounts :", formState.accounts)
	formRef.value
		?.validate()
		.then(() => {
			if (formState.accounts && formState.accounts.length > 0) {
				//  props.manager ? '수정' : '추가'
				const body = formState.accounts.map((x: any) => {
					x.bankType = x.bankTypeLabel
					x.vendorId = props.vendor.id
					x.companyCode = props.vendor.companyCode
					return x
				})
				// Object.assign({}, formState.managers, {
				//   vendorId: props.vendor.id
				// });
				useCFetch<Response<any>>(
					`${props.account ? "/api/v2/masters/vendorBankAccounts/" + body[0].id : "/api/v2/masters/vendorBankAccounts"}`,
					{
						method: props.account ? "PATCH" : "POST",
						body: props.account ? body[0] : body,
					}
				).then((res: Response<any>) => {
					if (res.status === 0) {
						!props.account
							? message.success(`${res.data.length}건의 계좌정보가 등록되었습니다.`)
							: message.success("계좌정보가 수정되었습니다.")
						open.value = false
					}
				})
			}
		})
		.catch((err) => {
			console.log(err)
		})
}
const onAfterClose = () => {
	formRef.value?.resetFields()
	formState.accounts = [
		{
			bankTypeLabel: "",
			bankTypeName: "",
			accountNumber: "",
			description: "",
			mainAccountFlag: false,
		},
	]
}
onUpdated(() => {
	if (props.account) {
		const label = props.account.bankTypeLabel
		const name = props.account.bankTypeName
		formState.accounts = [{ ...props.account, bankTypeLabel: name, bankTypeName: label }]
		console.log("manager", formState.accounts)
	}
})
</script>
<template>
	<!-- @ok="onFinish" -->
	<a-modal
		width="80rem"
		centered
		v-model:open="open"
		ok-text="저장"
		:title="`계좌정보 ${props.account ? '수정' : '등록'}`"
		:after-close="onAfterClose"
		:destroy-on-close="true"
		:confirmLoading="loading"
	>
		<a-descriptions
			class="mb-xl"
			v-if="!props.account"
			bordered
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<a-descriptions-item label="상호명">
				{{ props.vendor.name }}
			</a-descriptions-item>
			<a-descriptions-item label="거래처코드">
				{{ props.vendor.code }}
			</a-descriptions-item>
			<a-descriptions-item label="사업자등록번호">
				{{ props.vendor.businessRegistrationNumber }}
			</a-descriptions-item>
			<a-descriptions-item label="대표자">
				{{ props.vendor.representativeName }}
			</a-descriptions-item>
		</a-descriptions>
		<!-- @finish="onFinish" -->
		<a-form
			label-align="left"
			ref="formRef"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
			:model="formState"
		>
			<a-row :gutter="[15, 15]" v-for="(item, index) in formState.accounts" :key="index">
				<a-col span="24">
					<a-space align="center">
						<a-typography-title :level="5" class="page-title">
							계좌정보 <span v-if="index > 0">{{ index + 1 }}</span>
						</a-typography-title>
						<a-button
							v-if="index > 0"
							shape="circle"
							size="small"
							danger
							@click="onRemove(item)"
							:icon="materialIcons('mso', 'remove')"
						/>
					</a-space>
				</a-col>
				<a-col span="12">
					<a-form-item
						label="은행명"
						has-feedback
						:name="['accounts', index, 'bankTypeLabel']"
						:rules="{
							required: true,
							message: '필수입력값 입니다.',
						}"
					>
						<!-- <a-input v-model:value="item.bankTypeName" /> -->
						<eacc-select
							url="/api/v2/masters/vendorBankAccounts/types/bankTypes"
							v-model:value="item.bankTypeLabel"
							placeholder="은행을 선택해주세요."
							:field-names="{ label: 'label', value: 'code' }"
							:on-all-field="false"
							value-type="any"
							@update:any-value="
								(value: any) => {
									item.bankTypeLabel = value.code
									item.bankTypeName = value.label
								}
							"
						/>
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item
						label="계좌번호"
						:name="['accounts', index, 'accountNumber']"
						has-feedback
						:rules="{
							required: true,
							message: '필수입력값 입니다.',
						}"
					>
						<a-input v-model:value="item.accountNumber" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="비고">
						<a-input v-model:value="item.description" />
					</a-form-item>
				</a-col>
				<a-col span="12" v-if="index === 0">
					<a-form-item label="주 계좌">
						<a-space>
							<a-checkbox v-model:checked="item.mainAccountFlag">
								주 계좌로 설정
							</a-checkbox>
						</a-space>
					</a-form-item>
				</a-col>
			</a-row>
			<a-form-item v-if="!props.account" class="mt-md">
				<a-button
					type="primary"
					ghost
					:icon="materialIcons('mso', 'add_circle')"
					@click="onAdd"
				>
					계좌정보 추가
				</a-button>
			</a-form-item>
		</a-form>
		<template #footer>
			<a-flex
				align="center"
				:justify="`${props.account ? 'space-between' : 'flex-end'}`"
				:gap="10"
			>
				<a-button
					danger
					v-if="props.account"
					@click="deleteVendorBankAccounts(formState.accounts[0])"
					>삭제</a-button
				>
				<a-space :size="5">
					<a-button @click="open = false">취소</a-button>
					<a-button type="primary" @click="onFinish">{{
						props.account ? "수정" : "등록"
					}}</a-button>
				</a-space>
			</a-flex>
		</template>
	</a-modal>
</template>
