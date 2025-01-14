<script setup lang="ts">
import { Form } from "ant-design-vue"
import { createVNode } from "vue"
import type { IAddr, Response } from "@/types"
import type { Rule } from "ant-design-vue/es/form"
import type { VendorType } from "@/types/master/vendors"

const useForm = Form.useForm

// 스토어 생성
const authStore = useAuthStore()
// 반응형 객체로 변환
const { getCompanyCode } = storeToRefs(authStore)

const {
	show = false,
	vendorInfo,
	title = "거래처 추가",
} = defineProps<{ show: boolean; vendorInfo: VendorType; title: string }>()

const emit = defineEmits<{
	(e: "update:show", value: any): void
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

const loading = ref<boolean>(false)
const rulesRef = ref<Record<string, Rule[]>>({
	vendorType: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	name: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	code: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	businessRegistrationNumber: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	representativeName: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	businessCondition: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	businessType: [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
	"address.roadAddr": [
		{
			required: true,
			message: "필수입력 값입니다.",
			trigger: "blur",
		},
	],
})

const { resetFields, validate, validateInfos } = useForm(vendorInfo, rulesRef)

const openDaumAddrModal = (): void => {
	try {
		new window.daum.Postcode({
			oncomplete: function (data: IAddr) {
				if (vendorInfo) {
					// console.log('data ', data);
					vendorInfo.address.roadAddr = data.roadAddress
					vendorInfo.address.engAddr1 = data.roadAddressEnglish
					vendorInfo.address.engAddr2 = data.roadnameEnglish
					vendorInfo.address.jibunAddr = data.jibunAddress
					vendorInfo.address.zonecode = data.zonecode
				}
			},
		}).open()
	} catch (e) {
		console.error(e)
	}
}

const onDelete = (id: number | string) => {
	// console.log('거래처 삭제');
	if (id) {
		Modal.confirm({
			title: "거래처를 삭제 하시겠습니까?",
			icon: createVNode(materialIcons("mso", "error")),
			content: "다시 되돌릴 수 없습니다.",
			okText: "삭제",
			okType: "danger",
			cancelText: "취소",
			onOk() {
				deleteVendor(id)
			},
			onCancel() {
				console.log("Cancel")
			},
		})
	} else {
		message.info(`다시 시도해주세요.`)
	}
}
const onSubmit = () => {
	validate()
		.then(() => {
			loading.value = true
			if (vendorInfo.id) {
				patchVendor(toRaw(vendorInfo) as VendorType)
			} else {
				postVendor(toRaw(vendorInfo) as VendorType)
			}
		})
		.catch((err) => {
			console.log("error", err)
		})
}

/**
 * 거래처 정보 저장
 */
const postVendor = (item: VendorType) => {
	const body = item
	body.vendorFlag = true
	body.employeeVendorFlag = false
	if (item.vendorTypeName === "AR") {
		body.arTermsOfPayment = item.paymentTerms
	} else if (item.vendorTypeName === "AP") {
		body.apTermsOfPayment = item.paymentTerms
	} else {
		body.apTermsOfPayment = item.paymentTerms
		body.arTermsOfPayment = item.paymentTerms
	}
	useCFetch<Response<any>>(`/api/v2/masters/vendors`, {
		method: "POST",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				emit("refresh")
				message.success("거래처가 등록되었습니다.")
				open.value = false
			} else {
				message.error(`${res.message}`)
			}
		})
		.finally(() => {
			loading.value = false
		})
}

/**
 * 거래처 정보 수정
 */
const patchVendor = (item: VendorType) => {
	const body = item
	body.vendorFlag = true
	body.employeeVendorFlag = false
	if (item.vendorTypeName === "AR") {
		body.arTermsOfPayment = item.paymentTerms
	} else if (item.vendorTypeName === "AP") {
		body.apTermsOfPayment = item.paymentTerms
	} else {
		body.apTermsOfPayment = item.paymentTerms
		body.arTermsOfPayment = item.paymentTerms
	}
	useCFetch<Response<any>>(`/api/v2/masters/vendors/${item.id}`, {
		method: "PATCH",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				// onAfterClose();
				emit("refresh")
				message.success("거래처가 수정되었습니다.")
				open.value = false
			}
		})
		.finally(() => {
			loading.value = false
		})
}

/**
 * 거래처 정보 삭제
 */
