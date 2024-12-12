<script lang="ts" setup>
import { materialIcons } from "@/composables/icons"
import { FieldLayout } from "layout"
import type { IAddr, Response } from "@/types"

import {
	type Workplace,
	type Address,
	type WorkplaceTree,
	initWorkPlaceData,
} from "@/types/settings/workplaces"
import type { Rule } from "ant-design-vue/es/form"
import type { FormInstance } from "ant-design-vue"
import WorkPlaceAddDropDown from "@/components/settings/workplaces/WorkPlaceAddDropDown.vue"

const props = withDefaults(
	defineProps<{
		node: Workplace
		maxOrderSeq: string | number
	}>(),
	{}
)

const emit = defineEmits<{
	(e: "refresh", idx?: number): void
	(e: "appendWorkplace"): void
	(e: "companyInput", value: any): string
}>()

//WorkplaceClass
const companyForm = ref<Workplace>(initWorkPlaceData)
const workplaceForm = ref<Workplace>(initWorkPlaceData)
const companyFormRef = ref<FormInstance>()
const workplaceFormRef = ref<FormInstance>()
const isLoading = ref<boolean>(false)
const isEdit = ref<boolean>(false)

watch(
	() => props.node,
	(value) => {
		companyForm.value = value
		companyFormRef.value?.resetFields()

		workplaceForm.value = value
		workplaceFormRef.value?.resetFields()
	}
)

/**
 * 다음 주소 모달 호출 부분
 */
const openDaumAddrModal = (): void => {
	try {
		new window.daum.Postcode({
			oncomplete: function (data: IAddr) {
				if (workplaceForm.value) {
					workplaceForm.value.address.roadAddr = data.roadAddress
					workplaceForm.value.address.engAddr1 = data.roadAddressEnglish
					workplaceForm.value.address.engAddr2 = data.roadnameEnglish
					workplaceForm.value.address.jibunAddr = data.jibunAddress
					workplaceForm.value.address.zonecode = data.zonecode
				}
			},
		}).open()
	} catch (e) {
		console.error(e)
	}
}

/**
 * 회사 정보 저장/수정
 * @param item
 */
type MethodType =
	| "GET"
	| "HEAD"
	| "PATCH"
	| "POST"
	| "PUT"
	| "DELETE"
	| "CONNECT"
	| "OPTIONS"
	| "TRACE"
	| "get"
	| "head"
	| "patch"
	| "post"
	| "put"
	| "delete"
	| "connect"
	| "options"
	| "trace"
const createWorkplace = (
	id: number | string,
	item: Workplace,
	method: MethodType
): void => {
	isLoading.value = true
	useCFetch<Response<any>>(`/api/v2/settings/companies${id ? "/" + id : ""}`, {
		method,
		body: JSON.stringify(item),
	})
		.then((res: Response<any>) => {
			if (res.status == 0) {
				message.success(item.status === "create" ? "생성하였습니다." : "수정되었습니다.")
			}
		})
		.finally(() => {
			isLoading.value = false
			emit("refresh", Number(id))
		})
}

// test
const layout = {
	labelCol: { span: 8 },
	wrapperCol: { span: 16 },
}

const validateMessages = {
	required: "${label} 은/는 필수 값 입니다.",
	types: {
		email: "${label} is not a valid email!",
		number: "${label} is not a valid number!",
	},
	number: {
		range: "${label} must be between ${min} and ${max}",
	},
}

const isValidationRegNumber = ref<boolean>(false)
const isValidationCompanyCode = ref<boolean>(false)

/**
 * 사업자번호 체크
 * @param value
 */
