<script setup lang="ts">
import { materialIcons } from "@/composables/icons"
import type { FormInstance } from "ant-design-vue"
import type { Response } from "@/types"
import { createVNode } from "vue"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"

type Data = {
	id: string | number | undefined
	managerName: string
	email: string
	cellPhoneNumber: string
	telNumber: string
	description: string
	mainManagerFlag: boolean
}

const props = withDefaults(
	defineProps<{
		show: boolean
		vendor: any
		manager?: any
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
const formState = reactive<{ managers: Data[] }>({
	managers: [
		{
			id: undefined,
			managerName: "",
			email: "",
			cellPhoneNumber: "",
			telNumber: "",
			description: "",
			mainManagerFlag: false,
		},
	],
})

const onAdd = () => {
	formState.managers.push({
		id: undefined,
		managerName: "",
		email: "",
		cellPhoneNumber: "",
		telNumber: "",
		description: "",
		mainManagerFlag: false,
	})
}

const onRemove = (item: Data) => {
	const index = formState.managers.indexOf(item)
	if (index !== -1) {
		formState.managers.splice(index, 1)
	}
}

const deleteVendorManager = (item: any) => {
	Modal.confirm({
		title: "삭제하시겠습니까?",
		icon: createVNode(ExclamationCircleOutlined),
		okText: "확인",
		cancelText: "취소",
		onOk() {
			const body = Object.assign({}, item, {
				vendorId: props.vendor.id,
			})
			useCFetch<Response<any>>(`/api/v2/master/vendorManagers/${item.id}`, {
				method: "delete",
				body,
			})
				.then((res: Response<any>) => {
					if (res.status === 0) {
						message.success("거래처 담당자가 삭제되었습니다.")
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
	console.log("Received values of form:", values, props.vendor)
	console.log("formState.managers :", formState.managers)

	formRef.value
		?.validate()
		.then(async () => {
			if (formState.managers && formState.managers.length > 0) {
				const body = formState.managers.map((x: any) => {
					x.vendorId = props.vendor.id
					x.companyCode = props.vendor.companyCode
					return x
				})
				// Object.assign({}, formState.managers, {
				//   vendorId: props.vendor.id
				// });
				useCFetch<Response<any>>(
					`${props.manager ? "/api/v2/master/vendorManagers/" + body[0].id : "/api/v2/master/vendorManagers"}`,
					{
						method: props.manager ? "PATCH" : "POST",
						body: props.manager ? body[0] : body,
					}
				).then((res: Response<any>) => {
					if (res.status === 0) {
						!props.manager
							? message.success(`${res.data.length}건의 거래처 담당자가 등록되었습니다.`)
							: message.success("거래처 담당자가 수정되었습니다.")
						open.value = false
					}
				})
			}
		})
		.catch((err) => {
			console.error(err)
		})
}
const onAfterClose = () => {
	formRef.value?.resetFields()
	formState.managers = [
		{
			id: undefined,
			managerName: "",
			email: "",
			cellPhoneNumber: "",
			telNumber: "",
			description: "",
			mainManagerFlag: false,
		},
	]
}

onUpdated(() => {
	if (props.manager) {
		formState.managers = [{ ...props.manager }]
		// console.log('manager', props.manager);
	}
})
</script>
<template>
	<a-modal
		width="80rem"
		centered
		v-model:open="open"
		ok-text="저장"
		:title="`담당자 ${props.manager ? '수정' : '등록'}`"
		:after-close="onAfterClose"
		:destroy-on-close="true"
		:confirmLoading="loading"
	>
		<a-descriptions
			class="mb-xl"
			v-if="!props.manager"
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

		<a-form
			ref="formRef"
			label-align="left"
			:colon="false"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
			:model="formState"
		>
			<a-row :gutter="[15, 15]" v-for="(item, index) in formState.managers" :key="index">
				<a-col span="24">
					<a-space align="center">
						<a-typography-title :level="5" class="mb-none">
							담당자 <span v-if="index > 0">{{ index + 1 }}</span>
						</a-typography-title>
						<!-- v-if="formState.managers[index].id" -->
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
						label="담당자명"
						:name="['managers', index, 'managerName']"
						:rules="{
							required: true,
							message: '필수입력값 입니다.',
						}"
						has-feedback
					>
						<a-input v-model:value="item.managerName" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item
						label="이메일"
						:name="['managers', index, 'email']"
						:rules="[
							{
								required: true,
								message: '필수입력 값 입니다.',
								trigger: 'blur',
							},
							{
								pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
								message: '유효하지 않은 이메일 형식입니다.',
								trigger: 'blur',
							},
						]"
						has-feedback
					>
						<a-input v-model:value="item.email" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="휴대전화">
						<a-input v-model:value="item.cellPhoneNumber" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="회사전화">
						<a-input v-model:value="item.telNumber" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="비고">
						<a-input v-model:value="item.description" />
					</a-form-item>
				</a-col>
				<a-col span="12" v-if="index === 0">
					<a-form-item label="대표 담당자">
						<a-space>
							<a-checkbox v-model:checked="item.mainManagerFlag">
								대표 담당자로 설정
							</a-checkbox>
						</a-space>
					</a-form-item>
				</a-col>
			</a-row>
			<a-form-item v-if="!props.manager" class="mt-md">
				<a-button
					type="primary"
					ghost
					:icon="materialIcons('mso', 'add_circle')"
					@click="onAdd"
				>
					담당자 추가
				</a-button>
			</a-form-item>
		</a-form>
		<template #footer>
			<a-flex
				align="center"
				:justify="`${props.manager ? 'space-between' : 'flex-end'}`"
				:gap="10"
			>
				<a-button
					danger
					v-if="props.manager"
					@click="deleteVendorManager(formState.managers[0])"
					>삭제</a-button
				>
				<a-space :size="5">
					<a-button @click="open = false">취소</a-button>
					<a-button type="primary" @click="onFinish">{{
						props.manager ? "수정" : "등록"
					}}</a-button>
				</a-space>
			</a-flex>
		</template>
	</a-modal>
</template>
