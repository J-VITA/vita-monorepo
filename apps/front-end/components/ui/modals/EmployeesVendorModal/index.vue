<script lang="ts" setup>
import type { VendorType } from "@/types/master/vendors"
import type { Response } from "@/types"
import { Form } from "ant-design-vue"
import type { Rule } from "ant-design-vue/es/form"

const open = defineModel<boolean>("open")

const emit = defineEmits<{
	(e: "update:open", value: boolean): boolean
	(e: "refresh", value: boolean): boolean
}>()

const { vendorInfo, title } = defineProps<{
	vendorInfo: VendorType
	title: string
}>()

const loading = ref<boolean>(false)

const authStore = useAuthStore()
const { getCompanyCode } = storeToRefs(authStore)

const employeeIds = ref<Array<any>>([])

const useForm = Form.useForm

/**
 * 주민번호 체크 결과 필드 UI 활성 (주민번호 중복 조회)
 * @param _rule
 * @param value
 */
const validatedResidentNumberCheck = async (_rule: Rule, value: string) => {
	if (!value) {
		// return Promise.reject('필수입력 값입니다');
	} else {
		//TODO: 주민번호 서버 검증 로직 추가
		// await useCFetch<Response<any>>(
		//   `api 주소 경로 입력`,
		//   {
		//     method: 'get',
		//     params: {
		//       companyCode: '1000',
		//       businessRegistrationNumber: value,
		//     },
		//   }
		// ).then((res: Response<any>) => {
		//   if (res.status == 0 && res.data.available) {
		//     return Promise.resolve();
		//   } else {
		//     return Promise.reject(`${res.message}`);
		//   }
		// })
		// .catch((err: any) => {
		//   return Promise.reject(`${err.message}`);
		// });

		return Promise.resolve()
	}
}

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
	employeeVendorNumber: [
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
		{ required: true, message: "필수입력 값입니다.", trigger: "blur" },
		{
			pattern: /^(?:[0-9]{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[1,2][0-9]|3[0,1]))[1-4][0-9]{6}$/,
			message: "올바른 주민등록번호 형식이 아닙니다.",
			trigger: "blur",
		},
		{ validator: validatedResidentNumberCheck, trigger: "blur" },
	],
})
const { resetFields, validate, validateInfos } = useForm(vendorInfo, rulesRef)

const onSubmit = () => {
	validate()
		.then((data) => {
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
	body.vendorFlag = false
	body.employeeVendorFlag = true
	useCFetch<Response<any>>(`/api/v2/masters/vendors`, {
		method: "POST",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				emit("refresh", true)
				message.success("임직원 거래처가 등록되었습니다.")
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
	body.vendorFlag = false
	body.employeeVendorFlag = true
	useCFetch<Response<any>>(`/api/v2/masters/vendors/${item.id}`, {
		method: "PATCH",
		body,
	})
		.then((res: Response<any>) => {
			if (res.status === 0) {
				// onAfterClose();
				message.success("임직원 거래처가 수정되었습니다.")
				emit("refresh", true)
				open.value = false
			} else {
				message.error(`${res.message}`)
			}
		})
		.finally(() => {
			loading.value = false
		})
}

const options = ref<Array<any>>([])
const vendorTypeOptions = computed({
	get() {
		return options.value
	},
	set(value: Array<any>) {
		options.value = value
	},
})

watchEffect(async () => {
	if (open.value && !vendorInfo.id && !vendorInfo.vendorType) {
		//임직원 신규 등록 시 매입 코드를 하드코딩.
		if (vendorTypeOptions.value && vendorTypeOptions.value.length > 0) {
			const apCode =
				vendorTypeOptions.value
					.filter((v) => v.used)
					.map((v: { code: string }) => v.code)
					.find((code: string) => code === "AP") || ""
			vendorInfo.vendorType = apCode
		}
	}
	if (open.value && vendorInfo.employeeVendorNumber) {
		const response = await useCFetch<Response<any>>(`/api/v2/masters/commons/employees`, {
			method: "GET",
			params: {
				companyCode: getCompanyCode.value,
				employeeNumber: vendorInfo.employeeVendorNumber,
			},
		})
		if (response.status === 0 && response.data && response.data.length > 0) {
			if (response.data[0].id) {
				employeeIds.value = [response.data[0].id]
			}
		}
	}
})
</script>
<template>
	<a-modal
		width="40rem"
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
			:model="vendorInfo"
			:rules="rulesRef"
			:label-col="{ span: 6 }"
			:wrapper-col="{ span: 18 }"
			name="임직원 거래처"
		>
			<a-row :gutter="40">
				<a-col span="24">
					<!-- help="(매입, 매출, 매입/매출)" -->
					<a-form-item
						name="vendorType"
						label="거래처 구분"
						v-bind="validateInfos.vendorType"
						has-feedback
					>
						<eacc-select
							url="/api/v2/masters/vendors/types/vendorTypes"
							v-model:value="vendorInfo.vendorType"
							:field-names="{ label: 'label', value: 'code' }"
							:on-all-field="false"
							@on-options="(options) => (vendorTypeOptions = options || [])"
							@update:value="(value: any) => (vendorInfo.vendorType = value)"
							disabled
						/>
					</a-form-item>
					<a-form-item
						label="사용자선택"
						name="name"
						v-bind="validateInfos.name"
						has-feedback
					>
						<eacc-select-table
							v-model:value="employeeIds"
							key-props="id"
							label-prop="name"
							url="/api/v2/masters/commons/employees"
							:columns="[
								{ title: '사업장', data: (row: any) => row.workplaceName },
								{ title: '부서', data: (row: any) => row.department },
								{ title: '직위', data: (row: any) => row.gradeName },
								{ title: '이름', data: (row: any) => row.name },
							]"
							@update:value="(value: any) => (employeeIds = value)"
							@selection-change="
								(value: any) => {
									vendorInfo.name = value[0]?.name || ''
									vendorInfo.employeeVendorNumber = value[0]?.employeeNumber || ''
									validate('name')
								}
							"
							:disabled="vendorInfo.id ? true : false"
						/>
					</a-form-item>
					<a-form-item
						label="사원번호"
						name="employeeVendorNumber"
						v-bind="validateInfos.employeeVendorNumber"
						has-feedback
					>
						<a-input v-model:value="vendorInfo.employeeVendorNumber" disabled />
					</a-form-item>
					<a-form-item label="거래처코드" v-bind="validateInfos.code" has-feedback>
						<a-input
							v-model:value="vendorInfo.code"
							:disabled="vendorInfo.id ? true : false"
							@blur="() => validate('code')"
						/>
					</a-form-item>
					<a-form-item
						label="주민등록번호"
						v-bind="validateInfos.businessRegistrationNumber"
						name="businessRegistrationNumber"
						has-feedback
					>
						<a-input-group compact class="compact">
							<a-input
								v-model:value="vendorInfo.businessRegistrationNumber"
								:maxlength="13"
								:placeholder="`주민등록번호는 '-'를 빼고 입력해주세요`"
							/>
							<a-button @click="() => validate('businessRegistrationNumber')"
								>중복확인</a-button
							>
						</a-input-group>
					</a-form-item>
					<a-form-item label="사용여부">
						<a-switch v-model:checked="vendorInfo.used" size="small" />
					</a-form-item>
				</a-col>
			</a-row>
		</a-form>
	</a-modal>
</template>