const registrationNumberCheck = async (value: string) => {
	return useFetch<Response<any>>(`/api/v2/settings/companies/registrationNumber/check`, {
		method: "GET",
		params: {
			registrationNumber: value,
		},
	})
		.then((res: any) => res.data.value)
		.then((res: Response<any>) => {
			if (res.status === 0) {
				isValidationRegNumber.value = true
			} else {
				isValidationRegNumber.value = false
			}
		})
		.catch((err: any) => {
			isValidationRegNumber.value = false
		})
		.finally(() => {
			// formRef.value?.validateFields('registrationNumber')
		})
}
/**
 * 사업자 번호 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateRegistrationNumber = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("사업자 번호를 입력해주세요.")
	} else {
		await registrationNumberCheck(value)

		if (isValidationRegNumber.value) {
			return Promise.resolve()
		} else {
			return Promise.reject("유효하지 않은 사업자 번호입니다.")
		}
	}
}

/**
 * 회사코드 체크
 * @param value
 */
const companyCodeCheck = async (value: string) => {
	return useFetch<Response<any>>(`/api/v2/settings/companies/companies/code/check`, {
		method: "GET",
		params: {
			companyCode: value,
		},
	})
		.then((res: any) => res.data.value)
		.then((res: Response<any>) => {
			if (res.status === 0) {
				isValidationCompanyCode.value = true
			} else {
				isValidationCompanyCode.value = false
			}
		})
		.catch((err: any) => {
			isValidationCompanyCode.value = false
		})
		.finally(() => {
			// formRef.value?.validateFields('companyCode')
		})
}

/**
 * 삭제 모달 submit
 * @param data
 */
const deleteWorkplace = (data: WorkplaceTree): void => {
	if (data.id) {
		isLoading.value = true
		useCFetch<Response<any>>(`/api/v2/settings/companies/${data.id}`, {
			method: "DELETE",
			body: {
				id: data.id,
			},
		})
			.then((res: Response<any>) => {
				if (res.status == 0) {
					message.success("삭제되었습니다.")
					emit("refresh", 1)
				}
			})
			.finally(() => {
				isLoading.value = false
			})
	} else {
		message.error(`삭제 할 사업장을 선택하세요.`)
	}
}

/**
 * 회사코드 체크 결과 필드 UI 활성
 * @param _rule
 * @param value
 */
const validateCompanyCode = async (_rule: Rule, value: string) => {
	if (!value) {
		return Promise.reject("회사코드를 입력해주세요.")
	} else {
		await companyCodeCheck(value)

		if (isValidationCompanyCode.value) {
			return Promise.resolve()
		} else {
			return Promise.reject(
				"이미 사용 중인 회사코드 입니다. 동일 회사코드에 주사업장은 하나만 존재할 수 있습니다."
			)
		}
	}
}

/**
 * rules
 */
const rules: Record<string, Rule[]> = {
	registrationNumber: [
		{
			validator: validateRegistrationNumber,
			trigger: ["blur"],
			required: true,
		},
	],
	code: [{ validator: validateCompanyCode, trigger: ["blur"], required: true }],
	name: [{ required: true, message: "빈값을 채워주세요" }],
}

/**
 * form save
 * @param values
 */
const onFinish = (values: Workplace) => {
	if (values.status == "create") {
		const params = Object.assign({}, values, {
			orderSeq: Number(props.maxOrderSeq) + 1,
			used: true,
		})
		createWorkplace("", params, "POST")
	} else if (values.status == "append") {
		const params = Object.assign({}, values, {
			parentId: values.id,
			parentName: values.name,
			orderSeq: Number(props.maxOrderSeq) + 1,
			used: true,
		})
		createWorkplace("", params, "POST")
	} else {
		if (values.id) {
			createWorkplace(values.id, values, "PATCH")
		} else {
			message.error("잘못되어진 방식으로 접근하였습니다.")
		}
	}
}

const handleValidate = (...args: any) => {
	if (args[0] === "registrationNumber") {
	}
}

const handleFinishFailed = (errors: any) => {
	console.log(errors)
}

/**
 * 회사 추가 액션
 */