const deleteVendor = (id: number | string) => {
	// console.log(' delete vendor data ', id);
	useCFetch<Response<any>>(`/api/v2/masters/vendors/${id}`, {
		method: "DELETE",
		body: { id },
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				emit("refresh")
				message.success("거래처가 삭제 되었습니다.")
			}
		})
		.finally(() => {
			open.value = false
			loading.value = false
		})
}

const cancel = async () => {
	nextTick(() => {
		setTimeout(() => {
			console.log("cancel")
			open.value = false
			emit("refresh")
		}, 100)
	})
}
</script>
<template>
	<a-modal
		width="80rem"
		centered
		v-model:open="open"
		:title="title"
		:confirmLoading="loading"
		:destroy-on-close="true"
		:mask-closable="false"
		@ok="onSubmit"
	>
		<a-form
			label-align="left"
			:colon="false"
			:label-col="{ span: 8 }"
			:wrapper-col="{ span: 16 }"
		>
			<a-row :gutter="24">
				<a-col span="12">
					<a-form-item label="거래처 구분" v-bind="validateInfos.vendorType" has-feedback>
						<eacc-select
							url="/api/v2/masters/vendors/types/vendorTypes"
							v-model:value="vendorInfo.vendorType"
							:field-names="{ label: 'label', value: 'code' }"
							:on-all-field="false"
							@update:value="(value: any) => (vendorInfo.vendorType = value)"
						/>
					</a-form-item>
					<a-form-item label="거래처코드" v-bind="validateInfos.code" has-feedback>
						<a-input
							v-model:value="vendorInfo.code"
							:disabled="vendorInfo.id ? true : false"
						/>
					</a-form-item>
					<a-form-item
						label="대표자"
						v-bind="validateInfos.representativeName"
						has-feedback
					>
						<a-input v-model:value="vendorInfo.representativeName" />
					</a-form-item>
					<a-form-item label="업태" v-bind="validateInfos.businessCondition" has-feedback>
						<a-input v-model:value="vendorInfo.businessCondition" />
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="상호명" v-bind="validateInfos.name" has-feedback>
						<a-input v-model:value="vendorInfo.name" />
					</a-form-item>
					<a-form-item v-bind="validateInfos.businessRegistrationNumber" has-feedback>
						<template #label> 사업자등록번호 <br />주민등록번호 </template>
						<a-input v-model:value="vendorInfo.businessRegistrationNumber" />
					</a-form-item>
					<a-form-item label="대표번호">
						<a-input v-model:value="vendorInfo.telNumber" />
					</a-form-item>
					<a-form-item label="종목" v-bind="validateInfos.businessType" has-feedback>
						<a-input v-model:value="vendorInfo.businessType" />
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col span="24">
					<a-form-item
						label="주소"
						:label-col="{
							span: 4,
						}"
						:wrapper-col="{
							span: 20,
						}"
						v-bind="validateInfos['address.roadAddr']"
						has-feedback
					>
						<a-input-group compact class="address">
							<a-input v-model:value="vendorInfo.address.roadAddr" disabled />
							<a-button @click="openDaumAddrModal"> 주소검색 </a-button>
						</a-input-group>
					</a-form-item>
					<a-form-item
						label="상세주소"
						:label-col="{
							span: 4,
						}"
						:wrapper-col="{
							span: 20,
						}"
					>
						<a-input v-model:value="vendorInfo.address.detailAddr" />
					</a-form-item>
				</a-col>
			</a-row>
			<a-row :gutter="24">
				<a-col span="12">
					<a-form-item label="지급조건">
						<a-select
							v-model:value="vendorInfo.paymentTerms"
							placeholder="선택하세요"
							:options="[
								{ label: '전체', value: 'all' },
								{ label: '익월 10일', value: '10' },
								{ label: '익월 20일', value: '20' },
								{ label: '익월 25일', value: '25' },
							]"
						>
						</a-select>
					</a-form-item>
				</a-col>
				<a-col span="12">
					<a-form-item label="사용여부">
						<a-switch v-model:checked="vendorInfo.used" size="small" />
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
		<template #footer>
			<a-flex justify="space-between">
				<div>
					<a-button danger v-if="vendorInfo.id" @click="onDelete(vendorInfo.id)">
						삭제
					</a-button>
				</div>
				<a-space>
					<a-button @click="cancel">취소</a-button>
					<a-button type="primary" @click="onSubmit">저장</a-button>
				</a-space>
			</a-flex>
		</template>
	</a-modal>
</template>