const appendWorkplace = () => {
	isEdit.value = true
	emit("appendWorkplace")
	companyForm.value.status = "create"
	companyFormRef.value?.resetFields()
}

/**
 * 사업장 추가 액션
 */
const appendSubWorkplace = () => {
	isEdit.value = true
	if (companyForm.value.id) {
		companyForm.value.status = "append"
		workplaceFormRef.value?.resetFields([
			"representativeName",
			"bizType",
			"bizItem",
			["address", "roadAddr"],
			["address", "detailAddr"],
			"workplaceName",
			"workplaceCode",
		] as any)
	} else {
		message.error("회사를 선택해주세요.")
	}
}

onActivated(() => {
	if (companyForm.value.registrationNumber)
		registrationNumberCheck(companyForm.value.registrationNumber)
	if (companyForm.value.code) companyCodeCheck(companyForm.value.code)

	if (workplaceForm.value.registrationNumber)
		registrationNumberCheck(workplaceForm.value.registrationNumber)
	if (workplaceForm.value.code) companyCodeCheck(workplaceForm.value.code)
})
</script>

<template>
	<a-form
		ref="companyFormRef"
		autocomplete="off"
		label-align="left"
		:model="companyForm"
		:colon="false"
		:rules="companyForm.status === 'create' ? rules : undefined"
		@finish="onFinish(companyForm)"
	>
		<!-- 회사정보 start -->
		<a-descriptions
			bordered
			title="회사정보"
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<template #extra>
				<a-space :size="5">
					<eacc-button
						v-if="companyForm.status !== 'create' && isEdit"
						componentIs="delete"
						type="primary"
						:data="companyForm"
						:modal-open="true"
						:loading="isLoading"
						@click="deleteWorkplace"
					/>
					<a-button
						v-if="companyForm.status !== 'create' && !isEdit"
						:icon="materialIcons('mso', 'add_circle')"
						@click="appendSubWorkplace"
					>
						사업장추가
					</a-button>
					<a-button
						v-if="companyForm.status !== 'create' && !isEdit"
						type="primary"
						:icon="materialIcons('mso', 'edit')"
						@click="isEdit = true"
					>
						수정
					</a-button>
					<a-button v-if="isEdit" @click="isEdit = false"> 취소 </a-button>
					<a-button
						v-if="isEdit"
						type="primary"
						:icon="materialIcons('mso', 'save')"
						html-type="submit"
					>
						저장
					</a-button>
					<a-button
						v-if="companyForm.status === 'create' && !isEdit"
						:icon="materialIcons('mso', 'add_circle')"
						@click="appendWorkplace"
					>
						회사추가
					</a-button>
				</a-space>
			</template>

			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">회사명</span>
				</template>
				<a-form-item v-if="isEdit" name="name" has-feedback :rules="[{ required: true }]">
					<a-input
						v-model:value="companyForm.name"
						@change="emit('companyInput', companyForm.name)"
					></a-input>
				</a-form-item>
				<span v-else>{{ companyForm.name }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">사업자등록번호</span>
				</template>
				<a-form-item
					v-if="isEdit"
					name="registrationNumber"
					has-feedback
					:rules="[{ required: true }]"
				>
					<a-input v-model:value="companyForm.registrationNumber" />
				</a-form-item>
				<span v-else>{{ companyForm.registrationNumber }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">회사코드</span>
				</template>
				<a-form-item v-if="isEdit" name="code" has-feedback :rules="[{ required: true }]">
					<a-input
						v-model:value="companyForm.code"
						@change="emit('companyInput', companyForm.code)"
					></a-input>
				</a-form-item>
				<span v-else>{{ companyForm.code }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">대표자</span>
				</template>
				<a-form-item
					v-if="isEdit"
					name="representativeName"
					has-feedback
					:rules="[{ required: true }]"
				>
					<a-input v-model:value="companyForm.representativeName" />
				</a-form-item>
				<span v-else>{{ companyForm.representativeName }}</span>
			</a-descriptions-item>
		</a-descriptions>
		<!-- 회사정보 end -->
	</a-form>

	<a-form
		ref="workplaceFormRef"
		autocomplete="off"
		label-align="left"
		:model="workplaceForm"
		:colon="false"
		:rules="workplaceForm.status === 'create' ? rules : undefined"
		@finish="onFinish(workplaceForm)"
	>
		<!-- 사업장정보 start -->
		<a-descriptions
			class="mt-xl"
			bordered
			title="사업장정보"
			size="small"
			:column="2"
			:labelStyle="{ width: '15%' }"
			:contentStyle="{ width: '35%' }"
		>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">사업장명</span>
				</template>
				<a-form-item v-if="isEdit" name="workplaceName" has-feedback>
					<a-input
						v-model:value="workplaceForm.workplaceName"
						@change="emit('companyInput', workplaceForm.workplaceName)"
					></a-input>
				</a-form-item>
				<span v-else>{{ workplaceForm.workplaceName }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">사업자등록번호</span>
				</template>
				<a-form-item v-if="isEdit" name="registrationNumber" has-feedback>
					<a-input v-model:value="workplaceForm.registrationNumber" />
				</a-form-item>
				<span v-else>{{ workplaceForm.registrationNumber }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">사업장코드</span>
				</template>
				<a-form-item v-if="isEdit" name="workplaceCode" has-feedback>
					<a-input
						v-model:value="workplaceForm.workplaceCode"
						@change="emit('companyInput', workplaceForm.workplaceCode)"
					></a-input>
				</a-form-item>
				<span v-else>{{ workplaceForm.workplaceCode }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">대표자</span>
				</template>
				<a-form-item v-if="isEdit" name="representativeName" has-feedback>
					<a-input v-model:value="workplaceForm.representativeName" />
				</a-form-item>
				<span v-else>{{ workplaceForm.representativeName }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">업종</span>
				</template>
				<a-form-item v-if="isEdit" name="bizType" has-feedback>
					<a-input v-model:value="workplaceForm.bizType" />
				</a-form-item>
				<span v-else>{{ workplaceForm.bizType }}</span>
			</a-descriptions-item>
			<a-descriptions-item>
				<template #label>
					<span :class="{ required: isEdit }">업태</span>
				</template>
				<a-form-item v-if="isEdit" name="bizType" has-feedback>
					<a-input v-model:value="workplaceForm.bizType" />
				</a-form-item>
				<span v-else>{{ workplaceForm.bizType }}</span>
			</a-descriptions-item>
			<a-descriptions-item :span="2">
				<template #label>
					<span :class="{ required: isEdit }">주소</span>
				</template>
				<a-form-item
					class="mb-sm"
					v-if="isEdit"
					:name="['address', 'roadAddr']"
					:rules="[{ required: true }]"
				>
					<a-input-group compact class="address">
						<a-input v-model:value="workplaceForm.address.roadAddr" :disabled="true" />
						<a-button @click="openDaumAddrModal"> 주소검색 </a-button>
					</a-input-group>
				</a-form-item>

				<a-form-item :name="['address', 'detailAddr']" v-if="isEdit">
					<a-input v-model:value="workplaceForm.address.detailAddr" />
				</a-form-item>
				<a-space :size="4" v-else>
					<span v-if="workplaceForm.address.zonecode">
						({{ workplaceForm.address.zonecode }})
					</span>
					<span>{{ workplaceForm.address.roadAddr }}</span>
					<span> {{ workplaceForm.address.detailAddr }}</span>
				</a-space>
			</a-descriptions-item>
		</a-descriptions>
		<!-- 사업장정보 end -->
	</a-form>
	<!--회사정보
  <a-form
    ref="formRef"
    :model="form"
    :colon="false"
    :rules="form.status === 'create' ? rules : undefined"
    v-bind="layout"
    :labelCol="{ span: 6, offset: 0 }"
    layout="horizontal"
    autocomplete="off"
    labelAlign="left"
    :name="form.parentId ? '사업장정보' : '회사정보'"
    @finish="onFinish(form)"
  >
    <a-flex gap="small" justify="space-between" class="mb-md">
      <a-typography-title :level="4" class="mb-none">
        {{
          form.parentId
            ? `사업장정보`
            : form.companyCode
              ? '사업장정보'
              : '회사정보'
        }}{{ form.name ? `[${form.name}]` : '' }}
      </a-typography-title>
      <a-space :size="5">
        <work-place-add-drop-down
          v-if="['read', 'update'].includes(form.status)"
          @append-workplace="appendWorkplace"
          @append-sub-workplace="appendSubWorkplace"
        >
        </work-place-add-drop-down>

        <eacc-button
          v-if="['read', 'update'].includes(form.status)"
          componentIs="delete"
          type="primary"
          :data="form"
          :modal-open="true"
          :loading="isLoading"
          @click="deleteWorkplace"
        />

        <a-button
          v-if="['read', 'update', 'append'].includes(form.status)"
          :loading="isLoading"
          html-type="submit"
          type="primary"
          :icon="materialIcons('mso', 'save')"
        >
          {{ form.status === 'append' ? '저장' : '수정' }}
        </a-button>
        <a-button
          v-else="form.status === 'create'"
          html-type="submit"
          type="primary"
          :icon="materialIcons('mso', 'save')"
        >
          신규저장
        </a-button>
      </a-space>
    </a-flex>
    <a-form-item
      name="name"
      :label="`${form.parentId ? '사업장명' : form.companyCode ? '사업장명' : '회사명'}`"
    >
      <a-input
        v-model:value="form.name"
        @change="emit('companyInput', form.name)"
      ></a-input>
    </a-form-item>
    <a-form-item name="registrationNumber" label="사업자등록번호" has-feedback>
      <a-input v-model:value="form.registrationNumber"> </a-input>
    </a-form-item>

    <a-form-item name="representativeName" label="대표자">
      <a-input v-model:value="form.representativeName" />
    </a-form-item>

    <a-form-item name="bizType" label="업태" :rules="[{ required: true }]">
      <a-input v-model:value="form.bizType" />
    </a-form-item>

    <a-form-item name="bizItem" label="종목" :rules="[{ required: true }]">
      <a-input v-model:value="form.bizItem" />
    </a-form-item>

    <a-form-item
      :name="['address', 'roadAddr']"
      label="주소"
      :rules="[{ required: true }]"
    >
      <a-input-group compact class="address">
        <a-input v-model:value="form.address.roadAddr" />
        <a-button @click="openDaumAddrModal"> 주소검색 </a-button>
      </a-input-group>
    </a-form-item>

    <a-form-item :name="['address', 'detailAddr']" label="상세주소">
      <a-input v-model:value="form.address.detailAddr" />
    </a-form-item>

    <a-form-item name="companyCode" label="회사코드" has-feedback>
      <a-input
        v-model:value="form.companyCode"
        :disabled="['read', 'append'].includes(form.status)"
      ></a-input>
    </a-form-item>

    <a-form-item
      name="workplaceCode"
      :rules="[{ required: !['read'].includes(form.status) }]"
      label="사업장코드"
    >
      <a-input
        v-model:value="form.workplaceCode"
        :disabled="['read'].includes(form.status)"
      />
    </a-form-item>

    <a-form-item
      name="placeType"
      :rules="[{ required: true }]"
      label="사업자유형"
    >
      <eacc-select
        url="/api/v2/settings/companies/types/placeTypes"
        v-model:value="form.placeType"
        :field-names="{ label: 'label', value: 'code' }"
        :on-all-field="false"
        @update:value="(value: string) => (form.placeType = value)"
      >
      </eacc-select>
    </a-form-item>
  </a-form> -->
</template>
